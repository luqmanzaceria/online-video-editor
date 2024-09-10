// src/lib/api.ts
import prisma from "./prisma";

export async function getTracks() {
  return await prisma.track.findMany();
}
