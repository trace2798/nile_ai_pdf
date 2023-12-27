// import { db } from "@/lib/db";
// import { getPineconeClient } from "@/lib/pinecone";
import nile from "@/lib/NileServer";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log(data, "DATA");
    try {
      const response = await fetch(`${data.file.url}`);
      console.log(response);
      const blob = await response.blob();
      console.log(blob, "BLOB");
      const loader = new PDFLoader(blob);
      console.log(loader, "LOADER");
      const pageLevelDocs = await loader.load();
      console.log(pageLevelDocs);
      const pagesAmt = pageLevelDocs.length;
      console.log(pagesAmt);

      try {
        for (const doc of pageLevelDocs) {
          console.log(doc);
          const txtPath = doc.metadata.loc.pageNumber;
          const text = doc.pageContent;
          console.log(text);
          const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
          });
          //Split text into chunks (documents)
          const chunks = await textSplitter.createDocuments([text]);
          console.log(`Total chunks: ${chunks.length}`);
          console.log("EMBED CALL HERE");
          const modelName = "thenlper/gte-large";
          //   const azureOpenAIBasePath = "https://api.endpoints.anyscale.com/v1";

          //   const embeddingsArrays = await new OpenAIEmbeddings({
          //     modelName: "thenlper/gte-large",
          //     azureOpenAIBasePath: "https://api.endpoints.anyscale.com/v1",
          //     openAIApiKey: process.env.ANYSCALE_API_KEY,
          //   }).embedDocuments(
          //     chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
          //   );
          const embeddingsArrays = await new OpenAIEmbeddings({
            configuration: {
              baseURL: "https://api.endpoints.anyscale.com/v1",
            },
            modelName: modelName,
          }).embedDocuments(
            chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
          );
          console.log(embeddingsArrays);
          const batchSize = 100;
          let batch: any = [];
          for (let idx = 0; idx < chunks.length; idx++) {
            const chunk = chunks[idx];
            console.log(chunk);
            const vector = {
              id: `${data.file.id}_${idx}`,
              values: embeddingsArrays[idx],
              metadata: {
                ...chunk.metadata,
                loc: JSON.stringify(chunk.metadata.loc),
                pageContent: chunk.pageContent,
                txtPath: txtPath,
                filter: `${data.file.id}`,
              },
            };
            console.log(vector);

            batch = [...batch, vector];
            if (batch.length === batchSize || idx === chunks.length - 1) {
              console.log(batch);
              console.log(batch[0].values);
              //change this to your COMMAND_TO_UPSERT_TO_PINECONE
              //   await pineconeIndex.upsert(batch);
              // console.log("Upserting Vector");
              // Empty the batch
              for (const vector of batch) {
                const uuid = vector.id.split("_")[0];
                await nile.db("file_embedding").insert({
                  file_id: data.file.id,
                  tenant_id: data.file.tenant_id,
                  embedding_api_id: uuid,
                  embedding: JSON.stringify(vector.values),
                  pageContent: JSON.stringify(vector.metadata.pageContent),
                  location: JSON.stringify(vector.metadata.loc),
                });
              }
              batch = [];
            }
          }
          //   Log the number of vectors updated just for verification purpose
          console.log(`Database index updated with ${chunks.length} vectors`);
          await nile
            .db("file")
            .where({
              id: data.file.id,
              tenant_id: data.file.tenant_id,
            })
            .update({ isIndex: true });
          //   await db.file.update({
          //     data: {
          //       indexStatus: true,
          //       totalChunks: chunks.length,
          //     },
          //     where: {
          //       id: data.file.id,
          //     },
          //   });
        }
      } catch (err) {
        console.log("error: Error in upserting in pinecone ", err);
        return new NextResponse("Error in upserting in pinecone", {
          status: 400,
        });
      }
    } catch (error) {
      console.log(error);
      return new NextResponse("Could not fetch", {
        status: 400,
      });
    }

    return new NextResponse("FROM INDEX API", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("No Matches", { status: 400 });
  }
}
