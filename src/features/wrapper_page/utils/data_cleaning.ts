type Instruction = {
  label: string;
  opcode: string;
  operand: string;
  originalLine: string;
  prefix?: string;
};

import { instructionSet, instructionMnemonics } from "./instruction_set";

export function parseIntermediateFile(input: string): [Instruction[], string] {
  const lines = input.split("\n");
  const instructions: Instruction[] = [];
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === "") continue;

    const parts = trimmedLine.split(/\s+/);
    if (parts.length < 2) continue;

    parts.shift();

    console.log(parts);

    let label = "",
      opcode = "",
      operand = "",
      prefix = "";

    const checkForInstruction = (token: string) => {
      // Handle prefixes
      let cleanToken = token;
      if (token.startsWith("+") || token.startsWith("@")) {
        prefix = token[0];
        cleanToken = token.substring(1);
      }
      return instructionMnemonics.includes(cleanToken.toUpperCase());
    };

    if (parts.length === 1) {
      if (checkForInstruction(parts[0])) {
        opcode = parts[0];
      } else {
        label = parts[0];
      }
    } else if (parts.length === 2) {
      if (checkForInstruction(parts[0])) {
        opcode = parts[0];
        operand = parts[1];
      } else {
        label = parts[0];
        opcode = parts[1];
      }
    } else if (parts.length >= 3) {
      if (checkForInstruction(parts[0])) {
        opcode = parts[0];
        operand = parts[1];
      } else {
        label = parts[0];
        opcode = parts[1];
        operand = parts[2];
      }
    }

    const cleanedLine = [label, opcode, operand].filter(Boolean).join(" ");
    cleanedLines.push(cleanedLine);

    instructions.push({
      label,
      opcode,
      operand,
      originalLine: line,
      ...(prefix && { prefix }),
    });
  }

  return [instructions, cleanedLines.join("\n")];
}
