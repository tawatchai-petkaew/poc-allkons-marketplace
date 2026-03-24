# Version Management Guide

**Simple guide for tracking requirement changes in handoff documents**

---

## 📝 The Simple Way: Changelog Table

Every handoff document now has a **Change Log table** at the top. Just add a new row when requirements change!

### Example: PRD Change Log

```markdown
# PRD: Product Bulk Edit

## Change Log
| Version | Date | Changes | Updated By |
|---------|------|---------|------------|
| v1.2 | 2026-03-10 | Increased batch limit from 100 to 500 products | Jane (PO) |
| v1.1 | 2026-03-05 | Added PDF export functionality | Jane (PO) |
| v1.0 | 2024-03-01 | Initial version - bulk edit for price, stock, category | Jane (PO) |
```

**That's it!** No complex tools, just add a row.

---

## 🎯 When to Update the Changelog

### ✅ Update When:
- **Requirements change** (user stories added/removed/changed)
- **Acceptance criteria change** (stricter/looser validation)
- **Business rules change** (limits, thresholds, logic)
- **Scope changes** (features added/removed from release)

### ❌ Don't Update For:
- **Typos** (just fix it)
- **Grammar/formatting** (just fix it)
- **Clarifications** (unless they change meaning)

---

## 🔄 Simple Workflow

### Small Change (< 20% of document)

**Just edit and log it:**

1. **Edit document directly**
   ```bash
   vim docs/features/product-bulk-edit/01-prd.md
   ```

2. **Add row to changelog table** (at the top)
   ```markdown
   | v1.1 | 2026-03-05 | Added PDF export requirement | Jane (PO) |
   ```

3. **Update status** (if needed)
   ```markdown
   ## Status
   🟡 In Review - v1.1 - Updated requirements, needs re-approval
   ```

4. **Done!** That simple.

---

### Major Change (> 50% of document)

**Save a backup first:**

1. **Make a copy manually** (before editing)
   ```bash
   # Simple copy with date
   cp features/product-bulk-edit/01-prd.md \
      features/product-bulk-edit/01-prd-BACKUP-2026-03-05.md
   ```

2. **Edit the current document**
   ```bash
   vim features/product-bulk-edit/01-prd.md
   ```

3. **Add row to changelog**
   ```markdown
   | v2.0 | 2026-03-10 | Major redesign - changed from bulk edit to batch processing system | Jane (PO) |
   ```

4. **Reference the backup** (optional, in changelog)
   ```markdown
   | v2.0 | 2026-03-10 | Major redesign - see [v1.0 backup](./01-prd-BACKUP-2026-03-05.md) | Jane (PO) |
   ```

5. **Done!** Backup preserved, current updated.

---

## 📊 Real Example

### Before (v1.0):
```markdown
**FR-001: Product Selection**
- Max 100 products per batch
```

### Change Requested:
"We need to support 500 products per batch now"

### What to Do:

**1. Update Changelog:**
```markdown
## Change Log
| Version | Date | Changes | Updated By |
|---------|------|---------|------------|
| v1.1 | 2026-03-10 | Increased batch limit: 100→500 products | Sarah (BA) |
| v1.0 | 2024-03-02 | Initial version | Sarah (BA) |
```

**2. Update Business Rule:**
```markdown
**FR-001: Product Selection**
- Max 500 products per batch (updated 2026-03-10)
```

**3. Update Status:**
```markdown
## Status
🟡 In Review - v1.1 - Business rule updated, needs stakeholder approval
```

**Done!** Crystal clear what changed and when.

---

## 🤝 Team Communication

When you update requirements, **notify affected roles**:

### PRD Updated (PO changes)
→ Notify **BA** (needs to update BRD)

```markdown
## Change Log
| v1.1 | 2026-03-10 | Added PDF export - @BA please update BRD | Jane (PO) |
```

### BRD Updated (BA changes)
→ Notify **Designer + Developer** (may affect design/implementation)

