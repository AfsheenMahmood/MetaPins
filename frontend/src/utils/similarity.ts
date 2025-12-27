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
  const getWords = (s?: string) => {
    const text = normalize(s);
    if (!text) return new Set<string>();
    // Filter out common stop words for better matching
    const stopWords = new Set(["a", "the", "an", "is", "are", "in", "on", "at", "to", "for", "with", "of", "and"]);
    return new Set(text.split(/[\s,._-]+/).filter(w => w.length > 2 && !stopWords.has(w)));
  };

  const targetTags = new Set((target.tags || []).map((t) => normalize(t)));
  const targetCategory = normalize(target.category);
  const targetColor = normalize(target.color);
  const targetTitleWords = getWords(target.title);
  const targetDescWords = getWords(target.description);

  const scorePin = (p: Pin) => {
    const pid = String(p._id || p.id);
    const tid = String(target._id || target.id);
    if (!p || pid === tid) return -1;

    let score = 0;

    // 1. Tag overlap (High Weight)
    if (Array.isArray(p.tags) && p.tags.length && targetTags.size) {
      let overlap = 0;
      p.tags.forEach((t) => {
        if (targetTags.has(normalize(t))) overlap++;
      });
      score += overlap * tagWeight * 2; // Extra weight for tags
    }

    // 2. Category match
    if (targetCategory && normalize(p.category) === targetCategory) {
      score += categoryWeight;
    }

    // 3. Color match
    if (targetColor && normalize(p.color) === targetColor) {
      score += colorWeight * 2;
    }

    // 4. Text overlap (Title & Description)
    const otherTitleWords = getWords(p.title);
    const otherDescWords = getWords(p.description);

    let titleMatch = 0;
    targetTitleWords.forEach(w => {
      if (otherTitleWords.has(w)) titleMatch++;
    });
    score += titleMatch * textWeight * 2;

    let descMatch = 0;
    targetDescWords.forEach(w => {
      if (otherDescWords.has(w)) descMatch++;
    });
    score += descMatch * textWeight;

    return score;
  };

  const scored = pins
    .map((p) => ({ pin: p, score: scorePin(p) }))
    .filter((s) => s.score > 1) // Higher threshold for quality
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.pin);

  return scored;
}