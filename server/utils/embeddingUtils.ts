import { cleanText } from './cleanText';
import { getEmbeddings } from './bedrock';
import { cosineSimilarity } from './cosine';

export async function groupSimilarTexts(
    texts: string[],
    threshold = 0.9,
    maxGroups?: number
): Promise<{ representative: string; similar_questions: string[] }[]> {
    const cleanedMap = new Map<string, string>();

    const cleanedTexts = texts
        .map((text) => {
            const cleaned = cleanText(text);
            cleanedMap.set(cleaned, text);
            return cleaned;
        })
        .filter(Boolean);

    if (cleanedTexts.length === 0) return [];

    const embeddings = await getEmbeddings(cleanedTexts);
    const used = new Set<number>();
    const clusters: { [key: string]: string[] } = {};

    for (let i = 0; i < embeddings.length; i++) {
        if (used.has(i)) continue;

        const group = [cleanedMap.get(cleanedTexts[i])!];
        used.add(i);

        for (let j = i + 1; j < embeddings.length; j++) {
            if (used.has(j)) continue;
            const sim = cosineSimilarity(embeddings[i], embeddings[j]);
            if (sim >= threshold) {
                group.push(cleanedMap.get(cleanedTexts[j])!);
                used.add(j);
            }
        }

        clusters[group[0]] = group;

        if (maxGroups && Object.keys(clusters).length >= maxGroups) break;
    }

    return Object.entries(clusters).map(([key, group]) => ({
        representative: key,
        similar_questions: group,
    }));
}