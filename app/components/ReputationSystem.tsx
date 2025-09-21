import { useState, useEffect } from "react";

interface ReputationMetrics {
  authorityScore: number;
  consistencyScore: number;
  transparencyScore: number;
  perrReviewScore: number;
  factualAccuracy: number;
  overallScore: number;
}

interface ProvenanceData {
  originalSource: string;
  publishDate: string;
  lastModified: string;
  authors: string[];
  citations: number;
  retractions: number;
  corrections: number;
  chainOfCustody: ProvenanceNode[];
}

interface ProvenanceNode {
  id: string;
  timestamp: string;
  action: "created" | "shared" | "modified" | "verified" | "flagged";
  actor: string;
  platform: string;
  metadata?: Record<string, any>;
}

interface SourceWithReputation {
  id: string;
  title: string;
  domain: string;
  url: string;
  reputation: ReputationMetrics;
  provenance: ProvenanceData;
  category: "news" | "academic" | "government" | "health" | "fact-check" | "social";
}

interface ReputationDashboardProps {
  sources: SourceWithReputation[];
  onSourceClick: (source: SourceWithReputation) => void;
}

export function ReputationDashboard({ sources, onSourceClick }: ReputationDashboardProps) {
  const [sortBy, setSortBy] = useState<"reputation" | "authority" | "recency">("reputation");
  const [filterBy, setFilterBy] = useState<"all" | "trusted" | "questionable">("all");

  const getReputationColor = (score: number) => {
    if (score >= 0.8) return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" };
    if (score >= 0.6) return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" };
    return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" };
  };

  const getReputationLabel = (score: number) => {
    if (score >= 0.9) return "Highly Trusted";
    if (score >= 0.8) return "Trusted";
    if (score >= 0.7) return "Reliable";
    if (score >= 0.6) return "Questionable";
    return "Unreliable";
  };

  const filteredSources = sources.filter(source => {
    if (filterBy === "trusted") return source.reputation.overallScore >= 0.7;
    if (filterBy === "questionable") return source.reputation.overallScore < 0.7;
    return true;
  });

  const sortedSources = [...filteredSources].sort((a, b) => {
    switch (sortBy) {
      case "reputation":
        return b.reputation.overallScore - a.reputation.overallScore;
      case "authority":
        return b.reputation.authorityScore - a.reputation.authorityScore;
      case "recency":
        return new Date(b.provenance.publishDate).getTime() - new Date(a.provenance.publishDate).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Source Reputation & Provenance
        </h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="reputation">Sort by Reputation</option>
            <option value="authority">Sort by Authority</option>
            <option value="recency">Sort by Recency</option>
          </select>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Sources</option>
            <option value="trusted">Trusted Only</option>
            <option value="questionable">Questionable Only</option>
          </select>
        </div>
      </div>

      {/* Reputation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 dark:text-green-200">Trusted Sources</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {sources.filter(s => s.reputation.overallScore >= 0.7).length}
          </p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Questionable Sources</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {sources.filter(s => s.reputation.overallScore >= 0.5 && s.reputation.overallScore < 0.7).length}
          </p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 dark:text-red-200">Unreliable Sources</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {sources.filter(s => s.reputation.overallScore < 0.5).length}
          </p>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {sortedSources.map(source => (
          <SourceReputationCard
            key={source.id}
            source={source}
            onClick={() => onSourceClick(source)}
          />
        ))}
      </div>
    </div>
  );
}

interface SourceReputationCardProps {
  source: SourceWithReputation;
  onClick: () => void;
}

function SourceReputationCard({ source, onClick }: SourceReputationCardProps) {
  const reputationColor = getReputationColor(source.reputation.overallScore);
  const reputationLabel = getReputationLabel(source.reputation.overallScore);

  return (
    <div 
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {source.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {source.domain} • Published {new Date(source.provenance.publishDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${reputationColor.bg} ${reputationColor.text} ${reputationColor.border} border`}>
          {reputationLabel} ({Math.round(source.reputation.overallScore * 100)}%)
        </div>
      </div>

      {/* Reputation Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { label: "Authority", score: source.reputation.authorityScore },
          { label: "Consistency", score: source.reputation.consistencyScore },
          { label: "Transparency", score: source.reputation.transparencyScore },
          { label: "Peer Review", score: source.reputation.perrReviewScore },
          { label: "Accuracy", score: source.reputation.factualAccuracy }
        ].map(metric => (
          <div key={metric.label} className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{metric.label}</div>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs font-medium">{Math.round(metric.score * 100)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Provenance Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Authors: {source.provenance.authors.length}</span>
          <span>Citations: {source.provenance.citations}</span>
          {source.provenance.corrections > 0 && (
            <span className="text-orange-600">Corrections: {source.provenance.corrections}</span>
          )}
          {source.provenance.retractions > 0 && (
            <span className="text-red-600">Retractions: {source.provenance.retractions}</span>
          )}
        </div>
        <button className="text-blue-600 dark:text-blue-400 hover:underline">
          View Details →
        </button>
      </div>
    </div>
  );
}

export function ProvenanceTracker({ source }: { source: SourceWithReputation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getActionIcon = (action: ProvenanceNode["action"]) => {
    switch (action) {
      case "created": return "📝";
      case "shared": return "📤";
      case "modified": return "✏️";
      case "verified": return "✅";
      case "flagged": return "🚩";
    }
  };

  const getActionColor = (action: ProvenanceNode["action"]) => {
    switch (action) {
      case "created": return "text-blue-600";
      case "shared": return "text-green-600";
      case "modified": return "text-yellow-600";
      case "verified": return "text-green-700";
      case "flagged": return "text-red-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Provenance Chain
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track the complete history and verification trail of this source
          </p>
        </div>

        {/* Source Info */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Source Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Original Source:</strong> {source.provenance.originalSource}</div>
                <div><strong>Published:</strong> {new Date(source.provenance.publishDate).toLocaleString()}</div>
                <div><strong>Last Modified:</strong> {new Date(source.provenance.lastModified).toLocaleString()}</div>
                <div><strong>Authors:</strong> {source.provenance.authors.join(", ")}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Impact Metrics</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Citations:</strong> {source.provenance.citations}</div>
                <div><strong>Corrections:</strong> {source.provenance.corrections}</div>
                <div><strong>Retractions:</strong> {source.provenance.retractions}</div>
                <div><strong>Chain Events:</strong> {source.provenance.chainOfCustody.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chain of Custody */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Chain of Custody ({source.provenance.chainOfCustody.length} events)
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isExpanded ? "Collapse" : "Expand All"}
            </button>
          </div>

          <div className="space-y-3">
            {source.provenance.chainOfCustody.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm">{getActionIcon(event.action)}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${getActionColor(event.action)}`}>
                      {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    By {event.actor} on {event.platform}
                  </p>
                  
                  {isExpanded && event.metadata && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getReputationColor(score: number) {
  if (score >= 0.8) return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" };
  if (score >= 0.6) return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" };
  return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" };
}

function getReputationLabel(score: number) {
  if (score >= 0.9) return "Highly Trusted";
  if (score >= 0.8) return "Trusted";
  if (score >= 0.7) return "Reliable";
  if (score >= 0.6) return "Questionable";
  return "Unreliable";
}

// Mock data generator
export function generateMockReputationData(): SourceWithReputation[] {
  return [
    {
      id: "1",
      title: "Harvard Medical School Study on Health Claims",
      domain: "harvard.edu",
      url: "https://hms.harvard.edu/study",
      category: "academic",
      reputation: {
        authorityScore: 0.95,
        consistencyScore: 0.92,
        transparencyScore: 0.88,
        perrReviewScore: 0.96,
        factualAccuracy: 0.94,
        overallScore: 0.93
      },
      provenance: {
        originalSource: "Harvard Medical School Research Database",
        publishDate: "2024-09-15T10:00:00Z",
        lastModified: "2024-09-16T14:30:00Z",
        authors: ["Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Emily Rodriguez"],
        citations: 147,
        retractions: 0,
        corrections: 1,
        chainOfCustody: [
          {
            id: "1",
            timestamp: "2024-09-15T10:00:00Z",
            action: "created",
            actor: "Harvard Research Team",
            platform: "Harvard Medical Database"
          },
          {
            id: "2",
            timestamp: "2024-09-15T12:00:00Z",
            action: "verified",
            actor: "Peer Review Board",
            platform: "Academic Review System"
          },
          {
            id: "3",
            timestamp: "2024-09-16T09:00:00Z",
            action: "shared",
            actor: "Harvard Press Office",
            platform: "University Website"
          }
        ]
      }
    },
    {
      id: "2",
      title: "Social Media Health Claim Goes Viral",
      domain: "socialmedia.com",
      url: "https://socialmedia.com/post/123",
      category: "social",
      reputation: {
        authorityScore: 0.15,
        consistencyScore: 0.25,
        transparencyScore: 0.10,
        perrReviewScore: 0.05,
        factualAccuracy: 0.20,
        overallScore: 0.15
      },
      provenance: {
        originalSource: "Unknown social media user",
        publishDate: "2024-09-18T15:30:00Z",
        lastModified: "2024-09-18T15:30:00Z",
        authors: ["@HealthGuru123"],
        citations: 0,
        retractions: 0,
        corrections: 0,
        chainOfCustody: [
          {
            id: "1",
            timestamp: "2024-09-18T15:30:00Z",
            action: "created",
            actor: "@HealthGuru123",
            platform: "Social Media Platform"
          },
          {
            id: "2",
            timestamp: "2024-09-18T16:00:00Z",
            action: "shared",
            actor: "Multiple users",
            platform: "Social Media Platform",
            metadata: { shares: 1250, likes: 3400 }
          },
          {
            id: "3",
            timestamp: "2024-09-19T08:00:00Z",
            action: "flagged",
            actor: "Fact-checking team",
            platform: "REACTOR Platform",
            metadata: { reason: "Unsubstantiated health claim" }
          }
        ]
      }
    }
  ];
}