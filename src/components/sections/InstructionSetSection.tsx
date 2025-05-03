import React from "react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { ExportableTable } from "@/components/ExportableTable";
import { instructionSet } from "@/features/wrapper_page/utils/instruction_set";

export const InstructionSetSection: React.FC = () => {
  // Transform instruction set to a format suitable for the table
  const instructionData = instructionSet.map((instruction) => ({
    mnemonic: instruction.mnemonic,
    format: instruction.format.join("/"),
    size: instruction.size,
    opcode: instruction.opcode,
    description: instruction.description,
  }));

  return (
    <CollapsiblePanel title="Instruction Set" defaultOpen={false}>
      <ExportableTable
        data={instructionData}
        columns={[
          { key: "mnemonic", header: "Mnemonic" },
          { key: "format", header: "Format" },
          { key: "size", header: "Size" },
          { key: "opcode", header: "Opcode" },
          { key: "description", header: "Description" },
        ]}
        title="SIC/XE Instruction Set"
        filename="instruction_set"
      />
    </CollapsiblePanel>
  );
};
