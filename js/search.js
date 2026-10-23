/* ============================================================
   search.js — product matching shared by the catalog, the "/"
   palette and the paste-a-list parser. Pure functions: typo-
   tolerant, and it understands Hindi / Hinglish / English names.
   ============================================================ */

/* Extra words people actually type, per product line. */
const SYN = {
  "hardware-bolts": "bolt bolts nut nuts screw screws pech nut-bolt बोल्ट नट स्क्रू पेच",
  "hardware-washers": "washer washers anchor anchors stud studs वॉशर एंकर",
  "hardware-high-tensile": "high tensile ht hex bolt fastener fasteners 8.8 10.9 12.9 हाई टेंसाइल",
  "hardware-tools": "tool tools drill hammer spanner wrench औज़ार औजार ड्रिल टूल",
  "hardware-cnc": "cnc laser cutting fabrication machining custom part parts फैब्रिकेशन",
  "spices-haldi": "haldi turmeric हल्दी हलदी",
  "spices-lal-mirch": "lal mirch mirchi chilli chili red powder लाल मिर्च मिर्ची",
  "spices-kashmiri-mirch": "kashmiri mirch chilli chili degi कश्मीरी मिर्च",
  "spices-garam-masala": "garam masala गरम मसाला",
  "spices-khade-masale": "khade khada whole spices sabut खड़े खड़ा साबुत मसाले",
  "spices-jeera": "jeera jira cumin जीरा",
  "spices-dhaniya": "dhaniya dhania coriander धनिया",
  "spices-kali-mirch": "kali mirch black pepper peppercorn काली मिर्च",
  "spices-laung": "laung lavang clove cloves लौंग",
  "spices-elaichi": "elaichi ilaichi cardamom इलायची",
  "spices-hing": "hing heeng asafoetida हींग हिंग",
  "spices-saunf": "saunf sounf fennel सौंफ",
  "spices-meat-masala": "chicken meat mutton masala चिकन मीट मसाला",
  "spices-chaat-masala": "chaat chat pav bhaji masala चाट पाव भाजी",
  "spices-sambhar": "sambhar sambar rasam south indian सांभर सांबर रसम",
  "spices-custom-blends": "blend blends custom mix मिक्स ब्लेंड",
  "dryfruits-badam": "badam almond almonds बादाम",
  "dryfruits-kaju": "kaju cashew cashews काजू",
  "dryfruits-kishmish": "kishmish kismis raisin raisins munakka किशमिश मुनक्का",
  "dryfruits-pista": "pista pistachio pistachios akhrot walnut walnuts पिस्ता अखरोट",
  "dryfruits-mixed": "mixed mix dry fruits mewa seeds मेवा मिक्स",
  "packaging-poly-bags": "poly polybag polybags bag bags thaili carry पॉली बैग थैली",
  "packaging-food-grade": "food grade food-grade zip pouch bag bags फ़ूड ग्रेड पाउच",
  "packaging-printed": "printed print plain logo brand pouch प्रिंटेड प्लेन",
  "packaging-custom": "custom size sizes gauge gauges micron कस्टम साइज़",
  "packaging-bulk-rolls": "roll rolls bulk wholesale रोल",
};

const DIGITS = { "०": 0, "१": 1, "२": 2, "३": 3, "४": 4, "५": 5, "६": 6, "७": 7, "८": 8, "९": 9 };

