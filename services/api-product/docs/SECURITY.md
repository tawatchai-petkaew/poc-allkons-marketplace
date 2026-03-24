# Security Guidelines

## OWASP Top 10 Compliance

### A01: Broken Access Control

**Guards:**
```typescript
@Controller('v1/products')
@UseGuards(ActJwtGuard, MerchantGuard)
export class ProductController {
  @Get()
  async listProducts(@CurrentMerchant() merchant: Merchant) {
    // Guard ensures:
    // 1. User is authenticated (ActJwtGuard)
    // 2. User has access to merchant (MerchantGuard)

    // ALWAYS filter by merchantId
    return this.productService.find({ merchantId: merchant.id });
  }
}
```

**Merchant Ownership Validation:**
```typescript
// ✅ ALWAYS verify ownership
const batch = await this.repo.findOne({
  where: {
    uuid: batchUuid,
    merchantId: merchant.id  // Ensures user owns this resource
  }
});

if (!batch) {
  throw new NotFoundException('Batch not found');
}
```

### A02: Cryptographic Failures

**Hashing Sensitive Data:**
```typescript
import { createHash } from 'crypto';

// ✅ Hash tokens before caching
const cacheKey = createHash('sha256')
  .update(accessToken)
  .digest('hex');

await this.cacheManager.set(cacheKey, userData, 120);
```

**No Sensitive Data in Logs:**
```typescript
// ❌ WRONG
this.logger.log(`User logged in: ${user.password}`);

// ✅ CORRECT
this.logger.log(`User logged in: ${user.id}`);
```

### A03: Injection

**SQL Injection Prevention:**
```typescript
// ❌ DANGEROUS - SQL Injection!
const query = `SELECT * FROM users WHERE name = '${userName}'`;

// ✅ SAFE - Parameterized query
const users = await repo
  .createQueryBuilder('user')
  .where('user.name = :name', { name: userName })
  .getMany();

// ✅ SAFE - ILIKE search
.where('user.name ILIKE :search', { search: `%${term}%` })
```

**Input Validation:**
```typescript
import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class SearchDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
```

### A04: Insecure Design

**Rate Limiting:**
- Configured at infrastructure level
- Auth endpoints have stricter limits

**Input Validation at DTO:**
```typescript
// Validate BEFORE processing
@Post()
async create(@Body() dto: CreateProductDto) {
  // class-validator ensures data is safe
  return this.service.create(dto);
}
```

### A05: Security Misconfiguration

**CORS:**
```typescript
// main.ts
app.enableCors({
  origin: true,        // Configure properly for production
  credentials: true
});
```

**Error Handling:**
```typescript
// ❌ WRONG - Exposes internals
throw new Error(`Database error: ${dbError.stack}`);

// ✅ CORRECT - Generic message
throw new InternalServerErrorException('Operation failed');
```

### A07: Authentication Failures

**ActJwtGuard Pattern:**
```typescript
@Injectable()
export class ActJwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extract token from cookie or header
    const token = request.cookies?.accessToken ||
      request.headers.authorization?.replace('Bearer ', '');

    // 2. Check cache (SHA256 hash)
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const cached = await this.cacheManager.get(tokenHash);
    if (cached) {
      request.user = cached;
      return true;
    }

    // 3. Verify with JWKS
    const decoded = await this.verifyToken(token);

    // 4. Cache verified token (2min TTL)
    await this.cacheManager.set(tokenHash, decoded, 120);

    request.user = decoded;
    return true;
  }
}
```

**MerchantGuard Pattern:**
```typescript
@Injectable()
export class MerchantGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1. Extract merchant slug from params or header
    const merchantSlug = request.params.merchantSlug ||
      request.headers['currentmerchantslug'];

    // 2. Check cache (5min TTL)
    const cacheKey = `merchant:${user.id}:${merchantSlug}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      request.merchant = cached;
      return true;
    }

    // 3. Verify user has access to merchant
    const merchant = await this.dataSource
      .getRepository(Merchant)
      .createQueryBuilder('m')
      .innerJoin('user_merchants_merchant', 'umm', 'umm.merchantId = m.id')
      .where('umm.userId = :userId', { userId: user.id })
      .andWhere('m.slug = :slug', { slug: merchantSlug })
      .getOne();

    if (!merchant) {
      throw new ForbiddenException('Access denied');
    }

    // 4. Cache result
    await this.cacheManager.set(cacheKey, merchant, 300);

    request.merchant = merchant;
    return true;
  }
}
```

### A09: Logging Failures

**Security Event Logging:**
```typescript
// Log authentication failures
this.logger.warn(`Failed login attempt: ${email} from ${ip}`);

// Log permission denials
this.logger.warn(`Access denied: user ${userId} to merchant ${merchantId}`);

// Use Sentry for errors
Sentry.captureException(error);
```

**What NOT to Log:**
- Passwords
- Access tokens
- Credit card numbers
- Personal identifiable information

## Authentication Flow

**Cookie-based Session:**
```typescript
// Set cookie (httpOnly, secure)
response.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 3600000 // 1 hour
});
```

**JWT Verification:**
- JWKS-based with Keycloak
- Redis caching for verified tokens (2min)
- Automatic token refresh

## Permission System

**UserOrgPermissionGuard:**
```typescript
@UseGuards(ActJwtGuard, UserOrgPermissionGuard)
@RequireUserOrgPermissions('products:write')
async createProduct() {
  // User has permission
}
```

## Security Checklist

Before committing:
- [ ] Guards applied (`ActJwtGuard`, `MerchantGuard`)
- [ ] Merchant ownership validated (`where: { merchantId }`)
- [ ] Input validation with `class-validator`
- [ ] Parameterized queries (no SQL injection)
- [ ] No sensitive data in logs
- [ ] Sensitive data hashed before caching
- [ ] Error messages don't expose internals
- [ ] No hardcoded secrets (use env vars)
