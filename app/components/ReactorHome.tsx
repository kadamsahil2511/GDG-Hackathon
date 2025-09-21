import { useState } from "react";
import { FactCheckDisplay } from "./FactCheckDisplay";
import { SearchResultsDisplay } from "./SearchResultsDisplay";
import PageAnalyzerPopup from "./PageAnalyzerPopup";
import type { PageAnalysisResult } from "./PageAnalyzerPopup";

export function ReactorHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzingPage, setIsAnalyzingPage] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [pageAnalysisResult, setPageAnalysisResult] = useState<PageAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'fact-check' | 'search' | 'page-analyzer'>('fact-check');
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setSearchQuery(""); // Clear text input when image is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() && !selectedImage) return;
    
    if (activeMode === 'search') {
      await handleWebSearch();
    } else if (activeMode === 'page-analyzer') {
      await handlePageAnalysis();
    } else {
      await handleFactCheck();
    }
  };

  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("query", searchQuery);

      const response = await fetch("/api/search", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
        setError("");
      } else {
        setError(data.error || "Failed to perform search");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageAnalysis = async () => {
    if (!searchQuery.trim()) return;
    
    // Validate URL format
    try {
      new URL(searchQuery);
    } catch {
      setError("Please enter a valid URL for page analysis");
      return;
    }
    
    setIsAnalyzingPage(true);
    setShowAnalysisPopup(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("url", searchQuery);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setPageAnalysisResult(data);
        setError("");
      } else {
        setPageAnalysisResult({ error: data.error || "Failed to analyze page" } as PageAnalysisResult);
      }
    } catch (err) {
      setPageAnalysisResult({ error: "Network error. Please try again." } as PageAnalysisResult);
      console.error("Page analysis error:", err);
    } finally {
      setIsAnalyzingPage(false);
    }
  };

  const handleFactCheck = async () => {
    setIsAnalyzing(true);
    setError("");
    // Don't clear previous results immediately - keep them until new ones are ready

    try {
      const formData = new FormData();
      
      if (selectedImage) {
        // Convert image to base64 data URL for processing
        const reader = new FileReader();
        reader.onload = async () => {
          const imageDataUrl = reader.result as string;
          formData.append("inputText", imageDataUrl);
          await submitFactCheck(formData);
        };
        reader.readAsDataURL(selectedImage);
      } else {
        formData.append("inputText", searchQuery);
        await submitFactCheck(formData);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Fact-check error:", err);
      setIsAnalyzing(false);
    }
  };

  const submitFactCheck = async (formData: FormData) => {
    try {
      const response = await fetch("/api/fact-check", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFactCheckResult(data.result);
        setError(""); // Clear any previous errors
      } else {
        setError(data.error || "Failed to analyze the content");
        // Keep previous results visible even if there's an error
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Fact-check error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLuckyAnalysis = () => {
    const sampleClaims = [
      "The Earth is flat according to recent studies",
      "Vaccines contain microchips for tracking",
      "Climate change is not caused by human activity",
      "COVID-19 vaccines alter human DNA",
      "https://www.who.int/news-room/fact-sheets/detail/coronavirus-disease-(covid-19)"
    ];
    const randomClaim = sampleClaims[Math.floor(Math.random() * sampleClaims.length)];
    setSearchQuery(randomClaim);
  };

  const handleClearResults = () => {
    setFactCheckResult(null);
    setSearchResults(null);
    setError("");
    setSearchQuery("");
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button className="text-sm text-gray-700 hover:underline">
            About
          </button>
          <button className="text-sm text-gray-700 hover:underline">
            Privacy
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-gray-700 hover:underline">
            Crisis Mode
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Sign in
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-16 relative">
        {/* Logo - Behind everything */}
        <div className="w-[400px] max-w-[90vw] mb-8 absolute top-0 left-1/2 transform -translate-x-1/2 z-0 opacity-80">
          <img
            src="/logo.png"
            alt="REACTOR"
            className="w-full"
          />
        </div>

        {/* Content - Above logo */}
        <div className="relative z-10 flex flex-col items-center mt-32">
          {/* Search Box */}
          <div className="w-full max-w-[584px] mb-8">
            {/* Mode Tabs */}
            <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveMode('fact-check')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'fact-check'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔍 Fact Check
              </button>
              <button
                onClick={() => setActiveMode('search')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'search'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🌐 Web Search
              </button>
              <button
                onClick={() => setActiveMode('page-analyzer')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'page-analyzer'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔬 Page Analyzer
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    selectedImage 
                      ? "Image selected for analysis..." 
                      : activeMode === 'search'
                        ? "Search the web for anything..."
                        : activeMode === 'page-analyzer'
                          ? "Enter a URL to analyze for misleading content..."
                          : "Enter a claim to fact-check or paste a URL..."
                  }
                  disabled={selectedImage !== null && activeMode === 'fact-check'}
                  className={`w-full pl-12 pr-12 py-3 text-lg border border-gray-300 rounded-full 
                           bg-white text-gray-900 
                           focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                           hover:shadow-lg transition-shadow ${selectedImage && activeMode === 'fact-check' ? 'bg-gray-50' : ''}`}
                />
                {(isAnalyzing || isSearching || isAnalyzingPage) && (
                  <div className="absolute right-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </form>
            
            {/* Image Upload Section - Only for fact-check mode */}
            {activeMode === 'fact-check' && (
              <>
                <div className="mt-4 flex items-center justify-center space-x-4">
                  <label className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-lg
                                 hover:bg-blue-200 transition-colors border border-blue-300 flex items-center space-x-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                      <path d="M14 14L10 10L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  
                  {selectedImage && (
                    <button
                      onClick={handleClearImage}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg
                               hover:bg-red-200 transition-colors border border-red-300"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Selected for analysis"
                        className="max-w-xs max-h-48 rounded-lg shadow-md border border-gray-200"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={handleClearImage}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={handleSearch}
              disabled={(!searchQuery.trim() && !selectedImage) || isAnalyzing || isSearching || isAnalyzingPage}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg
                       hover:bg-gray-200 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       border border-gray-300"
            >
              {isAnalyzing ? "Analyzing..." : 
               isSearching ? "Searching..." :
               isAnalyzingPage ? "Analyzing Page..." :
               selectedImage ? "Analyze Image" : 
               activeMode === 'search' ? "Search Web" :
               activeMode === 'page-analyzer' ? "Analyze Page" : "Fact Check"}
            </button>
            <button
              onClick={handleLuckyAnalysis}
              disabled={isAnalyzing || isSearching || isAnalyzingPage || selectedImage !== null}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg
                       hover:bg-gray-200 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       border border-gray-300"
            >
              {activeMode === 'search' ? "I'm Feeling Lucky" : 
               activeMode === 'page-analyzer' ? "Random URL Check" : "I'm Feeling Skeptical"}
            </button>
            {(factCheckResult || searchResults || error) && (
              <button
                onClick={handleClearResults}
                disabled={isAnalyzing || isSearching || isAnalyzingPage}
                className="bg-red-100 text-red-700 px-6 py-3 rounded-lg
                         hover:bg-red-200 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         border border-red-300"
              >
                Clear Results
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 text-sm max-w-[584px]">
            <span className="text-gray-600">Quick checks:</span>
            <button className="text-blue-600 hover:underline">Breaking News</button>
            <button className="text-blue-600 hover:underline">Health Claims</button>
            <button className="text-blue-600 hover:underline">Science Facts</button>
            <button className="text-blue-600 hover:underline">Political Statements</button>
          </div>
        </div>

        {/* Results Display */}
        <div className="w-full">
          {/* Fact Check Results */}
          <FactCheckDisplay 
            result={factCheckResult}
            isLoading={isAnalyzing}
            error={error && activeMode === 'fact-check' ? error : ""}
          />
          
          {/* Search Results */}
          <SearchResultsDisplay 
            results={searchResults}
            isLoading={isSearching}
            error={error && activeMode === 'search' ? error : ""}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 space-y-2 md:space-y-0">
          <div className="flex space-x-6">
            <span>REACTOR Fact-Checking Platform</span>
            <button className="hover:underline">How it works</button>
            <button className="hover:underline">API</button>
            <button className="hover:underline">Sources</button>
          </div>
          <div className="flex space-x-6">
            <button className="hover:underline">Privacy</button>
            <button className="hover:underline">Terms</button>
            <button className="hover:underline">Settings</button>
            <div className="flex items-center space-x-2">
              <span>🌍</span>
              <select className="bg-transparent border-none text-inherit text-sm">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </footer>

      {/* Page Analyzer Popup */}
      <PageAnalyzerPopup
        isOpen={showAnalysisPopup}
        onClose={() => {
          setShowAnalysisPopup(false);
          setPageAnalysisResult(null);
        }}
        analysis={pageAnalysisResult}
        isLoading={isAnalyzingPage}
        url={searchQuery}
      />
    </div>
  );
}