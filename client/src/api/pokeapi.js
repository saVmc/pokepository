const BASE = "https://pokeapi.co/api/v2";
const ARTWORK =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export async function getSpecies(signal) {
  const response = await fetch(`${BASE}/pokemon-species?limit=1025`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`PokeAPI request failed (${response.status})`);
  }
  const data = await response.json();
  return data.results.map((entry) => ({
    dexId: Number(/\/(\d+)\/?$/.exec(entry.url)[1]),
    name: entry.name,
  }));
}

export function artworkUrl(dexId) {
  return `${ARTWORK}/${dexId}.png`;
}

export function displayName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

let namesPromise = null;

function nameIndex() {
  if (!namesPromise) {
    namesPromise = getSpecies().then(
      (list) => new Map(list.map((entry) => [entry.name, entry.dexId])),
    );
  }
  return namesPromise;
}

export async function dexIdFromCardName(cardName) {
  if (!cardName) return null;
  const index = await nameIndex();
  const tokens = cardName.toLowerCase().match(/[a-z]+/g) ?? [];
  for (let start = 0; start < tokens.length; start += 1) {
    for (let end = tokens.length; end > start; end -= 1) {
      const dexId = index.get(tokens.slice(start, end).join("-"));
      if (dexId) return dexId;
    }
  }
  return null;
}
