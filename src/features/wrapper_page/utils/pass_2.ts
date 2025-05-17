import { instructionSet } from "./instruction_set";
import { createSymbolTable } from "./pass_1";
import { generateFormat3Or4ObjectCode } from "./format_3";
const registers: Record<string, number> = {
  A: 0,
  X: 1,
  L: 2,
  B: 3,
  S: 4,
  T: 5,
  F: 6,
};

export function generateObjectCode(parsedLines: any[]) {
  const symbolTable = createSymbolTable(parsedLines);

  console.log("Symbol Table in pass 2:", symbolTable);

  let baseRegisterValue: number | null = null;

  for (let i = 0; i < parsedLines.length; i++) {
    const line = parsedLines[i];
    console.log("Current line in pass 2:", line);
    const opcode = line.opcode ? line.opcode.toUpperCase().trim() : "";
    const operand = line.operand ? line.operand.trim() : "";

    if (!opcode) {
      line.objectCode = "";
      continue;
    }

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
    } else if (
      opcode === "LITLD" ||
      opcode === "LITAD" ||
      opcode === "LITSB" ||
      opcode === "LITCMP"
    ) {
      line.objectCode = generateLitldObjectCode(operand, opcode);
      continue;
    }

    const isFormat4 = opcode.startsWith("+");
    const mnemonic = isFormat4 ? opcode.substring(1) : opcode;

    const instruction = instructionSet.find(
      (instr) => instr.mnemonic.toUpperCase() === mnemonic.toUpperCase()
    );

    console.log("this is the extracted opcodes " + instruction);

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
      // For Format 3/4 instructions, the PC value is the next instruction's location
      const pcValue = parseInt(line.loc, 16) + (isFormat4 ? 4 : 3);

      line.objectCode = generateFormat3Or4ObjectCode(
        instruction.opcode,
        operand,
        parseInt(line.loc, 16),
        pcValue, // Using correct PC value
        isFormat4,
        symbolTable,
        baseRegisterValue
      );
    }
  }

  return parsedLines;
}

function generateLitldObjectCode(
  operand: string,
  instructionType: string
): string {
  const parts = operand.split(",").map((part) => part.trim());

  if (parts.length !== 2) {
    console.error("Literal instruction requires two operands:", operand);
    return "";
  }

  const registerName = parts[0].trim();
  const literalPart = parts[1].trim();

  console.log("Register Name:", registerName);
  console.log("Literal Part:", literalPart);

  const registerValue = registers[registerName] || 0;

  let literalValue = 0;
  if (literalPart.startsWith("=X'") && literalPart.endsWith("'")) {
    const hexValue = literalPart.substring(3, literalPart.length - 1);
    literalValue = parseInt(hexValue, 16);
    console.log("Parsed hex literal:", hexValue, "->", literalValue);
  } else if (literalPart.startsWith("=C'") && literalPart.endsWith("'")) {
    const charValue = literalPart.substring(3, literalPart.length - 1);
    for (let i = 0; i < charValue.length; i++) {
      literalValue = (literalValue << 8) | charValue.charCodeAt(i);
    }
    console.log("Parsed character literal:", charValue, "->", literalValue);
  } else {
    console.error("Unsupported literal format:", literalPart);
  }

  // Select the correct opcode based on instruction type
  let opcodeValue: number;
  switch (instructionType) {
    case "LITAD":
      opcodeValue = 0xbc; // BC in hex
      break;
    case "LITSB":
      opcodeValue = 0x8c; // 8C in hex
      break;
    case "LITLD":
      opcodeValue = 0xe4; // E4 in hex
      break;
    case "LITCMP":
      opcodeValue = 0xfc; // FC in hex
      break;
    default:
      opcodeValue = 0xe4; // Default to LITLD
  }

  // Calculate object code as unsigned 32-bit value
  // First byte: opcode (8 bits)
  // Next 4 bits: register code
  // Last 20 bits: literal value

  const firstByte = opcodeValue.toString(16).padStart(2, "0");
  const registerAndLiteralBytes = (
    (registerValue << 20) |
    (literalValue & 0xfffff)
  )
    .toString(16)
    .padStart(6, "0");

  const objCode = (firstByte + registerAndLiteralBytes).toUpperCase();

  console.log(`Generated object code for ${instructionType}:`, objCode);
  return objCode;
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

function calculateByteDirectiveObjectCode(operand: string): string {
  if (operand.startsWith("C'") && operand.endsWith("'")) {
    const characters = operand.substring(2, operand.length - 1);
    let hexCode = "";

    for (let i = 0; i < characters.length; i++) {
      hexCode += characters.charCodeAt(i).toString(16).padStart(2, "0");
    }

    return hexCode.toUpperCase();
  } else if (operand.startsWith("X'") && operand.endsWith("'")) {
    return operand.substring(2, operand.length - 1).toUpperCase();
  }

  return "";
}
