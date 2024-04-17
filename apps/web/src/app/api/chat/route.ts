import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set the runtime to edge for best performance
export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log("GETTING /api/chat", messages);
  // Ask OpenAI for a streaming chat completion given the prompt
  // check if last message contains an image
  // if it does, use the gpt-4-vision-preview model
  // if it doesn't, use the gpt-3.5-turbo model
  const useVision =
    messages[messages.length - 1].content[0].type === "image_url";

  console.log("useVision", useVision);
  const model = useVision ? "gpt-4-vision-preview" : "gpt-3.5-turbo";
  const response = await openai.chat.completions.create({
    model,
    stream: true,
    messages,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
