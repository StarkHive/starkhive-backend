import { 
    ExceptionFilter, 
    Catch, 
    ArgumentsHost, 
    HttpStatus, 
    HttpException 
  } from '@nestjs/common';
  import { Response } from 'express';
  
  @Catch(Error)
  export class FileImportExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
  
      const status = 
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      response.status(status).json({
        statusCode: status,
        message: 'File import failed',
        error: exception.message,
      });
    }
  }