# Table: {table_name}

<!--
This template provides a structure for documenting database tables.
Replace {placeholders} with actual content. Delete sections that aren't applicable.
-->

## Purpose

<!-- Brief description of what this table represents and its role in the system. -->
<!-- Example: "Stores customer account information for authentication and profile management." -->

{Brief description of the table's purpose}

## Business Context

<!-- Domain-specific information, business rules, ownership, data sensitivity -->
<!-- Example: "Owned by Customer Success team. Contains PII - handle with care. Updated during registration and profile edits." -->

- **Owner:** {Team or system responsible}
- **Sensitivity:** {Public / Internal / Confidential / PII}
- **Update frequency:** {Real-time / Batch / Manual / etc.}
- **Business rules:** {Any important business constraints or rules}

## Columns

<!-- Document important columns. You don't need to document every column if the schema JSON is clear.
Focus on columns with domain-specific meaning, constraints, or edge cases. -->

### {column_name}

- **Type:** {sql_type}
- **Description:** {Detailed description of what this column stores}
- **Domain:** {Value constraints, enum values, ranges, or format}
- **Nullable:** {Yes / No}
- **Notes:** {Edge cases, data quality issues, migration history, etc.}

<!-- Repeat for each important column -->

## Common Queries

<!-- Document typical query patterns users might want to run against this table -->

### Query Pattern: {Pattern Name}

<!-- Example: "Get active users from last 30 days" -->

{Description of when and why this query pattern is used}

```sql
-- {Brief comment about what this query does}
SELECT {columns}
FROM {table_name}
WHERE {conditions}
-- Add example query here
```

**Use case:** {When would someone run this query?}
**Returns:** {What kind of data/results does it return?}
**Performance notes:** {Any indexes, optimization tips, or warnings}

<!-- Repeat for common patterns -->

## Relationships

<!-- Document how this table relates to other tables -->

- **Related tables:** {List of frequently joined tables}
- **Join patterns:** {Common join conditions}

<!-- Example:
- **Related tables:** orders, order_items
- **Join patterns:**
  - `users.id = orders.user_id` (one user has many orders)
  - `users.id = addresses.user_id` (one user has many addresses)
-->

## Examples

<!-- Provide representative data examples or describe value distributions -->

<!-- Example:
Typical user record:
- id: Sequential integers starting from 1
- email: Standard email format, unique constraint enforced
- created_at: Mostly concentrated in last 2 years (90% of users)
- status: ~85% 'active', ~10% 'inactive', ~5% 'deleted'
-->

{Representative data patterns or example rows}

## Notes

<!-- Any additional important information -->

- **Data quality considerations:** {Known issues, cleanup needed, etc.}
- **Historical context:** {How this table evolved, migrations, etc.}
- **Known issues or limitations:** {Bugs, technical debt, workarounds}
- **Future plans:** {Planned changes, deprecations, etc.}

<!-- Example notes:
- Data quality: ~2% of records have null emails due to legacy import
- Historical: Migrated from old 'customers' table in v2.0
- Known issue: created_at sometimes incorrect for imported legacy users
-->
