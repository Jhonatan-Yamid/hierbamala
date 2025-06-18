
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
function Welcome() {
    const session =  getServerSession(authOptions);
  return (
    <h1 className="text-white text-5xl">Dashboard </h1>
  )
}
export default Welcome