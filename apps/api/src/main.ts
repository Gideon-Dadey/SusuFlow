import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import helmet from "helmet";
import compression = require("compression");
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { validateProductionSecrets } from "./config/validate-env";
import { initSentry } from "./config/sentry.config";

async function bootstrap() {
  initSentry();
  validateProductionSecrets();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));

  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ limit: "10mb", extended: true }));
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production",
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.enableCors({
    origin: process.env.WEB_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-tenant-slug",
      "x-request-id",
      "idempotency-key",
    ],
  });

  app.setGlobalPrefix("api");
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const isProduction = process.env.NODE_ENV === "production";
  const logger = app.get(Logger);

  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("SusuFlow API")
      .setDescription("Multi-tenant digital susu savings platform")
      .setVersion("1.0")
      .addBearerAuth()
      .addTag("auth")
      .addTag("tenants")
      .addTag("customers")
      .addTag("deposits")
      .addTag("wallets")
      .addTag("ledger")
      .addTag("health")
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  const port = Number(process.env.PORT || process.env.API_PORT || 4000);
  await app.listen(port);
  logger.log(`SusuFlow API running on http://localhost:${port}`);
  if (!isProduction) {
    logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
