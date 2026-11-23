import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getSpecies, artworkUrl, displayName } from "../../api/pokeapi";
import "./other.css";

export default function PokemonGrid() {
  const [species, setSpecies] = useState([]);
  const [status, setStatus] = useState("loading");
  const [filter, setFilter] = useState("");
  const inputId = useId();

  useEffect(() => {
    const controller = new AbortController();
    getSpecies(controller.signal)
      .then((list) => {
        setSpecies(list);
        setStatus("done");
      })
      .catch((cause) => {
        if (cause.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  const term = filter.trim().toLowerCase();
  const shown = useMemo(
    () => (term ? species.filter((one) => one.name.includes(term)) : species),
    [species, term],
  );

  return (
    <div>
      <div className="card-search__field">
        <svg
          className="card-search__icon"
          viewBox="0 0 16 16"
          width="18"
          height="18"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
        </svg>
        <input
          id={inputId}
          className="card-search__input"
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Flareon, Charizard, Pikachu…"
          autoComplete="off"
        />
        {filter && (
          <button
            type="button"
            className="card-search__clear"
            onClick={() => setFilter("")}
            aria-label="Clear filter"
          >
            ×
          </button>
        )}
      </div>

      {status === "done" && (
        <ul className="poke-grid">
          {shown.map((one) => (
            <li key={one.dexId}>
              <Link to={`/pokemon/${one.dexId}`} className="poke-tile">
                <img
                  className="poke-tile__art"
                  src={artworkUrl(one.dexId)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width="160"
                  height="160"
                />
                <span className="poke-tile__name">{displayName(one.name)}</span>
                <span className="poke-tile__dex">
                  #{String(one.dexId).padStart(4, "0")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
