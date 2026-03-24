# Database Migrations

Manual SQL migration scripts for the product import feature.

## Why Manual Migrations?

This project shares a database with multiple other projects. Using TypeORM's automatic migration system would cause conflicts in the shared migration table. Therefore, we use manual SQL scripts that can be run independently.

## Files

- `001-product-import-tables.sql` - Creates product import tables and indexes
- `001-product-import-tables.rollback.sql` - Rolls back the migration (drops tables)

## Running Migrations

### Local Development (Docker)

```bash
# Connect to PostgreSQL in Docker
docker exec -i shopdit-api-postgres psql -U postgres -d shopdit_api_development < database/migrations/001-product-import-tables.sql
```

### Direct Connection

```bash
# Using psql command
psql -h localhost -p 20000 -U postgres -d shopdit_api_development -f database/migrations/001-product-import-tables.sql

# Or connect first, then run
psql -h localhost -p 20000 -U postgres -d shopdit_api_development
\i database/migrations/001-product-import-tables.sql
```

### Remote Database

```bash
# Replace with your actual database credentials
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_NAME> -f database/migrations/001-product-import-tables.sql
```

## Rolling Back

**WARNING:** This will delete all product import data!

```bash
# Local
docker exec -i shopdit-api-postgres psql -U postgres -d shopdit_api_development < database/migrations/001-product-import-tables.rollback.sql

# Direct
psql -h localhost -p 20000 -U postgres -d shopdit_api_development -f database/migrations/001-product-import-tables.rollback.sql
```

## Verifying Migration

Check if tables were created:

```sql
-- List all product_import tables
SELECT tablename FROM pg_tables WHERE tablename LIKE 'product_import%';

-- Check table structure
\d product_import_batch
\d product_import_item

-- Verify indexes
\di product_import*
```

## What Gets Created

### Extensions
- `uuid-ossp` - For UUID generation
- `pg_trgm` - For fuzzy text matching (similarity function)

### Tables
1. **product_import_batch** - Tracks import sessions
   - 16 columns
   - 5 indexes (including 2 composite indexes)
   - Foreign keys: merchant, user

2. **product_import_item** - Stores individual product matches
   - 25 columns
   - 5 indexes (including 2 composite indexes)
   - Foreign keys: batch, product (matched & selected)
   - JSONB column for suggested products

## Troubleshooting

### Error: "relation already exists"

The migration script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. If you get this error, the tables already exist.

### Error: "extension already exists"

This is normal and safe - the script uses `CREATE EXTENSION IF NOT EXISTS`.

### Error: "foreign key constraint"

Make sure the following tables exist before running:
- `merchant`
- `user`
- `product`

### Permission Denied

Make sure your database user has CREATE privileges:
```sql
GRANT CREATE ON DATABASE shopdit_api_development TO postgres;
```

## Next Steps After Migration

1. Verify tables were created successfully
2. Update the schema design document with actual migration date
3. Start implementing the API endpoints (Phase 2)
