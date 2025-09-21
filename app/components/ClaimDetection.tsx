import { useState, useEffect, useRef } from "react";

interface ClaimDetectionResult {
  id: string;
  text: string;
  startPos: number;
  endPos: number;
  confidence: number;
  status: "verified" | "disputed" | "unverified" | "misleading" | "false";
  sources: number;
}

interface ClaimDetectionProps {
  content: string;
  onClaimClick: (claim: ClaimDetectionResult) => void;
}

export function ClaimDetection({ content, onClaimClick }: ClaimDetectionProps) {
  const [detectedClaims, setDetectedClaims] = useState<ClaimDetectionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Simulate real-time claim detection
  useEffect(() => {
    if (!content) {
      setDetectedClaims([]);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const claims = detectClaims(content);
      setDetectedClaims(claims);
      setIsAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [content]);

  // Mock claim detection logic
  const detectClaims = (text: string): ClaimDetectionResult[] => {
    const patterns = [
      /\b(?:studies show|research proves|scientists say|experts claim|according to)\s+[^.!?]*[.!?]/gi,
      /\b(?:always|never|all|none|every|completely|totally|absolutely)\s+[^.!?]*[.!?]/gi,
      /\b(?:\d+%|\d+\s*percent)\s+[^.!?]*[.!?]/gi,
      /\b(?:causes?|prevents?|cures?|leads to|results in)\s+[^.!?]*[.!?]/gi,
    ];

    const claims: ClaimDetectionResult[] = [];
    let claimId = 1;

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const claimText = match[0];
        const confidence = Math.random() * 0.4 + 0.6; // 60-100%
        const status = getRandomStatus(confidence);
        
        claims.push({
          id: `claim-${claimId++}`,
          text: claimText,
          startPos: match.index,
          endPos: match.index + claimText.length,
          confidence,
          status,
          sources: Math.floor(Math.random() * 20) + 1
        });
      }
    });

    return claims.slice(0, 10); // Limit to 10 claims
  };

  const getRandomStatus = (confidence: number): ClaimDetectionResult["status"] => {
    if (confidence > 0.9) return "verified";
    if (confidence > 0.8) return "disputed";
    if (confidence > 0.7) return "unverified";
    if (confidence > 0.6) return "misleading";
    return "false";
  };

  const getStatusColor = (status: ClaimDetectionResult["status"]) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800 border-green-300";
      case "disputed": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "unverified": return "bg-gray-100 text-gray-800 border-gray-300";
      case "misleading": return "bg-orange-100 text-orange-800 border-orange-300";
      case "false": return "bg-red-100 text-red-800 border-red-300";
    }
  };

  const getStatusIcon = (status: ClaimDetectionResult["status"]) => {
    switch (status) {
      case "verified": return "✓";
      case "disputed": return "⚠";
      case "unverified": return "?";
      case "misleading": return "⚡";
      case "false": return "✗";
    }
  };

  const renderContentWithBadges = () => {
    if (!content || detectedClaims.length === 0) {
      return <span>{content}</span>;
    }

    const parts = [];
    let lastIndex = 0;

    // Sort claims by start position
    const sortedClaims = [...detectedClaims].sort((a, b) => a.startPos - b.startPos);

    sortedClaims.forEach((claim, index) => {
      // Add text before the claim
      if (claim.startPos > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {content.slice(lastIndex, claim.startPos)}
          </span>
        );
      }

      // Add the claim with badge
      parts.push(
        <span className="relative inline-block group cursor-pointer"
          onClick={() => onClaimClick(claim)}
        >
          <span className="underline decoration-dashed decoration-2 hover:bg-blue-50 px-1 rounded">
            {claim.text}
          </span>
          <span className={`
            absolute -top-8 left-1/2 transform -translate-x-1/2 
            px-2 py-1 text-xs rounded-full border
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            whitespace-nowrap z-10 pointer-events-none
            ${getStatusColor(claim.status)}
          `}>
            {getStatusIcon(claim.status)} {claim.status} ({Math.round(claim.confidence * 100)}%)
          </span>
        </span>
      );

      lastIndex = claim.endPos;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end">
          {content.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="space-y-4">
      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>Analyzing claims in real-time...</span>
        </div>
      )}

      {/* Content with inline badges */}
      <div 
        ref={textRef}
        className="prose max-w-none leading-relaxed text-gray-800"
      >
        {renderContentWithBadges()}
      </div>

      {/* Claims Summary */}
      {detectedClaims.length > 0 && !isAnalyzing && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Detected Claims ({detectedClaims.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {detectedClaims.map(claim => (
              <button
                key={claim.id}
                onClick={() => onClaimClick(claim)}
                className={`
                  px-3 py-1 text-xs rounded-full border cursor-pointer
                  hover:shadow-md transition-shadow
                  ${getStatusColor(claim.status)}
                `}
              >
                {getStatusIcon(claim.status)} {claim.status} ({claim.sources} sources)
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Input component for testing
export function ClaimInput() {
  const [inputText, setInputText] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<ClaimDetectionResult | null>(null);

  const sampleTexts = [
    "Studies show that drinking 8 glasses of water daily prevents all diseases. Research proves that this completely eliminates the need for medical treatment.",
    "According to scientists, vaccines contain 100% safe ingredients and never cause any side effects. Experts claim this is absolutely certain.",
    "Climate change causes 90% of natural disasters worldwide. This leads to completely unpredictable weather patterns every single time.",
    "New research shows that coffee prevents cancer in all cases. Studies prove that drinking 10 cups daily totally eliminates health risks."
  ];

  const handleClaimClick = (claim: ClaimDetectionResult) => {
    setSelectedClaim(claim);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Real-time Claim Detection
        </h2>
        
        {/* Sample texts */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Try a sample text:
          </label>
          <div className="flex flex-wrap gap-2">
            {sampleTexts.map((text, index) => (
              <button
                key={index}
                onClick={() => setInputText(text)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Sample {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter text to analyze:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type any text here to see real-time claim detection..."
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Claim detection results */}
      {inputText && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <ClaimDetection 
            content={inputText} 
            onClaimClick={handleClaimClick}
          />
        </div>
      )}

      {/* Selected claim details */}
      {selectedClaim && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Claim Details
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Text:</strong> {selectedClaim.text}</p>
            <p><strong>Status:</strong> {selectedClaim.status}</p>
            <p><strong>Confidence:</strong> {Math.round(selectedClaim.confidence * 100)}%</p>
            <p><strong>Sources found:</strong> {selectedClaim.sources}</p>
          </div>
          <button
            onClick={() => setSelectedClaim(null)}
            className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            View Evidence →
          </button>
        </div>
      )}
    </div>
  );
}