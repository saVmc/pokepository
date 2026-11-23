import { useEffect, useMemo, useState } from "react";

import {
  getSeriesList,
  eraIdOf,
  assetUrl,
  assetFallback,
} from "../../api/tcgdex";
import "./other.css";

const OTHER = "__other";

export default function EraFilter({ cards, value, onChange }) {
  const [series, setSeries] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getSeriesList(controller.signal)
      .then((list) => setSeries(list))
      .catch(() => setSeries([]));
    return () => controller.abort();
  }, []);

  const eras = useMemo(() => {
    const names = new Map((series ?? []).map((one) => [one.id, one]));
    const found = new Map();
    for (const card of cards) {
      const id = eraIdOf(card) ?? OTHER;
      if (!found.has(id)) found.set(id, { id, count: 0 });
      found.get(id).count += 1;
    }
    return [...found.values()]
      .map((era) => ({
        ...era,
        name:
          era.id === OTHER ? "Unlisted" : (names.get(era.id)?.name ?? era.id),
        logoStem: era.id === OTHER ? null : names.get(era.id)?.logo,
        logo: era.id === OTHER ? null : assetUrl(names.get(era.id)?.logo),
      }))
      .sort((a, b) => {
        if (a.id === OTHER) return 1;
        if (b.id === OTHER) return -1;
        return b.count - a.count;
      });
  }, [cards, series]);

  if (eras.length < 2) return null;

  return (
    <div className="era-filter">
      <ul className="era-filter__list">
        <li>
          <button
            type="button"
            className="era-filter__chip"
            aria-pressed={value === null}
            onClick={() => onChange(null)}
          >
            <span className="era-filter__label">All eras</span>
            <span className="era-filter__count">{cards.length}</span>
          </button>
        </li>

        {eras.map((era) => (
          <li key={era.id}>
            <button
              type="button"
              className="era-filter__chip"
              aria-pressed={value === era.id}
              onClick={() => onChange(value === era.id ? null : era.id)}
              title={era.name}
            >
              {era.logo ? (
                <img
                  className="era-filter__logo"
                  src={era.logo}
                  onError={assetFallback(era.logoStem)}
                  alt={era.name}
                  loading="lazy"
                />
              ) : (
                <span className="era-filter__label">{era.name}</span>
              )}
              <span className="era-filter__count">{era.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
