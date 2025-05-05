import React from "react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import Papa from "papaparse";

interface ExportableTableProps {
  data: any[];
  columns: { key: string; header: string }[];
  title: string;
  filename: string;
}

export const ExportableTable: React.FC<ExportableTableProps> = ({
  data,
  columns,
  title,
  filename,
}) => {
  const exportAsText = () => {
    let content = `${title}\n\n`;

    content += columns.map((col) => col.header.padEnd(15)).join("") + "\n";
    content += columns.map(() => "---------------").join("") + "\n";

    data.forEach((row) => {
      content +=
        columns
          .map((col) => {
            const value = row[col.key] || "";
            return String(value).padEnd(15);
          })
          .join("") + "\n";
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${filename}.txt`);
  };

  const exportAsCSV = () => {
    const csvData = data.map((row) => {
      const newRow: Record<string, any> = {};
      columns.forEach((col) => {
        newRow[col.header] = row[col.key];
      });
      return newRow;
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${filename}.csv`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <div className="space-x-2">
          <Button size="sm" variant="outline" onClick={exportAsText}>
            Export as TXT
          </Button>
          <Button size="sm" variant="outline" onClick={exportAsCSV}>
            Export as CSV
          </Button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-white">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map((col, i) => (
                <th key={i} className="py-2 px-4 text-left">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-700">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-2 px-4">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
