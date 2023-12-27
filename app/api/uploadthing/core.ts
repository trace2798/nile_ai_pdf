import { createUploadthing, type FileRouter } from "uploadthing/next";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import nile from "@/lib/NileServer";
import { configureNile } from "@/lib/AuthUtils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { OrganizationModal } from "@/components/modals/orgs-modal";
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
    console.log("1");

    const response = await fetch(
      `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
    );
    console.log(response);
    const blob = await response.blob();

    const loader = new PDFLoader(blob);

    const pageLevelDocs = await loader.load();

    const pagesAmt = pageLevelDocs.length;

    // const { subscriptionPlan } = metadata;
    console.log("CHECKING PAGES");
    console.log(pagesAmt);
    // Define the maximum pages for each subscription plan
    const maxPages: Record<SubscriptionPlan, number> = {
      FREE: 1,
      PRO: 2,
      ENTERPRISE: 5,
    };

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
  }
};

export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
