import { useState } from "react";

interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  excerpt: string;
  timestamp: string;
  relevanceScore: number;
  trustScore: number;
  category: "news" | "academic" | "government" | "health" | "fact-check" | "social";
  supportsClaim: boolean;
}

interface EvidenceExplanation {
  summary: string;
  methodology: string;
  confidence: number;
  factorsPro: string[];
  factorsAgainst: string[];
  context: string;
}

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  claimText: string;
  sources: Source[];
  explanation: EvidenceExplanation;
}

export function EvidenceDrawer({ isOpen, onClose, claimText, sources, explanation }: EvidenceDrawerProps) {
  const [activeTab, setActiveTab] = useState<"sources" | "analysis" | "timeline">("sources");

  if (!isOpen) return null;

  const supportingSources = sources.filter(s => s.supportsClaim);
  const contradictingSources = sources.filter(s => !s.supportsClaim);

  const getCategoryIcon = (category: Source["category"]) => {
    switch (category) {
      case "news": return "📰";
      case "academic": return "📚";
      case "government": return "🏛️";
      case "health": return "🏥";
      case "fact-check": return "✅";
      case "social": return "💬";
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Evidence Analysis
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                "{claimText}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: "sources", label: "Sources", count: sources.length },
              { id: "analysis", label: "Analysis", count: null },
              { id: "timeline", label: "Timeline", count: null }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "sources" && (
              <div className="p-6 space-y-6">
                {/* Supporting Sources */}
                {supportingSources.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                      Supporting Evidence ({supportingSources.length})
                    </h3>
                    <div className="space-y-4">
                      {supportingSources.map(source => (
                        <SourceCard key={source.id} source={source} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Contradicting Sources */}
                {contradictingSources.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
                      Contradicting Evidence ({contradictingSources.length})
                    </h3>
                    <div className="space-y-4">
                      {contradictingSources.map(source => (
                        <SourceCard key={source.id} source={source} />
                      ))}
                    </div>
                  </div>
                )}

                {sources.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No sources found for this claim.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="p-6 space-y-6">
                {/* Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Analysis Summary
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {explanation.summary}
                  </p>
                </div>

                {/* Confidence Score */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Confidence Score
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${explanation.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round(explanation.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Factors */}
                <div className="grid grid-cols-1 gap-4">
                  {explanation.factorsPro.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        Supporting Factors
                      </h4>
                      <ul className="space-y-1">
                        {explanation.factorsPro.map((factor, index) => (
                          <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start">
                            <span className="text-green-500 mr-2">+</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {explanation.factorsAgainst.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                        Contradicting Factors
                      </h4>
                      <ul className="space-y-1">
                        {explanation.factorsAgainst.map((factor, index) => (
                          <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                            <span className="text-red-500 mr-2">-</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Methodology */}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Analysis Methodology
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {explanation.methodology}
                  </p>
                </div>

                {/* Context */}
                {explanation.context && (
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Additional Context
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {explanation.context}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Source Timeline
                </h3>
                <div className="space-y-3">
                  {sources
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(source => (
                      <div key={source.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-3 h-3 rounded-full ${source.supportsClaim ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {source.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimestamp(source.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {source.domain} • {getCategoryIcon(source.category)} {source.category}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: Source }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
            {source.title}
          </h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {source.domain}
            </span>
            <span className="text-xs">
              {getCategoryIcon(source.category)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(source.timestamp)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-3">
          <div className={`text-xs font-medium ${getTrustScoreColor(source.trustScore)}`}>
            {Math.round(source.trustScore * 100)}%
          </div>
          <div className={`w-3 h-3 rounded-full ${source.supportsClaim ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
        {source.excerpt}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Relevance: {Math.round(source.relevanceScore * 100)}%
          </span>
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Source →
        </a>
      </div>
    </div>
  );
}

function getCategoryIcon(category: Source["category"]) {
  switch (category) {
    case "news": return "📰";
    case "academic": return "📚";
    case "government": return "🏛️";
    case "health": return "🏥";
    case "fact-check": return "✅";
    case "social": return "💬";
  }
}

function getTrustScoreColor(score: number) {
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.6) return "text-yellow-600";
  return "text-red-600";
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}d ago`;
  return date.toLocaleDateString();
}

// Mock data generator for testing
export function generateMockEvidence(claimText: string) {
  const sources: Source[] = [
    {
      id: "1",
      title: "Peer-reviewed study on health claims and evidence",
      url: "https://example.com/study1",
      domain: "journal.healthscience.com",
      excerpt: "Our comprehensive analysis of 1,000 health claims found that only 23% could be substantiated with high-quality evidence. The methodology involved systematic review of peer-reviewed publications.",
      timestamp: "2024-09-20T08:00:00Z",
      relevanceScore: 0.95,
      trustScore: 0.92,
      category: "academic",
      supportsClaim: false
    },
    {
      id: "2",
      title: "WHO guidelines on health information verification",
      url: "https://who.int/guidelines",
      domain: "who.int",
      excerpt: "The World Health Organization emphasizes the importance of evidence-based health information. Claims should be verified through multiple independent sources before acceptance.",
      timestamp: "2024-09-19T14:30:00Z",
      relevanceScore: 0.88,
      trustScore: 0.98,
      category: "health",
      supportsClaim: false
    },
    {
      id: "3",
      title: "Fact-check: Analysis of viral health claim",
      url: "https://factcheck.org/analysis",
      domain: "factcheck.org",
      excerpt: "Our investigation found limited scientific support for this claim. While some preliminary studies exist, the evidence is insufficient to support definitive conclusions.",
      timestamp: "2024-09-18T11:15:00Z",
      relevanceScore: 0.91,
      trustScore: 0.89,
      category: "fact-check",
      supportsClaim: false
    }
  ];

  const explanation: EvidenceExplanation = {
    summary: "Based on our analysis of available sources, this claim lacks sufficient scientific evidence. While some preliminary research exists, the consensus among experts and authoritative sources suggests caution.",
    methodology: "We analyzed 15 sources including peer-reviewed studies, official health organizations, and fact-checking databases. Sources were scored based on authority, recency, and relevance.",
    confidence: 0.78,
    factorsPro: [
      "Some preliminary research mentioned in social media",
      "Popular belief among certain groups"
    ],
    factorsAgainst: [
      "Lack of peer-reviewed evidence",
      "Contradicted by major health organizations", 
      "No large-scale clinical trials",
      "Expert consensus disagrees"
    ],
    context: "This type of health claim often spreads on social media without proper scientific backing. It's important to consult healthcare professionals and rely on evidence-based information."
  };

  return { sources, explanation };
}