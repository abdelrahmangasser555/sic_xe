"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadDemo } from "@/features/upload_component/components/upload_sic";
import { parseIntermediateFile } from "@/features/wrapper_page/utils/data_cleaning";
export default function Home() {
  const [beforeUpload, setBeforeUpload] = useState(true);
  const [submit, setSubmit] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sicFile, setSicFile] = useState<string | null | File>(null);
  const [intermediateFile, setIntermediateFile] = useState<any>(null);

  function handleReadFile() {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result;
        console.log("File content:", content);
        setSicFile(file);
        handleConvert(content);
      };
      reader.readAsText(file);
    }
  }

  function handleConvert(content: any) {
    // parsing the intermediate file
    const parsedData = parseIntermediateFile(content);
    console.log("Parsed Data:", parsedData);
  }

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
    <div className="dark flex min-h-screen items-center justify-center p-8">
      hello world
    </div>
  );
}
