import { createUploadthing, type FileRouter } from "uploadthing/next";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";

import nile from "@/lib/NileServer";
import { configureNile } from "@/lib/AuthUtils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { OrganizationModal } from "@/components/modals/orgs-modal";
import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { usePathname } from "next/navigation";

type SubscriptionPlan = "FREE" | "PRO" | "ENTERPRISE";

const f = createUploadthing();

const middleware = async () => {
  configureNile(cookies().get("authData"), null);
  console.log(nile.userId);
  const user = await nile.db("users.users").where({
    id: nile.userId,
  });
  console.log(user);
  if (!user) throw new Error("Unauthorized");
  // const params = usePathname();
  // const subscriptionPlan = await getUserSubscriptionPlan({ userId: user.id });
  const headersList = headers();
  console.log(headersList);
  const referer = headersList.get("referer");
  console.log(referer);
  if (!referer) {
    redirect("/");
  }
  const parts = referer.split("/");
  const number = parts[5];
  console.log(number);
  const orgId = number;
  return { userInfo: user, orgId };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  try {
    console.log(metadata);
    console.log(file);
    // const isFileExist = await nile.db("file").where({
    //   key: file.key,
    // });

    // if (isFileExist) return;
    console.log("1: Uploadthings api");

    const response = await fetch(
      `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
    );
    console.log(response);
    const blob = await response.blob();

    const loader = new PDFLoader(blob) || new TextLoader(blob);

    const pageLevelDocs = await loader.load();

    const pagesAmt = pageLevelDocs.length;

    // const { subscriptionPlan } = metadata;
    console.log("CHECKING PAGES");
    console.log(pagesAmt);

    // Check if the pages amount exceeds the limit for the subscription plan
    // const isPageLimitExceeded =
    // pagesAmt > maxPages[subscriptionPlan as SubscriptionPlan];
    const isPageLimitExceeded = pagesAmt > 50;
    console.log(isPageLimitExceeded);
    if (!isPageLimitExceeded) {
      const createdFile = await nile.db("file").insert({
        tenant_id: metadata.orgId,
        url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
        key: file.key,
        user_id: metadata.userInfo[0].id,
        user_name: metadata.userInfo[0].name,
        user_picture: metadata.userInfo[0].picture,
        isIndex: false,
        name: file.name,
        pageAmt: pagesAmt,
      });

      console.log("2: File created");
      console.log(createdFile);
      const fileId = await nile.db("file").where({
        key: file.key,
        tenant_id: metadata.orgId,
      });
      console.log(fileId);
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
              id: `${fileId[0].id}_${idx}`,
              values: embeddingsArrays[idx],
              metadata: {
                ...chunk.metadata,
                loc: JSON.stringify(chunk.metadata.loc),
                pageContent: chunk.pageContent,
                txtPath: txtPath,
                filter: `${fileId[0].id}`,
              },
            };
            console.log(vector);

            batch = [...batch, vector];
            if (batch.length === batchSize || idx === chunks.length - 1) {
              console.log(batch);
              console.log(batch[0].values);

              for (const vector of batch) {
                const uuid = vector.id.split("_")[0];
                await nile.db("file_embedding").insert({
                  file_id: fileId[0].id,
                  tenant_id: metadata.orgId,
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
              id: fileId[0].id,
              tenant_id: metadata.orgId,
            })
            .update({ isIndex: true });
        }
      } catch (err) {
        console.log("error: Error in upserting to database ", err);
        return "LIMITEXCEED";
      }
      return "SUCCESS";
    } else {
      return "LIMITEXCEED";
    }
  } catch (err) {
    // await db.file.update({
    //   data: {
    //     uploadStatus: "FAILED",
    //   },
    //   where: {
    //     id: createdFile.id,
    //   },
    // });
    console.log(err);
    return "LIMITEXCEED";
  }
};

export const ourFileRouter = {
  freePlanUploader: f({
    pdf: { maxFileSize: "4MB" },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({
    pdf: { maxFileSize: "16MB" },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
