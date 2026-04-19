import { AIProvider, AIProviderConfig } from '../types/aiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { MockAIProvider } from './providers/mockAIProvider';

export class AIProviderFactory {
  static createProvider(config: AIProviderConfig): AIProvider {
    switch (config.provider) {
      case 'openai':
        if (!config.apiKey) {
          throw new Error('OpenAI API key is required when using openai provider');
        }
        return new OpenAIProvider(
          config.apiKey,
          config.model || 'gpt-4',
          config.temperature || 0.7
        );

      case 'mock':
        return new MockAIProvider();

      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
  }
}
