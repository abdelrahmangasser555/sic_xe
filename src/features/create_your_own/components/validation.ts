import { AssemblyLine, OPCODES, DIRECTIVES } from "./constants";

export const validateLine = (
  line: AssemblyLine,
  index: number,
  labels: string[]
): string => {
  let error = "";

  if (index === 0 && line.opcode === "START") {
    if (!line.label) {
      error = "START directive requires a program name label";
    }
    if (!/^\d+$/.test(line.operand)) {
      error = "START operand must be a number";
    }
  }

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
    isNaN(Number(line.operand)) &&
    !labels.includes(line.operand) &&
    OPCODES.includes(line.opcode)
  ) {
    error = "Referenced label does not exist";
  }

  return error;
};

export const validateAllLines = (
  lines: AssemblyLine[]
): { validLines: AssemblyLine[]; isValid: boolean; errorSummary: string } => {
  const labels = lines
    .filter((line) => line.label && line.label.trim() !== "")
    .map((line) => line.label.trim());

  const validLines = lines.map((line, index) => ({
    ...line,
    error: validateLine(line, index, labels),
  }));

  const isValid = validLines.every((line) => !line.error);

  let errorSummary = "";
  if (!isValid) {
    const errors = validLines
      .map((line, index) =>
        line.error ? `Line ${index + 1}: ${line.error}` : null
      )
      .filter(Boolean);

    // Limit to first 3 errors to keep the summary concise
    const displayErrors = errors.slice(0, 3);
    if (errors.length > 3) {
      displayErrors.push(`...and ${errors.length - 3} more errors`);
    }

    errorSummary = displayErrors.join(". ");
  }

  return { validLines, isValid, errorSummary };
};
