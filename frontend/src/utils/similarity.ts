export type Pin = {
  id: string | number;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  color?: string;
  [k: string]: any;
};

type ScoreOptions = {
  tagWeight?: number;
  categoryWeight?: number;
  colorWeight?: number;
  textWeight?: number;
};

export function findSimilarPins(target: Pin, pins: Pin[], topN = 10, opts: ScoreOptions = {}) {
  if (!target) return [];

  const {
    tagWeight = 4,
    categoryWeight = 6,
    colorWeight = 2,
    textWeight = 1,
  } = opts;

  const normalize = (s?: string) => (s || "").toLowerCase().trim();

  const targetTags = new Set((target.tags || []).map((t) => normalize(t)));
  const targetCategory = normalize(target.category);
  const targetColor = normalize(target.color);
  const targetText = `${normalize(target.title)} ${normalize(target.description)}`;

  const scorePin = (p: Pin) => {
    if (!p || String(p.id) === String(target.id)) return -1;

    let score = 0;

    // tag overlap
    if (Array.isArray(p.tags) && p.tags.length && targetTags.size) {
      const otherTags = p.tags.map((t) => normalize(t));
      let overlap = 0;
      otherTags.forEach((t) => {
        if (targetTags.has(t)) overlap++;
      });
      score += overlap * tagWeight;
    }

    // category match
    if (targetCategory && normalize(p.category) === targetCategory) {
      score += categoryWeight;
    }

    // color exact match (simple)
    if (targetColor && normalize(p.color) === targetColor) {
      score += colorWeight;
    }

    // text overlap (title/description words)
    if (targetText.trim()) {
      const otherText = `${normalize(p.title)} ${normalize(p.description)}`;
      const targetWords = new Set(targetText.split(/\s+/).filter(Boolean));
      let matchedWords = 0;
      for (const w of otherText.split(/\s+/)) {
        if (!w) continue;
        if (targetWords.has(w)) matchedWords++;
      }
      score += matchedWords * textWeight;
    }

    return score;
  };

  const scored = pins
    .map((p) => ({ pin: p, score: scorePin(p) }))
    .filter((s) => s.score > 0) // only positive matches
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.pin);

  return scored;
}