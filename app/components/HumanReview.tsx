import { useState } from "react";

interface ReviewRequest {
  id: string;
  claimText: string;
  submittedBy: string;
  submissionTime: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: "health" | "politics" | "science" | "economics" | "social";
  automaticAnalysis: {
    confidence: number;
    status: "verified" | "disputed" | "unverified" | "misleading" | "false";
    reasoning: string;
  };
  reviewStatus: "pending" | "in-review" | "completed" | "escalated";
  assignedExpert?: string;
  expertNotes?: string;
  finalDecision?: string;
  impactScore: number; // 1-10 scale
  sourcesProvided: number;
}

interface Expert {
  id: string;
  name: string;
  expertise: string[];
  rating: number;
  reviewsCompleted: number;
  availabilityStatus: "available" | "busy" | "offline";
}

interface HumanReviewSystemProps {
  isExpertMode?: boolean;
}

export function HumanReviewSystem({ isExpertMode = false }: HumanReviewSystemProps) {
  const [activeTab, setActiveTab] = useState<"submit" | "pending" | "completed">("submit");
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>(generateMockReviewRequests());
  const [newRequest, setNewRequest] = useState({
    claimText: "",
    category: "health" as const,
    priority: "medium" as const,
    sources: ""
  });

  const submitReviewRequest = () => {
    if (!newRequest.claimText.trim()) return;

    const request: ReviewRequest = {
      id: `req-${Date.now()}`,
      claimText: newRequest.claimText,
      submittedBy: "Current User",
      submissionTime: new Date().toISOString(),
      priority: newRequest.priority,
      category: newRequest.category,
      automaticAnalysis: {
        confidence: Math.random() * 0.4 + 0.3, // 30-70% confidence
        status: ["disputed", "unverified", "misleading"][Math.floor(Math.random() * 3)] as any,
        reasoning: "Automatic analysis found conflicting evidence and requires expert review for definitive assessment."
      },
      reviewStatus: "pending",
      impactScore: Math.floor(Math.random() * 6) + 5, // 5-10
      sourcesProvided: newRequest.sources.split('\n').filter(s => s.trim()).length
    };

    setReviewRequests([request, ...reviewRequests]);
    setNewRequest({ claimText: "", category: "health", priority: "medium", sources: "" });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-review": return "text-blue-600";
      case "escalated": return "text-red-600";
      case "pending": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  if (isExpertMode) {
    return <ExpertReviewDashboard requests={reviewRequests} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Human-in-the-Loop Review
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Request expert review for uncertain or high-impact claims
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "submit", label: "Submit Request", icon: "📝" },
            { id: "pending", label: "Pending Reviews", icon: "⏳" },
            { id: "completed", label: "Completed", icon: "✅" }
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
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "submit" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Claim to Review *
                </label>
                <textarea
                  value={newRequest.claimText}
                  onChange={(e) => setNewRequest({...newRequest, claimText: e.target.value})}
                  placeholder="Enter the claim that needs expert review..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({...newRequest, category: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="health">Health & Medicine</option>
                    <option value="politics">Politics & Government</option>
                    <option value="science">Science & Technology</option>
                    <option value="economics">Economics & Finance</option>
                    <option value="social">Social Issues</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({...newRequest, priority: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - Important claim</option>
                    <option value="high">High - Potentially harmful</option>
                    <option value="urgent">Urgent - Immediate danger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sources (Optional)
                </label>
                <textarea
                  value={newRequest.sources}
                  onChange={(e) => setNewRequest({...newRequest, sources: e.target.value})}
                  placeholder="Provide any relevant sources or links (one per line)..."
                  className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Review Process
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Initial automatic analysis will be performed</li>
                  <li>• Request will be assigned to qualified expert</li>
                  <li>• Expert review typically completed within 24-48 hours</li>
                  <li>• You'll receive email notification when review is complete</li>
                </ul>
              </div>

              <button
                onClick={submitReviewRequest}
                disabled={!newRequest.claimText.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                         disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Submit for Expert Review
              </button>
            </div>
          )}

          {activeTab === "pending" && (
            <div className="space-y-4">
              {reviewRequests.filter(r => r.reviewStatus !== "completed").map(request => (
                <ReviewRequestCard key={request.id} request={request} />
              ))}
              {reviewRequests.filter(r => r.reviewStatus !== "completed").length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No pending review requests.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div className="space-y-4">
              {reviewRequests.filter(r => r.reviewStatus === "completed").map(request => (
                <ReviewRequestCard key={request.id} request={request} />
              ))}
              {reviewRequests.filter(r => r.reviewStatus === "completed").length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No completed reviews yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRequestCard({ request }: { request: ReviewRequest }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-review": return "text-blue-600";
      case "escalated": return "text-red-600";
      case "pending": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
            {request.claimText}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
            <span>Submitted {new Date(request.submissionTime).toLocaleDateString()}</span>
            <span>Impact Score: {request.impactScore}/10</span>
            {request.assignedExpert && (
              <span>Assigned to: {request.assignedExpert}</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
            {request.priority}
          </span>
          <span className={`text-xs font-medium ${getStatusColor(request.reviewStatus)}`}>
            {request.reviewStatus}
          </span>
        </div>
      </div>

      {request.automaticAnalysis && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Automatic Analysis ({Math.round(request.automaticAnalysis.confidence * 100)}% confidence)
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {request.automaticAnalysis.reasoning}
          </p>
        </div>
      )}

      {request.expertNotes && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mb-3">
          <h4 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
            Expert Notes
          </h4>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {request.expertNotes}
          </p>
        </div>
      )}

      {request.finalDecision && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
          <h4 className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
            Final Decision
          </h4>
          <p className="text-xs text-green-600 dark:text-green-400">
            {request.finalDecision}
          </p>
        </div>
      )}
    </div>
  );
}

function ExpertReviewDashboard({ requests }: { requests: ReviewRequest[] }) {
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null);

  const pendingRequests = requests.filter(r => r.reviewStatus === "pending" || r.reviewStatus === "in-review");
  const completedRequests = requests.filter(r => r.reviewStatus === "completed");

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Expert Review Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">Pending Reviews</h3>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {pendingRequests.length}
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">In Review</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {requests.filter(r => r.reviewStatus === "in-review").length}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200">Completed Today</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedRequests.length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Pending Reviews
          </h2>
          {pendingRequests.map(request => (
            <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                    {request.claimText}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>Priority: {request.priority}</span>
                    <span>Category: {request.category}</span>
                    <span>Impact: {request.impactScore}/10</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRequest(request)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mock data generator
function generateMockReviewRequests(): ReviewRequest[] {
  return [
    {
      id: "1",
      claimText: "New study shows that 5G towers cause cancer in 90% of people living within 1 mile radius",
      submittedBy: "User123",
      submissionTime: "2024-09-21T10:00:00Z",
      priority: "high",
      category: "health",
      automaticAnalysis: {
        confidence: 0.65,
        status: "disputed",
        reasoning: "Multiple conflicting studies found. WHO guidelines contradict claim. Requires expert epidemiological review."
      },
      reviewStatus: "in-review",
      assignedExpert: "Dr. Sarah Johnson (Epidemiologist)",
      expertNotes: "Reviewing latest peer-reviewed studies on EMF exposure. Initial assessment suggests claim lacks scientific foundation.",
      impactScore: 9,
      sourcesProvided: 3
    },
    {
      id: "2",
      claimText: "Climate change is not caused by human activity according to 97% of scientists",
      submittedBy: "FactChecker22",
      submissionTime: "2024-09-20T14:30:00Z",
      priority: "medium",
      category: "science",
      automaticAnalysis: {
        confidence: 0.45,
        status: "misleading",
        reasoning: "Claim contradicts established scientific consensus. Confidence low due to complexity of climate science."
      },
      reviewStatus: "completed",
      assignedExpert: "Dr. Michael Chen (Climate Scientist)",
      expertNotes: "Claim is factually incorrect. Scientific consensus shows 97% of climate scientists agree that human activities are the primary cause of recent climate change.",
      finalDecision: "FALSE - This claim contradicts overwhelming scientific evidence and consensus on anthropogenic climate change.",
      impactScore: 8,
      sourcesProvided: 1
    }
  ];
}