import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
    name: string;
    frequency: number;
    type: string;
}

export const SkillBar = ({ name, frequency, type }: Props) => {
    return (
        <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{name}</span>

                    <Badge
                        variant="outline"
                        className={cn(
                            "rounded-full",
                            type === "tech"
                                ? "border-blue-200 bg-blue-50 text-blue-600"
                                : "border-green-200 bg-green-50 text-green-600",
                        )}
                    >
                        {type === "tech" ? "Technical" : "Soft"}
                    </Badge>
                </div>
                <span className="font-bold">{frequency}%</span>
            </div>

            <Progress value={frequency} className="h-3" />
        </div>
    );
};
