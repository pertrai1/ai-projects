# Table: users

## Purpose

Stores customer account information including authentication credentials, contact details, and account metadata. This is the central table for all customer-related operations in the e-commerce system.

## Business Context

- **Owner:** Customer Success and Authentication teams
- **Sensitivity:** PII (Personally Identifiable Information) - Contains names and email addresses
- **Update frequency:** Real-time updates during registration, profile edits, and login
- **Business rules:**
  - Email must be unique across all users
  - Every order must be associated with a valid user
  - Soft deletes preferred over hard deletes for audit trail

## Columns

### id

- **Type:** integer
- **Description:** Unique identifier for each user account
- **Domain:** Sequential integers starting from 1
- **Nullable:** No (Primary Key)
- **Notes:** Auto-incremented. Never reused even if user is deleted.

### name

- **Type:** varchar(255)
- **Description:** User's full name as provided during registration
- **Domain:** UTF-8 text, typically 2-100 characters
- **Nullable:** No
- **Notes:** May contain special characters and international names. No strict validation on format.

### email

- **Type:** varchar(255)
- **Description:** User's email address used for login and notifications
- **Domain:** Valid email format (validated at application level)
- **Nullable:** No (Unique constraint)
- **Notes:** Case-insensitive uniqueness. Primary method of user identification. Used for password resets and order confirmations.

### created_at

- **Type:** timestamp
- **Description:** Timestamp when the user account was created
- **Domain:** UTC timestamps
- **Nullable:** No (Default: CURRENT_TIMESTAMP)
- **Notes:** Immutable after creation. Used for cohort analysis and user lifecycle reporting.

## Common Queries

### Query Pattern: Get recent user signups

Find users who registered within a specific time period.

```sql
-- Get users who signed up in the last 30 days
SELECT id, name, email, created_at
FROM users
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY created_at DESC;
```

**Use case:** Marketing campaigns, growth tracking, welcome email campaigns
**Returns:** List of recent users with their basic information
**Performance notes:** Indexed on created_at for efficient date range queries

### Query Pattern: Find user by email

Look up a user account by their email address (login, password reset).

```sql
-- Find user by email (case-insensitive)
SELECT id, name, email, created_at
FROM users
WHERE LOWER(email) = LOWER('user@example.com');
```

**Use case:** Authentication, account lookup, duplicate detection
**Returns:** Single user record or empty if not found
**Performance notes:** Unique index on email makes this very fast. Always use LOWER() for case-insensitive matching.

### Query Pattern: Count active users

Get total number of registered users (useful for dashboards).

```sql
-- Count total users
SELECT COUNT(*) as total_users
FROM users;
```

**Use case:** Dashboard metrics, business reporting
**Returns:** Integer count of all users
**Performance notes:** Fast count operation. Add WHERE clause if filtering by date range.

## Relationships

- **Related tables:** orders (one user has many orders)
- **Join patterns:**
  - `users.id = orders.user_id` - Get all orders for a specific user
  - Join on email is discouraged (use id instead for performance)

## Examples

Typical user record:
```
id: 12345
name: "Jane Smith"
email: "jane.smith@example.com"
created_at: 2024-12-15 14:23:45
```

Value distributions:
- id: Sequential integers, currently ranging from 1 to ~50,000
- name: Average length 15-25 characters
- email: Mix of personal (gmail, yahoo) and corporate domains
- created_at: Majority of users registered in last 2 years (80%)

## Notes

- **Data quality considerations:** ~1% of legacy imported users may have generic names like "User123" due to incomplete migration data
- **Historical context:** Table schema stable since v1.0. Email uniqueness enforced from start.
- **Known issues:** None currently
- **Security:** Passwords are NOT stored in this table - handled by separate authentication service
