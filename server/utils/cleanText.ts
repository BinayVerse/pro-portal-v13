export function cleanText(input: string): string {
    // Remove emojis (common ranges)
    return input
        .replace(
            /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDDE0-\uDDFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF])/g,
            ''
        )
        .replace(/\s+/g, ' ') // normalize whitespace
        .trim();
}
