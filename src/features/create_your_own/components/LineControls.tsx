import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Direction } from "./constants";

interface LineControlsProps {
  index: number;
  totalLines: number;
  onMoveLine: (index: number, direction: Direction) => void;
  onRemoveLine: (index: number) => void;
  onAddLine: (index: number) => void;
}

export const LineControls: React.FC<LineControlsProps> = ({
  index,
  totalLines,
  onMoveLine,
  onRemoveLine,
  onAddLine,
}) => {
  return (
    <div className="flex space-x-1 w-36">
      {" "}
      {/* Fixed width to match header */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onMoveLine(index, "up")}
        disabled={index === 0}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onMoveLine(index, "down")}
        disabled={index === totalLines - 1}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemoveLine(index)}
        disabled={totalLines <= 1}
        className="text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => onAddLine(index)}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
