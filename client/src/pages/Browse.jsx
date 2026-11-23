import { useState } from "react";

import PokemonGrid from "../components/other/PokemonGrid";
import SeriesGrid from "../components/other/SeriesGrid";

const MODES = [
  { id: "pokemon", label: "By Pokémon" },
  { id: "era", label: "By era" },
];

export default function Browse() {
  const [mode, setMode] = useState("pokemon");
  return (
    <main className="page">
      <h1 className="page__title">Browse</h1>

      <div className="browse-modes" role="tablist" aria-label="Browse mode">
        {MODES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            id={`browse-tab-${entry.id}`}
            aria-selected={mode === entry.id}
            aria-controls={`browse-panel-${entry.id}`}
            className="browse-modes__tab"
            onClick={() => setMode(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`browse-panel-${mode}`}
        aria-labelledby={`browse-tab-${mode}`}
      >
        {mode === "pokemon" ? <PokemonGrid /> : <SeriesGrid />}
      </div>
    </main>
  );
}
