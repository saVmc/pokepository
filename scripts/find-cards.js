"use strict";

const QUALITY = "high.png";
const DEFAULT_LIMIT = 25;

let lang = "en";

const isCardId = (value) => /^[a-z0-9.]+-[a-z]*\d[a-z0-9]*$/i.test(value);

async function get(path) {
  const response = await fetch(`https://api.tcgdex.net/v2/${lang}${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${path}`);
  }
  return response.json();
}

const imageUrl = (stem) => (stem ? `${stem}/${QUALITY}` : null);

async function search(name, limit) {
  const cards = await get(`/cards?name=${encodeURIComponent(name)}`);

  if (cards.length === 0) {
    console.log(`No cards matching "${name}".`);
    return;
  }

  const shown = cards.slice(0, limit);
  console.log(`${cards.length} match(es) for "${name}":\n`);

  for (const card of shown) {
    const url = imageUrl(card.image);
    console.log(`  ${card.id.padEnd(14)} ${card.name}`);
    console.log(
      `  ${" ".repeat(14)} ${url ?? "(no image — HoloCard needs one)"}\n`,
    );
  }

  if (cards.length > shown.length) {
    console.log(
      `...and ${cards.length - shown.length} more. Add --all to list them.`,
    );
  }
  console.log(`Run again with a card id for full detail, e.g. ${shown[0].id}`);
}

async function detail(id) {
  const card = await get(`/cards/${encodeURIComponent(id)}`);
  const url = imageUrl(card.image);

  console.log(`\n${card.name}  (${card.id})\n`);
  console.log(`  set         ${card.set?.name ?? "?"}`);
  console.log(
    `  number      ${card.localId ?? "?"} / ${card.set?.cardCount?.official ?? "?"}`,
  );
  console.log(`  rarity      ${card.rarity ?? "?"}`);
  if (card.hp) console.log(`  hp          ${card.hp}`);
  if (card.types?.length) console.log(`  types       ${card.types.join(", ")}`);
  console.log(`  illustrator ${card.illustrator ?? "?"}`);
  console.log(`\n  ${url ?? "(no image for this card)"}`);

  if (url) {
    console.log(`\nPaste into App.jsx:\n`);
    console.log(`  <HoloCard`);
    console.log(`    image="${url}"`);
    console.log(`    alt="${card.name}"`);
    console.log(`    preset="gold"`);
    console.log(`    width={320}`);
    console.log(`  />\n`);
  }
}

function usage() {
  console.log(`Find Pokemon TCG cards and their image URLs.

  node scripts/find-cards.js <name>       search by card name
  node scripts/find-cards.js <card-id>    full detail for one card
  --all                                   list every match, not just ${DEFAULT_LIMIT}
  --lang <code>                           en (default), ja, fr, de, es, it, pt

Japanese searches need the Japanese name: Toucannon is ドデカバシ.

Examples:
  node scripts/find-cards.js charizard
  node scripts/find-cards.js "m venusaur"
  node scripts/find-cards.js xy12-100
  node scripts/find-cards.js --lang ja ドデカバシ
`);
}

async function main() {
  const argv = process.argv.slice(2);
  const all = argv.includes("--all");

  const langAt = argv.indexOf("--lang");
  if (langAt !== -1 && argv[langAt + 1]) lang = argv[langAt + 1];

  const query = argv
    .filter(
      (arg, i) =>
        arg !== "--all" &&
        (langAt === -1 || (i !== langAt && i !== langAt + 1)),
    )
    .join(" ")
    .trim();

  if (!query) {
    usage();
    process.exit(1);
  }

  if (isCardId(query)) {
    await detail(query);
  } else {
    await search(query, all ? Infinity : DEFAULT_LIMIT);
  }
}

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  process.exit(1);
});
