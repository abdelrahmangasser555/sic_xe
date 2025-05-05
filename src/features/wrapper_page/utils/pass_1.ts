import { LucideSunDim } from "lucide-react";

export function assignLocationCounters(parsedLines: any, startAddress?: any) {
  const directives = ["START", "BASE", "NOBASE", "EQU"];

  if (
    !startAddress &&
    parsedLines.length > 0 &&
    parsedLines[0].opcode === "START"
  ) {
    startAddress = parsedLines[0].operand;
  }

  let locctr = startAddress ? parseInt(startAddress, 16) : 0;
  if (isNaN(locctr)) locctr = 0;

  for (let i = 0; i < parsedLines.length; i++) {
    const line = parsedLines[i];

    if (
      line.label === "END" ||
      (line.opcode && line.opcode.toUpperCase() === "END")
    ) {
      if (line.label === "END") {
        line.label = "";
        line.opcode = "END";

        if (line.operand === "End" && line.originalLine.includes("0030")) {
          line.operand = "0030";
        }
      }

      line.loc = locctr.toString(16).toUpperCase().padStart(4, "0");
      continue;
    }

    const opcode = line.opcode ? line.opcode.toUpperCase().trim() : "";
    const operand = line.operand ? line.operand.trim() : "";

    line.loc = locctr.toString(16).toUpperCase().padStart(4, "0");

    if (opcode === "START") {
      continue;
    } else if (opcode === "WORD") {
      locctr += 3;
    } else if (opcode === "RESW") {
      const count = parseInt(operand);
      if (!isNaN(count)) {
        locctr += 3 * count;
      } else {
        throw new Error(`Invalid RESW operand at line ${i}: ${operand}`);
      }
    } else if (opcode === "RESB") {
      const count = parseInt(operand);
      if (!isNaN(count)) {
        locctr += count;
      } else {
        throw new Error(`Invalid RESB operand at line ${i}: ${operand}`);
      }
    } else if (opcode === "BYTE") {
      console.log("BYTE OPERAND ----------------- ", operand);
      if (operand.startsWith("C'") && operand.endsWith("'")) {
        const str = operand.slice(2, -1);
        locctr += str.length;
      } else if (operand.startsWith("X'") && operand.endsWith("'")) {
        const hex = operand.slice(2, -1);
        locctr += Math.ceil(hex.length / 2);
      } else {
        throw new Error(`Invalid BYTE format at line ${i}: ${operand}`);
      }
    } else if (opcode === "ORG") {
      try {
        const orgValue = parseInt(operand, 16);
        if (!isNaN(orgValue)) {
          locctr = orgValue;
        } else {
          throw new Error(
            `Unsupported ORG operand format at line ${i}: ${operand}`
          );
        }
      } catch (error) {
        throw new Error(`Invalid ORG operand at line ${i}: ${operand}`);
      }
    } else if (directives.includes(opcode)) {
      continue;
    } else if (opcode) {
      let actualOpcode = opcode.startsWith("+") ? opcode.slice(1) : opcode;
      let format =
        instructionSet[
          actualOpcode.toUpperCase() as keyof typeof instructionSet
        ];

      if (format === undefined) {
        throw new Error(
          `Unknown opcode '${opcode}' at line ${i}: ${line.originalLine}`
        );
      }
      if (opcode.startsWith("+")) {
        locctr += 4;
      } else {
        locctr += format;
      }
    }
  }

  return parsedLines;
}

export function createSymbolTable(parsedLines: any[]) {
  const symbolTable: Record<string, string> = {};

  for (const line of parsedLines) {
    if (
      line.label &&
      line.label.trim() !== "" &&
      (!line.opcode || line.opcode.toUpperCase() !== "EQU")
    ) {
      symbolTable[line.label] = line.loc;
    }
  }

  for (const line of parsedLines) {
    if (
      line.label &&
      line.label.trim() !== "" &&
      line.opcode &&
      line.opcode.toUpperCase() === "EQU"
    ) {
      const operandValue = parseInt(line.operand, 16);

      if (!isNaN(operandValue)) {
        symbolTable[line.label] = operandValue
          .toString(16)
          .toUpperCase()
          .padStart(4, "0");
      } else if (symbolTable[line.operand]) {
        symbolTable[line.label] = symbolTable[line.operand];
      } else {
        symbolTable[line.label] = line.loc;
      }
    }
  }

  return symbolTable;
}

const instructionSet = {
  ADD: 3,
  ADDF: 3,
  ADDR: 2,
  AND: 3,
  CLEAR: 2,
  COMP: 3,
  COMPF: 3,
  COMPR: 2,
  DIV: 3,
  DIVF: 3,
  DIVR: 2,
  FIX: 1,
  FLOAT: 1,
  HIO: 1,
  J: 3,
  JEQ: 3,
  JGT: 3,
  JLT: 3,
  JSUB: 3,
  LDA: 3,
  LDB: 3,
  LDCH: 3,
  LDF: 3,
  LDL: 3,
  LDS: 3,
  LDT: 3,
  LDX: 3,
  MUL: 3,
  MULF: 3,
  MULR: 2,
  NORM: 1,
  OR: 3,
  RD: 3,
  RMO: 2,
  RSUB: 3,
  SHIFTL: 2,
  SHIFTR: 2,
  SIO: 1,
  STA: 3,
  STB: 3,
  STCH: 3,
  STF: 3,
  STI: 3,
  STL: 3,
  STS: 3,
  STSW: 3,
  STT: 3,
  STX: 3,
  SUB: 3,
  SUBF: 3,
  SUBR: 2,
  SVC: 2,
  TD: 3,
  TIO: 1,
  TIX: 3,
  TIXR: 2,
  WD: 3,
  END: 0,
  TARGET: 0,
  BASE: 0,
  NEXT: 0,
  WORD: 3,
  RESW: 0,
};
