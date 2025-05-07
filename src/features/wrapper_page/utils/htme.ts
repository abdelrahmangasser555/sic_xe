export interface HTMERecord {
  type: "H" | "T" | "E" | "M";
  content: string;
  address?: string;
  length?: string;
  programName?: string;
  objectCodes?: string;
  modification?: string;
}

export function generateHTMERecords(assembledCode: any[]): HTMERecord[] {
  const records: HTMERecord[] = [];
  if (!assembledCode || assembledCode.length === 0) return records;

  const firstLine = assembledCode[0];
  const lastLine = assembledCode[assembledCode.length - 1];
  const programName = firstLine.label || "PROGRAM";
  const startAddress = firstLine.loc || "0000";

  let endAddress = "0000";
  for (let i = assembledCode.length - 1; i >= 0; i--) {
    if (assembledCode[i].loc) {
      const currentLoc = parseInt(assembledCode[i].loc, 16);
      let instructionLength = 3;
      if (assembledCode[i].opcode?.startsWith("+")) instructionLength = 4;
      else if (assembledCode[i].opcode === "RESW")
        instructionLength = parseInt(assembledCode[i].operand || "0") * 3;
      else if (assembledCode[i].opcode === "RESB")
        instructionLength = parseInt(assembledCode[i].operand || "0");
      else if (assembledCode[i].opcode === "BYTE") {
        const operand = assembledCode[i].operand;
        if (operand?.startsWith("C")) {
          instructionLength = operand.substring(2, operand.length - 1).length;
        } else if (operand?.startsWith("X")) {
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

  let currentTextRecord: {
    startAddress: string;
    length: number;
    objectCodes: string[];
  } | null = null;

  for (let i = 0; i < assembledCode.length; i++) {
    const line = assembledCode[i];
    const objCode = line.objectCode;

    if (
      !objCode ||
      objCode === "" ||
      line.opcode === "RESW" ||
      line.opcode === "RESB"
    ) {
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

    const objCodeLength = objCode.length / 2;

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
      currentTextRecord.length += objCode.length;
      currentTextRecord.objectCodes.push(objCode);
    }
  }

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

  for (let i = 0; i < assembledCode.length; i++) {
    const line = assembledCode[i];
    if (line.opcode?.startsWith("+") && line.objectCode) {
      const modAddress = (parseInt(line.loc, 16) + 1)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();
      records.push({
        type: "M",
        content: `M^${modAddress}^05`,
        address: modAddress,
        length: "05",
        modification: "+",
      });
    }
  }

  records.push({
    type: "E",
    content: `E^${startAddress.padStart(6, "0")}`,
    address: startAddress,
  });

  console.log("HTME Records: ", records);

  return records;
}

// For backward compatibility
export const generateHTERecords = generateHTMERecords;
export type HTERecord = HTMERecord;
