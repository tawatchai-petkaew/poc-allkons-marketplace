import { HttpException, HttpStatus, PipeTransform } from "@nestjs/common";
import { MAX_FILE_SIZE, MULTIPLE_ALLOWED_FILE_TYPES } from "../enum/organization.enum";

export class MultipleFileValidationPipe implements PipeTransform {
  transform(files: Express.Multer.File[]): Express.Multer.File[] {
    if (!files) {
      throw new HttpException({
        message: 'File is required',
        data: {
          file: null
        }
      }, HttpStatus.BAD_REQUEST);
    }

    // Check file size and type for each file
    files.forEach(f => {
      if (f.size > MAX_FILE_SIZE) {
        throw new HttpException({
          message: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
          data: {
            fileSize: f.size,
            maxSize: MAX_FILE_SIZE
          }
        }, HttpStatus.BAD_REQUEST);
      }

      if (!MULTIPLE_ALLOWED_FILE_TYPES.includes(f.mimetype)) {
        throw new HttpException(
          {
            message: `File type not allowed. Allowed types: ${MULTIPLE_ALLOWED_FILE_TYPES.join(', ')}`,
            data: {
              fileType: f.mimetype,
              allowedTypes: MULTIPLE_ALLOWED_FILE_TYPES
            }
          },
          HttpStatus.BAD_REQUEST
        )
      }
    });

    return files;
  }
}