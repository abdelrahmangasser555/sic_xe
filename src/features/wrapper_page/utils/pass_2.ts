import { instructionSet } from "./instruction_set";
import { createSymbolTable } from "./pass_1";

// Define register numbers for format 2 instructions
const registers: Record<string, number> = {
  A: 0,
  X: 1,
  L: 2,
  B: 3,
  S: 4,
  T: 5,
  F: 6,
};

// Generate object code for each instruction
export function generateObjectCode(parsedLines: any[]) {
  // Create symbol table from pass 1 output
  const symbolTable = createSymbolTable(parsedLines);

  // Track base register value for base-relative addressing
  let baseRegisterValue: number | null = null;

  // Process each line
  for (let i = 0; i < parsedLines.length; i++) {
    const line = parsedLines[i];
    const opcode = line.opcode ? line.opcode.toUpperCase().trim() : "";
    const operand = line.operand ? line.operand.trim() : "";

    // Skip if not an actual instruction or directive
    if (!opcode) {
      line.objectCode = "";
      continue;
    }

    // Handle assembler directives
    if (
      opcode === "START" ||
      opcode === "END" ||
      opcode === "ORG" ||
      opcode === "RESW" ||
      opcode === "RESB" ||
      opcode === "EQU"
    ) {
      line.objectCode = "";
      continue;
    } else if (opcode === "BASE") {
      if (symbolTable[operand]) {
        baseRegisterValue = parseInt(symbolTable[operand], 16);
      } else if (!isNaN(parseInt(operand, 16))) {
        baseRegisterValue = parseInt(operand, 16);
      }
      line.objectCode = "";
      continue;
    } else if (opcode === "NOBASE") {
      baseRegisterValue = null;
      line.objectCode = "";
      continue;
    } else if (opcode === "BYTE") {
      line.objectCode = calculateByteDirectiveObjectCode(operand);
      continue;
    } else if (opcode === "WORD") {
      const value = parseInt(operand, 10);
      line.objectCode = value.toString(16).toUpperCase().padStart(6, "0");
      continue;
    }

    // Process machine instructions
    const isFormat4 = opcode.startsWith("+");
    const mnemonic = isFormat4 ? opcode.substring(1) : opcode;

    // Find instruction in instruction set
    const instruction = instructionSet.find(
      (instr) => instr.mnemonic.toUpperCase() === mnemonic.toUpperCase()
    );

    if (!instruction) {
      console.error(`Unknown instruction: ${mnemonic} at line ${i}`);
      line.objectCode = "";
      continue;
    }

    if (instruction.format.includes(1)) {
      line.objectCode = instruction.opcode;
    } else if (instruction.format.includes(2)) {
      line.objectCode = generateFormat2ObjectCode(instruction.opcode, operand);
    } else {
      const nextLoc =
        i < parsedLines.length - 1
          ? parseInt(parsedLines[i + 1].loc, 16)
          : parseInt(line.loc, 16) + (isFormat4 ? 4 : 3);

      line.objectCode = generateFormat3Or4ObjectCode(
        instruction.opcode,
        operand,
        parseInt(line.loc, 16),
        nextLoc,
        isFormat4,
        symbolTable,
        baseRegisterValue
      );
    }
  }

  return parsedLines;
}

function generateFormat2ObjectCode(opcode: string, operand: string): string {
  const operandParts = operand.split(",").map((part) => part.trim());

  let r1 = 0;
  let r2 = 0;

  if (operandParts.length >= 1) {
    r1 =
      registers[operandParts[0]] !== undefined ? registers[operandParts[0]] : 0;
  }

  if (operandParts.length >= 2) {
    r2 =
      registers[operandParts[1]] !== undefined ? registers[operandParts[1]] : 0;
  }

  return `${opcode}${r1}${r2}`;
}

