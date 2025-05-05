"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Common SIC/XE opcodes
const OPCODES = [
  "ADD",
  "ADDF",
  "ADDR",
  "AND",
  "CLEAR",
  "COMP",
  "COMPF",
  "COMPR",
  "DIV",
  "DIVF",
  "DIVR",
  "FIX",
  "FLOAT",
  "HIO",
  "J",
  "JEQ",
  "JGT",
  "JLT",
  "JSUB",
  "LDA",
  "LDB",
  "LDCH",
  "LDF",
  "LDL",
  "LDS",
  "LDT",
  "LDX",
  "LPS",
  "MUL",
  "MULF",
  "MULR",
  "NORM",
  "OR",
  "RD",
  "RMO",
  "RSUB",
  "SHIFTL",
  "SHIFTR",
  "SIO",
  "SSK",
  "STA",
  "STB",
  "STCH",
  "STF",
  "STI",
  "STL",
  "STS",
  "STSW",
  "STT",
  "STX",
  "SUB",
  "SUBF",
  "SUBR",
  "SVC",
  "TD",
  "TIO",
  "TIX",
  "TIXR",
  "WD",
];

// Directives
const DIRECTIVES = [
  "START",
  "END",
  "BYTE",
  "WORD",
  "RESB",
  "RESW",
  "BASE",
  "NOBASE",
  "EQU",
  "ORG",
  "LTORG",
];

// Templates for common structures
const TEMPLATES = {
  basic: [
    { label: "PROG", opcode: "START", operand: "0", prefix: "", error: "" },
    { label: "", opcode: "", operand: "", prefix: "", error: "" },
    { label: "", opcode: "END", operand: "PROG", prefix: "", error: "" },
  ],
  withMain: [
    { label: "PROG", opcode: "START", operand: "0", prefix: "", error: "" },
    { label: "MAIN", opcode: "LDA", operand: "#0", prefix: "", error: "" },
    { label: "", opcode: "RSUB", operand: "", prefix: "", error: "" },
    { label: "", opcode: "END", operand: "PROG", prefix: "", error: "" },
  ],
};

