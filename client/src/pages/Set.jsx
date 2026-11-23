import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Breadcrumb from "../components/other/Breadcrumb";

import CardArtGrid from "../components/other/CardArtGrid";
import { getSet, assetUrl, assetFallback } from "../api/tcgdex";

export default function Set() {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getSet(id, controller.signal)
      .then((data) => setResult({ id, status: "done", data }))
      .catch((cause) => {
        if (cause.name === "AbortError") return;
        setResult({ id, status: "error", error: cause.message });
      });
    return () => controller.abort();
  }, [id]);

  const current = result?.id === id ? result : { status: "loading" };
  const set = current.data;

  return (
    <main className="page">
      <Breadcrumb
        items={[
          { label: "Browse", to: "/browse" },
          set?.serie?.id
            ? {
                label: `${set.serie.name} era`,
                to: `/series/${set.serie.id}`,
              }
            : null,
          {
            label: set?.name ?? id,
            image: set?.logo ? assetUrl(set.logo) : null,
            onImageError: set?.logo ? assetFallback(set.logo) : undefined,
          },
        ]}
      />

      {current.status === "loading" && (
        <p className="page__lead">Loading {id}…</p>
      )}

      {current.status === "error" && (
        <p className="page__lead" role="alert">
          Could not load {id}: {current.error}
        </p>
      )}

      {current.status === "done" && (
        <>
          <div className="set-header">
            {set.logo && (
              <img
                className="set-header__logo"
                src={assetUrl(set.logo)}
                onError={assetFallback(set.logo)}
                alt={set.name}
              />
            )}
            <div>
              <h1 className="card-stats__name">{set.name}</h1>
              <p className="card-stats__sub">
                {set.serie?.name}
                {set.releaseDate ? ` · ${set.releaseDate}` : ""}
                {set.cardCount
                  ? ` · ${set.cardCount.official} cards (${set.cardCount.total} with secrets)`
                  : ""}
              </p>
            </div>
          </div>

          <CardArtGrid cards={set.cards ?? []} />
        </>
      )}
    </main>
  );
}
