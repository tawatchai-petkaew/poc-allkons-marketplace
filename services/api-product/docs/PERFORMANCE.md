# Performance Optimization

## Performance Requirements

- Support **500+ concurrent users**
- Response time < 500ms for standard endpoints
- Handle bulk operations (500+ items)
- Efficient search and filtering

## Database Optimization

### Indexing Strategy

**Add indexes for:**
- WHERE clauses
- JOIN conditions
- ORDER BY columns
- Frequent searches

**B-tree Indexes (Default):**
```typescript
// Single column
@Index('idx_product_barcode', ['barcode'])

// Composite (order matters!)
@Index('idx_product_merchant_status', ['merchantId', 'status'])

// In entity
@Entity('products')
@Index('idx_product_barcode', ['barcode'])
@Index('idx_product_merchant', ['merchantId', 'status'])
export class Product {
  // ...
}
```

**GIN Trigram (for ILIKE searches):**
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Single column
CREATE INDEX idx_product_name_trgm
ON products USING GIN (name gin_trgm_ops);

-- Multiple columns need separate indexes
CREATE INDEX idx_product_brand_trgm
ON products USING GIN (brand gin_trgm_ops);
```

**Partial Indexes:**
```sql
-- Only index active products
CREATE INDEX idx_active_products
ON products(merchant_id, status)
WHERE status = 'ACTIVE';
```

**When to Use:**
- B-tree: Exact matches, ranges, sorting
- GIN trigram: `ILIKE '%search%'` queries
- Partial: Frequently filtered subsets

### Query Optimization

**Select Only Needed Columns:**
```typescript
// ❌ Selects everything
const products = await repo.find({ where: { merchantId } });

// ✅ Select specific columns
const products = await repo
  .createQueryBuilder('p')
  .select(['p.id', 'p.name', 'p.price'])
  .where('p.merchantId = :merchantId', { merchantId })
  .getMany();
```

**Conditional Heavy Fields:**
```typescript
// Only load JSONB when filtering by status
if (matchStatus) {
  query.addSelect('item.suggestedProducts');
}
```

**Pagination:**
```typescript
const [items, total] = await repo.findAndCount({
  where: { merchantId },
  skip: (page - 1) * limit,
  take: limit,
  order: { createdAt: 'DESC' }
});

return {
  items,
  total,
  page,
  totalPages: Math.ceil(total / limit)
};
```

### Avoiding N+1 Queries

**Problem:**
```typescript
// ❌ N+1 - Queries database N times
const orders = await orderRepo.find({ where: { merchantId } });
for (const order of orders) {
  order.product = await productRepo.findOne({
    where: { id: order.productId }
  });
}
```

**Solution 1: In() Operator**
```typescript
// ✅ 2 queries total
const orders = await orderRepo.find({ where: { merchantId } });
const productIds = orders.map(o => o.productId);
const products = await productRepo.find({
  where: { id: In(productIds) }
});

// Map products to orders
const productMap = new Map(products.map(p => [p.id, p]));
orders.forEach(o => {
  o.product = productMap.get(o.productId);
});
```

**Solution 2: Eager Loading**
```typescript
// ✅ 1 query with JOIN
const orders = await orderRepo.find({
  where: { merchantId },
  relations: ['product']
});
```

### Batching Large Operations

**Insert/Update Batching:**
```typescript
const BATCH_SIZE = 500;

// ✅ Batch inserts
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await repo
    .createQueryBuilder()
    .insert()
    .into(Product)
    .values(batch)
    .execute();
}

// ✅ Batch updates
for (let i = 0; i < ids.length; i += BATCH_SIZE) {
  const batchIds = ids.slice(i, i + BATCH_SIZE);
  await repo.update(
    { id: In(batchIds) },
    { status: 'PROCESSED' }
  );
}
```

## Caching Strategy

### Redis Caching

**Cache Manager Setup:**
```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getProducts(merchantId: number) {
    const cacheKey = `products:${merchantId}`;

    // 1. Check cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // 2. Query database
    const products = await this.repo.find({ where: { merchantId } });

    // 3. Cache with TTL
    await this.cacheManager.set(cacheKey, products, 300); // 5min

    return products;
  }
}
```

**TTL Guidelines:**
- Static data: 3600s (1 hour)
- Semi-static: 300s (5 minutes)
- Dynamic: 60s (1 minute)
- Real-time: 10s or no cache

**Cache Invalidation:**
```typescript
// Invalidate on update
async updateProduct(id: number, data: any) {
  const product = await this.repo.findOne({ where: { id } });

  await this.repo.update(id, data);

  // Clear cache
  await this.cacheManager.del(`product:${id}`);
  await this.cacheManager.del(`products:${product.merchantId}`);

  return this.repo.findOne({ where: { id } });
}
```

### Guard Caching

**Token Caching:**
```typescript
// Hash token before caching
const tokenHash = createHash('sha256').update(token).digest('hex');

// Cache verified token (2min)
await this.cacheManager.set(
  `auth:${tokenHash}`,
  userData,
  120
);
```

**Merchant Access Caching:**
```typescript
// Cache merchant access (5min)
await this.cacheManager.set(
  `merchant:${userId}:${merchantSlug}`,
  merchant,
  300
);
```

## Concurrency Optimization

### Pessimistic Locking

**For Critical Updates:**
```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // Lock rows for update
  const items = await queryRunner.manager.find(Entity, {
    where: { id: In(ids) },
    lock: { mode: 'pessimistic_write' }
  });

  // Update safely
  items.forEach(item => item.status = 'PROCESSING');
  await queryRunner.manager.save(items);

  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

### Atomic Updates

**Use WHERE conditions:**
```typescript
// ✅ Atomic - only updates if current status is PENDING
const result = await repo
  .createQueryBuilder()
  .update(Entity)
  .set({ status: 'PROCESSING' })
  .where('id = :id', { id })
  .andWhere('status = :currentStatus', { currentStatus: 'PENDING' })
  .execute();

// Check if actually updated
if (result.affected === 0) {
  throw new ConflictException('Item already processed');
}
```

## Performance Checklist

Before committing:
- [ ] Indexes on all WHERE/JOIN/ORDER BY columns
- [ ] GIN trigram for ILIKE searches
- [ ] Batching for bulk operations (500 items max)
- [ ] No N+1 queries (use `In()` or eager loading)
- [ ] Redis caching with appropriate TTL
- [ ] Pagination for large result sets
- [ ] Conditional selection of heavy fields (JSONB)
- [ ] Pessimistic locks for critical updates
- [ ] Atomic updates with WHERE conditions

## Monitoring

**Query Performance:**
```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

**Application Monitoring:**
- Sentry for error tracking
- Custom metrics for critical paths
- Response time tracking
