import { FC } from "react";
import { ChatTenant } from "./_components/chat-tenant";
import { configureNile } from "@/lib/AuthUtils";
import { cookies, headers } from "next/headers";
import nile from "@/lib/NileServer";
import { redirect } from "next/navigation";

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
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
    .db("message_tenant")
    .where({
      user_id: nile.userId,
      tenant_id: number,
    })
    .select();

  return (
    <>
      <ChatTenant
        tenant_id={number}
        pastMessages={messages}
        userId={nile.userId}
      />
    </>
  );
};

export default page;
