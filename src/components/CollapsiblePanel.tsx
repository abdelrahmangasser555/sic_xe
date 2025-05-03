import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-800 rounded-lg mb-4 overflow-hidden">
      <div
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-700 hover:bg-gray-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {isOpen ? (
          <ChevronUp className="text-white h-5 w-5" />
        ) : (
          <ChevronDown className="text-white h-5 w-5" />
        )}
      </div>

      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};
