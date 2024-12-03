import { api } from "@/convex/_generated/api";
import { WebhookEvent } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { message: "Please add WEBHOOK_SECRET to .env or .env.local" },
      { status: 500 }
    );
  }

  const responseHeaders = new Headers();
  responseHeaders.set("Access-Control-Allow-Origin", "*"); // Allow all origins (update for production)
  responseHeaders.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, svix-id, svix-timestamp, svix-signature");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders });
  }

  try {
    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing SVIX headers", {
        status: 400,
        headers: responseHeaders,
      });
    }

    // Get and verify body payload
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Invalid Webhook Signature", {
        status: 400,
        headers: responseHeaders,
      });
    }

    // Handle events
    const eventType = evt.type;
    switch (eventType) {
      case "user.created":
        try {
          console.log("payload", payload);

          const userData = {
            userId: payload?.data?.id,
            email: payload?.data?.email_addresses?.[0]?.email_address,
            name: `${payload?.data?.first_name || ""}`,
            createdAt: Date.now(),
            profileImage: payload?.data?.profile_image_url,
          };

          await fetchMutation(api.users.createUser, userData);

          return NextResponse.json(
            { status: 200, message: "User info inserted" },
            { headers: responseHeaders }
          );
        } catch (error) {
          return NextResponse.json(
            { status: 400, error },
            { headers: responseHeaders }
          );
        }

      case "user.updated":
        return NextResponse.json(
          { status: 200, message: "User info updated" },
          { headers: responseHeaders }
        );

      default:
        return new Response("Unhandled event type", {
          status: 400,
          headers: responseHeaders,
        });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: responseHeaders,
    });
  }
}
