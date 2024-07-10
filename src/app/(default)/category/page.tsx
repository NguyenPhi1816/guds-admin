import { auth } from "@/auth";

const Page = async () => {
  const session = await auth();

  // console.log("mySession: ", session);

  return <div>This is category page</div>;
};
export default Page;
