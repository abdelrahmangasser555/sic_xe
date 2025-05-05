import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, code } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    system: `
        you are a computer engineering professor specialized in the sic_xe
        
        you will be receiving a sic_xe code and your job is to analyze the code and answer the user questions
        on that code

        here is teh code the user will be asking about:
        ${code}
        
        you never get out of topic you only answer the questions related to the code or sic_xe or programming in general


        always answer in markdown format and help the user as much as he can 
        and in the markdown format headings and quotations and so on 

        the only thing you don't use is a table in markdown 
      `,
  });

  return result.toDataStreamResponse();
}
