# Database & Migrations

## TypeORM 0.3.20

**Breaking Changes from 0.2.x:**
- `Connection` → `DataSource`
- `connection.getRepository()` → `dataSource.getRepository()`

## Database Configuration

**PostgreSQL** with SSL enabled for production

**Connection:**
```typescript
import { DataSource } from 'typeorm';

@Injectable()
export class YourService {
  constructor(private readonly dataSource: DataSource) {}

  async query() {
    const repo = this.dataSource.getRepository(Entity);
    return repo.find();
  }
}
```

**Configuration:** `src/config/data-source.ts`

## Migrations

### Location
- Migrations: `src/migration/` (320+ files)
- Entities: `src/model/` (170+ files)

### Commands

```bash
# Generate migration
yarn pretypeorm                              # Generate ormconfig.json
yarn typeorm:migration:generate -- -n Name

# Run migrations
yarn typeorm:migration:run                   # Local
yarn docker:migration:run                    # Docker

# Revert migration
yarn typeorm:migration:revert
```

### Migration Workflow

1. **Modify entity** in `src/model/*.entity.ts`
2. **Generate:** `yarn pretypeorm && yarn typeorm:migration:generate -- -n DescriptiveName`
3. **Review** generated migration
4. **Test:** `yarn typeorm:migration:run`
5. **Commit** both entity and migration

### Migration Examples

**Add Index:**
```sql
-- Create index
CREATE INDEX IF NOT EXISTS idx_product_barcode
ON products(barcode)
WHERE barcode IS NOT NULL;

-- GIN trigram for ILIKE
CREATE INDEX IF NOT EXISTS idx_product_name_trgm
ON products USING GIN (name gin_trgm_ops);

-- Composite index
CREATE INDEX IF NOT EXISTS idx_product_merchant_status
ON products(merchant_id, status);
```

**Add Column:**
```sql
-- Add column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS new_field VARCHAR(255);

-- Add with default
ALTER TABLE products
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
```

**Rollback File:**
Create `XXX-migration-name-rollback.sql` for each migration:
```sql
-- Rollback: Remove indexes
DROP INDEX IF EXISTS idx_product_barcode;
DROP INDEX IF EXISTS idx_product_name_trgm;
```

## Index Strategy

### When to Add Indexes

Add indexes for columns used in:
- WHERE clauses
- JOIN conditions
- ORDER BY clauses
- Frequent searches

### Index Types

**B-tree (Default):**
```typescript
@Index('idx_product_barcode', ['barcode'])
```

**Composite:**
```typescript
@Index('idx_product_merchant_status', ['merchantId', 'status'])
```

**GIN Trigram (for ILIKE):**
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_name_trgm ON products USING GIN (name gin_trgm_ops);
```

**Partial Index:**
```sql
CREATE INDEX idx_active_products
ON products(status)
WHERE status = 'ACTIVE';
```

## Seeding

```bash
# Seed all data
yarn start:dev:db:seed

# Seed specific
yarn start:dev:db:seed:permissions
yarn start:dev:db:seed:role-permissions
```

Seeds located in `src/scripts/`

## Transaction Patterns

**Standard Pattern:**
```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // 1. Query with lock
  const items = await queryRunner.manager.find(Entity, {
    where: { id: In(ids) },
    lock: { mode: 'pessimistic_write' }
  });

  // 2. Update
  await queryRunner.manager.save(items);

  // 3. Commit
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release(); // ALWAYS!
}
```

**Batch Processing with Transactions:**
```typescript
// Process large dataset in chunks
const CHUNK_SIZE = 100;
for (let i = 0; i < items.length; i += CHUNK_SIZE) {
  const chunk = items.slice(i, i + CHUNK_SIZE);

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    for (const item of chunk) {
      await queryRunner.manager.save(item);
    }
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

## Common Queries

**Avoid N+1:**
```typescript
// ❌ N+1
for (const order of orders) {
  order.product = await productRepo.findOne({ where: { id: order.productId } });
}

// ✅ Batch query
const productIds = orders.map(o => o.productId);
const products = await productRepo.find({
  where: { id: In(productIds) }
});
const productMap = new Map(products.map(p => [p.id, p]));
orders.forEach(o => o.product = productMap.get(o.productId));
```

**Pagination:**
```typescript
const [items, total] = await repo.findAndCount({
  where: { merchantId },
  skip: (page - 1) * limit,
  take: limit,
  order: { createdAt: 'DESC' }
});
```
