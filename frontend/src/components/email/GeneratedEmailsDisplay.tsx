import { useState } from 'react';
import { Email } from '../../types/index';

interface GeneratedEmailsDisplayProps {
  emails: Email[];
  emailType: string;
}

export default function GeneratedEmailsDisplay({ emails, emailType }: GeneratedEmailsDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (email: Email, index: number) => {
    const emailText = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(emailText).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-indigo-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generated Emails</h2>

      {emails.length === 0 ? (
        <p className="text-gray-500">No emails generated yet.</p>
      ) : (
        <div className="grid gap-4">
          {emails.map((email, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
                      Variation {email.variation}
                    </span>
                    <span className="text-xs text-gray-500">({emailType})</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    <span className="text-gray-500">Subject: </span>
                    {email.subject}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap text-sm mb-4 bg-gray-50 p-3 rounded border border-gray-100">
                {email.body}
              </p>

              <button
                onClick={() => copyToClipboard(email, index)}
                className={`w-full py-2 px-4 rounded font-medium transition-all flex items-center justify-center gap-2 ${
                  copiedIndex === index
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {copiedIndex === index ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Email
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
