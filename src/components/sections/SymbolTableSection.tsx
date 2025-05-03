import React from "react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { ExportableTable } from "@/components/ExportableTable";

interface SymbolTableSectionProps {
  symbolTable: Record<string, string>;
}

export const SymbolTableSection: React.FC<SymbolTableSectionProps> = ({
  symbolTable,
}) => {
  if (!symbolTable || Object.keys(symbolTable).length === 0) {
    return null;
  }

  // Transform the symbol table into an array for the table
  const symbolTableArray = Object.entries(symbolTable).map(
    ([symbol, address]) => ({
      symbol,
      address,
    })
  );

  return (
    <CollapsiblePanel title="Symbol Table">
      <ExportableTable
        data={symbolTableArray}
        columns={[
          { key: "symbol", header: "Symbol" },
          { key: "address", header: "Address" },
        ]}
        title="Symbol Table"
        filename="symbol_table"
      />
    </CollapsiblePanel>
  );
};
