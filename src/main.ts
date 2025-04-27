import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"
import type { NestExpressApplication } from "@nestjs/platform-express"
import session from "express-session"
import passport from "passport"
import { Logger } from "@nestjs/common"

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
  // This is important for SSE connections that need to stay open
  app.set("keepAliveTimeout", 65000) // Slightly higher than 60 seconds
  app.set("headersTimeout", 66000) // Slightly higher than keepAliveTimeout

  await app.listen(process.env.PORT || 3000)

  logger.log(`Application is running on: ${await app.getUrl()}`)
  logger.log(`Environment: ${process.env.NODE_ENV || "development"}`)
}
bootstrap()

