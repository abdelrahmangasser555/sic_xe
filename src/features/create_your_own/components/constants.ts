// Common SIC/XE opcodes
export const OPCODES = [
  "ADD",
  "ADDF",
  "ADDR",
  "AND",
  "CLEAR",
  "COMP",
  "COMPF",
  "COMPR",
  "DIV",
  "DIVF",
  "DIVR",
  "FIX",
  "FLOAT",
  "HIO",
  "J",
  "JEQ",
  "JGT",
  "JLT",
  "JSUB",
  "LDA",
  "LDB",
  "LDCH",
  "LDF",
  "LDL",
  "LDS",
  "LDT",
  "LDX",
  "LPS",
  "MUL",
  "MULF",
  "MULR",
  "NORM",
  "OR",
  "RD",
  "RMO",
  "RSUB",
  "SHIFTL",
  "SHIFTR",
  "SIO",
  "SSK",
  "STA",
  "STB",
  "STCH",
  "STF",
  "STI",
  "STL",
  "STS",
  "STSW",
  "STT",
  "STX",
  "SUB",
  "SUBF",
  "SUBR",
  "SVC",
  "TD",
  "TIO",
  "TIX",
  "TIXR",
  "WD",
];

// Directives
export const DIRECTIVES = [
  "START",
  "END",
  "BYTE",
  "WORD",
  "RESB",
  "RESW",
  "BASE",
  "NOBASE",
  "EQU",
  "ORG",
  "LTORG",
];

// Templates for common structures
export const TEMPLATES = {
  basic: [
    { label: "PROG", opcode: "START", operand: "0", prefix: "", error: "" },
    { label: "", opcode: "", operand: "", prefix: "", error: "" },
    { label: "", opcode: "END", operand: "PROG", prefix: "", error: "" },
  ],
  withMain: [
    { label: "PROG", opcode: "START", operand: "0", prefix: "", error: "" },
    { label: "MAIN", opcode: "LDA", operand: "#0", prefix: "", error: "" },
    { label: "", opcode: "RSUB", operand: "", prefix: "", error: "" },
    { label: "", opcode: "END", operand: "PROG", prefix: "", error: "" },
  ],
  // Sample code 1: File I/O example
  fileHandling: [
    { label: "HW1B", opcode: "START", operand: "0030", prefix: "", error: "" },
    { label: "WRREC", opcode: "LDX", operand: "ZERO", prefix: "", error: "" },
    { label: "WLOOP", opcode: "TD", operand: "OUTPUT", prefix: "", error: "" },
    { label: "", opcode: "JEQ", operand: "WLOOP", prefix: "", error: "" },
    { label: "", opcode: "LDCH", operand: "RECORD,X", prefix: "", error: "" },
    { label: "", opcode: "WD", operand: "OUTPUT", prefix: "", error: "" },
    { label: "", opcode: "TIX", operand: "LENGTH", prefix: "", error: "" },
    { label: "", opcode: "JLT", operand: "WLOOP", prefix: "", error: "" },
    { label: "ZERO", opcode: "WORD", operand: "0", prefix: "", error: "" },
    { label: "LENGTH", opcode: "WORD", operand: "1", prefix: "", error: "" },
    {
      label: "OUTPUT",
      opcode: "BYTE",
      operand: "X'05'",
      prefix: "",
      error: "",
    },
    { label: "RECORD", opcode: "RESB", operand: "4096", prefix: "", error: "" },
    { label: "", opcode: "END", operand: "HW1B", prefix: "", error: "" },
  ],
  // Sample code 2: Calculator example
  calculator: [
    { label: "CALC", opcode: "START", operand: "2000", prefix: "", error: "" },
    { label: "", opcode: "LDA", operand: "NUM1", prefix: "", error: "" },
    { label: "", opcode: "ADD", operand: "NUM2", prefix: "", error: "" },
    { label: "", opcode: "SUB", operand: "NUM3", prefix: "", error: "" },
    { label: "", opcode: "STA", operand: "RESULT", prefix: "", error: "" },
    { label: "", opcode: "RSUB", operand: "", prefix: "", error: "" },
    { label: "NUM1", opcode: "WORD", operand: "5", prefix: "", error: "" },
    { label: "NUM2", opcode: "WORD", operand: "10", prefix: "", error: "" },
    { label: "NUM3", opcode: "WORD", operand: "3", prefix: "", error: "" },
    { label: "RESULT", opcode: "RESW", operand: "1", prefix: "", error: "" },
    { label: "", opcode: "END", operand: "CALC", prefix: "", error: "" },
  ],
};

export interface AssemblyLine {
  label: string;
  opcode: string;
  operand: string;
  prefix: string;
  error: string;
}

export type Direction = "up" | "down";
