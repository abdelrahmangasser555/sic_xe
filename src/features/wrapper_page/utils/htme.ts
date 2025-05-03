export interface HTERecord {
  type: "H" | "T" | "E";
  content: string;
  address?: string;
  length?: string;
  programName?: string;
  objectCodes?: string;
}

export function generateHTERecords(assembledCode: any[]): HTERecord[] {
  const records: HTERecord[] = [];
  if (!assembledCode || assembledCode.length === 0) return records;

  // Find program name, start address and length
  const firstLine = assembledCode[0];
  const lastLine = assembledCode[assembledCode.length - 1];
  const programName = firstLine.label || "PROGRAM";
  const startAddress = firstLine.loc || "0000";

  // Calculate program length (end address - start address)
  let endAddress = "0000";
  for (let i = assembledCode.length - 1; i >= 0; i--) {
    if (assembledCode[i].loc) {
      const currentLoc = parseInt(assembledCode[i].loc, 16);
      // Add the length of the instruction (typically 3 bytes, but could be different)
      let instructionLength = 3;
      if (assembledCode[i].opcode?.startsWith("+")) instructionLength = 4;
      else if (assembledCode[i].opcode === "RESW")
        instructionLength = parseInt(assembledCode[i].operand || "0") * 3;
      else if (assembledCode[i].opcode === "RESB")
        instructionLength = parseInt(assembledCode[i].operand || "0");
      else if (assembledCode[i].opcode === "BYTE") {
        const operand = assembledCode[i].operand;
        if (operand?.startsWith("C")) {
          // Character constants: each character is 1 byte
          instructionLength = operand.substring(2, operand.length - 1).length;
        } else if (operand?.startsWith("X")) {
          // Hex constants: each pair of hex digits is 1 byte
          instructionLength = Math.ceil(
            operand.substring(2, operand.length - 1).length / 2
          );
        }
      }

      endAddress = (currentLoc + instructionLength)
        .toString(16)
        .padStart(4, "0")
        .toUpperCase();
      break;
    }
  }

  const programLength = (parseInt(endAddress, 16) - parseInt(startAddress, 16))
    .toString(16)
    .padStart(6, "0")
    .toUpperCase();

  // Add Header record
  records.push({
    type: "H",
    content: `H^${programName.padEnd(6)}^${startAddress.padStart(
      6,
      "0"
    )}^${programLength}`,
    programName,
    address: startAddress,
    length: programLength,
  });

  // Generate Text records
  let currentTextRecord: {
    startAddress: string;
    length: number;
    objectCodes: string[];
  } | null = null;

  for (let i = 0; i < assembledCode.length; i++) {
    const line = assembledCode[i];
    const objCode = line.objectCode;

    // Skip lines with no object code or with directives that reserve memory
    if (
      !objCode ||
      objCode === "" ||
      line.opcode === "RESW" ||
      line.opcode === "RESB"
    ) {
      // If we have an active text record, finalize it
      if (currentTextRecord && currentTextRecord.objectCodes.length > 0) {
        const textLength = (currentTextRecord.length / 2)
          .toString(16)
          .padStart(2, "0")
          .toUpperCase();
        const textContent = `T^${
          currentTextRecord.startAddress
        }^${textLength}^${currentTextRecord.objectCodes.join("")}`;

        records.push({
          type: "T",
          content: textContent,
          address: currentTextRecord.startAddress,
          length: textLength,
          objectCodes: currentTextRecord.objectCodes.join(""),
        });

        currentTextRecord = null;
      }
      continue;
    }

    // Get the object code length in bytes
    const objCodeLength = objCode.length / 2;

    // If we don't have an active text record or adding this code would exceed 30 bytes, create a new one
    if (!currentTextRecord || currentTextRecord.length + objCode.length > 60) {
      // 30 bytes = 60 hex chars
      if (currentTextRecord && currentTextRecord.objectCodes.length > 0) {
        // Finalize the current text record
        const textLength = (currentTextRecord.length / 2)
          .toString(16)
          .padStart(2, "0")
          .toUpperCase();
        const textContent = `T^${
          currentTextRecord.startAddress
        }^${textLength}^${currentTextRecord.objectCodes.join("")}`;

        records.push({
          type: "T",
          content: textContent,
          address: currentTextRecord.startAddress,
          length: textLength,
          objectCodes: currentTextRecord.objectCodes.join(""),
        });
      }

      // Start a new text record
      currentTextRecord = {
        startAddress: line.loc.padStart(6, "0").toUpperCase(),
        length: objCode.length,
        objectCodes: [objCode],
      };
    } else {
      // Add to the current text record
      currentTextRecord.length += objCode.length;
      currentTextRecord.objectCodes.push(objCode);
    }
  }

  // Finalize the last text record if there is one
  if (currentTextRecord && currentTextRecord.objectCodes.length > 0) {
    const textLength = (currentTextRecord.length / 2)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
    const textContent = `T^${
      currentTextRecord.startAddress
    }^${textLength}^${currentTextRecord.objectCodes.join("")}`;

    records.push({
      type: "T",
      content: textContent,
      address: currentTextRecord.startAddress,
      length: textLength,
      objectCodes: currentTextRecord.objectCodes.join(""),
    });
  }

  // Add End record - use the start address for execution
  records.push({
    type: "E",
    content: `E^${startAddress.padStart(6, "0")}`,
    address: startAddress,
  });

  return records;
}
