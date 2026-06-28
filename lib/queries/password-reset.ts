import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });

  await prisma.passwordResetToken.create({
    data: { userId, token, expiresAt },
  });

  return { token, expiresAt };
}

export async function findValidPasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: {
      user: {
        include: { company: true, driver: true, customer: true },
      },
    },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return record;
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const record = await findValidPasswordResetToken(token);
  if (!record) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null },
    }),
  ]);

  return prisma.user.findUniqueOrThrow({
    where: { id: record.userId },
    include: { company: true, driver: true, customer: true },
  });
}
