import { pgTransactionRepo } from '../models/PgTransaction';
import { pgUserRepo } from '../models/PgUser';
import { fetchCashfreeOrder } from '../utils/cashfreeClient';
import { TransactionStatus } from '../types/transaction';
import { config } from '../config/env';
import { logger } from '../utils/logger';

// Statuses that must not be re-processed by the poller
const TERMINAL_STATUSES: TransactionStatus[] = ['success', 'refunded', 'cancelled', 'stuck'];

/**
 * Map a Cashfree order_status to our internal TransactionStatus.
 * Returns null for transient statuses that should keep polling.
 */
function resolveStatus(orderStatus: string): TransactionStatus | null {
  switch (orderStatus) {
    case 'PAID':     return 'success';
    case 'EXPIRED':  return 'cancelled';
    default:         return null; // ACTIVE, TERMINATION_REQUESTED, etc. — keep polling
  }
}

/**
 * Poll all eligible pending Cashfree orders once and update their statuses.
 * Returns a summary of what happened for logging.
 */
export async function pollPendingCashfreeOrders(): Promise<{
  checked: number;
  resolved: number;
  stuck: number;
  errors: number;
}> {
  const { intervalMs, maxAttempts, minAgeMinutes } = config.cashfree.poll;

  const candidates = await pgTransactionRepo.findPendingCashfreeForPoll({
    minAgeMinutes,
    pollIntervalMs: intervalMs,
    maxAttempts,
  });

  const summary = { checked: candidates.length, resolved: 0, stuck: 0, errors: 0 };

  if (candidates.length === 0) {
    return summary;
  }

  logger.info('[cashfreePoller] polling %d pending orders', candidates.length);

  for (const txn of candidates) {
    const newAttempts = txn.pull_attempts + 1;

    try {
      // order_id = transaction UUID (set during Cashfree order creation)
      const cfOrder = await fetchCashfreeOrder(txn.id);
      const resolvedStatus = resolveStatus(cfOrder.order_status);

      await pgTransactionRepo.appendWebhookEvent(txn.id, {
        event: `cashfree.poll.${cfOrder.order_status}`,
        payload: {
          cf_order_id: cfOrder.cf_order_id,
          order_status: cfOrder.order_status,
          poll_attempt: newAttempts,
        },
        received_at: new Date().toISOString(),
      });

      if (resolvedStatus) {
        // Order reached a terminal state — update and optionally grant tokens
        await pgTransactionRepo.updateStatus(txn.id, resolvedStatus, {
          gateway_payment_id: String(cfOrder.cf_order_id),
        });

        if (resolvedStatus === 'success') {
          await pgUserRepo.addTokensAndPlan(txn.user_id, txn.tokens_added, txn.plan);
        }

        logger.info('[cashfreePoller] resolved txn=%s order_status=%s → %s',
          txn.id, cfOrder.order_status, resolvedStatus);
        summary.resolved++;

        // Reset pull counter so the record is clean
        await pgTransactionRepo.recordPollAttempt(txn.id, newAttempts);
      } else if (newAttempts >= maxAttempts) {
        // Still pending after max attempts — mark as stuck
        await pgTransactionRepo.updateStatus(txn.id, 'stuck', {
          failure_reason: `Marked stuck after ${newAttempts} poll attempts. Last CF status: ${cfOrder.order_status}`,
        });
        await pgTransactionRepo.recordPollAttempt(txn.id, newAttempts);

        logger.warn('[cashfreePoller] stuck txn=%s attempts=%d cf_status=%s',
          txn.id, newAttempts, cfOrder.order_status);
        summary.stuck++;
      } else {
        // Still pending — record attempt and wait for next interval
        await pgTransactionRepo.recordPollAttempt(txn.id, newAttempts);

        logger.debug('[cashfreePoller] still pending txn=%s cf_status=%s attempt=%d/%d',
          txn.id, cfOrder.order_status, newAttempts, maxAttempts);
      }
    } catch (err) {
      summary.errors++;
      logger.error('[cashfreePoller] error polling txn=%s err=%s',
        txn.id, err instanceof Error ? err.message : String(err));

      // Still record the attempt so we don't hammer a failing order
      await pgTransactionRepo.recordPollAttempt(txn.id, newAttempts).catch(() => {});
    }
  }

  logger.info('[cashfreePoller] done — checked=%d resolved=%d stuck=%d errors=%d',
    summary.checked, summary.resolved, summary.stuck, summary.errors);

  return summary;
}

/**
 * Start the recurring Cashfree poll loop.
 * Runs immediately on startup, then every intervalMs milliseconds.
 * Safe to call multiple times — only one timer is created.
 */
let pollerTimer: ReturnType<typeof setInterval> | null = null;

export function startCashfreePoller(): void {
  if (pollerTimer) return;

  const { intervalMs, maxAttempts, minAgeMinutes } = config.cashfree.poll;

  logger.info(
    '[cashfreePoller] starting — interval=%ds maxAttempts=%d minAge=%dmin',
    Math.round(intervalMs / 1000), maxAttempts, minAgeMinutes
  );

  // Run once at startup (after a short delay so DB is ready)
  setTimeout(() => pollPendingCashfreeOrders().catch((e) =>
    logger.error('[cashfreePoller] startup poll error', e)
  ), 15_000);

  pollerTimer = setInterval(() => {
    pollPendingCashfreeOrders().catch((e) =>
      logger.error('[cashfreePoller] interval poll error', e)
    );
  }, intervalMs);
}

export function stopCashfreePoller(): void {
  if (pollerTimer) {
    clearInterval(pollerTimer);
    pollerTimer = null;
    logger.info('[cashfreePoller] stopped');
  }
}
