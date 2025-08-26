import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Sudoku with on-screen Number Pad (mobile-friendly)
 * - Tap a cell to select it, then tap a number (1-9) to place it
 * - Erase button to clear a selected editable cell
 * - Check button validates against a solution
 * - Back button -> /games
 * - Framer Motion for subtle animations
 *
 * NOTE: This example uses a fixed puzzle + solution for clarity.
 * You can replace the puzzle/solution with a generator later.
*/

const PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

export default function Sudoku() {
  const navigate = useNavigate();

  // board state: copy of PUZZLE so we don't mutate the constant
  const [board, setBoard] = useState(() => PUZZLE.map((r) => [...r]));
  const [selected, setSelected] = useState(null); // {r,c} or null
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // helper: is cell original (clue)?
  const isClue = (r, c) => PUZZLE[r][c] !== 0;

  // select cell (tap)
  const selectCell = (r, c) => {
    setMessage("");
    setShowMessage(false);
    setSelected({ r, c });
  };

  // set number into selected cell if editable
  const setNumber = (n) => {
    if (!selected) return;
    const { r, c } = selected;
    if (isClue(r, c)) {
      // can't edit a clue; show small feedback
      setMessage("This cell is a clue — cannot edit.");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 1200);
      return;
    }
    setBoard((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = n;
      return copy;
    });
  };

  const eraseCell = () => {
    if (!selected) return;
    const { r, c } = selected;
    if (isClue(r, c)) {
      setMessage("Cannot erase a clue cell.");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 1200);
      return;
    }
    setBoard((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = 0;
      return copy;
    });
  };

  // keyboard support: numbers and backspace/0 to erase
  useEffect(() => {
    const handler = (e) => {
      if (!selected) return;
      const key = e.key;
      if (key >= "1" && key <= "9") {
        setNumber(parseInt(key, 10));
      } else if (key === "0" || key === "Backspace" || key === "Delete") {
        eraseCell();
      } else if (key === "ArrowLeft") {
        setSelected(({ r, c } = selected) => ({ r, c: Math.max(0, c - 1) }));
      } else if (key === "ArrowRight") {
        setSelected(({ r, c } = selected) => ({ r, c: Math.min(8, c + 1) }));
      } else if (key === "ArrowUp") {
        setSelected(({ r, c } = selected) => ({ r: Math.max(0, r - 1), c }));
      } else if (key === "ArrowDown") {
        setSelected(({ r, c } = selected) => ({ r: Math.min(8, r + 1), c }));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected]);

  // quick validation helpers (row/col/box unique)
  const isValidPlacement = useCallback((brd, row, col, val) => {
    if (val === 0) return true;
    // check row
    for (let c = 0; c < 9; c++) if (c !== col && brd[row][c] === val) return false;
    // check col
    for (let r = 0; r < 9; r++) if (r !== row && brd[r][col] === val) return false;
    // check box
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++) if (!(r === row && c === col) && brd[r][c] === val) return false;
    return true;
  }, []);

  // Check solution: exact match to SOLUTION or full valid board
  const checkSolution = () => {
    // basic completeness check
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (board[r][c] === 0) {
      setMessage("Board incomplete — fill all cells.");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 1800);
      return;
    }

    // if exact solution known, compare
    let match = true;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (board[r][c] !== SOLUTION[r][c]) match = false;

    if (match) {
      setMessage("🎉 Correct! You solved it!");
      setShowMessage(true);
      setShowErrors(false);
    } else {
      // show which cells are wrong (toggle showErrors)
      setMessage("❌ Some cells are incorrect. Toggle errors to see highlights.");
      setShowMessage(true);
      setShowErrors(true);
    }
    setTimeout(() => setShowMessage(false), 2200);
  };

  const clearBoard = () => {
    setBoard(PUZZLE.map((r) => [...r]));
    setSelected(null);
    setShowErrors(false);
    setMessage("");
  };

  // Toggle candidate: (not implemented) — skip for now

  // helper to compute CSS classes for cell borders (thick 3x3)
  const cellBorderClass = (r, c) => {
    const right = c % 3 === 2 && c !== 8 ? "border-r-4" : "";
    const bottom = r % 3 === 2 && r !== 8 ? "border-b-4" : "";
    return `${right} ${bottom}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      {/* Top controls */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-4 gap-4">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600"
        >
          ⬅ Back
        </button>

        <div className="flex gap-2 items-center">
          <button
            onClick={checkSolution}
            className="px-3 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            Check
          </button>
          <button
            onClick={clearBoard}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Board + number pad layout */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sudoku board (center/left) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 flex justify-center"
        >
          <div
            className="bg-white rounded-lg p-3"
            style={{
              // board is responsive: width = min(90vw, 680px), maintain square cells
              width: "min(90vw, 680px)",
              maxWidth: 560,
            }}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(9, 1fr)",
                gap: "6px",
              }}
            >
              {board.map((row, rIdx) =>
                row.map((num, cIdx) => {
                  const selectedCls = selected && selected.r === rIdx && selected.c === cIdx ? "ring-4 ring-blue-400" : "";
                  const clue = isClue(rIdx, cIdx);
                  const wrong = showErrors && SOLUTION[rIdx][cIdx] !== board[rIdx][cIdx] && board[rIdx][cIdx] !== 0;
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => selectCell(rIdx, cIdx)}
                      className={`flex items-center justify-center aspect-square text-lg sm:text-xl md:text-2xl
                        ${clue ? "bg-gray-200 font-bold text-gray-900" : "bg-white text-black"}
                        ${cellBorderClass(rIdx, cIdx)}
                        ${selectedCls}
                        ${wrong ? "outline outline-4 outline-red-400" : ""}
                        rounded-md`}
                      style={{ minWidth: 0 }}
                      aria-label={`Row ${rIdx + 1} Column ${cIdx + 1}`}
                    >
                      {num !== 0 ? num : ""}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* Number pad & info (right column on md / below on small screens) */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
          <div className="bg-gray-800 p-4 rounded-lg text-white">
            <div className="mb-3 text-sm text-gray-300">Selected:</div>
            <div className="mb-4 text-lg">
              {selected ? `Row ${selected.r + 1}, Col ${selected.c + 1}` : "Tap a cell"}
            </div>

            {/* Number pad 3x3 */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1,2,3,4,5,6,7,8,9].map((n) => {
                // disable if no selected or selected is clue
                const disabled = !selected || isClue(selected.r, selected.c);
                return (
                  <button
                    key={n}
                    onClick={() => setNumber(n)}
                    disabled={disabled}
                    className={`py-2 rounded-md text-xl font-semibold ${disabled ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={eraseCell}
                disabled={!selected || isClue(selected?.r, selected?.c)}
                className={`flex-1 py-2 rounded-md ${!selected ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-500 text-white"}`}
              >
                Erase
              </button>
              <button
                onClick={() => { setShowErrors((s) => !s); }}
                className="flex-1 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-black"
              >
                Toggle Errors
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-300">
              Tip: tap a cell then tap a number (or use keyboard). Use <span className="font-semibold">Toggle Errors</span> to highlight wrong entries (compares to solution).
            </div>

            {/* small status/message */}
            <AnimatePresence>
              {showMessage && message && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 p-2 bg-white text-black rounded">
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