```markdown
## Change Log
| v1.1 | 2026-03-10 | Updated API contract - @Dev check compatibility | Sarah (BA) |
```

### Design Updated (Designer changes)
→ Notify **Developer** (implementation may need changes)

### Implementation Updated (Dev changes)
→ Notify **QA** (tests may need updates)

---

## 📁 File Organization Options

### Option 1: Keep Backups in Same Folder (Simple)
```
features/product-bulk-edit/
├── 01-prd.md                      ← Current version (always edit this)
├── 01-prd-BACKUP-2026-03-05.md   ← Backup before major change
├── 02-brd.md                      ← Current version
└── 02-brd-BACKUP-2026-03-05.md   ← Backup
```

**Pros**: Simple, visible, no subfolders
**Cons**: Folder gets messy with many backups

---

### Option 2: Use History Folder (Cleaner)
```
features/product-bulk-edit/
├── 01-prd.md              ← Current version (always edit this)
├── 02-brd.md              ← Current version
└── history/               ← Archived versions
    ├── 01-prd-v1.0.md
    ├── 01-prd-v1.1.md
    └── 02-brd-v1.0.md
```

**Pros**: Clean structure, clear history
**Cons**: One extra folder

**Manual copy:**
```bash
mkdir -p features/product-bulk-edit/history
cp features/product-bulk-edit/01-prd.md \
   features/product-bulk-edit/history/01-prd-v1.0.md
```

---

## 🎯 Best Practices

### 1. **Use Semantic Versioning**
- `v1.0` → `v1.1` - Minor change (small additions, clarifications)
- `v1.1` → `v2.0` - Major change (redesign, breaking changes)

### 2. **Be Specific in Changelog**
❌ Bad: "Updated requirements"
✅ Good: "Increased batch limit from 100 to 500 products"

### 3. **Keep Current File Clean**
- The `01-prd.md` (no suffix) is ALWAYS the current version
- Backups have dates/versions in filename

### 4. **Link Related Changes**
```markdown
| v1.2 | 2026-03-10 | Updated based on BRD v1.1 feedback | Jane (PO) |
```

### 5. **Update Status**
```markdown
🟡 In Review - v1.2 - Waiting for stakeholder approval
🟢 Approved - v1.0 - Ready for next role
🔴 Blocked - v1.1 - Needs API clarification from backend team
```

---

## 🔍 Quick Reference

| Action | Method | Tool Needed? |
|--------|--------|--------------|
| **Small change** | Edit directly + update changelog | No, just edit |
| **Big change** | Copy file first with `cp`, then edit + changelog | No, just `cp` command |
| **Find what changed** | Read changelog table | No |
| **Compare versions** | Read backup file vs current | No |
| **Restore old version** | Copy backup back to current | No, just `cp` |

---

## ❓ FAQ

**Q: Do I need to use git?**
A: No! Changelog table + optional backups are enough.

**Q: What if I forget to backup before editing?**
A: Just add the change to changelog. For next time, remember to backup first for major changes.

**Q: Can I delete old backups?**
A: Yes, after module is released and stable. Keep at least the last major version.

**Q: How do I know if a change is "major"?**
A: If it invalidates existing work (Design/Implementation), it's major. When in doubt, backup first.

**Q: Should every role use changelog?**
A: Yes! PO (PRD), BA (BRD), Designer (Design), Dev (Implementation), QA (Test Plan) - all should track changes.

---

## 💡 Pro Tip

**Before you start editing a document with major changes:**

```bash
# Quick backup (one line!)
cp docs/modules/[module-name]/prd.md docs/modules/[module-name]/prd-backup-$(date +%Y-%m-%d).md
```

Now edit fearlessly! You have a backup.

---

## 📚 Related Docs

- [`docs/modules/README.md`](docs/modules/README.md) - Module-based structure guide
- [`docs/HANDOFF-MIGRATION.md`](docs/HANDOFF-MIGRATION.md) - Why we use module folders and version management

---

**Remember**: The changelog table is your friend. Just add a row when things change! 🎯
