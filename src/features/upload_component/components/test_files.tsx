import { motion } from "framer-motion";
import { FileIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface TestFile {
  title: string;
  description: string;
  code: string;
  icon?: any;
}

interface TestFilesProps {
  files: TestFile[];
  handleConvert: (code: string) => void;
}

export default function TestFiles({ files, handleConvert }: TestFilesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {files.map((file, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <HoverCard>
            <HoverCardTrigger asChild>
              <Card
                className="cursor-pointer transition-all duration-200"
                onClick={() => handleConvert(file.code)}
              >
                <CardHeader className="">
                  <div className="flex items-start gap-3">
                    {file.icon ? (
                      file.icon
                    ) : (
                      <FileIcon className="text-blue-500" />
                    )}
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {file.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {file.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0" align="start">
              <div className="bg-zinc-900 text-zinc-100 rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
                  <span className="text-xs text-zinc-400 font-mono">
                    {file.title}
                  </span>
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  </div>
                </div>
                <pre className="text-xs p-3 overflow-auto max-h-[300px] font-mono">
                  <code>{file.code}</code>
                </pre>
              </div>
            </HoverCardContent>
          </HoverCard>
        </motion.div>
      ))}
    </div>
  );
}
