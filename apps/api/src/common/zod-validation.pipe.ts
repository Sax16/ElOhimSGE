import { BadRequestException, Body, Param, type PipeTransform, Query } from '@nestjs/common';
import { type ZodTypeAny, type z } from 'zod';

/**
 * Pipe de validación con Zod (D2): los schemas de packages/shared son la única
 * definición de validación, compartida entre React Hook Form y la API.
 */
export class ZodValidationPipe<T extends ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Datos inválidos',
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return result.data;
  }
}

export const zodBody = <T extends ZodTypeAny>(schema: T) => Body(new ZodValidationPipe(schema));
export const zodQuery = <T extends ZodTypeAny>(schema: T) => Query(new ZodValidationPipe(schema));
export const zodParam = <T extends ZodTypeAny>(name: string, schema: T) =>
  Param(name, new ZodValidationPipe(schema));
