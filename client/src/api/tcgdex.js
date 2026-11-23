const BASE = "https://api.tcgdex.net/v2/en";

export const EXCLUDED_SERIES = ["tcgp"];

async function request(path, signal) {
  const response = await fetch(`${BASE}${path}`, { signal });
  if (response.status === 404) throw new Error("Not found");
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

export function searchCards(name, signal) {
  return request(`/cards?name=${encodeURIComponent(name)}`, signal);
}

export function getCard(id, signal) {
  return request(`/cards/${encodeURIComponent(id)}`, signal);
}

export async function getSeriesList(signal) {
  const list = await request("/series", signal);
  return list.filter((entry) => !EXCLUDED_SERIES.includes(entry.id));
}

export function getSeries(id, signal) {
  return request(`/series/${encodeURIComponent(id)}`, signal);
}

export function getSet(id, signal) {
  return request(`/sets/${encodeURIComponent(id)}`, signal);
}

export function getDex(dexId, signal) {
  return request(`/dex-ids/${encodeURIComponent(dexId)}`, signal);
}

let excludedSetsPromise = null;

export function getExcludedSetIds() {
  if (!excludedSetsPromise) {
    excludedSetsPromise = Promise.all(
      EXCLUDED_SERIES.map((id) =>
        request(`/series/${id}`).then((series) =>
          (series.sets ?? []).map((set) => set.id),
        ),
      ),
    )
      .then((groups) => new Set(groups.flat()))
      .catch(() => new Set());
  }
  return excludedSetsPromise;
}

let setNamesPromise = null;

export function getSetNames() {
  if (!setNamesPromise) {
    setNamesPromise = request("/sets")
      .then((sets) => new Map(sets.map((set) => [set.id, set.name])))
      .catch(() => new Map());
  }
  return setNamesPromise;
}

export function setIdOf(card) {
  const index = card.id.lastIndexOf("-");
  return index === -1 ? card.id : card.id.slice(0, index);
}

export function eraIdOf(card) {
  if (!card.image) return null;
  const parts = card.image.split("/");
  return parts[parts.length - 3] ?? null;
}

export function seriePathOf(card) {
  if (!card.image) return null;
  const parts = card.image.split("/");
  return parts.slice(-3, -1).join("/");
}

export function cardImage(stem, quality = "high.png") {
  return stem ? `${stem}/${quality}` : null;
}

export function assetUrl(stem, extension = "webp") {
  if (!stem) return null;
  return `${stem.replace("/univ/", "/en/")}.${extension}`;
}

export function assetFallback(stem) {
  return (event) => {
    const image = event.currentTarget;
    if (image.dataset.fallback) return;
    image.dataset.fallback = "1";
    image.src = assetUrl(stem, "png");
  };
}

export function setAssetUrl(seriePath, kind = "symbol") {
  return seriePath
    ? `https://assets.tcgdex.net/en/${seriePath}/${kind}.webp`
    : null;
}
