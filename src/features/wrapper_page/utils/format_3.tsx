import { instructionSet } from "./instruction_set";
export function generateFormat3Or4ObjectCode(
  opcode: string,
  operand: string,
  currentLoc: number,
  pcValue: number, // Changed parameter name to be clearer
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
      .toUpperCase()}, PC=0x${pcValue.toString(16).toUpperCase()}`
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
    let targetOperand = operand;

    // Check if indexed addressing
    if (operand.includes(",X")) {
      x = 1;
      targetOperand = operand.split(",")[0].trim();
      console.log("Indexed addressing detected (x=1), operand=", targetOperand);
    }

    // Immediate addressing (#)
    if (targetOperand.startsWith("#")) {
      i = 1;
      n = 0;
      let immediateValue = targetOperand.substring(1);
      console.log(`Immediate addressing (n=0, i=1), value=${immediateValue}`);

      // Try to parse as a symbol from symbol table
      if (symbolTable[immediateValue]) {
        address = parseInt(symbolTable[immediateValue], 16);
      } else {
        // Try to parse as a decimal number
        const decValue = parseInt(immediateValue, 10);
        if (!isNaN(decValue)) {
          address = decValue;
        } else {
          // Try to parse as a hex number
          address = parseInt(immediateValue, 16);
        }
      }
    }
    // Indirect addressing (@)
    else if (targetOperand.startsWith("@")) {
      i = 0;
      n = 1;
      let indirectValue = targetOperand.substring(1);
      console.log(`Indirect addressing (n=1, i=0), value=${indirectValue}`);

      if (symbolTable[indirectValue]) {
        address = parseInt(symbolTable[indirectValue], 16);
      } else if (!isNaN(parseInt(indirectValue, 16))) {
        address = parseInt(indirectValue, 16);
      }
    } else {
      i = 1;
      n = 1;
      console.log(`Direct addressing (n=1, i=1), operand=${targetOperand}`);

      if (symbolTable[targetOperand]) {
        address = parseInt(symbolTable[targetOperand], 16);
        console.log(
          `Symbol found in table: ${targetOperand} → 0x${address
            .toString(16)
            .toUpperCase()}`
        );
        console.log(
          `Symbol found in table: ${targetOperand} → 0x${address
            .toString(16)
            .toUpperCase()}`
        );
      } else if (!isNaN(parseInt(targetOperand, 16))) {
        address = parseInt(targetOperand, 16);
        console.log(
          `Parsed as hex: ${targetOperand} → 0x${address
            .toString(16)
            .toUpperCase()}`
        );
      }
    }
  }
  console.groupEnd();

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
      address.toString(16).padStart(4, "0");

    objectCode = objCodeHex.toUpperCase();
    console.log(`Final object code: ${objectCode}`);
    console.groupEnd();
  }
  // Format 3 - Simplified approach
  else {
    console.group("Format 3 object code calculation (simplified):");

    // For simplified Format 3, we use direct addressing without displacement
    // We just need the address directly (no PC-relative or base-relative)

    // Build the flags byte - in simplified version p and b are always 0
    p = 0; // No PC-relative addressing
    b = 0; // No base-relative addressing

    const flagsByte = (x << 3) | (b << 2) | (p << 1) | e;
    console.log(
      `Flags byte: x=${x}, b=${b}, p=${p}, e=${e} → 0x${flagsByte
        .toString(16)
        .toUpperCase()}`
    );

    // Get the lower 12 bits of the address
    const addressBits = address;
    console.log(
      `Address for object code: 0x${addressBits
        .toString(16)
        .toUpperCase()} (12 bits)`
    );

    // Format the object code with proper padding
    const objCodeHex =
      addressBits < 4
        ? opcode +
          flagsByte.toString(16).padStart(1, "0") +
          addressBits.toString(16).padStart(3, "0")
        : opcode + addressBits.toString(16).padStart(4, "0");

    objectCode = objCodeHex.toUpperCase();
    console.log(`Final object code: ${objectCode}`);
    console.groupEnd();
  }

  console.groupEnd();
  return objectCode;
}
