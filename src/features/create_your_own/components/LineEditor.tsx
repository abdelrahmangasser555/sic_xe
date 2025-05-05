import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { OPCODES, DIRECTIVES, AssemblyLine } from "./constants";

interface LineEditorProps {
  line: AssemblyLine;
  index: number;
  labels: string[];
  onChange: (index: number, field: keyof AssemblyLine, value: string) => void;
}

export const LineEditor: React.FC<LineEditorProps> = ({
  line,
  index,
  labels,
  onChange,
}) => {
  // Local state for optimistic updates
  const [localLine, setLocalLine] = useState<AssemblyLine>(line);

  // Update local state when props change
  useEffect(() => {
    setLocalLine(line);
  }, [line]);

  const handleChange = (field: keyof AssemblyLine, value: string) => {
    // Update local state immediately for optimistic UI
    setLocalLine((prev) => ({ ...prev, [field]: value }));
    // Notify parent component of the change
    onChange(index, field, value);
  };

  const [customOperand, setCustomOperand] = useState(false);

  const showLabelDropdown =
    localLine.opcode === "END" ||
    (OPCODES.includes(localLine.opcode) &&
      !["RSUB"].includes(localLine.opcode));

  // Handle the custom operand case
  const handleOperandChange = (value: string) => {
    if (value === "__custom__") {
      setCustomOperand(true);
    } else {
      setCustomOperand(false);
      handleChange("operand", value);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        value={localLine.label}
        onChange={(e) => handleChange("label", e.target.value)}
        placeholder="Label"
        className="w-40" // Fixed width instead of w-1/4
      />

      <Select
        value={localLine.opcode || "select-opcode"}
        onValueChange={(value) => handleChange("opcode", value)}
      >
        <SelectTrigger className="w-40">
          {" "}
          {/* Fixed width */}
          <SelectValue placeholder="Opcode" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Directives</SelectLabel>
            {DIRECTIVES.map((dir) => (
              <SelectItem key={dir} value={dir}>
                {dir}
              </SelectItem>
            ))}
          </SelectGroup>

          <SelectSeparator className="my-2" />

          <SelectGroup>
            <SelectLabel>Instructions</SelectLabel>
            {OPCODES.map((op) => (
              <SelectItem key={op} value={op}>
                {op}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="flex space-x-1 w-[332px]">
        {" "}
        {/* Fixed width for prefix+operand container */}
        <Select
          value={localLine.prefix || "none"}
          onValueChange={(value) =>
            handleChange("prefix", value === "none" ? "" : value)
          }
        >
          <SelectTrigger className="w-20">
            {" "}
            {/* Fixed width */}
            <SelectValue placeholder="Prefix" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="#">#</SelectItem>
              <SelectItem value="@">@</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {showLabelDropdown && !customOperand ? (
          <Select
            value={localLine.operand || "select-operand"}
            onValueChange={handleOperandChange}
          >
            <SelectTrigger className="w-60">
              {" "}
              {/* Fixed width */}
              <SelectValue placeholder="Operand" />
            </SelectTrigger>
            <SelectContent>
              {labels.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Labels</SelectLabel>
                  {labels.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              <SelectSeparator className="my-2" />
              <SelectGroup>
                <SelectItem value="__custom__">Custom value...</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            value={localLine.operand}
            onChange={(e) => handleChange("operand", e.target.value)}
            placeholder="Operand"
            className="w-60" /* Fixed width */
            onFocus={() => setCustomOperand(true)}
            onBlur={() => {
              // Only reset to dropdown if we have a valid label and it's a label reference type
              if (labels.includes(localLine.operand) && showLabelDropdown) {
                setCustomOperand(false);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
