import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import CardArtGrid from "../components/other/CardArtGrid";
import EraFilter from "../components/other/EraFilter";
import BackLink from "../components/other/BackLink";
import { getDex, getExcludedSetIds, setIdOf, eraIdOf } from "../api/tcgdex";
import { artworkUrl, displayName } from "../api/pokeapi";

export default function Pokemon() {
  const { dexId } = useParams();
  const [result, setResult] = useState(null);
  const [eraId, setEraId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getDex(dexId, controller.signal), getExcludedSetIds()])
      .then(([data, excluded]) => {
        const cards = (data.cards ?? []).filter(
          (card) => !excluded.has(setIdOf(card)),
        );
        setResult({ dexId, status: "done", cards });
        setEraId(null);
      })
      .catch((cause) => {
        if (cause.name === "AbortError") return;
        setResult({ dexId, status: "error", error: cause.message });
      });
    return () => controller.abort();
  }, [dexId]);

  const current = result?.dexId === dexId ? result : { status: "loading" };
  const cards = useMemo(() => current.cards ?? [], [current.cards]);

  const filtered = useMemo(() => {
    if (!eraId) return cards;
    return cards.filter((card) => (eraIdOf(card) ?? "__other") === eraId);
  }, [cards, eraId]);

  const species = cards[0]
    ? displayName(cards[0].name.split(" ")[0])
    : `#${dexId}`;
  const names = new Set(cards.map((card) => card.name));

  return (
    <main className="page">
      <BackLink to="/browse">All Pokémon</BackLink>

      {current.status === "loading" && (
        <p className="page__lead">Loading Pokédex #{dexId}…</p>
      )}

      {current.status === "error" && (
        <p className="page__lead" role="alert">
          Could not load #{dexId}: {current.error}
        </p>
      )}

      {current.status === "done" && (
        <>
          <div className="set-header">
            <img
              className="poke-header__art"
              src={artworkUrl(dexId)}
              alt=""
              width="140"
              height="140"
            />
            <div>
              <h1 className="card-stats__name">{species}</h1>
              <p className="card-stats__sub">
                Pokédex #{dexId} · {names.size} variant
                {names.size === 1 ? "" : "s"} · {cards.length} card
                {cards.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <EraFilter cards={cards} value={eraId} onChange={setEraId} />

          <CardArtGrid cards={filtered} />
        </>
      )}
    </main>
  );
}
