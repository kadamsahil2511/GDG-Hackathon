import { useState } from "react";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  type: string;
  rank: number;
}

interface SearchResultsData {
  query: string;
  results: SearchResult[];
  total_results: number;
  timestamp: number;
  error?: string;
}

interface SearchResultsDisplayProps {
  results: SearchResultsData | null;
  isLoading: boolean;
  error?: string;
}

export function SearchResultsDisplay({ results, isLoading, error }: SearchResultsDisplayProps) {
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  const getResultTypeIcon = (type: string) => {
    const icons = {
      'reference': '📚',
      'video': '📹',
      'discussion': '💬',
      'academic': '🎓',
      'official': '🏛️',
      'news': '📰',
      'general': '🌐'
    };
    return icons[type as keyof typeof icons] || '🌐';
  };

  const getResultTypeColor = (type: string) => {
    const colors = {
      'reference': 'bg-blue-50 text-blue-700 border-blue-200',
      'video': 'bg-red-50 text-red-700 border-red-200',
      'discussion': 'bg-purple-50 text-purple-700 border-purple-200',
      'academic': 'bg-green-50 text-green-700 border-green-200',
      'official': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'news': 'bg-orange-50 text-orange-700 border-orange-200',
      'general': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[800px] mx-auto mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">Searching the web...</span>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[800px] mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-red-800 font-semibold">Search Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!results || !results.results.length) {
    return null;
  }

  return (
    <div className="w-full max-w-[800px] mx-auto mt-8 space-y-4">
      {/* Search Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            🔍 Search Results for "{results.query}"
          </h2>
          <span className="text-sm text-gray-500">
            {results.total_results} results found
          </span>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-3">
        {results.results.map((result, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              {/* Result Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getResultTypeColor(result.type)}`}>
                      {getResultTypeIcon(result.type)} {result.type}
                    </span>
                    <span className="text-xs text-gray-500">#{result.rank}</span>
                  </div>
                  <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate">
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {result.title}
                    </a>
                  </h3>
                  <p className="text-sm text-green-700 truncate">{result.domain}</p>
                </div>
                <button
                  onClick={() => toggleExpanded(index)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg 
                    className={`w-5 h-5 transform transition-transform ${expandedResults.has(index) ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Result Snippet */}
              <div className={`transition-all duration-300 ${expandedResults.has(index) ? 'max-h-96' : 'max-h-16'} overflow-hidden`}>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {result.snippet}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-100">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Visit Site →
                </a>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Fact-Check This
                </button>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Save Result
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          Powered by <span className="font-semibold text-blue-600">REACTOR Search</span> • 
          Results aggregated from multiple sources
        </p>
      </div>
    </div>
  );
}