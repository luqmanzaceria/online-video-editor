// src/app/api/tracks/route.ts
import { NextResponse } from "next/server";
import { getTracks } from "@/lib/api";

export async function GET() {
  try {
    const tracks = await getTracks();
    return NextResponse.json(tracks);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching tracks", error: error.message },
      { status: 500 }
    );
  }
}
