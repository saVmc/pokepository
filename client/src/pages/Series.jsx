import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Breadcrumb from "../components/other/Breadcrumb";

import { getSeries, assetUrl, assetFallback } from "../api/tcgdex";

export default function Series() {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getSeries(id, controller.signal)
      .then((data) => setResult({ id, status: "done", data }))
      .catch((cause) => {
        if (cause.name === "AbortError") return;
        setResult({ id, status: "error", error: cause.message });
      });
    return () => controller.abort();
  }, [id]);

  const current = result?.id === id ? result : { status: "loading" };
  const series = current.data;
  const sets = series?.sets ?? [];

  return (
    <main className="page">
      <Breadcrumb
        items={[
          { label: "Browse", to: "/browse" },
          {
            label: `${series?.name ?? id} era`,
            image: series?.logo ? assetUrl(series.logo) : null,
            onImageError: series?.logo ? assetFallback(series.logo) : undefined,
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
            {series.logo && (
              <img
                className="set-header__logo"
                src={assetUrl(series.logo)}
                onError={assetFallback(series.logo)}
                alt=""
              />
            )}
            <div>
              <h1 className="card-stats__name">{series.name} era</h1>
              <p className="card-stats__sub">
                {sets.length} set{sets.length === 1 ? "" : "s"}
                {series.releaseDate ? ` · from ${series.releaseDate}` : ""}
              </p>
            </div>
          </div>

          <ul className="set-grid">
            {sets.map((set) => (
              <li key={set.id}>
                <Link to={`/set/${set.id}`} className="set-tile">
                  {set.logo ? (
                    <img
                      className="set-tile__logo"
                      src={assetUrl(set.logo)}
                      onError={assetFallback(set.logo)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="set-tile__logo" aria-hidden="true" />
                  )}
                  <span className="set-tile__row">
                    {set.symbol && (
                      <img
                        className="set-tile__symbol"
                        src={assetUrl(set.symbol)}
                        onError={assetFallback(set.symbol)}
                        alt=""
                        loading="lazy"
                      />
                    )}
                    <span className="set-tile__name">{set.name}</span>
                  </span>
                  <span className="set-tile__count">
                    {set.cardCount?.official ?? "?"} cards
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
