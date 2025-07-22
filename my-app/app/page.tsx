import Link from "next/link";

export default function Home() {
  const hackingGames = [
    {
      id: "motherboard-laser",
      title: "Motherboard Laser",
      description: "Redirect laser beam using mirrors to hit the target",
      difficulty: "Medium",
      path: "/hacks/motherboard-laser",
      category: "Security Systems",
      gradient: "from-red-600 to-orange-500",
      icon: "🔴"
    },
    {
      id: "data-crack",
      title: "Data Crack",
      description: "Align moving blocks with the red line using precise timing",
      difficulty: "Hard",
      path: "/hacks/data-crack",
      category: "Access Control",
      gradient: "from-blue-600 to-cyan-500",
      icon: "📊"
    },
    {
      id: "anagram-password",
      title: "Password Decoder",
      description: "Unscramble 5-letter words to find the access code",
      difficulty: "Easy",
      path: "/hacks/anagram",
      category: "Cryptography",
      gradient: "from-green-600 to-emerald-500",
      icon: "🔤"
    },
    {
      id: "voltlab-puzzle",
      title: "VOLTlab Circuit",
      description: "Connect numbers to multipliers to match target voltage",
      difficulty: "Medium",
      path: "/hacks/voltlab",
      category: "Electronics",
      gradient: "from-yellow-600 to-amber-500",
      icon: "⚡"
    },
    {
      id: "fingerprint-scanner",
      title: "Biometric Scanner",
      description: "Match fingerprint fragments to the target pattern",
      difficulty: "Medium",
      path: "/hacks/fingerprint-match",
      category: "Biometrics",
      gradient: "from-purple-600 to-pink-500",
      icon: "👆"
    },
    {
      id: "circuit-panel",
      title: "Circuit Panel",
      description: "Slide columns to complete the electrical circuit",
      difficulty: "Easy",
      path: "/hacks/circuit-slide",
      category: "Engineering",
      gradient: "from-teal-600 to-cyan-500",
      icon: "🔧"
    },
    {
      id: "bruteforce-exe",
      title: "BruteForce.exe",
      description: "Stop rolling letters to reveal the 8-character password",
      difficulty: "Hard",
      path: "/hacks/bruteforce",
      category: "Password Cracking",
      gradient: "from-gray-700 to-gray-500",
      icon: "💻"
    },
    {
      id: "fingerprint-cloner",
      title: "Fingerprint Cloner",
      description: "Cycle through fingerprint slices to match the target",
      difficulty: "Medium",
      path: "/hacks/fingerprint-cloner",
      category: "Advanced Biometrics",
      gradient: "from-indigo-600 to-blue-500",
      icon: "🔬"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "Hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative z-10 text-center py-12 px-6">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            GTA ONLINE
          </h1>
          <h2 className="text-3xl font-semibold mb-2 text-gray-300">HACKING SIMULATOR</h2>
          <p className="text-lg text-gray-400">Master the art of digital infiltration</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-8 text-center text-gray-200">SELECT TRAINING MODULE</h3>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hackingGames.map((game) => (
              <Link 
                key={game.id} 
                href={game.path}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-90`}></div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>
                
                {/* Content */}
                <div className="relative z-10 p-6 h-48 flex flex-col justify-between">
                  {/* Top section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{game.icon}</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(game.difficulty)} text-white`}>
                        {game.difficulty}
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold mb-2 text-white group-hover:text-yellow-300 transition-colors">
                      {game.title}
                    </h4>
                    
                    <p className="text-sm text-gray-200 opacity-90 mb-2">
                      {game.description}
                    </p>
                  </div>
                  
                  {/* Bottom section */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
                      {game.category}
                    </span>
                    <div className="text-white group-hover:text-yellow-300 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-6 border border-blue-500/20">
            <div className="text-blue-400 text-2xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold mb-2 text-blue-300">Authentic Experience</h3>
            <p className="text-sm text-gray-300">Each module simulates real GTA Online hacking conditions with accurate timing and mechanics.</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border border-purple-500/20">
            <div className="text-purple-400 text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2 text-purple-300">Progressive Difficulty</h3>
            <p className="text-sm text-gray-300">Train at your own pace with varying difficulty levels from beginner to expert.</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-6 border border-green-500/20">
            <div className="text-green-400 text-2xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold mb-2 text-green-300">Skill Development</h3>
            <p className="text-sm text-gray-300">Master precision timing, pattern recognition, and quick decision making.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <div className="border-t border-gray-700 pt-6">
            <p>© 2024 GTA Online Hacking Simulator - Unofficial Training Platform</p>
            <p className="mt-2 text-xs">Practice makes perfect. Train responsibly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
