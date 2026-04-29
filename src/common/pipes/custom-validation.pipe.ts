import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// @Injectable()
// export class CustomValidationPipe implements PipeTransform {
//   async transform(value: any, metadata: ArgumentMetadata) {
//     const { metatype } = metadata;
//
//     if (!metatype || !this.toValidate(metatype)) {
//       return value;
//     }
//
//     const object = plainToInstance(metatype, value);
//     const errors = await validate(object);
//
//     if (errors.length > 0) {
//       // Формируем messages в нужном формате: { поле: [ошибки] }
//       const messages: Record<string, string[]> = {};
//
//       errors.forEach((error) => {
//         const constraints = error.constraints || {};
//         messages[error.property] = Object.values(constraints);
//       });
//
//       throw new BadRequestException(messages);
//     }
//
//     return value;
//   }
//
//   private toValidate(metatype: Function): boolean {
//     const types = [String, Boolean, Number, Array, Object];
//     return !types.includes(metatype as any);
//   }
// }

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || this.isPrimitive(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      stopAtFirstError: false,
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatValidationErrors(errors);
      throw new BadRequestException(formattedErrors);
    }

    return object;
  }

  private formatValidationErrors(errors: any[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const error of errors) {
      // Рекурсивно обрабатываем вложенные ошибки
      this.collectErrors(error, result);
    }

    return result;
  }

  private collectErrors(
    error: any,
    result: Record<string, string[]>,
    parentKey: string = '',
  ) {
    const key = parentKey ? `${parentKey}.${error.property}` : error.property;

    // Текущие ошибки поля
    if (error.constraints) {
      result[key] = Object.values(error.constraints);
    }

    // Рекурсивно обрабатываем детей
    if (error.children && error.children.length > 0) {
      for (const child of error.children) {
        this.collectErrors(child, result, key);
      }
    }
  }

  private isPrimitive(metatype: any): boolean {
    const primitives = [String, Boolean, Number, Array, Object];
    return primitives.includes(metatype);
  }
}
