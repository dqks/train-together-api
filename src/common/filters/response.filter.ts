import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../classes/api-response';

@Catch()
export class ResponseFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Ошибки валидации (BadRequestException)
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse() as any;

      // Если messages уже в формате { field: [errors] }
      if (
        typeof exceptionResponse === 'object' &&
        !Array.isArray(exceptionResponse)
      ) {
        return response
          .status(400)
          .json(ApiResponse.error(exceptionResponse, 400));
      }

      // Если строка или массив строк
      return response
        .status(400)
        .json(ApiResponse.error([exception.message], 400));
    }

    // Остальные HTTP исключения
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message;
      return response.status(status).json(ApiResponse.error([message], status));
    }

    // Неизвестные ошибки
    console.error('Unhandled error:', exception);
    return response
      .status(500)
      .json(ApiResponse.error(['Internal server error'], 500));
  }
}
