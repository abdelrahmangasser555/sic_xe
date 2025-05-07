import {
  MessageSquare,
  RotateCcw,
  Plus,
  Minus,
  X as Multiply,
  Divide,
  ListOrdered,
  ArrowBigUp,
  Search,
  TrendingUp,
  ShieldAlert,
  Timer,
  Sigma,
} from "lucide-react";

export const testFiles: any = [
  {
    title: "HELLO WORLD",
    description: "A simple hello world program",
    icon: <MessageSquare className="text-blue-500" />,
    code: `10  MSGOUT  START   3000        Start at 3000
20          LDX     #0          Initialize index X
30  DISP    LDCH    TEXT,X      Load character from TEXT
40          WD      DEVICE      Write character
50          TIX     LENGTH      X++
60          JLT     DISP        Loop if X < LENGTH
70          RSUB                Return
80  DEVICE  BYTE     X'01'      Output device code
90  LENGTH  WORD     11         Length of string
100 TEXT    BYTE     C'HELLOWORLD'
110         END      MSGOUT
`,
  },
  {
    title: "SIMPLE LOOP",
    description: "A simple loop program",
    icon: <RotateCcw className="text-green-500" />,
    code: `10  LOOPX   START   4000        Start address 4000
20          LDA     COUNT       Load COUNT
30  AGAIN   COMP    #0          Compare A with 0
40          JEQ     DONE        If 0, exit loop
50          STA     OUTPUT      Store current value
60          +SUB     ONE         Decrement
70          +STA     COUNT       Update COUNT
80          J       AGAIN       Repeat loop
90  DONE    RSUB                Return
100 COUNT   WORD     5
110 ONE     WORD     1
120 OUTPUT  +RESW     1
130         END     LOOPX
`,
  },
  {
    title: "ADDITION",
    description: "Program to add two numbers",
    icon: <Plus className="text-green-600" />,
    code: `10  ADDPRG  START   1000        Start at 1000
20          LDA     NUM1        Load first number
30          ADD     NUM2        Add second number
40          STA     RESULT      Store the result
50          RSUB                Return
60  NUM1    WORD    25          First number
70  NUM2    WORD    15          Second number
80  RESULT  RESW    1           Reserve word for result
90          END     ADDPRG
`,
  },
  {
    title: "SUBTRACTION",
    description: "Program to subtract two numbers",
    icon: <Minus className="text-red-500" />,
    code: `10  SUBPRG  START   1500        Start at 1500
20          LDA     NUM1        Load first number
30          SUB     NUM2        Subtract second number
40          STA     RESULT      Store the result
50          RSUB                Return
60  NUM1    WORD    50          First number
70  NUM2    WORD    30          Second number
80  RESULT  RESW    1           Reserve word for result
90          END     SUBPRG
`,
  },
  {
    title: "MULTIPLICATION",
    description: "Program to multiply two numbers",
    icon: <Multiply className="text-purple-500" />,
    code: `10  MULPRG  START   2000        Start at 2000
20          LDA     #0          Initialize accumulator
30          LDX     COUNT       Load counter
40  LOOP    ADD     NUM1        Add NUM1 to accumulator
50          TIX     NUM2        Decrement counter
60          JLT     LOOP        Jump if not done
70          STA     RESULT      Store the result
80          RSUB                Return
90  NUM1    WORD    5           First number
100 NUM2    WORD    4           Second number
110 COUNT   WORD    4           Counter
120 RESULT  RESW    1           Reserve word for result
130         END     MULPRG
`,
  },
  {
    title: "DIVISION",
    description: "Simple division implementation",
    icon: <Divide className="text-orange-500" />,
    code: `10  DIVPRG  START   2500        Start at 2500
20          LDA     NUM1        Load dividend
30          LDX     #0          Initialize quotient
40  LOOP    COMP    NUM2        Compare with divisor
50          JLT     DONE        If less, we're done
60          SUB     NUM2        Subtract divisor
70          TIX     #1          Increment quotient
80          J       LOOP        Repeat
90  DONE    STX     QUOTIENT    Store quotient
100         STA     REMAINDER   Store remainder
110         RSUB                Return
120 NUM1    WORD    20          Dividend
130 NUM2    WORD    3           Divisor
140 QUOTIENT RESW   1           Quotient
150 REMAINDER RESW  1           Remainder
160         END     DIVPRG
`,
  },
  {
    title: "ARRAY SUM",
    description: "Calculate sum of array elements",
    icon: <ListOrdered className="text-blue-600" />,
    code: `10  ARRSUM  START   3500        Start at 3500
20          LDA     #0          Initialize sum to 0
30          LDX     #0          Initialize index
40  LOOP    LDS     ARRAY,X     Load array element
50          ADDR    S,A         Add to accumulator
60          TIX     LENGTH      Increment index
70          JLT     LOOP        Loop if not done
80          STA     RESULT      Store the sum
90          RSUB                Return
100 ARRAY   WORD    5           Array element 1
110         WORD    10          Array element 2
120         WORD    15          Array element 3
130         WORD    20          Array element 4
140         WORD    25          Array element 5
150 LENGTH  WORD    5           Array length
160 RESULT  RESW    1           Result storage
170         END     ARRSUM
`,
  },
  {
    title: "CHARACTER COUNT",
    description: "Count specific character occurrences",
    icon: <ListOrdered className="text-teal-500" />,
    code: `10  CHRCNT  START   4500        Start at 4500
20          LDA     #0          Initialize counter
30          LDX     #0          Initialize index
40          LDS     TARGET      Load target character
50  LOOP    LDCH    TEXT,X      Load character from text
60          COMPR   S,A         Compare with target
70          JNE     NEXT        Skip if not equal
80          LDA     COUNT       Load current count
90          ADD     ONE         Increment count
100         STA     COUNT       Store updated count
110 NEXT    TIX     LENGTH      Increment index
120         JLT     LOOP        Loop if not done
130         RSUB                Return
140 TARGET  BYTE    C'A'        Target character
150 TEXT    BYTE    C'ABRACADABRA'
160 LENGTH  WORD    11          Text length
170 COUNT   WORD    0           Character count
180 ONE     WORD    1           Constant 1
190         END     CHRCNT
`,
  },
  {
    title: "FIND MAXIMUM",
    description: "Find maximum value in an array",
    icon: <ArrowBigUp className="text-blue-700" />,
    code: `10  MAXFND  START   5000        Start at 5000
20          LDX     #0          Initialize index
30          LDA     ARRAY,X     Load first element as max
40          LDX     #3          Start from second element
50  LOOP    COMP    ARRAY,X     Compare with current element
60          JGT     NEXT        Skip if max is greater
70          LDA     ARRAY,X     Update max if necessary
80  NEXT    TIX     LENGTH      Increment index
90          JLT     LOOP        Loop if not done
100         STA     MAXVAL      Store maximum value
110         RSUB                Return
120 ARRAY   WORD    15          Array element 1
130         WORD    7           Array element 2
140         WORD    22          Array element 3
150         WORD    9           Array element 4
160         WORD    18          Array element 5
170 LENGTH  WORD    5           Array length
180 MAXVAL  RESW    1           Maximum value
190         END     MAXFND
`,
  },
  {
    title: "FACTORIAL",
    description: "Calculate factorial of a number",
    icon: <Sigma className="text-purple-600" />,
    code: `10  FACTRL  START   5500        Start at 5500
20          LDA     NUM         Load number
30          COMP    #0          Compare with 0
40          JEQ     ZERO        Jump if zero
50          LDX     #1          Initialize result to 1
60  LOOP    MULR    A,X         Multiply result by current num
70          SUB     ONE         Decrement number
80          COMP    #0          Compare with 0
90          JGT     LOOP        Loop if not done
100         STX     RESULT      Store the result
110         J       EXIT        Jump to exit
120 ZERO    LDA     #1          Factorial of 0 is 1
130         STA     RESULT      Store the result
140 EXIT    RSUB                Return
150 NUM     WORD    5           Input number
160 ONE     WORD    1           Constant 1
170 RESULT  RESW    1           Result storage
180         END     FACTRL
`,
  },
  {
    title: "BINARY SEARCH",
    description: "Binary search in a sorted array",
    icon: <Search className="text-indigo-500" />,
    code: `10  BINSRC  START   6000        Start at 6000
20          LDA     #0          Low index
30          LDX     LENGTH      High index
40          LDS     TARGET      Target value
50  LOOP    ADDR    A,X         Calculate mid = (low+high)
60          RMO     X,B         Copy to B
70          DIVR    TWO,B       Divide by 2 to get mid
80          COMP    ARRAY,B     Compare target with arr[mid]
90          JEQ     FOUND       Found the element
100         JGT     HIGHER      Target is higher
110         RMO     B,X         high = mid - 1
120         SUB     ONE         Subtract 1
130         J       CHECK       Check termination
140 HIGHER  RMO     B,A         low = mid + 1
150         ADD     ONE         Add 1
160 CHECK   COMPR   A,X         Compare low and high
170         JLT     LOOP        Continue if low < high
180         LDA     #-1         Element not found
190         J       EXIT        Jump to exit
200 FOUND   LDA     #1          Element found
210 EXIT    STA     RESULT      Store result
220         RSUB                Return
230 ARRAY   WORD    10          Sorted array element 1
240         WORD    20          Sorted array element 2
250         WORD    30          Sorted array element 3
260         WORD    40          Sorted array element 4
270         WORD    50          Sorted array element 5
280 LENGTH  WORD    5           Array length
290 TARGET  WORD    30          Target value to find
300 TWO     WORD    2           Constant 2
310 ONE     WORD    1           Constant 1
320 RESULT  RESW    1           Result: 1=found, -1=not found
330         END     BINSRC
`,
  },
  {
    title: "ERROR HANDLER",
    description: "Simple error handling example",
    icon: <ShieldAlert className="text-red-600" />,
    code: `10  ERRHDL  START   7000        Start at 7000
20          LDA     INPUT       Load input value
30          COMP    MINVAL      Compare with minimum
40          JLT     ERRMIN      Jump if less than minimum
50          COMP    MAXVAL      Compare with maximum
60          JGT     ERRMAX      Jump if greater than maximum
70          STA     VALID       Store valid input
80          LDA     #0          Success code
90          J       EXIT        Jump to exit
100 ERRMIN  LDA     #1          Error code for below minimum
110         J       EXIT        Jump to exit
120 ERRMAX  LDA     #2          Error code for above maximum
130 EXIT    STA     ERRCODE     Store error code
140         RSUB                Return
150 INPUT   WORD    75          Input value
160 MINVAL  WORD    0           Minimum allowed value
170 MAXVAL  WORD    100         Maximum allowed value
180 VALID   RESW    1           Valid input storage
190 ERRCODE RESW    1           Error code storage
200         END     ERRHDL
`,
  },
  {
    title: "DELAY TIMER",
    description: "Implement a simple delay timer",
    icon: <Timer className="text-yellow-500" />,
    code: `10  DELAY   START   7500        Start at 7500
20          LDX     #0          Initialize counter
30  LOOP    TIX     DURATION    Increment counter
40          JLT     LOOP        Loop until duration reached
50          RSUB                Return
60  DURATION WORD   10000       Delay duration
70          END     DELAY
`,
  },
];
