import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TEMPLATES, AssemblyLine } from "./constants";
import { ChevronDown, TestTube } from "lucide-react";

import { Separator } from "@/components/ui/separator";
interface TemplateSelectorProps {
  onApplyTemplate: (template: AssemblyLine[]) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onApplyTemplate,
}) => {
  const [savedProjects, setSavedProjects] = React.useState<any[]>([]);
  React.useEffect(() => {
    const saved = localStorage.getItem("savedProjects");
    if (saved) {
      setSavedProjects(JSON.parse(saved));
    }
  }, []);
  return (
    <div className="flex space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Select Template <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="flex items-center space-x-2 justify-between text-blue-500/70 text-xl font-bold">
            Saved Projects
          </DropdownMenuLabel>
          <Separator className="my-1" />
          {savedProjects.length > 0 ? (
            savedProjects.map((project, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => onApplyTemplate(project?.code)}
              >
                {project?.name || `Project ${index + 1}`}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No saved projects</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center space-x-2 justify-between text-yellow-500/70  text-xl font-bold">
            Basic Templates
          </DropdownMenuLabel>
          <Separator className="my-1" />
          <DropdownMenuItem onClick={() => onApplyTemplate(TEMPLATES.basic)}>
            Basic Structure
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onApplyTemplate(TEMPLATES.withMain)}>
            With Main Function
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center space-x-2 justify-between text-green-500/70 text-xl font-bold">
            {/* <TestTube className="h-4 w-4 text-green-500" /> */}
            Example Programs
          </DropdownMenuLabel>
          <Separator className="my-1" />
          <DropdownMenuItem
            onClick={() => onApplyTemplate(TEMPLATES.fileHandling)}
          >
            File I/O Example
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onApplyTemplate(TEMPLATES.calculator)}
          >
            Calculator Example
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
