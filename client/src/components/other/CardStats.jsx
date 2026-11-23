import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import BackLink from "./BackLink";
import { TypeBadge, StageBadge, RetreatCost } from "./CardSymbols";
import HoloCard from "../reactbits/holocard/HoloCard";
import { getCard, cardImage, assetUrl, assetFallback } from "../../api/tcgdex";
import { artworkUrl, dexIdFromCardName } from "../../api/pokeapi";
import "./other.css";

function Row({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

export default function CardStats({ id }) {
  const [card, setCard] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [evolve, setEvolve] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getCard(id, controller.signal)
      .then((data) => {
        setCard(data);
        setStatus("done");
      })
      .catch((cause) => {
        if (cause.name === "AbortError") return;
        setError(cause.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [id]);

  const evolveFrom = card?.evolveFrom;

  useEffect(() => {
    if (!evolveFrom) return undefined;
    let active = true;
    dexIdFromCardName(evolveFrom).then((dexId) => {
      if (active) setEvolve({ name: evolveFrom, dexId });
    });
    return () => {
      active = false;
    };
  }, [evolveFrom]);

  const evolveDex =
    evolveFrom && evolve?.name === evolveFrom ? evolve.dexId : null;

  if (status === "loading") return <p className="page__lead">Loading {id}…</p>;
  if (status === "error")
    return (
      <p className="page__lead" role="alert">
        Could not load {id}: {error}
      </p>
    );

  const art = cardImage(card.image);
  const printed = card.set?.cardCount?.official;

  return (
    <>
      <BackLink to={card.set?.id ? `/set/${card.set.id}` : "/browse"}>
        {card.set?.name ?? "Browse"}
      </BackLink>

      <div className="card-stats">
        <div>
          {art ? (
            <div className="card-stats__art">
              <HoloCard
                image={art}
                alt={card.name}
                preset="rainbow"
                width={320}
              />
            </div>
          ) : (
            <p className="card-stats__placeholder">
              TCGdex has no scan for this card yet
            </p>
          )}

          {card.dexId?.length > 0 && (
            <ul className="dex-chips">
              {card.dexId.map((entry) => (
                <li key={entry}>
                  <Link to={`/pokemon/${entry}`} className="dex-chip">
                    <img
                      className="dex-chip__art"
                      src={artworkUrl(entry)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="dex-chip__text">
                      <span className="dex-chip__name">View all cards</span>
                      <span className="dex-chip__dex">
                        #{String(entry).padStart(4, "0")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h1 className="card-stats__name">{card.name}</h1>
          <div className="card-stats__setline">
            {card.set?.id ? (
              <Link
                to={`/set/${card.set.id}`}
                className="set-chip"
                title={card.set.name}
              >
                {card.set.logo ? (
                  <img
                    className="set-chip__logo"
                    src={assetUrl(card.set.logo)}
                    onError={assetFallback(card.set.logo)}
                    alt={card.set.name}
                  />
                ) : (
                  card.set.name
                )}
              </Link>
            ) : (
              <span>Unknown set</span>
            )}
            {card.localId && (
              <span className="card-stats__number">
                {card.localId}
                {printed ? `/${printed}` : ""}
              </span>
            )}
          </div>

          <p className="card-stats__chips">
            <StageBadge stage={card.stage} />
            {card.hp && (
              <span className="card-stats__hp">
                {card.hp}
                <small>HP</small>
              </span>
            )}
            {card.rarity && (
              <span className="card-stats__rarity">{card.rarity}</span>
            )}
          </p>

          <dl className="card-stats__list">
            <Row label="Category" value={card.category} />
            <Row
              label="Type/s"
              value={
                card.types?.length ? (
                  <span className="card-stats__inline">
                    {card.types.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </span>
                ) : null
              }
            />
            <Row
              label="Evolves from"
              value={
                evolveDex ? (
                  <Link to={`/pokemon/${evolveDex}`} className="evolve-chip">
                    <img
                      className="evolve-chip__art"
                      src={artworkUrl(evolveDex)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{evolveFrom}</span>
                  </Link>
                ) : (
                  evolveFrom
                )
              }
            />
            <Row label="Retreat" value={<RetreatCost cost={card.retreat} />} />
            <Row
              label="Weakness"
              value={
                card.weaknesses?.length ? (
                  <span className="card-stats__inline">
                    {card.weaknesses.map((weakness) => (
                      <span key={weakness.type} className="card-stats__inline">
                        <TypeBadge type={weakness.type} showLabel={false} />
                        <span className="card-stats__weak-value">
                          {weakness.value}
                        </span>
                      </span>
                    ))}
                  </span>
                ) : null
              }
            />
            <Row label="Illustrator" value={card.illustrator} />
            <Row label="Regulation mark" value={card.regulationMark} />
            <Row label="Variants" value={variantList(card.variants)} />
            <Row label="Card ID" value={card.id} />
          </dl>

          {card.attacks?.length > 0 && (
            <ul className="card-stats__attacks">
              {card.attacks.map((attack, index) => (
                <li key={index} className="card-stats__attack">
                  <span className="card-stats__attack-name">{attack.name}</span>
                  {attack.damage && (
                    <span className="card-stats__attack-damage">
                      {attack.damage}
                    </span>
                  )}
                  {attack.effect && (
                    <p className="card-stats__attack-effect">{attack.effect}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function variantList(variants) {
  if (!variants) return null;
  const names = Object.keys(variants).filter((key) => variants[key]);
  return names.length ? names.join(", ") : null;
}