export const norm = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/[०-९]/g, (d) => DIGITS[d])
    .normalize("NFC")
    .replace(/[^\p{L}\p{M}\p{N}.\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const words = (s) => norm(s).split(" ").filter(Boolean);

/* Optimal-string-alignment distance, capped — enough for typo tolerance. */
function dist(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

/* How well one query word matches a bag of target words: 0 = no match. */
function wordScore(q, targets) {
  let best = 0;
  for (const t of targets) {
    if (t === q) return 3;
    if (t.startsWith(q) && q.length >= 2) best = Math.max(best, 2.4);
    else if (q.length >= 4 && t.includes(q)) best = Math.max(best, 1.8);
    else if (q.length >= 4) {
      const allowed = q.length >= 6 ? 2 : 1;
      if (dist(q, t.slice(0, q.length + allowed), allowed) <= allowed || dist(q, t, allowed) <= allowed) best = Math.max(best, 1.4);
    }
  }
  return best;
}

/* Attach searchable terms to items (name + division + synonyms). */
export function indexItems(items) {
  return items.map((it) => ({ ...it, terms: words(`${it.raw} ${it.divName} ${it.short} ${SYN[it.id] || ""}`) }));
}

/* Rank items for a free-text query. Every query word must match something —
   unless `partial`, where unknown words (sizes like "M12", brand names) are skipped. */
export function searchItems(query, indexed, limit = 50, { partial = false } = {}) {
  const qs = words(query);
  if (!qs.length) return [];
  return indexed
    .map((it) => {
      let total = 0, hits = 0, best = 0;
      for (const q of qs) {
        const s = wordScore(q, it.terms);
        if (!s && !partial) return null;
        if (s) { hits++; total += s; best = Math.max(best, s); }
      }
      // Partial lines need one strong word, unless every word matched (a lone typo like "haldee").
      if (!hits || (partial && best < 1.8 && hits < qs.length)) return null;
      return { it, score: hits * 10 + total / qs.length };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.it);
}

/* ---------- paste-a-list parser ---------- */
const UNIT_WORDS = [
  [/^(kg|kgs|kilo|kilos|kilogram|kilograms|किलो|किग्रा)$/, "kg", 1],
  [/^(g|gm|gms|gram|grams|ग्राम)$/, "g", 1],
  [/^(ton|tons|tonne|टन)$/, "kg", 1000],
  [/^(quintal|quintals|qtl|क्विंटल)$/, "kg", 100],
  [/^(pc|pcs|piece|pieces|nos|no|पीस|नग)$/, "pcs", 1],
  [/^(pack|packs|packet|packets|pkt|pkts|पैकेट)$/, "packs", 1],
  [/^(bag|bags|sack|sacks|बैग|बोरी)$/, "bags", 1],
  [/^(box|boxes|carton|cartons|डिब्बा|डिब्बे)$/, "boxes", 1],
  [/^(roll|rolls|रोल)$/, "rolls", 1],
];

function unitOf(word) {
  for (const [re, unit, mult] of UNIT_WORDS) if (re.test(word)) return { unit, mult };
  return null;
}

/* "haldi 25kg" / "25 kg haldi" / "kaju - 10" → { item, qty, unit, text } */
export function parseLine(line, indexed) {
  const clean = norm(line.replace(/(\d)([a-zA-Zऀ-ॿ])/g, "$1 $2").replace(/,(?=\d{3})/g, ""));
  if (!clean) return null;
  const toks = clean.split(" ");
  let qty = null, unit = null, mult = 1;
  const rest = [];
  toks.forEach((t, i) => {
    const n = Number(t);
    if (qty === null && t !== "" && !Number.isNaN(n) && !/^m\d/.test(t)) {
      // "M12" style sizes are part of the name, plain numbers are quantities.
      qty = n;
      const u = toks[i + 1] && unitOf(toks[i + 1]);
      if (u) { unit = u.unit; mult = u.mult; }
      return;
    }
    if (unitOf(t) && qty !== null && unit) return; // already consumed
    if (unitOf(t) && qty === null) return; // unit before number — ignore the word
    rest.push(t);
  });
  const text = rest.join(" ").trim();
  if (!text) return null;
  const [best] = searchItems(text, indexed, 1, { partial: true });
  // Keep what the buyer typed when it says more than our line name does ("M12 bolts").
  const extra = best ? rest.filter((w) => !wordScore(w, best.terms)) : [];
  return { item: best || null, qty: qty === null ? null : +(qty * mult).toFixed(3), unit, text: line.trim(), spec: extra.length ? text : "" };
}

export function parseList(text, indexed) {
  return String(text)
    .split(/\n|;|,(?!\d)/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => parseLine(l, indexed))
    .filter(Boolean);
}
