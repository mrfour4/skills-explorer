import { useFilters } from "@/hooks/use-filters";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import queryString from "query-string";

export const useGetSkills = () => {
    const [filters] = useFilters();

    return useQuery({
        queryKey: ["skills", filters],
        queryFn: async () => {
            const searchParams = queryString.stringify(
                {
                    ...filters,
                    updatedAfter: filters.updatedAfter
                        ? format(filters.updatedAfter, "yyyy-MM-dd")
                        : null,
                },
                {
                    arrayFormat: "bracket",
                    skipNull: true,
                },
            );
            console.log("🚀 ~ queryFn: ~ searchParams:", searchParams);

            const res = await fetch(`api/skills?${searchParams}`);

            if (!res.ok) {
                throw new Error("Failed to fetch skills");
            }

            return (await res.json()) as Skill[];
        },
        enabled: !!filters.jobTitle,
    });
};
