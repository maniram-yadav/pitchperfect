'use client';

import EmailGenerationForm from '../components/email/EmailGenerationForm';
import { useAuth } from '../hooks/useAuth';
import { useEmailStore } from '../lib/emailStore';
import EmailPreview from '../components/email/EmailPreview';

export default function GeneratePage() {
  const { hasLoaded } = useAuth();
  const { currentGeneration } = useEmailStore();

  if (!hasLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <EmailGenerationForm />

      {currentGeneration && currentGeneration.generatedOutput?.emails && (
        <div className="max-w-4xl mx-auto mt-8">
          <EmailPreview emails={currentGeneration.generatedOutput.emails} />
        </div>
      )}
    </div>
  );
}
