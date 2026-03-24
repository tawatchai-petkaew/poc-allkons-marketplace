# Documentation

This directory contains detailed technical documentation for the Allkons Marketplace API.

## Quick Start

**New to the project?** Start here:
1. Read [../CLAUDE.md](../CLAUDE.md) - Essential guidelines and quick reference
2. Browse topics below based on your needs

## Documentation Structure

### [ARCHITECTURE.md](ARCHITECTURE.md)
Module organization, directory structure, and architectural patterns.

**Read this when:**
- Understanding the dual-version (V1/V2) architecture
- Finding where specific features live
- Learning about authentication flow
- Understanding multi-tenancy implementation

### [DATABASE.md](DATABASE.md)
TypeORM patterns, migrations, transactions, and database optimization.

**Read this when:**
- Creating or running migrations
- Writing database queries
- Implementing transactions
- Optimizing database performance
- Understanding TypeORM 0.3.20 patterns

### [SECURITY.md](SECURITY.md)
Security guidelines, OWASP Top 10 compliance, guards, and authentication.

**Read this when:**
- Implementing authentication/authorization
- Creating new API endpoints
- Handling user input
- Implementing guards
- Ensuring OWASP compliance

### [PERFORMANCE.md](PERFORMANCE.md)
Performance optimization, caching, indexing, and concurrency handling.

**Read this when:**
- Optimizing slow queries
- Implementing caching
- Adding database indexes
- Handling bulk operations
- Supporting high concurrent users (500+)

## Additional Resources

- **Main Guide:** [../CLAUDE.md](../CLAUDE.md)
- **Plans:** `../.claude/tasks/`
- **Custom Commands:** `../.claude/commands/`
- **Migration Files:** `../src/migration/`
- **Entity Models:** `../src/model/`

## Contributing

When adding new patterns or conventions:
1. Update the relevant documentation file
2. Add examples with code snippets
3. Include both ✅ correct and ❌ incorrect patterns
4. Update [../CLAUDE.md](../CLAUDE.md) if it's a critical pattern
