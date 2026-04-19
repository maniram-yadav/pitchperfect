'use client';

import { Email } from '../../types/index';

interface EmailPreviewProps {
  emails: Email[];
  onCopy?: (text: string) => void;
}

export default function EmailPreview({ emails, onCopy }: EmailPreviewProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    if (onCopy) onCopy(text);
  };

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold">Generated Emails</h2>

      {emails.map((email) => (
        <div key={email.variation} className="border rounded-lg p-6 bg-gray-50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Variation {email.variation}</h3>
            <button
              onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`)}
              className="bg-secondary text-white px-4 py-1 rounded text-sm hover:bg-blue-600"
            >
              Copy
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subject</label>
            <p className="bg-white p-3 rounded border">{email.subject}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Body</label>
            <p className="bg-white p-3 rounded border whitespace-pre-wrap">{email.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
