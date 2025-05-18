import React, { useState } from "react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { ExportableTable } from "@/components/ExportableTable";
import { instructionSet } from "@/features/wrapper_page/utils/instruction_set";
import { Input } from "../ui/input";
//
export const InstructionSetSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Transform instruction set to a format suitable for the table
  const instructionData = instructionSet.map((instruction) => ({
    mnemonic: instruction.mnemonic,
    format: instruction.format.join("/"),
    size: instruction.size,
    opcode: instruction.opcode,
    description: instruction.description,
  }));

  // Filter the instruction data based on search query
  const filteredData = instructionData.filter(
    (instruction) =>
      instruction.mnemonic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instruction.opcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CollapsiblePanel title="Instruction Set" defaultOpen={false}>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by mnemonic or opcode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border  rounded"
        />
      </div>
      <ExportableTable
        data={filteredData}
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
