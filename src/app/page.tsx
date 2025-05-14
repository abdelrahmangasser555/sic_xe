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
import { RefreshCw, Download, Star, Upload, Edit, Save } from "lucide-react";
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
import toast, { Toaster } from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import ChatSicXE from "@/features/ask_sic_xe/components/ask_ai_chat_wrapper";
import StatusDot from "@/features/create_your_own/components/pulse_bubble";
import TestFiles from "@/features/upload_component/components/test_files";
import { testFiles } from "@/features/wrapper_page/utils/test_files";
export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("upload");

  const [inputMode, setInputMode] = useState<"before" | "results">("before");
  const [inputSource, setInputSource] = useState<"upload" | "create">("upload");

  const [files, setFiles] = useState<File[]>([]);
  const [sicFile, setSicFile] = useState<string | null | File>(null);

  const [assemblyLines, setAssemblyLines] = useState<AssemblyLine[]>([]);

  const [intermediateFile, setIntermediateFile] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [assembledAsText, setAssembledAsText] = useState<any>("");
  const [locationCounterAssigned, setLocationCounterAssigned] =
    useState<any>(null);
  const [symbolTable, setSymbolTable] = useState<Record<string, string>>({});
  const [assembledCode, setAssembledCode] = useState<any>(null);
  const [hteRecords, setHteRecords] = useState<HTERecord[]>([]);
  const [formattedDisplayCode, setFormattedDisplayCode] = useState<string>("");

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

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
      toast.error("Please enter assembly code to convert.", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  }

  function handleConvertFromTestFile(content: string) {
    setSicFile("Test File");
    setInputMode("results");
    setInputSource("upload");
    handleConvert(content);
  }

  function handleConvert(content: any) {
    setFormattedDisplayCode(content);

    console.log("Input content:", content);

    const parsed = parseIntermediateFile(content);
    console.log("Parsed data:", parsed);
    setParsedData(parsed);

    const withLocationCounters = assignLocationCounters(parsed[0]);
    setLocationCounterAssigned(withLocationCounters);
    console.log("With location counters:", withLocationCounters);
    const symbols = createSymbolTable(withLocationCounters);
    setSymbolTable(symbols);

    const withObjectCode = generateObjectCode(withLocationCounters);
    setAssembledCode(withObjectCode);
    const textContent = withObjectCode
      .map(
        (line: any, index: number) =>
          `${index}\t${line.label}\t${line.opcode}\t${line.operand}`
      )
      .join("\n");
    setAssembledAsText(textContent);

    const records = generateHTERecords(withObjectCode);
    setHteRecords(records);
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

  function handleAddingCodeToLocal() {
    if (!projectName.trim()) {
      toast.error("Please enter a project name", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }

    // Determine which code to save based on input source
    let codeToSave;
    if (inputSource === "create") {
      // If created directly, use the assemblyLines
      codeToSave = assemblyLines;
    } else {
      // If uploaded, convert parsed data to the required format
      codeToSave = parsedData[0].map((item: any) => ({
        label: item.label || "",
        opcode: item.opcode || "",
        operand: item.operand || "",
        prefix: "",
        error: "",
      }));
    }

    // Get existing saved projects from local storage
    const existingSavedProjects = JSON.parse(
      localStorage.getItem("savedProjects") || "[]"
    );

    // Create a new project object
    const newProject = {
      name: projectName,
      code: codeToSave,
      date: new Date().toISOString(),
    };

    // Add new project to the array
    existingSavedProjects.push(newProject);

    // Save back to local storage
    localStorage.setItem(
      "savedProjects",
      JSON.stringify(existingSavedProjects)
    );

    // Show success toast
    toast.success("Project saved successfully!", {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });

    // Reset state and close popover
    setProjectName("");
    setIsPopoverOpen(false);
  }

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
                  Create Assembly{" "}
                  <StatusDot status="success" className="mt-1" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="w-full">
                <FileUploadDemo files={files} setFiles={setFiles} />
                {files.length > 0 && (
                  <Button className="w-full mt-4" onClick={handleReadFile}>
                    Process File
                  </Button>
                )}
                <h1 className="text-lg font-bold text-white mt-4">
                  Example Test Files
                </h1>
                <p className="text-sm text-neutral-400 mb-2">
                  Click on any of the test files below to load (hover to preview
                  code)
                </p>
                <TestFiles
                  files={testFiles}
                  handleConvert={handleConvertFromTestFile}
                />
              </TabsContent>

              <TabsContent value="create" className="w-full">
                <CreateByText
                  state={assemblyLines}
                  setState={setAssemblyLines}
                  onSave={handleAssembleFromText}
                />
                <h1 className="text-lg font-bold text-white mt-4">
                  Example Test Files
                </h1>
                <p className="text-sm text-neutral-400 mb-2">
                  Click on any of the test files below to load (hover to preview
                  code)
                </p>
                <TestFiles
                  files={testFiles}
                  handleConvert={handleConvertFromTestFile}
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
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="success">
                <Save className="mr-2 h-4 w-4" />
                save as template
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Save Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter a name for your project
                  </p>
                </div>
                <div className="grid gap-2">
                  <Input
                    id="project-name"
                    placeholder="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                  <Button onClick={handleAddingCodeToLocal} className="w-full">
                    Save Project
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col items-center mb-6">
        <ChatSicXE code={formattedDisplayCode} />
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
          {hteRecords && hteRecords.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">
                  Object Program (HTME Records)
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

          <InstructionSetSection />
        </div>

        <div className="space-y-6">
          {symbolTable && Object.keys(symbolTable).length > 0 && (
            <SymbolTableSection symbolTable={symbolTable} />
          )}

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
      <Toaster position="top-right" />
    </div>
  );
}
