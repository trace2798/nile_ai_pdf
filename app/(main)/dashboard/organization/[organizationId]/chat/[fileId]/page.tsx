import { Chat } from "./_components/chat";
import nile from "@/lib/NileServer";
import { configureNile } from "@/lib/AuthUtils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

interface FileIdPageProps {
  params: {
    fileId: string;
  };
}

const FileIdPage = async ({ params }: FileIdPageProps) => {
  configureNile(cookies().get("authData"), null);
  console.log(nile.userId);
  if (!nile.userId) {
    redirect("/");
  }
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
  const messages = await nile
    .db("message")
    .where({
      fileId: params.fileId,
      user_id: nile.userId,
      tenant_id: number,
    })
    .select();

  return (
    <>
      <Chat
        fileId={params.fileId}
        pastMessages={messages}
        userId={nile.userId}
        tenant_id={number}
      />
    </>
  );
};

export default FileIdPage;