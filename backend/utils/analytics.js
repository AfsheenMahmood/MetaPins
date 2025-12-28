/**
 * Advanced Similarity & Ranking Algorithm for Big Data Analytics Project
 * 
 * Features:
 * 1. Weighted Tag Similarity (Rare tags have more weight)
 * 2. Engagement Ranking (Likes & Saves influence score)
 * 3. Categorical Cluster Boosting
 * 4. Text Analysis on Titles/Descriptions
 */

function calculateIDF(allPins) {
    const tagDocsCount = {};
    const totalDocs = allPins.length;

    allPins.forEach(pin => {
        const tags = new Set((pin.tags || []).map(t => t.toLowerCase().trim()));
        tags.forEach(tag => {
            tagDocsCount[tag] = (tagDocsCount[tag] || 0) + 1;
        });
    });

    const idf = {};
    for (const tag in tagDocsCount) {
        // IDF formula: log(Total Documents / Documents with tag)
        idf[tag] = Math.log(totalDocs / (tagDocsCount[tag] || 1)) + 1;
    }
    return idf;
}

function getWords(s) {
    if (!s) return new Set();
    const stopWords = new Set(["a", "the", "an", "is", "are", "in", "on", "at", "to", "for", "with", "of", "and"]);
    return new Set(
        s.toLowerCase()
            .split(/[\s,._-]+/)
            .filter(w => w.length > 2 && !stopWords.has(w))
    );
}

function calculateSimilarityScore(target, allPins) {
    const idf = calculateIDF(allPins);
    const targetTags = (target.tags || []).map(t => t.toLowerCase().trim());
    const targetCategory = (target.category || "").toLowerCase().trim();
    const targetColor = (target.color || "").toLowerCase().trim();
    const targetTitleWords = getWords(target.title);

    return allPins
        .map(p => {
            // Don't compare with self
            if (String(p._id) === String(target._id)) return { pin: p, score: -1 };

            let score = 0;

            // 1. Tag Similarity (TF-IDF inspired)
            const pTags = (p.tags || []).map(t => t.toLowerCase().trim());
            pTags.forEach(tag => {
                if (targetTags.includes(tag)) {
                    // rare tags (high IDF) boost score more than common tags
                    score += (idf[tag] || 1) * 10;
                }
            });

            // 2. Category Boost
            if (targetCategory && (p.category || "").toLowerCase().trim() === targetCategory) {
                score += 15;
            }

            // 3. Color Connection
            if (targetColor && (p.color || "").toLowerCase().trim() === targetColor) {
                score += 5;
            }

            // 4. Textual Overlap
            const pTitleWords = getWords(p.title);
            let textOverlap = 0;
            targetTitleWords.forEach(w => {
                if (pTitleWords.has(w)) textOverlap++;
            });
            score += textOverlap * 2;

            // 5. Engagement Decoding (Big Data Metric)
            // We assume pins with more likes/saves are higher quality "matches"
            const likeCount = Array.isArray(p.likes) ? p.likes.length : 0;
            const saveCount = Array.isArray(p.savedPins) ? p.savedPins.length : 0;

            // Decay engagement impact to ensure similarity is still primary
            const engagementBoost = (likeCount * 2) + (saveCount * 3);
            score += Math.min(engagementBoost, 20);

            return { pin: p, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
}

module.exports = { calculateSimilarityScore };
