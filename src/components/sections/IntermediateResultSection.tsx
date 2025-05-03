import React from "react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { ExportableTable } from "@/components/ExportableTable";

interface IntermediateResultSectionProps {
  parsedData: any[];
  title: string;
  filename: string;
  columns: { key: string; header: string }[];
}

export const IntermediateResultSection: React.FC<
  IntermediateResultSectionProps
> = ({ parsedData, title, filename, columns }) => {
  if (!parsedData || parsedData.length === 0) {
    return null;
  }

  return (
    <CollapsiblePanel title={title}>
      <ExportableTable
        data={parsedData}
        columns={columns}
        title={title}
        filename={filename}
      />
    </CollapsiblePanel>
  );
};
