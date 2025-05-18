import React, { useState } from "react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { ExportableTable } from "@/components/ExportableTable";
import { Input } from "../ui/input";

interface AssembledCodeSectionProps {
  assembledCode: any[];
}

export const AssembledCodeSection: React.FC<AssembledCodeSectionProps> = ({
  assembledCode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!assembledCode || assembledCode.length === 0) {
    return null;
  }

  // Filter the assembled code based on search query
  const filteredCode = assembledCode.filter((code) =>
    Object.values(code).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <CollapsiblePanel title="Assembled Code" defaultOpen={true}>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search assembled code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <ExportableTable
        data={filteredCode}
        columns={[
          { key: "loc", header: "LOC" },
          { key: "label", header: "Label" },
          { key: "opcode", header: "Opcode" },
          { key: "operand", header: "Operand" },
          { key: "objectCode", header: "Object Code" },
        ]}
        title="Assembled SIC/XE Program"
        filename="assembled_code"
      />
    </CollapsiblePanel>
  );
};
