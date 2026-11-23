import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getSeriesList, assetUrl, assetFallback } from "../../api/tcgdex";
import "./other.css";

export default function SeriesGrid() {
  const [series, setSeries] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getSeriesList(controller.signal)
      .then((list) => {
        setSeries(list);
        setStatus("done");
      })
      .catch((cause) => {
        if (cause.name === "AbortError") return;
        setError(cause.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  if (status === "loading") return <p className="page__lead">Loading eras…</p>;
  if (status === "error")
    return (
      <p className="page__lead" role="alert">
        Could not load eras: {error}
      </p>
    );

  return (
    <>
      <p className="card-search__status">{series.length} eras</p>
      <ul className="era-grid">
        {series.map((entry) => (
          <li key={entry.id}>
            <Link to={`/series/${entry.id}`} className="era-tile">
              {entry.logo ? (
                <img
                  className="era-tile__logo"
                  src={assetUrl(entry.logo)}
                  onError={assetFallback(entry.logo)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="era-tile__logo era-tile__logo--empty">
                  {entry.name}
                </span>
              )}
              <span className="era-tile__name">{entry.name} era</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
