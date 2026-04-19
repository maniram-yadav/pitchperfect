import { Generation } from '../../types/index';
import GeneratedEmailsDisplay from './GeneratedEmailsDisplay';
import { useState } from 'react';

interface GenerationHistoryProps {
  generations: Generation[];
}

export default function GenerationHistory({ generations }: GenerationHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        📋 Generation History
        {generations.length > 0 && (
          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-normal">
            {generations.length}
          </span>
        )}
      </h2>

      {generations.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg">No email generations yet</p>
          <p className="text-gray-400 text-sm mt-2">Generate your first cold email above to see history here!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {generations.map((gen) => (
            <div key={gen._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedId(expandedId === gen._id ? null : gen._id)}
                className="w-full px-4 py-4 bg-white hover:bg-blue-50 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {gen.inputParams.senderCompany} → {gen.inputParams.targetIndustry}
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap font-medium">
                      {gen.inputParams.variations} variation{gen.inputParams.variations > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    <span className="font-medium">Target:</span> {gen.inputParams.targetRole} • <span className="font-medium">Type:</span> {gen.inputParams.emailType.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(gen.createdAt || '').toLocaleDateString()} {new Date(gen.createdAt || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === gen._id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </button>

              {expandedId === gen._id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600 font-medium">Email Type:</span>
                      <p className="text-gray-900 mt-1">{gen.inputParams.emailType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Tone:</span>
                      <p className="text-gray-900 mt-1 capitalize">{gen.inputParams.tone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Length:</span>
                      <p className="text-gray-900 mt-1 capitalize">{gen.inputParams.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Tokens Used:</span>
                      <p className="text-gray-900 mt-1">{gen.tokensUsed} tokens</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-gray-600 text-sm font-medium block mb-2">Pain Points:</span>
                    <div className="flex flex-wrap gap-2">
                      {gen.inputParams.painPoints.map((point, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>

                  <GeneratedEmailsDisplay
                    emails={gen.generatedOutput.emails}
                    emailType={gen.inputParams.emailType.replace('_', ' ')}
                  />

                  {gen.generatedOutput.sequence && gen.generatedOutput.sequence.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        📧 Email Sequence
                      </h4>
                      <div className="grid gap-3">
                        {gen.generatedOutput.sequence.map((email, idx) => (
                          <div key={idx} className="bg-white p-4 rounded border border-gray-200 hover:border-blue-200 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-semibold text-indigo-600">📅 Day {email.day}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-2">{email.subject}</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{email.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