export default function CreateByText({ state, setState }: any) {
  const [lines, setLines] = useState<any[]>([
    { label: "PROG", opcode: "START", operand: "0", prefix: "", error: "" },
  ]);

  const [labels, setLabels] = useState<string[]>([]);

  // Update the parent component's state when lines change
  useEffect(() => {
    if (setState) {
      setState(lines);
    }
  }, [lines, setState]);

  // Extract labels for dropdown references
  useEffect(() => {
    const newLabels = lines
      .filter((line) => line.label && line.label.trim() !== "")
      .map((line) => line.label.trim());
    setLabels(newLabels);
  }, [lines]);

  // Validate a single line
  const validateLine = (line: any, index: number) => {
    let error = "";

    // Validate START directive
    if (index === 0 && line.opcode === "START") {
      if (!line.label) {
        error = "START directive requires a program name label";
      }
      if (!/^\d+$/.test(line.operand)) {
        error = "START operand must be a number";
      }
    }

    // Validate END directive
    if (line.opcode === "END") {
      if (!labels.includes(line.operand)) {
        error = "END operand must reference a valid label";
      }
    }

    // Validate opcodes
    if (
      line.opcode &&
      !OPCODES.includes(line.opcode) &&
      !DIRECTIVES.includes(line.opcode)
    ) {
      error = "Invalid opcode";
    }

    // Validate RSUB (should have no operand)
    if (line.opcode === "RSUB" && line.operand) {
      error = "RSUB should not have an operand";
    }

    // Check if a referenced label exists
    if (
      line.operand &&
      !line.operand.startsWith("#") &&
      !line.operand.startsWith("@") &&
      !line.operand.includes(",") &&
      isNaN(line.operand) &&
      !labels.includes(line.operand) &&
      OPCODES.includes(line.opcode)
    ) {
      error = "Referenced label does not exist";
    }

    return error;
  };

  // Validate all lines
  const validateAllLines = () => {
    const newLines = [...lines];

    newLines.forEach((line, index) => {
      line.error = validateLine(line, index);
    });

    setLines(newLines);
    return newLines.every((line) => !line.error);
  };

  // Add a new line
  const addLine = (index: number) => {
    const newLines = [...lines];
    newLines.splice(index + 1, 0, {
      label: "",
      opcode: "",
      operand: "",
      prefix: "",
      error: "",
    });
    setLines(newLines);
  };

  // Remove a line
  const removeLine = (index: number) => {
    if (lines.length <= 1) return; // Keep at least one line

    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  // Move a line up
  const moveLine = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === lines.length - 1)
    ) {
      return;
    }

    const newLines = [...lines];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    [newLines[index], newLines[targetIndex]] = [
      newLines[targetIndex],
      newLines[index],
    ];
    setLines(newLines);
  };

  // Apply a template
  const applyTemplate = (template: string) => {
    setLines(TEMPLATES[template]);
  };

  // Save the program
  const saveProgram = () => {
    if (validateAllLines()) {
      alert("Program is valid and can be saved!");
      // Here you would implement the actual save functionality
    } else {
      alert("Please fix errors before saving");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create SIC/XE Assembly Program</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => applyTemplate("basic")}>
            Basic Template
          </Button>
          <Button variant="outline" onClick={() => applyTemplate("withMain")}>
            With Main Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lines.map((line, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={line.label}
                  onChange={(e) => {
                    const newLines = [...lines];
                    newLines[index].label = e.target.value;
                    setLines(newLines);
                  }}
                  placeholder="Label"
                  className="w-1/4"
                />

                <Select
                  value={line.opcode}
                  onValueChange={(value) => {
                    const newLines = [...lines];
                    newLines[index].opcode = value;
                    setLines(newLines);
                  }}
                >
                  <SelectTrigger className="w-1/4">
                    <SelectValue placeholder="Opcode" />
                  </SelectTrigger>
                  <SelectContent>
                    <optgroup label="Directives">
                      {DIRECTIVES.map((dir) => (
                        <SelectItem key={dir} value={dir}>
                          {dir}
                        </SelectItem>
                      ))}
                    </optgroup>
                    <optgroup label="Instructions">
                      {OPCODES.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </optgroup>
                  </SelectContent>
                </Select>

                <div className="w-1/4 flex space-x-1">
                  <Select
                    value={line.prefix}
                    onValueChange={(value) => {
                      const newLines = [...lines];
                      newLines[index].prefix = value;
                      setLines(newLines);
                    }}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="#">#</SelectItem>
                      <SelectItem value="@">@</SelectItem>
                    </SelectContent>
                  </Select>

                  {line.opcode === "END" ||
                  (OPCODES.includes(line.opcode) &&
                    !["RSUB"].includes(line.opcode)) ? (
                    <Select
                      value={line.operand}
                      onValueChange={(value) => {
                        const newLines = [...lines];
                        newLines[index].operand = value;
                        setLines(newLines);
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Operand" />
                      </SelectTrigger>
                      <SelectContent>
                        {labels.map((label) => (
                          <SelectItem key={label} value={label}>
                            {label}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="text"
                      value={line.operand}
                      onChange={(e) => {
                        const newLines = [...lines];
                        newLines[index].operand = e.target.value;
                        setLines(newLines);
                      }}
                      placeholder="Operand"
                      className="flex-1"
                    />
                  )}
                </div>

                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveLine(index, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveLine(index, "down")}
                    disabled={index === lines.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeLine(index)}
                    disabled={lines.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => addLine(index)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {line.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{line.error}</AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={validateAllLines}>
          Validate
        </Button>
        <Button onClick={saveProgram}>
          <Save className="mr-2 h-4 w-4" /> Save Program
        </Button>
      </CardFooter>
    </Card>
  );
}