function generateFormat3Or4ObjectCode(
  opcode: string,
  operand: string,
  currentLoc: number,
  nextLoc: number,
  isFormat4: boolean,
  symbolTable: Record<string, string>,
  baseRegisterValue: number | null
): string {
  let opcodeValue = parseInt(opcode, 16);
  let nixbpe = 0;
  let address = 0;

  // Parse operand and set flags
  if (operand === "") {
    // Handle RSUB which has no operand
    nixbpe = 0x30; // Set n=1, i=1
  } else {
    // Check addressing modes
    if (operand.startsWith("#")) {
      // Immediate addressing
      nixbpe |= 0x10; // Set i=1
      let immediateValue = operand.substring(1);

      // Check for indexed addressing with immediate
      if (immediateValue.includes(",X")) {
        nixbpe |= 0x08; // Set x=1
        immediateValue = immediateValue.split(",")[0].trim();
      }

      if (symbolTable[immediateValue]) {
        address = parseInt(symbolTable[immediateValue], 16);
      } else {
        // Try parsing as decimal first
        const decValue = parseInt(immediateValue, 10);
        if (!isNaN(decValue)) {
          address = decValue;
        } else {
          // If not a decimal, try as hex
          address = parseInt(immediateValue, 16);
        }
      }
    } else if (operand.startsWith("@")) {
      // Indirect addressing
      nixbpe |= 0x20; // Set n=1
      let symbolName = operand.substring(1);

      // Check for indexed addressing with indirect
      if (symbolName.includes(",X")) {
        nixbpe |= 0x08; // Set x=1
        symbolName = symbolName.split(",")[0].trim();
      }

      if (symbolTable[symbolName]) {
        address = parseInt(symbolTable[symbolName], 16);
      } else if (!isNaN(parseInt(symbolName, 16))) {
        // Try to parse as a hex value if not found in symbol table
        address = parseInt(symbolName, 16);
      }
    } else {
      // Direct addressing
      nixbpe |= 0x30; // Set n=1, i=1

      let actualOperand = operand;
      // Check for indexed addressing
      if (operand.includes(",X")) {
        nixbpe |= 0x08; // Set x=1
        actualOperand = operand.split(",")[0].trim();
      }

      if (symbolTable[actualOperand]) {
        address = parseInt(symbolTable[actualOperand], 16);
      } else if (!isNaN(parseInt(actualOperand, 16))) {
        address = parseInt(actualOperand, 16);
      }
    }
  }

  // Set format 4 flag if needed
  if (isFormat4) {
    nixbpe |= 0x01; // Set e=1

    // Format 4 uses full 20-bit address
    opcodeValue = (opcodeValue & 0xfc) | ((nixbpe & 0x30) >> 4);
    const objCode = (opcodeValue << 24) | (nixbpe << 20) | (address & 0xfffff);
    return objCode.toString(16).toUpperCase().padStart(8, "0");
  } else {
    // Format 3: Calculate displacement
    let displacement = 0;
    let useBase = false;
    let usePC = false;

    // Try PC-relative addressing first
    const pcValue = nextLoc;
    displacement = address - pcValue;

    if (!isNaN(displacement) && displacement >= -2048 && displacement <= 2047) {
      nixbpe |= 0x02; // Set p=1
      usePC = true;
    } else if (baseRegisterValue !== null) {
      // Try base-relative addressing
      displacement = address - baseRegisterValue;

      if (!isNaN(displacement) && displacement >= 0 && displacement <= 4095) {
        nixbpe |= 0x04; // Set b=1
        useBase = true;
      }
    }

    // Direct addressing if neither PC nor base relative worked
    if (!usePC && !useBase && address <= 4095) {
      displacement = address;
    }

    // Build format 3 object code
    opcodeValue = (opcodeValue & 0xfc) | ((nixbpe & 0x30) >> 4);
    const objCode =
      (opcodeValue << 16) | ((nixbpe & 0x0f) << 12) | (displacement & 0xfff);
    return objCode.toString(16).toUpperCase().padStart(6, "0");
  }
}

// Helper function for BYTE directive
function calculateByteDirectiveObjectCode(operand: string): string {
  if (operand.startsWith("C'") && operand.endsWith("'")) {
    // Character constant
    const characters = operand.substring(2, operand.length - 1);
    let hexCode = "";

    for (let i = 0; i < characters.length; i++) {
      hexCode += characters.charCodeAt(i).toString(16).padStart(2, "0");
    }

    return hexCode.toUpperCase();
  } else if (operand.startsWith("X'") && operand.endsWith("'")) {
    // Hexadecimal constant
    return operand.substring(2, operand.length - 1).toUpperCase();
  }

  return "";
}
