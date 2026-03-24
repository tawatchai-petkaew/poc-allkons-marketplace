import { PipeTransform, Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../enum/file-type.enum';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new HttpException({
        message: 'File is required',
        data: {
          file: null
        }
      }, HttpStatus.BAD_REQUEST);
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new HttpException({
        message: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
        data: {
          fileSize: file.size,
          maxSize: MAX_FILE_SIZE
        }
      }, HttpStatus.BAD_REQUEST);
    }
    

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new HttpException(
        {
          message: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
          data: {
            fileType: file.mimetype,
            allowedTypes: ALLOWED_FILE_TYPES
          }
        },
        HttpStatus.BAD_REQUEST
      )
    }

    return file;
  }
}
