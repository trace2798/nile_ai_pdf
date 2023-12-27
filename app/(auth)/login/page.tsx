import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { FC } from "react";
import { UserAuthLoginForm } from "./_components/login-form";
import GoogleAuthPanel from "@/components/google-auth-panel";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <>
      <div className="flex flex-col w-full justify-center items-center">
        <Card className="min-w-sm max-w-md p-5 mt-24">
          <CardHeader className="text-2xl p-0 text-center">Log in</CardHeader>
          {/* <UserAuthLoginForm /> */}
          {/* <div className="relative flex justify-center text-sm my-5">
            <span className=" px-2 text-muted-foreground">
              Or continue with
            </span>
          </div> */}
          <div className="mt-7 items-center flex justify-center flex-col">
            <GoogleAuthPanel />
          </div>
          <CardFooter className="mt-10 text-sm text-center flex items-center justify-center">
            <h1>
              {" "}
              Don&apos;t have an account?{" "}
              <a href="/sign-up" className="text-indigo-400 hover:underline">
                &nbsp;Sign Up
              </a>
            </h1>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default page;
