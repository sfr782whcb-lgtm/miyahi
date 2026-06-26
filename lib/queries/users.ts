import { prisma } from "@/lib/prisma";

export async function updateUserPassword(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function getUserPasswordHash(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
}
