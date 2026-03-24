import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export const StringToBoolean = () =>
  applyDecorators(
    IsBoolean(),
    Transform(({ obj, key }) => {
      return obj[key] === 'true'
        ? true
        : obj[key] === 'false'
          ? false
          : obj[key];
    }),
  );
