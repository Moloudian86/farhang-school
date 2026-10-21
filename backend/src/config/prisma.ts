import { PrismaClient } from "@prisma/client";

/**
 * One shared Prisma client for the whole backend.
 * Think of it as the single "phone line" between our code and MySQL.
 */
export const prisma = new PrismaClient();
