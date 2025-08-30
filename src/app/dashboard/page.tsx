import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get user and redirect based on role
  const user = await currentUser();
  if(!user?.privateMetadata?.role || String(user?.privateMetadata?.role).toUpperCase() === "USER") redirect("/");
  else if (String(user?.privateMetadata?.role) === "ADMIN") redirect("/dashboard/admin");
  else if (String(user?.privateMetadata?.role) === "SELLER") redirect("/dashboard/seller");
  return <div className="p-4">Dashboard Home</div>;
} 