// Server-side Prisma client singleton
import { PrismaClient } from "@prisma/client"

// Avoid creating multiple instances in dev hot-reload
export const prisma = globalThis.__prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma
