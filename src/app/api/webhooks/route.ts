import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { User, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;
    if (evt.type === "user.created" || evt.type === "user.updated") {
      // console.log("userId:", evt.data.id);
      // console.log("user data -->", evt.data);
      console.log("eventType:", evt.type, evt.data.private_metadata?.role);
      const user: Partial<User> = {
        id: evt.data.id,
        name: evt.data.first_name + " " + evt.data.last_name,
        email: evt.data.email_addresses?.[0]?.email_address,
        picture: evt.data.image_url,
        role: Object.values(Role).includes(
          (evt.data?.private_metadata?.role as string)?.toUpperCase() as Role
        )
          ? ((evt.data.private_metadata?.role as string)?.toUpperCase() as Role)
          : Role.User,
      };
      if (!user) return new Response("Invalid user data", { status: 400 });
      console.log("user to upsert:", user);
      const dbUser = await db.user.upsert({
        where: { email: user.email! },
        update: user,
        create: {
          id: user.id!,
          name: user.name!,
          email: user.email!,
          picture: user.picture!,
          role: user.role || "User",
        },
      });
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(evt.data.id, {
        privateMetadata: {
          role: dbUser.role || "User",
        },
      });
    }

    if (evt.type === "user.deleted") {
      const userId = evt.data.id;
      await db.user.delete({
        where: { id: userId },
      });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
