import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Play } from "lucide-react";

interface ProgramActionsProps {
  onValidate: () => void;
  onSave: () => void;
  saveLabel?: string;
  saveIcon?: React.ReactNode;
}

export const ProgramActions: React.FC<ProgramActionsProps> = ({
  onValidate,
  onSave,
  saveLabel = "Save Program",
  saveIcon = <Save className="mr-2 h-4 w-4" />,
}) => {
  return (
    <div className="flex justify-between w-full">
      <Button variant="outline" onClick={onValidate}>
        Validate and save
      </Button>
      <Button onClick={onSave}>
        {saveIcon} {saveLabel}
      </Button>
    </div>
  );
};
