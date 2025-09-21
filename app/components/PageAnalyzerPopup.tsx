import { useState, useEffect } from "react";
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

export interface PageAnalysisResult {
  overall_credibility_score: number;
  is_misleading: boolean;
  risk_level: "low" | "medium" | "high";
  issues_found: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    description: string;
    evidence: string;
    location: string;
  }>;
  positive_indicators?: string[];
  sources_mentioned?: number;
  fact_check_summary: string;
  recommendation: "proceed" | "caution" | "avoid";
  key_claims?: Array<{
    claim: string;
    verifiable: boolean;
    confidence: "high" | "medium" | "low";
  }>;
  analyzed_url?: string;
  analyzed_title?: string;
  analyzed_domain?: string;
  analysis_timestamp?: number;
  word_count?: number;
  error?: string;
}

interface PageAnalyzerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PageAnalysisResult | null;
  isLoading: boolean;
  url: string;
}

export default function PageAnalyzerPopup({ 
  isOpen, 
  onClose, 
  analysis, 
  isLoading, 
  url 
}: PageAnalyzerPopupProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Reset details when popup opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowDetails(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high": return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case "medium": return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case "low": return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const closeTab = () => {
    if (window.confirm("Are you sure you want to close this tab?")) {
      window.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">REACTOR Page Analysis</h2>
              <p className="text-sm text-gray-600 truncate max-w-md">{url}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ClockIcon className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-lg font-medium text-gray-900">Analyzing Page Content...</p>
                <p className="text-sm text-gray-600 mt-2">This may take a few seconds</p>
              </div>
            </div>
          ) : analysis?.error ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</p>
              <p className="text-sm text-gray-600">{analysis.error}</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Overall Assessment */}
              <div className={`p-4 rounded-lg border-2 ${getRiskColor(analysis.risk_level)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getRiskIcon(analysis.risk_level)}
                    <h3 className="font-semibold text-lg">
                      {analysis.is_misleading ? "⚠️ Potentially Misleading Content Detected" : "✅ Content Appears Credible"}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getCredibilityColor(analysis.overall_credibility_score)}`}>
                      {analysis.overall_credibility_score}%
                    </div>
                    <div className="text-xs text-gray-600">Credibility Score</div>
                  </div>
                </div>
                
                <p className="text-sm mb-3">{analysis.fact_check_summary}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span>Risk Level: <strong className="capitalize">{analysis.risk_level}</strong></span>
                    {analysis.sources_mentioned !== undefined && (
                      <span>Sources: <strong>{analysis.sources_mentioned}</strong></span>
                    )}
                    {analysis.word_count && (
                      <span>Words: <strong>{analysis.word_count.toLocaleString()}</strong></span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {analysis.analysis_timestamp && new Date(analysis.analysis_timestamp * 1000).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Issues Found */}
              {analysis.issues_found && analysis.issues_found.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Issues Identified ({analysis.issues_found.length})
                  </h4>
                  <div className="space-y-3">
                    {analysis.issues_found.slice(0, showDetails ? undefined : 3).map((issue, index) => (
                      <div key={index} className="bg-white border border-red-200 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-red-900 capitalize">
                            {issue.type.replace(/_/g, ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium
                            ${issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                              issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'}`}>
                            {issue.severity} severity
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                        {issue.evidence && (
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Evidence:</strong> {issue.evidence}
                          </p>
                        )}
                      </div>
                    ))}
                    {analysis.issues_found.length > 3 && (
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        {showDetails ? 'Show Less' : `Show ${analysis.issues_found.length - 3} More Issues`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Positive Indicators */}
              {analysis.positive_indicators && analysis.positive_indicators.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Positive Credibility Indicators
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                    {analysis.positive_indicators.map((indicator, index) => (
                      <li key={index}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Claims */}
              {analysis.key_claims && analysis.key_claims.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Key Claims Analysis</h4>
                  <div className="space-y-2">
                    {analysis.key_claims.map((claim, index) => (
                      <div key={index} className="bg-white border border-blue-200 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium
                            ${claim.verifiable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {claim.verifiable ? 'Verifiable' : 'Unverifiable'}
                          </span>
                          <span className="text-xs text-gray-600">
                            Confidence: {claim.confidence}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{claim.claim}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {analysis?.recommendation && (
                <span className="capitalize">
                  <strong>Recommendation:</strong> {analysis.recommendation === 'avoid' ? 'Exercise caution with this content' : 
                    analysis.recommendation === 'caution' ? 'Read with healthy skepticism' : 'Content appears reliable'}
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Reading
              </button>
              {analysis?.is_misleading && (
                <button
                  onClick={closeTab}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Close Tab
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}