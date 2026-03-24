import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class PublicAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token) {
      return true; // No token is present, allow the request to proceed without authentication
    }

    // If a token is present, the parent AuthGuard's canActivate method will handle token validation
    return super.canActivate(context);
  }
}
