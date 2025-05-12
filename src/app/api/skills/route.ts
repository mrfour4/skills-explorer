import { NextRequest } from "next/server";
import queryString from "query-string";
import { z } from "zod";
import { searchParamsSchema } from "../../../modules/home/schemas/search-schema";

export async function getSkill() {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockSkills = [
        { name: "HTML/CSS", frequency: 95, type: "tech" },
        { name: "JavaScript", frequency: 92, type: "tech" },
        { name: "Responsive Design", frequency: 80, type: "tech" },
        { name: "React", frequency: 78, type: "tech" },
        { name: "TypeScript", frequency: 65, type: "tech" },
        { name: "Communication", frequency: 70, type: "soft" },
        { name: "Teamwork", frequency: 68, type: "soft" },
        { name: "Problem Solving", frequency: 65, type: "soft" },
    ];

    return mockSkills;
}

const schema = searchParamsSchema.extend({
    updatedAfter: z.string().date().nullish(),
});

export async function GET(req: NextRequest) {
    const raw = queryString.parse(req.nextUrl.searchParams.toString(), {
        arrayFormat: "bracket",
    });
    console.log("🚀 ~ raw ~ raw:", raw);

    const { success, data, error } = schema.safeParse(raw);

    if (!success) {
        console.log("🚀 ~ GET ~ Invalid query parameters:", error.toString());
        return Response.json(
            { error: "Invalid query parameters" },
            { status: 400 },
        );
    }

    console.log("🚀 ~ GET ~ data:", data);
    const { jobTitle, location, experienceLevel, updatedAfter } = data;

    if (jobTitle === "nono") {
        return Response.json([]);
    }

    try {
        const skills = await getSkill();
        return Response.json(skills);
    } catch (error) {
        console.error("Error fetching skills:", error);
        return Response.json(
            { error: "Failed to fetch skills" },
            { status: 500 },
        );
    }
}
