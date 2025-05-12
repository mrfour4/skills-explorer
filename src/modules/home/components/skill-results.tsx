import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilters } from "@/hooks/use-filters";
import { useGetSkills } from "../hooks/use-skill";
import { EmptyResults } from "./empty-results";
import { SkillBar } from "./skill-bar";

export const SkillResults = () => {
    const { isLoading, data, isError } = useGetSkills();
    const [filters] = useFilters();

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-transparent" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-red-500">Error loading skills</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return <EmptyResults />;
    }

    const technicalSkills = data.filter((skill) => skill.type === "tech");
    const softSkills = data.filter((skill) => skill.type === "soft");

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <Tabs defaultValue="all">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold">
                            {filters.jobTitle} Skills
                        </h2>
                        <p className="text-sm text-gray-500">
                            Based on {250} job postings
                        </p>
                    </div>
                    <TabsList defaultValue="all">
                        <TabsTrigger value="all">All Skills</TabsTrigger>
                        <TabsTrigger value="tech">Technical</TabsTrigger>
                        <TabsTrigger value="soft">Soft Skills</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all">
                    {data.map((skill, index) => (
                        <SkillBar
                            key={index}
                            name={skill.name}
                            frequency={skill.frequency}
                            type={skill.type}
                        />
                    ))}
                </TabsContent>

                <TabsContent value="tech">
                    {technicalSkills.map((skill, index) => (
                        <SkillBar
                            key={index}
                            name={skill.name}
                            frequency={skill.frequency}
                            type={skill.type}
                        />
                    ))}
                </TabsContent>

                <TabsContent value="soft">
                    {softSkills.map((skill, index) => (
                        <SkillBar
                            key={index}
                            name={skill.name}
                            frequency={skill.frequency}
                            type={skill.type}
                        />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
};
