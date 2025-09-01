import levenshtein from 'fast-levenshtein';

export function groupSimilarQuestions(questions: string[]): string[][] {
    const clusters: string[][] = [];

    for (const q of questions) {
        const normalized = q.toLowerCase().trim();
        let matched = false;

        for (const group of clusters) {
            const representative = group[0].toLowerCase().trim();
            const distance = levenshtein.get(normalized, representative);
            const threshold = Math.floor(Math.min(normalized.length, representative.length) * 0.3); // 30% diff allowed

            if (distance <= threshold) {
                group.push(q);
                matched = true;
                break;
            }
        }

        if (!matched) {
            clusters.push([q]);
        }
    }

    return clusters;
}
