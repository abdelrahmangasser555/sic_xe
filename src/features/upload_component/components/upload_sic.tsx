"use client";
import React from "react";
import { FileUpload } from "./file_upload";

interface FileUploadDemoProps {
  files: File[];
  setFiles: (files: File[]) => void;
  single?: boolean;
  maxSize?: number;
  onError?: (error: string) => void;
  onContentRead?: (content: string) => void;
  [key: string]: any;
}

export function FileUploadDemo({
  files,
  setFiles,
  single = true,
  maxSize = 10, // Default 10MB
  onError = (error: string) => alert(error),
  onContentRead,
  ...props
}: FileUploadDemoProps) {
  const readFileContent = async (file: File) => {
    try {
      const content = await file.text();
      onContentRead?.(content);
    } catch (error) {
      onError("Error reading file content");
    }
  };

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    if (files.length > 0) {
      readFileContent(files[0]);
    }
    console.log(files);
  };

  return (
    <div className="w-full mx-auto min-h-[300px] border-2 border-dashed bg-neutral-950/50 border-neutral-800 rounded-xl backdrop-blur-sm transition-colors hover:border-neutral-700">
      <FileUpload
        onChange={handleFileUpload}
        single={single}
        maxSize={maxSize}
        onError={onError}
        only={["text/plain", "text/x-asm", "application/octet-stream"]}
        {...props}
      />
    </div>
  );
}
