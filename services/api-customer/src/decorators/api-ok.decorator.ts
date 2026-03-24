import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiProperty,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiOkRes = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  options: ApiResponseOptions & { isArray?: boolean } = {},
  example?: string | number | boolean,
) => {
  const dataOption = {
    default: example ? example : undefined,
    ...(options.isArray
      ? { type: 'array', items: { $ref: getSchemaPath(dataDto) } }
      : { $ref: getSchemaPath(dataDto) }),
  };

  return applyDecorators(
    ApiExtraModels(SwaggerHttpResponse, dataDto),
    ApiResponse({
      ...options,
      status: options.status || HttpStatus.OK,
      description: options.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SwaggerHttpResponse) },
          {
            properties: {
              statusCode: { default: options.status || HttpStatus.OK },
              data: dataOption,
            },
          },
        ],
      },
    }),
  );
};

export class SwaggerHttpResponse<T> {
  @ApiProperty({
    type: Number,
    description: 'Status code',
  })
  statusCode: number;

  @ApiProperty({
    type: String,
    description: 'Response message',
    example: 'Success',
  })
  message: string;

  @ApiProperty()
  data: T;
}
