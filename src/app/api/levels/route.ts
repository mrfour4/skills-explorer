export async function getLevels() {
    // In a real app, this would be a fetch call to your API
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const levels: string[] = [
        "Intern",
        "Entry Level",
        "Mid Level",
        "Senior Level",
        "Lead Level",
        "Manager Level",
    ];
    return levels;
}
export const GET = async () => {
    try {
        const levels = await getLevels();
        return Response.json(levels);
    } catch (error) {
        console.error("Error fetching levels:", error);
        return Response.json(
            { error: "Failed to fetch levels" },
            { status: 500 },
        );
    }
};
