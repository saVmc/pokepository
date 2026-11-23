import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Breadcrumb from "./Breadcrumb";
import { TypeBadge, StageBadge, RetreatCost } from "./CardSymbols";
import HoloCard from "../reactbits/holocard/HoloCard";
import { getCard, cardImage, assetUrl, assetFallback } from "../../api/tcgdex";
import { artworkUrl, dexIdFromCardName, speciesName } from "../../api/pokeapi";
import "./other.css";

const FOILS = {
  none: { intensity: 0, edgeSparkle: 0, glare: 0 },
  holo: {
    preset: "rainbow",
    intensity: 0.45,
    edgeSparkle: 0.3,
    glare: 0.12,
    scale: 1,
  },
  illustration: {
    preset: "glitter",
    intensity: 0.3,
    edgeSparkle: 0.22,
    glare: 0.1,
    scale: 1.4,
  },
  ultra: {
    preset: "shards",
    intensity: 0.8,
    edgeSparkle: 0.7,
    glare: 0.18,
    scale: 1.1,
  },
  gold: {
    preset: "gold",
    intensity: 0.95,
    edgeSparkle: 0.9,
    glare: 0.26,
    foilColor: "#ffd76a",
    scale: 1.2,
  },
};

const RARITY_FOIL = {
  "ACE SPEC Rare": "holo",
  "Amazing Rare": "holo",
  "Classic Collection": "holo",
  "Double rare": "holo",
  "Holo Rare": "holo",
  "Holo Rare V": "holo",
  "Holo Rare VMAX": "holo",
  "Holo Rare VSTAR": "holo",
  LEGEND: "holo",
  "Radiant Rare": "holo",
  "Rare Holo": "holo",
  "Rare Holo LV.X": "holo",
  "Rare PRIME": "holo",
  "Illustration rare": "illustration",
  "Black White Rare": "ultra",
  "Full Art Trainer": "ultra",
  "Futuristic Rare": "ultra",
  "Mega Attack Rare": "ultra",
  "One Shiny": "ultra",
  "One Star": "ultra",
  "Pikachu Rare": "ultra",
  "RGB Rare": "ultra",
  "Shiny Ultra Rare": "ultra",
  "Shiny rare": "ultra",
  "Shiny rare V": "ultra",
  "Shiny rare VMAX": "ultra",
  "Special illustration rare": "ultra",
  "Three Star": "ultra",
  "Two Shiny": "ultra",
  "Two Star": "ultra",
  "Ultra Rare": "ultra",
  Crown: "gold",
  "Hyper rare": "gold",
  "Mega Hyper Rare": "gold",
  "Secret Rare": "gold",
};

function foilFor(card) {
  const tier =
    RARITY_FOIL[card.rarity] ?? (card.variants?.holo ? "holo" : "none");
  return FOILS[tier];
}

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
  const [species, setSpecies] = useState(null);

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

  const dexId = card?.dexId?.[0];

  useEffect(() => {
    if (!dexId) return undefined;
    let active = true;
    speciesName(dexId).then((name) => {
      if (active) setSpecies({ dexId, name });
    });
    return () => {
      active = false;
    };
  }, [dexId]);

  const speciesLabel =
    dexId && species?.dexId === dexId ? species.name : dexId ? `#${dexId}` : null;

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
      <Breadcrumb
        items={[
          { label: "Browse", to: "/browse" },
          dexId
            ? {
                label: speciesLabel,
                to: `/pokemon/${dexId}`,
                image: artworkUrl(dexId),
              }
            : null,
          card.set?.id
            ? {
                label: card.set.name,
                to: `/set/${card.set.id}`,
                image: card.set.logo ? assetUrl(card.set.logo) : null,
                onImageError: card.set.logo
                  ? assetFallback(card.set.logo)
                  : undefined,
              }
            : null,
          { label: card.localId ? `${card.name} · ${card.localId}` : card.name },
        ]}
      />

      <div className="card-stats">
        <div>
          {art ? (
            <div className="card-stats__art">
              <HoloCard
                image={art}
                alt={card.name}
                width={320}
                {...foilFor(card)}
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
