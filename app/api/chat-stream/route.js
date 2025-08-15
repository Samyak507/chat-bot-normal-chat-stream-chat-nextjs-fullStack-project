import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { message } = await request.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Use streaming API
    const streamResult = await model.generateContentStream(message);

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamResult.stream) {
          const content = chunk.text();
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
