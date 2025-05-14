import { instructionSet } from "./instruction_set";
import { createSymbolTable } from "./pass_1";

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

function generateFormat3Or4ObjectCode(
  opcode: string,
  operand: string,
  currentLoc: number,
  nextLoc: number,
  isFormat4: boolean,
  symbolTable: Record<string, string>,
  baseRegisterValue: number | null
): string {
  console.group(
    `SIC/XE Object Code Generation - ${isFormat4 ? "Format 4" : "Format 3"}`
  );
  console.log(`Input: opcode=${opcode}, operand=${operand || "(none)"}`);
  console.log(
    `Location: current=0x${currentLoc
      .toString(16)
      .toUpperCase()}, next=0x${nextLoc.toString(16).toUpperCase()}`
  );
  console.log(
    `Base register value: ${
      baseRegisterValue !== null
        ? "0x" + baseRegisterValue.toString(16).toUpperCase()
        : "not set"
    }`
  );

  // Parse the opcode hex value
  let opcodeValue = parseInt(opcode, 16);
  console.log(`Opcode value: 0x${opcodeValue.toString(16).toUpperCase()}`);

  let n = 0,
    i = 0,
    x = 0,
    b = 0,
    p = 0,
    e = 0;
  let address = 0;

  // Set e flag for format 4
  if (isFormat4) {
    e = 1;
    console.log("Extended format (e=1)");
  }

  // Parse operand to set addressing flags
  console.group("Addressing mode determination:");
  if (operand === "") {
    // Simple addressing with no operand (like RSUB)
    n = 1;
    i = 1;
    console.log("No operand - Simple addressing (n=1, i=1)");
  } else {
    // Check if indexed addressing
    if (operand.includes(",X")) {
      x = 1;
      operand = operand.split(",")[0].trim();
      console.log("Indexed addressing detected (x=1), operand=", operand);
    }

    // Immediate addressing (#)
    if (operand.startsWith("#")) {
      i = 1;
      n = 0;
      let immediateValue = operand.substring(1);
      console.log(`Immediate addressing (n=0, i=1), value=${immediateValue}`);

      // Try to parse as a symbol from symbol table
      if (symbolTable[immediateValue]) {
        address = parseInt(symbolTable[immediateValue], 16);
        console.log(
          `Symbol found in table: ${immediateValue} → 0x${address
            .toString(16)
            .toUpperCase()}`
        );
      } else {
        // Try to parse as a decimal number
        const decValue = parseInt(immediateValue, 10);
        if (!isNaN(decValue)) {
          address = decValue;
          console.log(
            `Parsed as decimal: ${immediateValue} → ${address} (0x${address
              .toString(16)
              .toUpperCase()})`
          );
        } else {
          // Try to parse as a hex number
          address = parseInt(immediateValue, 16);
          console.log(
            `Parsed as hex: ${immediateValue} → 0x${address
              .toString(16)
              .toUpperCase()}`
          );
        }
      }
    }
    // Indirect addressing (@)
    else if (operand.startsWith("@")) {
      i = 0;
      n = 1;
      let indirectValue = operand.substring(1);
      console.log(`Indirect addressing (n=1, i=0), value=${indirectValue}`);

      if (symbolTable[indirectValue]) {
        address = parseInt(symbolTable[indirectValue], 16);
        console.log(
          `Symbol found in table: ${indirectValue} → 0x${address
            .toString(16)
            .toUpperCase()}`
        );
      } else if (!isNaN(parseInt(indirectValue, 16))) {
        address = parseInt(indirectValue, 16);
        console.log(
          `Parsed as hex: ${indirectValue} → 0x${address
            .toString(16)
            .toUpperCase()}`
        );
      }
    }
    // Direct addressing
    else {
      i = 1;
      n = 1;
      console.log(`Direct addressing (n=1, i=1), operand=${operand}`);

      if (symbolTable[operand]) {
        address = parseInt(symbolTable[operand], 16);
        console.log(
          `Symbol found in table: ${operand} → 0x${address
            .toString(16)
            .toUpperCase()}`
        );
      } else if (!isNaN(parseInt(operand, 16))) {
        address = parseInt(operand, 16);
        console.log(
          `Parsed as hex: ${operand} → 0x${address.toString(16).toUpperCase()}`
        );
      }
    }
  }
  console.groupEnd();

  // Calculate final opcode with n and i bits
  const originalOpcodeValue = opcodeValue;
  opcodeValue = (opcodeValue & 0xfc) | (n << 1) | i;
  console.log(
    `Modified opcode: 0x${originalOpcodeValue
      .toString(16)
      .toUpperCase()} → 0x${opcodeValue
      .toString(16)
      .toUpperCase()} (after adding n=${n}, i=${i})`
  );

  let objectCode = "";

  // Format 4 - Extended format
  if (isFormat4) {
    console.group("Format 4 object code calculation:");
    // Build the object code as a string to ensure proper formatting
    const flagsByte = (x << 7) | (b << 6) | (p << 5) | (e << 4);
    console.log(
      `Flags byte: x=${x}, b=${b}, p=${p}, e=${e} → 0x${flagsByte
        .toString(16)
        .toUpperCase()}`
    );
    console.log(
      `Address value: 0x${address.toString(16).toUpperCase()} (20 bits)`
    );

    const objCodeHex =
      opcodeValue.toString(16).padStart(2, "0") +
      flagsByte.toString(16).padStart(1, "0") +
      address.toString(16).padStart(5, "0");

    objectCode = objCodeHex.toUpperCase();
    console.log(`Final object code: ${objectCode}`);
    console.groupEnd();
  }
  // Format 3
  else {
    console.group("Format 3 object code calculation:");
    let displacement = 0;
    let addressingMethod = "direct";

    // PC-relative addressing
    if (
      !operand.startsWith("#") ||
      !isNaN(parseInt(operand.substring(1), 10))
    ) {
      const pcValue = nextLoc;
      const disp = address - pcValue;

      console.log(
        `Checking PC-relative: Target=0x${address
          .toString(16)
          .toUpperCase()}, PC=0x${pcValue
          .toString(16)
          .toUpperCase()}, disp=${disp} (0x${disp.toString(16).toUpperCase()})`
      );

      // Check if displacement is within range for PC-relative
      if (!isNaN(disp) && disp >= -2048 && disp <= 2047) {
        p = 1;
        displacement = disp & 0xfff; // Ensure 12-bit 2's complement representation
        addressingMethod = "PC-relative";
        console.log(
          `Using PC-relative addressing (p=1): disp=${disp} → 0x${displacement
            .toString(16)
            .toUpperCase()}`
        );
      }
      // Try base-relative addressing if PC-relative is out of range
      else if (baseRegisterValue !== null) {
        const baseDisp = address - baseRegisterValue;

        console.log(
          `Checking BASE-relative: Target=0x${address
            .toString(16)
            .toUpperCase()}, BASE=0x${baseRegisterValue
            .toString(16)
            .toUpperCase()}, disp=${baseDisp} (0x${baseDisp
            .toString(16)
            .toUpperCase()})`
        );

        if (!isNaN(baseDisp) && baseDisp >= 0 && baseDisp <= 4095) {
          b = 1;
          displacement = baseDisp;
          addressingMethod = "BASE-relative";
          console.log(
            `Using BASE-relative addressing (b=1): disp=${baseDisp} → 0x${displacement
              .toString(16)
              .toUpperCase()}`
          );
        }
        // Direct addressing as fallback
        else if (address <= 4095) {
          displacement = address;
          console.log(
            `Using direct addressing: address=0x${address
              .toString(16)
              .toUpperCase()}`
          );
        } else {
          console.warn(
            `⚠️ Address 0x${address
              .toString(16)
              .toUpperCase()} is out of range for all addressing modes!`
          );
        }
      }
      // Direct addressing as fallback
      else if (address <= 4095) {
        displacement = address;
        console.log(
          `Using direct addressing: address=0x${address
            .toString(16)
            .toUpperCase()}`
        );
      } else {
        console.warn(
          `⚠️ Address 0x${address
            .toString(16)
            .toUpperCase()} is out of range and BASE is not set!`
        );
      }
    } else {
      // For immediate values, use direct displacement
      displacement = address & 0xfff;
      console.log(
        `Using immediate value directly: 0x${address
          .toString(16)
          .toUpperCase()} → 0x${displacement.toString(16).toUpperCase()}`
      );
    }

    // Build the object code as a string to ensure proper formatting
    const flagsByte = (x << 3) | (b << 2) | (p << 1) | e;
    console.log(
      `Flags byte: x=${x}, b=${b}, p=${p}, e=${e} → 0x${flagsByte
        .toString(16)
        .toUpperCase()}`
    );
    console.log(
      `Final displacement: 0x${displacement
        .toString(16)
        .toUpperCase()} (12 bits)`
    );

    const objCodeHex =
      opcodeValue.toString(16).padStart(2, "0") +
      flagsByte.toString(16).padStart(1, "0") +
      (displacement & 0xfff).toString(16).padStart(3, "0");

    objectCode = objCodeHex.toUpperCase();
    console.log(
      `Final object code: ${objectCode} (using ${addressingMethod} addressing)`
    );
    console.groupEnd();
  }

  console.groupEnd();
  return objectCode;
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
