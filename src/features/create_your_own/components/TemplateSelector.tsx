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
import { ChevronDown } from "lucide-react";

interface TemplateSelectorProps {
  onApplyTemplate: (template: AssemblyLine[]) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onApplyTemplate,
}) => {
  return (
    <div className="flex space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Select Template <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Basic Templates</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onApplyTemplate(TEMPLATES.basic)}>
            Basic Structure
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onApplyTemplate(TEMPLATES.withMain)}>
            With Main Function
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Example Programs</DropdownMenuLabel>
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
