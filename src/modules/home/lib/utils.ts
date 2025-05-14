function normalizeText(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

export function isMatch(input: string, target: string): boolean {
    const inputTokens = normalizeText(input).split(" ");
    const targetTokens = normalizeText(target).split(" ");

    return inputTokens.every((inputToken) =>
        targetTokens.some((targetToken) => targetToken.startsWith(inputToken)),
    );
}

export function getMonthAgo(months: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
}
