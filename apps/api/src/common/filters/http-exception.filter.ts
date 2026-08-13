import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { Prisma } from "@susuflow/database";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let resolved = exception;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") {
        const fields =
          Array.isArray(exception.meta?.target) &&
          exception.meta.target.length > 0
            ? (exception.meta.target as string[]).join(", ")
            : "value";
        resolved = new ConflictException(
          `A record with this ${fields} already exists`,
        );
      } else if (exception.code === "P2000") {
        resolved = new BadRequestException(
          "One of the values you entered is too long. Please check your input and try again.",
        );
      } else if (exception.code === "P2028") {
        resolved = new BadRequestException(
          "Could not save your documents in time. Please try again.",
        );
      }
    }

    const status =
      resolved instanceof HttpException
        ? resolved.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const error =
        exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(
        `${request.method} ${request.url}: ${error.message}`,
        error.stack,
      );
    }

    const exceptionResponse =
      resolved instanceof HttpException ? resolved.getResponse() : null;

    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>)?.message ||
          "Internal server error";

    const errors =
      typeof exceptionResponse === "object" && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>).errors
        : undefined;

    response.status(status).json({
      type: `https://api.susuflow.com/errors/${status}`,
      title: HttpStatus[status],
      status,
      detail: Array.isArray(message) ? message.join(", ") : message,
      instance: request.url,
      errors,
    });
  }
}
