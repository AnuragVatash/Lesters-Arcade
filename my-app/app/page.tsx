import Link from "next/link";

export default function Home() {
  const hackingGames = [
    {
      id: "motherboard-laser",
      title: "Motherboard Laser",
      description: "Redirect laser beam using mirrors to hit the target",
      difficulty: "Medium",
      path: "/hacks/motherboard-laser"
    },
    {
      id: "data-crack",
      title: "Data Crack",
      description: "Align moving blocks with the red line using precise timing",
      difficulty: "Hard",
      path: "/hacks/data-crack"
    },
    {
      id: "anagram-password",
      title: "Anagram Password",
      description: "Unscramble 5-letter words to find the password",
      difficulty: "Easy",
      path: "/hacks/anagram"
    },
    {
      id: "voltlab-puzzle",
      title: "VOLTlab",
      description: "Connect numbers to multipliers to match target voltage",
      difficulty: "Medium",
      path: "/hacks/voltlab"
    },
    {
      id: "fingerprint-scanner",
      title: "Fingerprint Scanner",
      description: "Match fingerprint fragments to the target pattern",
      difficulty: "Medium",
      path: "/hacks/fingerprint-match"
    },
    {
      id: "circuit-panel",
      title: "Circuit Panel",
      description: "Slide columns to complete the electrical circuit",
      difficulty: "Easy",
      path: "/hacks/circuit-slide"
    },
    {
      id: "bruteforce-exe",
      title: "BruteForce.exe",
      description: "Stop rolling letters to reveal the 8-character password",
      difficulty: "Hard",
      path: "/hacks/bruteforce"
    },
    {
      id: "fingerprint-cloner",
      title: "Fingerprint Cloner",
      description: "Cycle through fingerprint slices to match the target",
      difficulty: "Medium",
      path: "/hacks/fingerprint-cloner"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <div className="border-b border-green-400 p-6">
        <h1 className="text-4xl font-bold text-center mb-2">GTA ONLINE</h1>
        <h2 className="text-2xl text-center mb-2">HACKING SIMULATOR</h2>
        <p className="text-center text-sm opacity-75">Training Module v2.1</p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h3 className="text-xl mb-4">SELECT TRAINING MODULE:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hackingGames.map((game) => (
              <Link 
                key={game.id} 
                href={game.path}
                className="block border border-green-400 p-4 hover:bg-green-400 hover:text-black transition-colors duration-200"
              >
                <div className="mb-2">
                  <h4 className="text-lg font-bold">{game.title}</h4>
                  <span className={`text-sm ${getDifficultyColor(game.difficulty)}`}>
                    [{game.difficulty}]
                  </span>
                </div>
                <p className="text-sm opacity-75">{game.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="border border-green-400 p-4 mt-8">
          <h3 className="text-lg font-bold mb-2">INSTRUCTIONS:</h3>
          <ul className="text-sm space-y-1 opacity-75">
            <li>• Select a hacking module to begin training</li>
            <li>• Each module simulates real GTA Online conditions</li>
            <li>• Practice until you can complete under time pressure</li>
            <li>• Press ESC to return to this menu from any module</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs opacity-50">
          <p>Lifeinvader Security Systems - Selling your secrets since 1996</p>
        </div>
      </div>
    </div>
  );
}
