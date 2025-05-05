"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadDemo } from "@/features/upload_component/components/upload_sic";
import { parseIntermediateFile } from "@/features/wrapper_page/utils/data_cleaning";
import {
  assignLocationCounters,
  createSymbolTable,
} from "@/features/wrapper_page/utils/pass_1";
import { generateObjectCode } from "@/features/wrapper_page/utils/pass_2";
import {
  generateHTERecords,
  HTERecord,
} from "@/features/wrapper_page/utils/htme";
// Import section components
import { AssembledCodeSection } from "@/components/sections/AssembledCodeSection";
import { SymbolTableSection } from "@/components/sections/SymbolTableSection";
import { IntermediateResultSection } from "@/components/sections/IntermediateResultSection";
import { InstructionSetSection } from "@/components/sections/InstructionSetSection";
import { RefreshCw, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Home() {
  const [beforeUpload, setBeforeUpload] = useState(true);
  const [submit, setSubmit] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sicFile, setSicFile] = useState<string | null | File>(null);
  const [intermediateFile, setIntermediateFile] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [locationCounterAssigned, setLocationCounterAssigned] =
    useState<any>(null);
  const [symbolTable, setSymbolTable] = useState<Record<string, string>>({});
  const [assembledCode, setAssembledCode] = useState<any>(null);
  const [hteRecords, setHteRecords] = useState<HTERecord[]>([]);

  function handleReadFile() {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result;
        console.log("File content:", content);
        setSicFile(file);
        setBeforeUpload(false);
        handleConvert(content);
      };
      reader.readAsText(file);
    }
  }

  function handleConvert(content: any) {
    const parsed = parseIntermediateFile(content);
    setParsedData(parsed);
    console.log("Parsed Data:", parsed);
    const withLocationCounters = assignLocationCounters(parsed[0]);
    setLocationCounterAssigned(withLocationCounters);
    console.log("Location Counter Assigned:", withLocationCounters);
    const symbols = createSymbolTable(withLocationCounters);
    setSymbolTable(symbols);
    console.log("Symbol Table:", symbols);
    const withObjectCode = generateObjectCode(withLocationCounters);
    setAssembledCode(withObjectCode);
    console.log("Assembled Code with Object Code:", withObjectCode);
    const records = generateHTERecords(withObjectCode);
    setHteRecords(records);
    console.log("HTE Records:", records);
  }

  const downloadHTERecords = () => {
    if (!hteRecords || hteRecords.length === 0) return;

    const content = hteRecords.map((record) => record.content).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "object_program.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (beforeUpload) {
    return (
      <div className="dark min-h-screen ">
        <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white tracking-tight sm:text-5xl">
              SIC/XE Converter
            </h1>
            <p className="text-neutral-400 max-w-lg mx-auto text-lg">
              Upload your SIC/XE assembly file and convert it with ease.
              Supports standard formats and provides detailed output.
            </p>
          </div>
          <div className="w-full max-w-3xl mx-auto">
            <FileUploadDemo files={files} setFiles={setFiles} />
          </div>
          {files.length > 0 && (
            <Button
              className="w-full max-w-3xl "
              onClick={() => {
                handleReadFile();
                setSubmit(true);
              }}
            >
              Process sic/xe
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen p-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">
          SIC/XE Assembler Results
        </h1>

        {/* Process Another File button moved to top */}
        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setBeforeUpload(true);
              setFiles([]);
              setSicFile(null);
              setParsedData(null);
              setLocationCounterAssigned(null);
              setSymbolTable({});
              setAssembledCode(null);
              setHteRecords([]);
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Process Another File
          </Button>
          <Button variant={"secondary"}>
            <Star />
            Analyze code by AI
          </Button>
        </div>
      </div>

      {/* File information */}
      {sicFile && (
        <div className="mb-6 text-white">
          <p className="text-lg">
            File: {sicFile instanceof File ? sicFile.name : "Processed file"}
          </p>
        </div>
      )}

      {/* Main content grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Primary result */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assembled Code */}
          {hteRecords && hteRecords.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">
                  Object Program (HTE Records)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadHTERecords}
                  className="ml-auto flex items-center gap-1"
                >
                  <Download className="h-4 w-4" /> Download
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Type</TableHead>
                      <TableHead>Content</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hteRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono font-bold">
                          {record.type}
                        </TableCell>
                        <TableCell className="font-mono break-all">
                          {record.content.replace(/\^/g, " ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          {assembledCode && (
            <AssembledCodeSection assembledCode={assembledCode} />
          )}

          {/* HTE Records Section */}

          {/* Instruction Set moved under assembly code */}
          <InstructionSetSection />
        </div>

        {/* Right column - Supporting data */}
        <div className="space-y-6">
          {/* Symbol Table */}
          {symbolTable && Object.keys(symbolTable).length > 0 && (
            <SymbolTableSection symbolTable={symbolTable} />
          )}

          {/* Pass 1 Results */}
          {locationCounterAssigned && (
            <IntermediateResultSection
              parsedData={locationCounterAssigned}
              title="Pass 1 Results"
              filename="pass1_results"
              columns={[
                { key: "loc", header: "LOC" },
                { key: "label", header: "Label" },
                { key: "opcode", header: "Opcode" },
                { key: "operand", header: "Operand" },
              ]}
            />
          )}

          {/* Original Parsed Data */}
          {parsedData && parsedData[0] && (
            <IntermediateResultSection
              parsedData={parsedData[0]}
              title="Intermediate File"
              filename="intermediate_file"
              columns={[
                { key: "label", header: "Label" },
                { key: "opcode", header: "Opcode" },
                { key: "operand", header: "Operand" },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
