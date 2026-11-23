import { Link } from "react-router-dom";

import { cardImage } from "../../api/tcgdex";
import "./other.css";

function Tile({ card }) {
  const art = cardImage(card.image, "low.webp");
  return (
    <li>
      <Link to={`/card/${card.id}`} className="art-tile">
        {art ? (
          <img
            className="art-tile__image"
            src={art}
            alt={card.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="art-tile__image art-tile__image--empty">
            No scan
          </span>
        )}
        <span className="art-tile__name">{card.name}</span>
        <span className="art-tile__id">{card.id}</span>
      </Link>
    </li>
  );
}

export default function CardArtGrid({ cards }) {
  if (!cards || cards.length === 0) {
    return <p className="card-search__status">No cards to show.</p>;
  }

  const scanned = cards.filter((card) => card.image);
  const unscanned = cards.filter((card) => !card.image);

  return (
    <>
      {scanned.length > 0 && (
        <ul className="art-grid">
          {scanned.map((card) => (
            <Tile key={card.id} card={card} />
          ))}
        </ul>
      )}

      {unscanned.length > 0 && (
        <details className="no-scan">
          <summary className="no-scan__summary">
            {unscanned.length} card{unscanned.length === 1 ? "" : "s"} without a
            scan
          </summary>
          <ul className="art-grid art-grid--muted">
            {unscanned.map((card) => (
              <Tile key={card.id} card={card} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
