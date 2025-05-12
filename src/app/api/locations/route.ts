export async function getLocations() {
    // In a real app, this would be a fetch call to your API
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const locations: string[] = [
        "Thành phố Hồ Chí Minh",
        "Hà Nội",
        "Đà Nẵng",
        "Cần Thơ",
        "Hải Phòng",
        "Nha Trang",
        "Vũng Tàu",
    ];
    return locations;
}

export const GET = async () => {
    try {
        const locations = await getLocations();
        return Response.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return Response.json(
            { error: "Failed to fetch locations" },
            { status: 500 },
        );
    }
};
