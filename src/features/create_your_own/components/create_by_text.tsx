"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineEditor } from "./LineEditor";
import { LineControls } from "./LineControls";
import { ErrorDisplay } from "./ErrorDisplay";
import { TemplateSelector } from "./TemplateSelector";
import { ProgramActions } from "./ProgramActions";
import { validateAllLines } from "./validation";
import { AssemblyLine, Direction, TEMPLATES } from "./constants";
import { Play } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
interface CreateByTextProps {
  state?: AssemblyLine[];
  setState?: (lines: AssemblyLine[]) => void;
  onSave?: (lines: AssemblyLine[]) => void;
}

export default function CreateByText({
  state,
  setState,
  onSave,
}: CreateByTextProps) {
  const defaultLines = [
    { label: "PROG", opcode: "START", operand: "0", prefix: "", error: "" },
  ];

  const [localLines, setLocalLines] = useState<AssemblyLine[]>(() =>
    state && state.length > 0 ? [...state] : [...defaultLines]
  );

  const [labels, setLabels] = useState<string[]>([]);

  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [validationSummary, setValidationSummary] = useState<string>("");

  useEffect(() => {
    if (state && state.length > 0) {
      setLocalLines(state);
    }
  }, [state]);

  const updateParentState = useCallback(
    (newLines: AssemblyLine[]) => {
      if (setState) {
        setState(newLines);
      }
    },
    [setState]
  );

  useEffect(() => {
    const newLabels = localLines
      .filter((line) => line.label && line.label.trim() !== "")
      .map((line) => line.label.trim());
    setLabels(newLabels);
  }, [localLines]);

  const validateLines = useCallback(() => {
    const { validLines, isValid, errorSummary } = validateAllLines(localLines);
    setLocalLines(validLines);
    setValidationSummary(
      isValid ? "" : errorSummary || "Please check your program for errors"
    );
    return { validLines, isValid };
  }, [localLines]);

  const debouncedValidate = useCallback(() => {
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    validationTimerRef.current = setTimeout(() => {
      validateLines();
    }, 2000);
  }, [validateLines]);

  useEffect(() => {
    debouncedValidate();

    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, [debouncedValidate]);

  const handleLineChange = useCallback(
    (index: number, field: keyof AssemblyLine, value: string) => {
      const newLines = [...localLines];
      newLines[index] = { ...newLines[index], [field]: value };
      setLocalLines(newLines);
    },
    [localLines]
  );

  const handleAddLine = useCallback(
    (index: number) => {
      const newLines = [...localLines];
      newLines.splice(index + 1, 0, {
        label: "",
        opcode: "",
        operand: "",
        prefix: "",
        error: "",
      });
      setLocalLines(newLines);
    },
    [localLines]
  );

  const handleRemoveLine = useCallback(
    (index: number) => {
      if (localLines.length <= 1) return;
      const newLines = [...localLines];
      newLines.splice(index, 1);
      setLocalLines(newLines);
      toast.success("Line removed successfully", {
        icon: "🗑️",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    },
    [localLines]
  );

  const handleMoveLine = useCallback(
    (index: number, direction: Direction) => {
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === localLines.length - 1)
      ) {
        return;
      }

      const newLines = [...localLines];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      [newLines[index], newLines[targetIndex]] = [
        newLines[targetIndex],
        newLines[index],
      ];
      setLocalLines(newLines);
    },
    [localLines]
  );

  const handleApplyTemplate = useCallback((template: AssemblyLine[]) => {
    setLocalLines([...template]);
  }, []);

  const handleValidate = () => {
    const { validLines, isValid } = validateLines();

    if (isValid) {
      toast.success("Program is valid!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      updateParentState(validLines);
    }

    if (!isValid) {
      toast.error("Program has errors. Please fix them.", {
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
    return { isValid, validLines };
  };

  const handleSave = () => {
    const { isValid, validLines } = handleValidate();

    if (isValid) {
      if (onSave) {
        setLocalLines(validLines);
        onSave(validLines);
      } else {
        toast.success("Program is valid and can be saved!", {
          icon: "👏",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
      }
    } else {
      toast.error("Please fix errors before saving", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between  w-[100%]">
        <CardTitle>Create SIC/XE Assembly Program</CardTitle>
        <TemplateSelector onApplyTemplate={handleApplyTemplate} />
      </CardHeader>
      <CardContent>
        {validationSummary && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{validationSummary}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2 mb-4 font-medium text-sm text-muted-foreground px-1">
          <div className="w-40">LABEL</div>
          <div className="w-40">OPCODE</div>
          <div className="w-20">PREFIX</div>
          <div className="w-60">OPERAND</div>
          <div className="w-[25vw] flex items-center justify-end ">ACTIONS</div>
        </div>

        <div className="space-y-2">
          {localLines.map((line, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <LineEditor
                  line={line}
                  index={index}
                  labels={labels}
                  onChange={handleLineChange}
                />
                <LineControls
                  index={index}
                  totalLines={localLines.length}
                  onMoveLine={handleMoveLine}
                  onRemoveLine={handleRemoveLine}
                  onAddLine={handleAddLine}
                />
              </div>
              <ErrorDisplay error={line.error} />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <ProgramActions
          onValidate={handleValidate}
          onSave={handleSave}
          saveLabel="Assemble Code"
          saveIcon={<Play className="h-4 w-4" />}
        />
      </CardFooter>
      <Toaster
        toastOptions={{
          className: "bg-gray-800 text-white",
        }}
      />
    </Card>
  );
}
