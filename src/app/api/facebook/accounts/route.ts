import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let token = searchParams.get('token');
  
  // If no token in query, try to get it from the user's session & database
  if (!token) {
    const session = await auth();
    if (session?.user?.id) {
      const account = await prisma.account.findFirst({
        where: {
          userId: session.user.id,
          provider: "facebook"
        }
      });
      token = account?.access_token || null;
    }
  }

  if (!token) {
    return NextResponse.json({ error: "Missing Facebook Access Token. Please connect your Facebook account." }, { status: 400 });
  }

  try {
    // Ping Facebook Graph API - requesting 'id' which includes the 'act_' prefix
    const response = await fetch(`https://graph.facebook.com/v20.0/me/adaccounts?fields=name,account_id,id&access_token=${token}`);
    const data = await response.json();

    if (data.error) {
       return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ accounts: data.data });
  } catch (error: any) {
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
