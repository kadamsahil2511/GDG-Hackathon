import logoDark from "../welcome/logo-dark.svg";
import logoLight from "../welcome/logo-light.svg";
import { useState } from "react";

export function ReactorHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate navigation to analysis page
    setTimeout(() => {
      window.location.href = `/analyze?q=${encodeURIComponent(searchQuery)}`;
    }, 1000);
  };

  const handleLuckyAnalysis = () => {
    const sampleClaims = [
      "The Earth is flat according to recent studies",
      "Vaccines contain microchips for tracking",
      "Climate change is not caused by human activity",
      "COVID-19 vaccines alter human DNA"
    ];
    const randomClaim = sampleClaims[Math.floor(Math.random() * sampleClaims.length)];
    setSearchQuery(randomClaim);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button className="text-sm text-gray-700 dark:text-gray-300 hover:underline">
            About
          </button>
          <button className="text-sm text-gray-700 dark:text-gray-300 hover:underline">
            Privacy
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-gray-700 dark:text-gray-300 hover:underline">
            Crisis Mode
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Sign in
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        {/* Logo */}
        <div className="w-[400px] max-w-[90vw] mb-8">
          <img
            src={logoLight}
            alt="REACTOR"
            className="block w-full dark:hidden"
          />
          <img
            src={logoDark}
            alt="REACTOR"
            className="hidden w-full dark:block"
          />
        </div>

        {/* Search Box */}
        <div className="w-full max-w-[584px] mb-8">
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
                placeholder="Enter a claim to fact-check..."
                className="w-full pl-12 pr-12 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-full 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                         hover:shadow-lg transition-shadow"
              />
              {isAnalyzing && (
                <div className="absolute right-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isAnalyzing}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg
                     hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border border-gray-300 dark:border-gray-600"
          >
            {isAnalyzing ? "Analyzing..." : "Fact Check"}
          </button>
          <button
            onClick={handleLuckyAnalysis}
            disabled={isAnalyzing}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg
                     hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border border-gray-300 dark:border-gray-600"
          >
            I'm Feeling Skeptical
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3 text-sm max-w-[584px]">
          <span className="text-gray-600 dark:text-gray-400">Quick checks:</span>
          <button className="text-blue-600 dark:text-blue-400 hover:underline">Breaking News</button>
          <button className="text-blue-600 dark:text-blue-400 hover:underline">Health Claims</button>
          <button className="text-blue-600 dark:text-blue-400 hover:underline">Science Facts</button>
          <button className="text-blue-600 dark:text-blue-400 hover:underline">Political Statements</button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400 space-y-2 md:space-y-0">
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
    </div>
  );
}