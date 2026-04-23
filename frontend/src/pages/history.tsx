'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { emailAPI } from '../lib/api';
import { Generation } from '../types/index';

function groupByMonth(generations: Generation[]): { label: string; items: Generation[] }[] {
  const map = new Map<string, Generation[]>();

  for (const gen of generations) {
    const date = new Date(gen.createdAt);
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(gen);
  }

  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function EmailCard({ email, emailType }: { email: { subject: string; body: string; variation: number }; emailType: string }) {
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
          Variation {email.variation}
        </span>
        <span className="text-xs text-gray-400 capitalize">{emailType}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-3">
        <span className="text-gray-400 font-normal">Subject: </span>{email.subject}
      </p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
        {email.body}
      </p>
    </div>
  );
}

function GenerationCard({ gen }: { gen: Generation }) {
  const [expanded, setExpanded] = useState(false);
  const emailType = gen.inputParams.emailType?.replace(/_/g, ' ') ?? '';

  const title = gen.inputParams.useCustomInput
    ? 'Custom Prompt'
    : `${gen.inputParams.senderCompany || '—'} → ${gen.inputParams.targetIndustry || '—'}`;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 bg-white hover:bg-blue-50 transition-colors flex items-start justify-between text-left gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
              {gen.generatedOutput?.emails?.length ?? 0} email{gen.generatedOutput?.emails?.length !== 1 ? 's' : ''}
            </span>
            {gen.generatedOutput?.sequence?.length ? (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                + {gen.generatedOutput.sequence.length}-step sequence
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-500 flex flex-wrap gap-x-3">
            {gen.inputParams.targetRole && <span>{gen.inputParams.targetRole}</span>}
            {emailType && <span className="capitalize">{emailType}</span>}
            {gen.inputParams.tone && <span className="capitalize">{gen.inputParams.tone}</span>}
            <span>{gen.tokensUsed} token{gen.tokensUsed !== 1 ? 's' : ''} used</span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(gen.createdAt)}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-4">
          {gen.inputParams.painPoints && gen.inputParams.painPoints.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pain Points</p>
              <div className="flex flex-wrap gap-2">
                {gen.inputParams.painPoints.map((pt, i) => (
                  <span key={i} className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full">{pt}</span>
                ))}
              </div>
            </div>
          )}

          {gen.inputParams.customPrompt && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Custom Prompt</p>
              <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded p-3 whitespace-pre-wrap">
                {gen.inputParams.customPrompt}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Emails</p>
            <div className="space-y-3">
              {(gen.generatedOutput?.emails ?? []).map((email, i) => (
                <EmailCard key={i} email={email} emailType={emailType} />
              ))}
            </div>
          </div>

          {gen.generatedOutput?.sequence && gen.generatedOutput.sequence.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Follow-up Sequence</p>
              <div className="space-y-3">
                {gen.generatedOutput.sequence.map((seqEmail, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-indigo-600 mb-1">Day {seqEmail.day}</p>
                    <p className="text-sm font-medium text-gray-800 mb-2">{seqEmail.subject}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                      {seqEmail.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { isAuthenticated, hasLoaded } = useAuth();
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasLoaded && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasLoaded, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    emailAPI.getHistory(200).then((result) => {
      if (result.success && Array.isArray(result.data)) {
        setGenerations(result.data);
      }
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!hasLoaded || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading history…</div>;
  }

  if (!isAuthenticated) return null;

  const groups = groupByMonth(generations);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email History</h1>
        <p className="text-gray-500 mt-1">All your previously generated emails, grouped by month.</p>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No emails generated yet</p>
          <p className="text-gray-400 text-sm mt-1">Head to the Generate page to create your first email.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(({ label, items }) => (
            <section key={label}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</h2>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{items.length} generation{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {items.map((gen) => (
                  <GenerationCard key={gen._id} gen={gen} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
