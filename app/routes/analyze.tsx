import { useState, useEffect } from "react";
import { ClaimDetection } from "../components/ClaimDetection";
import { EvidenceDrawer, generateMockEvidence } from "../components/EvidenceDrawer";
import { ReputationDashboard, generateMockReputationData } from "../components/ReputationSystem";
import logoDark from "../welcome/logo-dark.svg";
import logoLight from "../welcome/logo-light.svg";

export function meta() {
  return [
    { title: "Analysis - REACTOR" },
    { name: "description", content: "Real-time fact-checking analysis results" },
  ];
}

export default function Analyze() {
  const [query, setQuery] = useState("");
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [selectedClaimText, setSelectedClaimText] = useState("");
  const [activeTab, setActiveTab] = useState<"detection" | "reputation" | "timeline">("detection");

  useEffect(() => {
    // Get query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      setQuery(decodeURIComponent(q));
    }
  }, []);

  const handleClaimClick = (claim: any) => {
    setSelectedClaimText(claim.text);
    setIsEvidenceDrawerOpen(true);
  };

  const mockEvidence = generateMockEvidence(selectedClaimText);
  const mockReputationData = generateMockReputationData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img
                  src={logoLight}
                  alt="REACTOR"
                  className="h-8 w-auto dark:hidden"
                />
                <img
                  src={logoDark}
                  alt="REACTOR"
                  className="h-8 w-auto hidden dark:block"
                />
              </a>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter a claim to fact-check..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Crisis Mode
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Query Summary */}
        {query && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Fact-Check Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing: "{query}"
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: "detection", label: "Claim Detection", icon: "🔍" },
            { id: "reputation", label: "Source Reputation", icon: "⭐" },
            { id: "timeline", label: "Timeline", icon: "📅" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {activeTab === "detection" && query && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Real-time Claim Detection
              </h2>
              <ClaimDetection 
                content={query} 
                onClaimClick={handleClaimClick}
              />
            </div>
          )}

          {activeTab === "reputation" && (
            <div className="p-6">
              <ReputationDashboard 
                sources={mockReputationData}
                onSourceClick={(source) => {
                  setSelectedClaimText(source.title);
                  setIsEvidenceDrawerOpen(true);
                }}
              />
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Information Timeline
              </h2>
              <div className="space-y-4">
                {mockReputationData.map((source, index) => (
                  <div key={source.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {source.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(source.provenance.publishDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {source.domain} • Reputation: {Math.round(source.reputation.overallScore * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!query && activeTab === "detection" && (
            <div className="p-12 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Enter a claim to analyze
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use the search bar above to start fact-checking any claim or statement.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              🚨 Crisis Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Monitor trending claims and breaking news for rapid fact-checking.
            </p>
            <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
              Enable Crisis Mode
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              🔒 Privacy Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enable on-device processing for sensitive information.
            </p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Enable Privacy Mode
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              👥 Human Review
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Request expert review for uncertain or high-impact claims.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Request Review
            </button>
          </div>
        </div>
      </main>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        claimText={selectedClaimText}
        sources={mockEvidence.sources}
        explanation={mockEvidence.explanation}
      />
    </div>
  );
}