import { AssemblyLine, OPCODES, DIRECTIVES } from "./constants";

export const validateLine = (
  line: AssemblyLine,
  index: number,
  labels: string[]
): string => {
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
): { validLines: AssemblyLine[]; isValid: boolean } => {
  const labels = lines
    .filter((line) => line.label && line.label.trim() !== "")
    .map((line) => line.label.trim());

  const validLines = lines.map((line, index) => ({
    ...line,
    error: validateLine(line, index, labels),
  }));

  const isValid = validLines.every((line) => !line.error);

  return { validLines, isValid };
};
