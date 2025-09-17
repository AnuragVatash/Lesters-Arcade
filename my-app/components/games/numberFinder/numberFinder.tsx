"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from "react";
import TimeComparisonDisplay from "@/components/ui/TimeComparison";
import { submitTime as submitLeaderboardTime } from "@/lib/leaderboard";
import { useOracle } from "@/hooks/useOracle";
import ParticleSystem from "@/components/effects/ParticleSystem";
import StartupOverlay from "@/components/ui/StartupOverlay";

import { type User } from "@/lib/auth";

interface NumberFinderProps {
  user: User;
  skipCutscenes?: boolean;
}

export default function NumberFinder({ user, skipCutscenes = false }: NumberFinderProps) {
  // Create array of 8 Rows with 10 double digit numbers each. pick a random array and random index for example arr[row[0]col[0]]]
  //This picks the first row first column the user has to select this index using wasd keys.
  // Game is supposed to be for selecting 4 elements but sinnce the elements are always in the same order it doesn't matter
  // Every second or so the elements move backwards -- find out how to do this
  type Row = number[]; // A row will be an array of numbers
  type GameBoard = Row[]; // The game board will be an array of rows

  const [gameBoard, setGameBoard] = useState<GameBoard>([]);
  const [rowIndex, setRowIndex] = useState<number>(0);
  const [colIndex, setColIndex] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // State to keep track of the hovered cell
  const [hoveredRow, setHoveredRow] = useState(0);
  const [hoveredCol, setHoveredCol] = useState(0);

  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [timeComparison, setTimeComparison] = useState<{
    oldTime: number | null;
    newTime: number;
    improvement: number | null;
    isFirstRecord: boolean;
  } | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const [targetValue, setTargetValue] = useState<number>(0);
  const [showStartup, setShowStartup] = useState<boolean>(true);
  const [hackingProgress, setHackingProgress] = useState<number>(0);
  const [hackingText, setHackingText] = useState<string>(
    "INITIALIZING HACK PROTOCOL..."
  );

  // Oracle hook for cheat code functionality
  const { oracleActive, resetOracle } = useOracle({
    gameStarted,
    activationSequence: "`", // Change to backtick for easier access
    onOracleActivated: () => {
      console.log("Oracle activated! Looking for target value:", targetValue);
      // Automatically move the cursor to the target number
      // Since numbers are now moving, this needs to be re-evaluated on oracle activation
      // We'll rely on the targetValue to find its current position
      if (gameBoard.length > 0) {
        let foundRow = -1;
        let foundCol = -1;
        for (let r = 0; r < gameBoard.length; r++) {
          for (let c = 0; c < gameBoard[r].length; c++) {
            if (gameBoard[r][c] === targetValue) {
              foundRow = r;
              foundCol = c;
              break;
            }
          }
          if (foundRow !== -1) break;
        }
        console.log("Target found at:", foundRow, foundCol);
        console.log(
          "Moving cursor from:",
          hoveredRow,
          hoveredCol,
          "to:",
          foundRow,
          foundCol
        );
        if (foundRow !== -1) {
          setHoveredRow(foundRow);
          setHoveredCol(foundCol);
        }
      }
    },
  });

  const startGame = () => {
    const newGameBoard: GameBoard = [];
    for (let i = 0; i < 8; i++) {
      const row: number[] = [];
      for (let j = 0; j < 10; j++) {
        row.push(Math.floor(Math.random() * 90) + 10); // Example: generate random double-digit numbers
      }
      newGameBoard.push(row);
    }
    setGameBoard(newGameBoard);

    const newRowIndex: number = Math.floor(Math.random() * 8);
    const newColIndex: number = Math.floor(Math.random() * 10);
    setRowIndex(newRowIndex);
    setColIndex(newColIndex);
    setTargetValue(newGameBoard[newRowIndex][newColIndex]); // Store the target value

    // Set cursor to a random position (different from target)
    let randomCursorRow: number;
    let randomCursorCol: number;
    do {
      randomCursorRow = Math.floor(Math.random() * 8);
      randomCursorCol = Math.floor(Math.random() * 10);
    } while (
      randomCursorRow === newRowIndex &&
      randomCursorCol === newColIndex
    );

    setHoveredRow(randomCursorRow);
    setHoveredCol(randomCursorCol);
    setGameStarted(true);
    setGameStartTime(Date.now()); // Start timer
    setTimeComparison(null);
    setShowAlert(false); // Hide any existing alerts
    resetOracle(); // Reset oracle on new game
  };

  // Startup hacking sequence effect
  useEffect(() => {
    if (!showStartup) return;

    // Fast path when skip is enabled: briefly show the overlay, then continue
    if (skipCutscenes) {
      setHackingText("INITIALIZING HACK PROTOCOL...");
      setHackingProgress(100);
      const t = setTimeout(() => {
        setShowStartup(false);
      }, 300);
      return () => clearTimeout(t);
    }

    const hackingSteps = [
      { text: "INITIALIZING HACK PROTOCOL...", duration: 800 },
      { text: "BYPASSING SECURITY FIREWALL...", duration: 1200 },
      { text: "DECRYPTING DATABASE ACCESS...", duration: 1000 },
      { text: "INJECTING MALICIOUS PAYLOAD...", duration: 900 },
      { text: "ESTABLISHING BACKDOOR CONNECTION...", duration: 1100 },
      { text: "HACK COMPLETE - ACCESS GRANTED", duration: 600 },
    ];

    let currentStep = 0;
    let currentProgress = 0;
    let progressInterval: NodeJS.Timeout | null = null;
    let stepTimeout: NodeJS.Timeout | null = null;
    let finalTimeout: NodeJS.Timeout | null = null;

    const updateProgress = () => {
      if (currentStep >= hackingSteps.length) {
        setHackingProgress(100);
        finalTimeout = setTimeout(() => {
          setShowStartup(false);
        }, 500);
        return;
      }

      const step = hackingSteps[currentStep];
      setHackingText(step.text);

      const stepIncrement = 100 / hackingSteps.length;
      progressInterval = setInterval(() => {
        currentProgress += 2;
        setHackingProgress(
          Math.min(currentProgress, (currentStep + 1) * stepIncrement)
        );

        if (currentProgress >= (currentStep + 1) * stepIncrement) {
          if (progressInterval) clearInterval(progressInterval);
          currentStep++;
          stepTimeout = setTimeout(updateProgress, 200);
        }
      }, step.duration / (stepIncrement / 2));
    };

    const startTimeout = setTimeout(updateProgress, 500);

    return () => {
      clearTimeout(startTimeout);
      if (progressInterval) clearInterval(progressInterval);
      if (stepTimeout) clearTimeout(stepTimeout);
      if (finalTimeout) clearTimeout(finalTimeout);
    };
  }, [showStartup, skipCutscenes]);

  // Effect for keyboard navigation
  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Calculate the new row and column based on the current hovered position
      // and the key pressed. We will use the `hoveredRow` and `hoveredCol` from
      // the effect's closure. React will batch these state updates.
      let newRow = hoveredRow;
      let newCol = hoveredCol;

      switch (event.key) {
        case "w": // Up
          newRow = (hoveredRow - 1 + 8) % 8;
          break;
        case "s": // Down
          newRow = (hoveredRow + 1) % 8;
          break;
        case "a": // Left
          if (hoveredCol === 0) {
            newCol = 9; // Move to last column
            newRow = (hoveredRow - 1 + 8) % 8; // Move to previous row, wrapping around
          } else {
            newCol = hoveredCol - 1; // Move left in same row
          }
          break;
        case "d": // Right
          if (hoveredCol === 9) {
            newCol = 0; // Move to first column
            newRow = (hoveredRow + 1) % 8; // Move to next row, wrapping around
          } else {
            newCol = hoveredCol + 1; // Move right in same row
          }
          break;
      }

      // Update both states. React will batch these updates.
      setHoveredRow(newRow);
      setHoveredCol(newCol);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted, hoveredRow, hoveredCol]); // Dependencies include hoveredRow and hoveredCol

  // Effect for numbers moving backwards
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setGameBoard((prevGameBoard) => {
        const flatBoard: number[] = prevGameBoard.flat(); // Flatten the 2D array
        const shiftedFlatBoard = [...flatBoard.slice(1), flatBoard[0]]; // Move first element to last

        // Reconstruct 2D game board
        const newGameBoard: GameBoard = [];
        for (let i = 0; i < 8; i++) {
          newGameBoard.push(shiftedFlatBoard.slice(i * 10, (i + 1) * 10));
        }

        // Find the new rowIndex and colIndex of the targetValue
        let newTargetRow = -1;
        let newTargetCol = -1;
        for (let r = 0; r < newGameBoard.length; r++) {
          for (let c = 0; c < newGameBoard[r].length; c++) {
            if (newGameBoard[r][c] === targetValue) {
              newTargetRow = r;
              newTargetCol = c;
              break;
            }
          }
          if (newTargetRow !== -1) break;
        }
        // Update the state for rowIndex and colIndex based on new position
        setRowIndex(newTargetRow);
        setColIndex(newTargetCol);

        return newGameBoard;
      });
    }, 1000); // Shift every 1 second

    return () => clearInterval(interval);
  }, [gameStarted, targetValue]); // Depend on gameStarted and targetValue

  // Determine which cells should be highlighted (current + next 3 elements)
  const highlightedCells: Set<string> = new Set();
  const displayedNumbers: string[] = [];

  if (gameStarted && gameBoard.length > 0) {
    // Show the TARGET number and the next 3 numbers from the TARGET position (for display)
    const targetNumber = gameBoard[rowIndex][colIndex];
    displayedNumbers.push(targetNumber.toString());

    // Calculate the next 3 numbers from the TARGET position for display
    const targetFlatIndex = rowIndex * 10 + colIndex;
    for (let i = 1; i <= 3; i++) {
      const nextFlatIndex = (targetFlatIndex + i) % 80; // Total 8 rows * 10 cols = 80 cells
      const nextHighlightRow = Math.floor(nextFlatIndex / 10);
      const nextHighlightCol = nextFlatIndex % 10;
      displayedNumbers.push(
        gameBoard[nextHighlightRow][nextHighlightCol].toString()
      );
    }

    // Highlight the cursor and the next 3 numbers from the CURSOR position (for red highlighting)
    highlightedCells.add(`${hoveredRow}-${hoveredCol}`);
    const cursorFlatIndex = hoveredRow * 10 + hoveredCol;

    for (let i = 1; i <= 3; i++) {
      const nextFlatIndex = (cursorFlatIndex + i) % 80; // Total 8 rows * 10 cols = 80 cells
      const nextHighlightRow = Math.floor(nextFlatIndex / 10);
      const nextHighlightCol = nextFlatIndex % 10;
      highlightedCells.add(`${nextHighlightRow}-${nextHighlightCol}`);
    }
  }

  const handleSubmit = useCallback(() => {
    if (!gameStarted) return;

    const isCorrect = hoveredRow === rowIndex && hoveredCol === colIndex;

    if (isCorrect) {
      // Success! Show success alert and submit time
      setAlertType("success");
      setAlertMessage("🎉 Correct! Target found!");
      setShowAlert(true);

      if (gameStartTime && user) {
        const gameTime = Date.now() - gameStartTime;
        const comparison = submitLeaderboardTime(
          user.username,
          gameTime,
          "numberFinder",
          user.isGuest
        );
        setTimeComparison(comparison);
      }

      // Reset to startup screen after 2 seconds
      setTimeout(() => {
        setShowAlert(false);
        setGameStarted(false);
        setGameStartTime(null);
        // Reset all game state
        setGameBoard([]);
        setRowIndex(0);
        setColIndex(0);
        setTargetValue(0);
        setHoveredRow(0);
        setHoveredCol(0);
        // Reset startup screen
        setShowStartup(true);
        setHackingProgress(0);
        setHackingText("INITIALIZING HACK PROTOCOL...");
        resetOracle();
      }, 2000);
    } else {
      // Incorrect - show error alert but keep game running
      setAlertType("error");
      setAlertMessage("❌ Wrong selection! Try again.");
      setShowAlert(true);

      // Hide alert after 1.5 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 1500);
    }
  }, [
    gameStarted,
    hoveredRow,
    hoveredCol,
    rowIndex,
    colIndex,
    gameStartTime,
    user,
    resetOracle,
    skipCutscenes,
  ]);

  // Enter key support for submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && gameStarted) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, handleSubmit]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Matrix Rain Background */}
      <ParticleSystem
        width={typeof window !== "undefined" ? window.innerWidth : 800}
        height={typeof window !== "undefined" ? window.innerHeight : 600}
        particleCount={25}
        spawnRate={0.1}
        enabled={true}
        mode="matrix"
        className="absolute inset-0 opacity-30 pointer-events-none"
      />
      {/* Oracle status indicator */}
      {oracleActive && (
        <div className="absolute top-0 left-0 z-30 bg-yellow-900/90 border border-yellow-500/50 text-yellow-400 px-3 py-1 rounded-md text-sm font-mono animate-pulse">
          [ORACLE] ACTIVE
        </div>
      )}
      <img
        src={"/numberFinder/fullPic.png"}
        className="w-full"
        alt="Number Finder Game"
      />
      <div className="absolute inset-0 p-4">
        {showStartup ? (
          <StartupOverlay visible={showStartup} text={hackingText} progress={hackingProgress} />
        ) : !gameStarted ? (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-blue-400 font-mono text-lg animate-pulse">
                [SYSTEM] NUMBER FINDER PROTOCOL
              </div>
              <button
                onClick={startGame}
                className="px-8 py-4 rounded-md bg-blue-900/30 border border-blue-500/50 text-blue-400 font-mono font-medium hover:bg-blue-800/40 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200"
              >
                [INITIALIZE] START GAME
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-center text-red-600 font-light text-3xl mt-30">
              {displayedNumbers.join(".")}
            </h2>
            <div className="mt-20 grid grid-cols-10 max-w-2xl mx-auto">
              {gameBoard.map((row, rowIdx) =>
                row.map((number, colIdx) => {
                  const isHighlighted = highlightedCells.has(
                    `${rowIdx}-${colIdx}`
                  );

                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={`
                                            w-12 h-8 flex items-center justify-center text-3xl font-light
                                            ${
                                              isHighlighted
                                                ? "text-red-600"
                                                : "text-white"
                                            }
                                        `}
                    >
                      {number}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {showAlert && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-center">
          <div
            className={`px-6 py-3 rounded-md font-mono font-medium border shadow-lg ${
              alertType === "success"
                ? "bg-green-900/90 border-green-500/50 text-green-400 shadow-green-500/20"
                : "bg-red-900/90 border-red-500/50 text-red-400 shadow-red-500/20"
            }`}
          >
            {alertMessage}
          </div>
        </div>
      )}

      {timeComparison && (
        <TimeComparisonDisplay
          comparison={timeComparison}
          onClose={() => {
        // Close summary and show the Number Finder protocol loading screen again
        setTimeComparison(null);
        setShowStartup(true);
            setHackingProgress(0);
            setHackingText("INITIALIZING HACK PROTOCOL...");
          }}
        />
      )}
    </div>
  );
}
