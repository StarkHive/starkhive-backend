import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe, Logger } from "@nestjs/common"
import type { NestExpressApplication } from "@nestjs/platform-express"
import session from "express-session"
import passport from "passport"
import * as fs from "fs"
import * as path from "path"

async function bootstrap() {
  const logger = new Logger("Bootstrap")
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Enable CORS for the frontend
  app.enableCors({
    origin: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads")
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir)
  }

  // Create previews and thumbnails directories
  const previewsDir = path.join(process.cwd(), "public", "previews")
  const thumbnailsDir = path.join(process.cwd(), "public", "thumbnails")

  if (!fs.existsSync(previewsDir)) {
    fs.mkdirSync(previewsDir, { recursive: true })
  }
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true })
  }

  // Serve static assets from /public
  app.useStaticAssets(path.join(process.cwd(), "public"))

  // Set global prefix for all routes
  app.setGlobalPrefix("api/admin")

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key", // Use env variable in production
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
      },
    }),
  )

  // Initialize passport and session
  app.use(passport.initialize())
  app.use(passport.session())

  // Apply ValidationPipe globally
  app.useGlobalPipes(new ValidationPipe())

  // Configure server timeout for long-lived connections like SSE
  app.set("keepAliveTimeout", 65000)
  app.set("headersTimeout", 66000)

  await app.listen(process.env.PORT || 3000)

  logger.log(`Application is running on: ${await app.getUrl()}`)
  logger.log(`Environment: ${process.env.NODE_ENV || "development"}`)
}

bootstrap()
