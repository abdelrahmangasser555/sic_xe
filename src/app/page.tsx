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
import { RefreshCw, Download, Star, Upload, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateByText from "@/features/create_your_own/components/create_by_text";
import { AssemblyLine } from "@/features/create_your_own/components/constants";

export default function Home() {
  // Input mode state
  const [activeTab, setActiveTab] = useState<string>("upload");

  // Common state between modes
  const [inputMode, setInputMode] = useState<"before" | "results">("before");
  const [inputSource, setInputSource] = useState<"upload" | "create">("upload");

  // Upload-specific state
  const [files, setFiles] = useState<File[]>([]);
  const [sicFile, setSicFile] = useState<string | null | File>(null);

  // Create-specific state
  const [assemblyLines, setAssemblyLines] = useState<AssemblyLine[]>([]);

  // Processing results state
  const [intermediateFile, setIntermediateFile] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [locationCounterAssigned, setLocationCounterAssigned] =
    useState<any>(null);
  const [symbolTable, setSymbolTable] = useState<Record<string, string>>({});
  const [assembledCode, setAssembledCode] = useState<any>(null);
  const [hteRecords, setHteRecords] = useState<HTERecord[]>([]);
  const [formattedDisplayCode, setFormattedDisplayCode] = useState<string>("");

  // Reset all state
  const resetState = () => {
    setInputMode("before");
    setFiles([]);
    setSicFile(null);
    setAssemblyLines([]);
    setParsedData(null);
    setLocationCounterAssigned(null);
    setSymbolTable({});
    setAssembledCode(null);
    setHteRecords([]);
    setFormattedDisplayCode("");
  };

  // Handle file reading
  function handleReadFile() {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result;
        setSicFile(file);
        setInputMode("results");
        setInputSource("upload");
        handleConvert(content);
      };
      reader.readAsText(file);
    }
  }

  // Handle assembly from create-by-text
  function handleAssembleFromText() {
    if (assemblyLines.length > 0) {
      // Convert assembly lines to text format for processing
      const textContent = assemblyLines
        .map(
          (line, index) =>
            `${index}\t${line.label}\t${line.opcode}\t${line.prefix}${line.operand}`
        )
        .join("\n");
      console.log(textContent);
      setSicFile("Created Assembly Code");
      setInputMode("results");
      setInputSource("create");
      handleConvert(textContent);
    } else {
      alert("Please add some assembly code first");
    }
  }

  // Common conversion function for both upload and create modes
  function handleConvert(content: any) {
    console.log("Converting content:", content);

    // Format the content with line numbers for display
    const lines = content.split("\n");
    let lineNumber = 10; // Start line numbers at 10
    const formattedLines = lines
      .map((line: any) => {
        // Skip empty lines
        if (line.trim() === "") return "";

        // Parse the line into components
        const parts = line
          .trim()
          .split(/\s+/)
          .filter((p: any) => p);

        let label = "",
          opcode = "",
          operand = "";

        if (line.startsWith("\t") || line.startsWith(" ")) {
          // No label
          opcode = parts[0] || "";
          operand = parts.slice(1).join(" ");
        } else {
          // Has label
          label = parts[0] || "";
          opcode = parts[1] || "";
          operand = parts.slice(2).join(" ");
        }

        // Format the line with number and aligned fields
        const formattedLine = `${lineNumber
          .toString()
          .padEnd(5)} ${label.padEnd(8)} ${opcode.padEnd(8)} ${operand}`;

        // Increment line number for next line
        lineNumber += 10;

        return formattedLine;
      })
      .join("\n");

    setFormattedDisplayCode(formattedLines);

    // Continue with the existing processing
    const parsed = parseIntermediateFile(content);
    console.log("Parsed data:", parsed);
    setParsedData(parsed);

    const withLocationCounters = assignLocationCounters(parsed[0]);
    setLocationCounterAssigned(withLocationCounters);

    const symbols = createSymbolTable(withLocationCounters);
    setSymbolTable(symbols);

    const withObjectCode = generateObjectCode(withLocationCounters);
    setAssembledCode(withObjectCode);

    const records = generateHTERecords(withObjectCode);
    setHteRecords(records);
  }

  // Download HTE records
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

  // Render input form (upload or create)
  if (inputMode === "before") {
    return (
      <div className="dark min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white tracking-tight sm:text-5xl">
              SIC/XE Converter
            </h1>
            <p className="text-neutral-400 max-w-lg mx-auto text-lg">
              Upload or create your SIC/XE assembly code and convert it with
              ease.
            </p>
          </div>

          <div className="w-full max-w-6xl mx-auto">
            <Tabs
              defaultValue="upload"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Create Assembly
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="w-full">
                <FileUploadDemo files={files} setFiles={setFiles} />
                {files.length > 0 && (
                  <Button className="w-full mt-4" onClick={handleReadFile}>
                    Process File
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="create" className="w-full">
                <CreateByText
                  state={assemblyLines}
                  setState={setAssemblyLines}
                  onSave={handleAssembleFromText}
                />
              </TabsContent>
            </Tabs>
          </div>
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

        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={resetState}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Start Over
          </Button>
          <Button variant="secondary">
            <Star className="mr-2 h-4 w-4" />
            Analyze code by AI
          </Button>
        </div>
      </div>

      {/* File information */}
      <div className="mb-6 text-white">
        <p className="text-lg">
          {inputSource === "upload"
            ? `File: ${
                sicFile instanceof File ? sicFile.name : "Processed file"
              }`
            : "Source: Created Assembly Code"}
        </p>
      </div>

      {/* Main content grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Primary result */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formatted Display Code */}
          {/* {formattedDisplayCode && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">
                  Formatted Assembly Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="font-mono text-sm whitespace-pre-wrap bg-slate-950 p-4 rounded-md overflow-auto">
                  {formattedDisplayCode}
                </pre>
              </CardContent>
            </Card>
          )} */}

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
