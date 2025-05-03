import React from "react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { ExportableTable } from "@/components/ExportableTable";

interface AssembledCodeSectionProps {
  assembledCode: any[];
}

export const AssembledCodeSection: React.FC<AssembledCodeSectionProps> = ({
  assembledCode,
}) => {
  if (!assembledCode || assembledCode.length === 0) {
    return null;
  }

  return (
    <CollapsiblePanel title="Assembled Code" defaultOpen={true}>
      <ExportableTable
        data={assembledCode}
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
