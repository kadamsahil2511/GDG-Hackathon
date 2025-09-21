import { useState, useEffect } from "react";

interface TrendingClaim {
  id: string;
  text: string;
  velocity: number; // claims per hour
  reach: number; // estimated people reached
  platforms: string[];
  sentiment: "positive" | "negative" | "neutral";
  riskLevel: "low" | "medium" | "high" | "critical";
  firstDetected: string;
  lastUpdated: string;
  verificationStatus: "unverified" | "investigating" | "disputed" | "debunked" | "verified";
  relatedClaims: string[];
}

interface BreakingEvent {
  id: string;
  title: string;
  description: string;
  category: "health" | "politics" | "science" | "disaster" | "security" | "economy";
  severity: "low" | "medium" | "high" | "critical";
  claimsCount: number;
  misinformationRisk: number;
  startTime: string;
  location?: string;
  sources: string[];
  keywordTriggers: string[];
}

interface CrisisModeProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export function CrisisMode({ isActive, onToggle }: CrisisModeProps) {
  const [trendingClaims, setTrendingClaims] = useState<TrendingClaim[]>([]);
  const [breakingEvents, setBreakingEvents] = useState<BreakingEvent[]>([]);
  const [alertLevel, setAlertLevel] = useState<"normal" | "elevated" | "high" | "critical">("normal");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    if (isActive) {
      // Load initial data
      loadCrisisData();
      
      // Set up auto-refresh
      if (autoRefresh) {
        const interval = setInterval(loadCrisisData, refreshInterval * 1000);
        return () => clearInterval(interval);
      }
    }
  }, [isActive, autoRefresh, refreshInterval]);

  const loadCrisisData = () => {
    // Simulate loading trending claims and breaking events
    setTrendingClaims(generateMockTrendingClaims());
    setBreakingEvents(generateMockBreakingEvents());
    updateAlertLevel();
  };

  const updateAlertLevel = () => {
    // Determine alert level based on trending claims and events
    const criticalCount = trendingClaims.filter(c => c.riskLevel === "critical").length;
    const highRiskCount = trendingClaims.filter(c => c.riskLevel === "high").length;
    
    if (criticalCount > 0) {
      setAlertLevel("critical");
    } else if (highRiskCount > 2) {
      setAlertLevel("high");
    } else if (highRiskCount > 0) {
      setAlertLevel("elevated");
    } else {
      setAlertLevel("normal");
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-600";
      case "high": return "bg-orange-500";
      case "elevated": return "bg-yellow-500";
      case "normal": return "bg-green-500";
    }
  };

  if (!isActive) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Crisis Mode Inactive
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enable Crisis Mode to monitor trending misinformation and breaking events in real-time.
          </p>
          <button
            onClick={() => onToggle(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Activate Crisis Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Crisis Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getAlertColor(alertLevel)} animate-pulse`}></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Crisis Mode Active
              </h1>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(alertLevel)}`}>
              {alertLevel.toUpperCase()} ALERT
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Auto-refresh:</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            </div>
            <button
              onClick={() => onToggle(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Active Claims</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{trendingClaims.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Trending now</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Breaking Events</h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{breakingEvents.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monitoring</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">High Risk</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {trendingClaims.filter(c => c.riskLevel === "high" || c.riskLevel === "critical").length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Requires attention</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Reach</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {(trendingClaims.reduce((sum, claim) => sum + claim.reach, 0) / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">People reached</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Claims */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Trending Claims
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {trendingClaims.map(claim => (
              <TrendingClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </div>

        {/* Breaking Events */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Breaking Events
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {breakingEvents.map(event => (
              <BreakingEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingClaimCard({ claim }: { claim: TrendingClaim }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-green-600";
      case "debunked": return "text-red-600";
      case "disputed": return "text-orange-600";
      case "investigating": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
            {claim.text}
          </p>
        </div>
        <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(claim.riskLevel)}`}>
          {claim.riskLevel}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-3">
          <span>🚀 {claim.velocity}/hr</span>
          <span>👥 {(claim.reach / 1000).toFixed(0)}K reached</span>
          <span className={getStatusColor(claim.verificationStatus)}>
            {claim.verificationStatus}
          </span>
        </div>
        <span>{new Date(claim.lastUpdated).toLocaleTimeString()}</span>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex space-x-1">
          {claim.platforms.map(platform => (
            <span key={platform} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {platform}
            </span>
          ))}
        </div>
        <button className="text-blue-600 dark:text-blue-400 hover:underline text-xs">
          Investigate →
        </button>
      </div>
    </div>
  );
}

function BreakingEventCard({ event }: { event: BreakingEvent }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health": return "🏥";
      case "politics": return "🏛️";
      case "science": return "🧬";
      case "disaster": return "🌪️";
      case "security": return "🔒";
      case "economy": return "💰";
      default: return "📰";
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCategoryIcon(event.category)}</span>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {event.title}
            </h3>
            {event.location && (
              <p className="text-xs text-gray-600 dark:text-gray-400">📍 {event.location}</p>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
          {event.severity}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {event.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-3">
          <span>📊 {event.claimsCount} claims</span>
          <span>⚠️ {Math.round(event.misinformationRisk * 100)}% risk</span>
        </div>
        <div className="flex space-x-2">
          <button className="text-blue-600 dark:text-blue-400 hover:underline">
            Monitor
          </button>
          <button className="text-green-600 dark:text-green-400 hover:underline">
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock data generators
function generateMockTrendingClaims(): TrendingClaim[] {
  return [
    {
      id: "1",
      text: "New study shows that drinking coffee prevents all diseases and extends life by 20 years",
      velocity: 450,
      reach: 2500000,
      platforms: ["Twitter", "Facebook", "TikTok"],
      sentiment: "positive",
      riskLevel: "high",
      firstDetected: "2024-09-21T10:00:00Z",
      lastUpdated: "2024-09-21T14:30:00Z",
      verificationStatus: "investigating",
      relatedClaims: ["claim-2", "claim-3"]
    },
    {
      id: "2",
      text: "Breaking: Government confirms aliens have landed and are living among us",
      velocity: 1200,
      reach: 5000000,
      platforms: ["Twitter", "Reddit", "YouTube"],
      sentiment: "negative",
      riskLevel: "critical",
      firstDetected: "2024-09-21T12:00:00Z",
      lastUpdated: "2024-09-21T14:45:00Z",
      verificationStatus: "debunked",
      relatedClaims: ["claim-4", "claim-5"]
    },
    {
      id: "3",
      text: "Scientists discover that eating chocolate cake daily improves brain function by 300%",
      velocity: 200,
      reach: 800000,
      platforms: ["Instagram", "Facebook"],
      sentiment: "positive",
      riskLevel: "medium",
      firstDetected: "2024-09-21T09:00:00Z",
      lastUpdated: "2024-09-21T14:15:00Z",
      verificationStatus: "disputed",
      relatedClaims: []
    }
  ];
}

function generateMockBreakingEvents(): BreakingEvent[] {
  return [
    {
      id: "1",
      title: "Major earthquake hits coastal region",
      description: "7.2 magnitude earthquake reported with potential tsunami warnings. Multiple unverified claims about casualties and damage spreading on social media.",
      category: "disaster",
      severity: "high",
      claimsCount: 47,
      misinformationRisk: 0.85,
      startTime: "2024-09-21T13:00:00Z",
      location: "Pacific Coast",
      sources: ["USGS", "Local News", "Emergency Services"],
      keywordTriggers: ["earthquake", "tsunami", "disaster", "casualties"]
    },
    {
      id: "2",
      title: "Presidential health rumors circulating",
      description: "Unsubstantiated claims about the president's health condition spreading rapidly across social platforms following a cancelled public appearance.",
      category: "politics",
      severity: "medium",
      claimsCount: 23,
      misinformationRisk: 0.65,
      startTime: "2024-09-21T11:30:00Z",
      sources: ["Political Twitter", "News Outlets", "Official Statements"],
      keywordTriggers: ["president", "health", "condition", "cancelled"]
    }
  ];
}