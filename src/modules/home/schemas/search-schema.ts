import { z } from "zod";

export const searchParamsSchema = z.object({
    jobTitle: z.string().min(1, { message: "Job title is required" }),
    locations: z.array(z.string()).optional(),
    levels: z.array(z.string()).optional(),
    updatedAfter: z.date().nullish(),
});

export type SearchData = z.infer<typeof searchParamsSchema>;
