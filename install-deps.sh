#!/bin/bash

# Install core dependencies
npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata typescript

# Install validation and transformation dependencies
npm install class-validator class-transformer class-sanitizer

# Install type definitions
npm install --save-dev @types/node @types/express
