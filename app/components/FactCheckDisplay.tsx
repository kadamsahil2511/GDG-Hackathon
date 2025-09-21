import { useState } from "react";

interface FactCheckResult {
  claim?: string;
  url?: string;
  query?: string;
  is_correct?: boolean;
  confidence_score?: number;
  category?: string;
  conclusion?: string;
  sources?: string[];
  explanation?: string;
  summary?: string;
  error?: string;
  raw_response?: string;
  source_type?: string;
  image_description?: string;
  image_path?: string;
}

interface FactCheckDisplayProps {
  result: FactCheckResult | null;
  isLoading: boolean;
  error?: string;
}

export function FactCheckDisplay({ result, isLoading, error }: FactCheckDisplayProps) {
  // Show loading state only if there are no previous results
  if (isLoading && !result && !error) {
    return (
      <div className="w-full max-w-[800px] mx-auto mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">Analyzing with AI fact-checker...</span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="w-full max-w-[800px] mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-red-800 font-semibold">Analysis Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const getStatusColor = (isCorrect: boolean | undefined, confidenceScore?: number) => {
    if (isCorrect === undefined) return "bg-gray-100 text-gray-800 border-gray-300";
    if (isCorrect) {
      if (confidenceScore && confidenceScore > 80) return "bg-green-100 text-green-800 border-green-300";
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getStatusText = (isCorrect: boolean | undefined, confidenceScore?: number) => {
    if (isCorrect === undefined) return "Analyzed";
    if (isCorrect) {
      if (confidenceScore && confidenceScore > 80) return "Verified True";
      return "Likely True";
    }
    return "False/Misleading";
  };

  const getStatusIcon = (isCorrect: boolean | undefined) => {
    if (isCorrect === undefined) return "📋";
    return isCorrect ? "✅" : "❌";
  };

  return (
    <div className="w-full max-w-[800px] mx-auto mt-8 space-y-4 relative">
      {/* Loading Overlay when updating results */}
      {isLoading && result && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-blue-700 text-sm font-medium">Analyzing new query...</span>
          </div>
        </div>
      )}
      
      {/* Error Banner */}
      {error && result && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Main Result Card */}
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${isLoading ? 'opacity-75' : ''}`}>
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {result.source_type === "image" ? "AI Image Fact-Check Result" : "AI Fact-Check Result"}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(result.is_correct, result.confidence_score)}`}>
              {getStatusIcon(result.is_correct)} {getStatusText(result.is_correct, result.confidence_score)}
            </span>
          </div>
          {result.source_type === "image" && result.image_description && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Image Content:</span> {result.image_description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Analyzed Content */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Analyzed Content:</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">
              "{result.claim || result.url || result.query}"
            </p>
          </div>

          {/* Confidence Score */}
          {result.confidence_score !== undefined && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Confidence Score:</h3>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${result.confidence_score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {result.confidence_score}%
                </span>
              </div>
            </div>
          )}

          {/* Category */}
          {result.category && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Category:</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {result.category}
              </span>
            </div>
          )}

          {/* Explanation */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Analysis:</h3>
            <p className="text-gray-700 leading-relaxed">
              {result.explanation || result.summary || result.conclusion || "No detailed explanation provided."}
            </p>
          </div>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Sources ({result.sources.length}):</h3>
              <div className="space-y-2">
                {result.sources.slice(0, 5).map((source, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {source.startsWith('http') ? (
                      <a 
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm break-all"
                      >
                        {source}
                      </a>
                    ) : (
                      <span className="text-gray-600 text-sm">{source}</span>
                    )}
                  </div>
                ))}
                {result.sources.length > 5 && (
                  <p className="text-gray-500 text-sm">
                    ... and {result.sources.length - 5} more sources
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error handling */}
          {result.error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Processing Note:</h3>
              <p className="text-yellow-700 text-sm">{result.error}</p>
              {result.raw_response && (
                <details className="mt-2">
                  <summary className="text-yellow-700 text-sm cursor-pointer">View raw response</summary>
                  <pre className="text-xs text-yellow-600 mt-2 whitespace-pre-wrap bg-yellow-100 p-2 rounded">
                    {result.raw_response}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          View Detailed Analysis
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
          Share Result
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
          Report Issue
        </button>
      </div>
    </div>
  );
}