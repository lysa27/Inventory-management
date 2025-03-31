import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Ensure you have authOptions configured

export async function getSession(request: Request) {
  return await getServerSession(authOptions);
}
