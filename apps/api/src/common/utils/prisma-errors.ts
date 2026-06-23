import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Prisma } from "@susuflow/database";

export function handlePrismaError(error: unknown, context?: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields =
        Array.isArray(error.meta?.target) && error.meta.target.length > 0
          ? (error.meta.target as string[]).join(", ")
          : "value";
      throw new ConflictException(
        `A record with this ${fields} already exists`,
      );
    }

    if (error.code === "P2000") {
      throw new BadRequestException(
        "One of the values you entered is too long. If you used Ghana Card, try again after your admin updates the database, or leave it blank for now.",
      );
    }
  }

  if (
    error instanceof Error &&
    error.message === "Customer role not configured"
  ) {
    throw new InternalServerErrorException(
      "Customer role is not configured. Contact your platform administrator.",
    );
  }

  if (context) {
    console.error(`[${context}]`, error);
  }

  throw error;
}
