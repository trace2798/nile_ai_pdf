import nile from "@/lib/NileServer";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body, "BODY");

    await nile.db("message").insert({
      text: body.messages[body.messages.length - 1].content,
      fileId: body.fileId,
      user_id: body.user_id,
      isUserMessage: true,
      tenant_id: body.tenant_id,
    });

    const question = body.messages[body.messages.length - 1].content;
    console.log(question);

    const anyscale = new OpenAI({
      baseURL: "https://api.endpoints.anyscale.com/v1",
      apiKey: process.env.ANYSCALE_API_KEY!,
    });

    // const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
    const modelName = "thenlper/gte-large";
    const queryEmbedding = await new OpenAIEmbeddings({
      configuration: {
        baseURL: "https://api.endpoints.anyscale.com/v1",
      },
      modelName: modelName,
    }).embedQuery(question);
    console.log(queryEmbedding, "queryEmbedding");
    // 4. Query Pinecone index and return top 10 matches

    const queryResponse = await nile
      .db("file_embedding")
      .select("pageContent", "location")
      .orderByRaw(`embedding <=> '[${queryEmbedding}]'`)
      .where({ file_id: body.fileId, tenant_id: body.tenant_id })
      .limit(10);
    console.log(queryResponse, "queryResponse");

    if (queryResponse) {
      const concatenatedPageContent = queryResponse
        .map((match: any) => match.pageContent)
        .join(" ");
      console.log(concatenatedPageContent, "concatenatedPageContent");

      const prevMessages = await nile
        .db("message")
        .where({
          fileId: body.fileId,
          tenant_id: body.tenant_id,
          user_id: body.user_id,
        })
        .limit(6)
        .select("*");

      const formattedPrevMessages = prevMessages.map((msg) => ({
        role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
        content: msg.text,
      }));

      let result;
      if (prevMessages.length < 6) {
        result = await anyscale.chat.completions.create({
          model: "meta-llama/Llama-2-70b-chat-hf",
          temperature: 0.1,
          stream: true,
          messages: [
            {
              role: "system",
              content:
                "You are a friendly assistant who uses the context below to answer questions in markdown format. Answer honestly, citing sources with line numbers. Provide inline citation.",
            },
            {
              role: "user",
              content: `Use the provided context: ${concatenatedPageContent} to answer the user's question: ${question}. Answers should be in markdown format. If unsure, simply say you don't know.
      Helpful Answer:`,
            },
          ],
        });
        console.log(result, "result");
      } else {
        result = await anyscale.chat.completions.create({
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          temperature: 0.1,
          stream: true,
          messages: [
            {
              role: "system",
              content:
                "You are a friendly assistant who uses the context below to answer questions in markdown format. Answer honestly, citing sources with line numbers. Provide inline citation.",
            },
            {
              role: "user",
              content: `Use the provided context: ${concatenatedPageContent} to answer the user's question: ${question}. Answers should be in markdown format. If unsure, simply say you don't know.
      \n----------------\n
      PREVIOUS CONVERSATION:
     ${formattedPrevMessages}
      \n----------------\n
      Helpful Answer:`,
            },
          ],
        });
      }
      console.log(result, "RESULT");

      const stream = OpenAIStream(result, {
        async onCompletion(completion: any) {
          console.log(completion, "completion");
          await nile.db("message").insert({
            text: completion,
            fileId: body.fileId,
            user_id: body.user_id,
            isUserMessage: false,
            tenant_id: body.tenant_id,
          });
        },
      });
      return new StreamingTextResponse(stream);
    } else {
      console.log("There are no matches.");
      return new NextResponse("No Matches", { status: 200 });
    }
  } catch (error) {
    console.log("[READ_error]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
