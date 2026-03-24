import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
// export class AuthCenterGuard implements CanActivate {
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const authorization = request.headers.authorization;
//     const appId = request.headers['app-id'];

//     if (authorization) {
//       if (!authorization.startsWith('Bearer '))
//         throw new UnauthorizedException(
//           "Authorization header must start with 'Bearer '",
//         );
//       const token = authorization.split(' ')[1];
//       const decoded: any = jwt.decode(token);

//       if (!decoded) {
//         throw new UnauthorizedException('Invalid token');
//       }

//       // Check if token is expired
//       let isTokenExpired = false;
//       if (decoded.exp) {
//         const currentTime = Math.floor(Date.now() / 1000);
//         if (decoded.exp <= currentTime) {
//           isTokenExpired = true;
//         }
//       }

//       Object.assign(request, {
//         authPayload: decoded,
//         user: {
//           userId: decoded.userId,
//           organizeId: decoded?.organizeId,
//           organizationId: decoded?.organizationId,
//         },
//         isTokenExpired: isTokenExpired,
//         platform:
//           appId === process.env.APP_ID_SELLER
//             ? Platform.SELLER
//             : appId === process.env.APP_ID_MARKETPLACE
//             ? Platform.MARKETPLACE
//             : Platform.BUYER,
//       });
//     }
//     return request;
//   }
// }
