type Skill = {
    skillName: string;
    skillType: "tech" | "soft";
    frequency: string;
};

export type Cursor = {
    lastFreq: number;
    lastName: string;
} | null;

export type SkillApiResponse = {
    data: Skill[];
    nextCursor: Cursor;
    meta: {
        count: number;
        matchedJobCount: number;
        duration: number;
        timestamp: string;
    };
};
