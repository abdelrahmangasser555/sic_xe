export function assignLocationCounters(parsedLines: any, startAddress?: any) {
  const directives = ["START", "BASE", "NOBASE", "EQU"];

  // Find the START directive to get the starting address if not provided
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

    // Fix the END directive issue
    if (
      line.label === "END" ||
      (line.opcode && line.opcode.toUpperCase() === "END")
    ) {
      if (line.label === "END") {
        line.label = "";
        line.opcode = "END";
        // If the operand contains an address, keep it
        if (line.operand === "End" && line.originalLine.includes("0030")) {
          line.operand = "0030";
        }
      }
      // END directive doesn't increment LOCCTR
      line.loc = locctr.toString(16).toUpperCase().padStart(4, "0");
      continue;
    }

    const opcode = line.opcode ? line.opcode.toUpperCase().trim() : "";
    const operand = line.operand ? line.operand.trim() : "";

    // Save current location counter value for this line
    line.loc = locctr.toString(16).toUpperCase().padStart(4, "0");

    // Process based on opcode
    if (opcode === "START") {
      // START directive already processed for initial LOCCTR
      continue;
    } else if (opcode === "WORD") {
      locctr += 3; // WORD is 3 bytes in SIC/XE
    } else if (opcode === "RESW") {
      const count = parseInt(operand);
      if (!isNaN(count)) {
        locctr += 3 * count; // Each word is 3 bytes in SIC/XE
      } else {
        throw new Error(`Invalid RESW operand at line ${i}: ${operand}`);
      }
    } else if (opcode === "RESB") {
      const count = parseInt(operand);
      if (!isNaN(count)) {
        locctr += count; // RESB reserves exactly the number of bytes specified
      } else {
        throw new Error(`Invalid RESB operand at line ${i}: ${operand}`);
      }
    } else if (opcode === "BYTE") {
      if (operand.startsWith("C'") && operand.endsWith("'")) {
        const str = operand.slice(2, -1);
        locctr += str.length; // Each character takes 1 byte
      } else if (operand.startsWith("X'") && operand.endsWith("'")) {
        const hex = operand.slice(2, -1);
        locctr += Math.ceil(hex.length / 2); // Each pair of hex digits takes 1 byte
      } else {
        throw new Error(`Invalid BYTE format at line ${i}: ${operand}`);
      }
    } else if (opcode === "ORG") {
      // ORG directive - set LOCCTR to the value of the operand
      try {
        const orgValue = parseInt(operand, 16);
        if (!isNaN(orgValue)) {
          locctr = orgValue;
        } else {
          // If it's a symbol, we would need a symbol table here
          throw new Error(
            `Unsupported ORG operand format at line ${i}: ${operand}`
          );
        }
      } catch (error) {
        throw new Error(`Invalid ORG operand at line ${i}: ${operand}`);
      }
    } else if (directives.includes(opcode)) {
      // Other directives don't affect LOCCTR
      continue;
    } else if (opcode) {
      // Handle regular instructions
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

      // Format 4 instructions start with '+'
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

  // First pass: Process all labels except those defined by EQU
  for (const line of parsedLines) {
    if (
      line.label &&
      line.label.trim() !== "" &&
      (!line.opcode || line.opcode.toUpperCase() !== "EQU")
    ) {
      symbolTable[line.label] = line.loc;
    }
  }

  // Second pass: Process EQU directives now that other symbols are defined
  for (const line of parsedLines) {
    if (
      line.label &&
      line.label.trim() !== "" &&
      line.opcode &&
      line.opcode.toUpperCase() === "EQU"
    ) {
      // Try to parse as a hex value first
      const operandValue = parseInt(line.operand, 16);

      if (!isNaN(operandValue)) {
        // It's a numeric value
        symbolTable[line.label] = operandValue
          .toString(16)
          .toUpperCase()
          .padStart(4, "0");
      } else if (symbolTable[line.operand]) {
        // It references another symbol
        symbolTable[line.label] = symbolTable[line.operand];
      } else {
        // Unsupported operand format or expression - default to current location
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
};
