import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Block non admins from accessing admin dashboard
  const user = await currentUser();
  if(!user || String(user?.privateMetadata?.role).toUpperCase() !== "ADMIN") redirect("/");
  return <div className="w-full h-full">
    {/* Sidebar */}
    <Sidebar  />
    <div className="w-[100%-300px] ml-[300px] ">
      {/* Header */}
      <Header />
      <div className="mt-[75px] p-4">{children}</div>
    </div>
  </div>;
}