# Table: orders

## Purpose

Records all customer orders including order totals, status tracking, and timestamps. This table is the core of the order management system and links customers to their purchases.

## Business Context

- **Owner:** Order Management and Fulfillment teams
- **Sensitivity:** Confidential (contains order history and purchase amounts)
- **Update frequency:** Real-time during checkout; batch updates for status changes
- **Business rules:**
  - Every order must belong to a valid user (foreign key constraint)
  - Order total must match sum of line items (validated at application level)
  - Status transitions follow defined workflow: pending → shipped → delivered
  - Cancelled orders retain status='cancelled' permanently (no deletion)
  - Orders are immutable after creation (except status field)

## Columns

### id

- **Type:** integer
- **Description:** Unique order identifier
- **Domain:** Sequential integers starting from 1
- **Nullable:** No (Primary Key)
- **Notes:** Auto-incremented. Used in customer communications ("Order #12345"). Never reused.

### user_id

- **Type:** integer
- **Description:** Reference to the user who placed this order
- **Domain:** Must exist in users.id
- **Nullable:** No (Foreign Key to users.id)
- **Notes:** Indexed for fast user order lookups. Cannot be changed after order creation.

### total

- **Type:** decimal(10,2)
- **Description:** Total order amount including taxes and shipping
- **Domain:** Positive decimal (0.01 to 99,999,999.99)
- **Nullable:** No
- **Notes:** Denormalized for performance. Should match line items sum but discrepancies may exist in legacy data.

### status

- **Type:** varchar(50)
- **Description:** Current order fulfillment status
- **Domain:** Enum-like values: 'pending', 'shipped', 'delivered', 'cancelled'
- **Nullable:** Yes (Default: 'pending')
- **Notes:** Tracks order through fulfillment pipeline. Status transitions logged separately. Case-sensitive.

### created_at

- **Type:** timestamp
- **Description:** Timestamp when order was placed
- **Domain:** UTC timestamps
- **Nullable:** Yes (Default: CURRENT_TIMESTAMP)
- **Notes:** Immutable. Used for order history, analytics, and delivery estimates. Indexed for date range queries.

## Common Queries

### Query Pattern: Get user order history

Retrieve all orders for a specific customer.

```sql
-- Get all orders for a user, most recent first
SELECT id, total, status, created_at
FROM orders
WHERE user_id = 12345
ORDER BY created_at DESC;
```

**Use case:** Customer account page, order history view, customer service lookup
**Returns:** Chronological list of user's orders
**Performance notes:** Indexed on user_id. Very fast even for users with many orders.

### Query Pattern: Find pending orders

Get orders awaiting fulfillment.

```sql
-- Find all pending orders (needs processing)
SELECT id, user_id, total, created_at
FROM orders
WHERE status = 'pending'
ORDER BY created_at ASC;
```

**Use case:** Order fulfillment queue, warehouse picking lists, operations dashboard
**Returns:** Orders waiting to be processed, oldest first
**Performance notes:** Consider compound index on (status, created_at) for large order volumes.

### Query Pattern: Recent orders

Get orders from a specific time period for reporting.

```sql
-- Get orders from last 7 days
SELECT COUNT(*) as order_count,
       SUM(total) as revenue,
       AVG(total) as avg_order_value
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  AND status != 'cancelled';
```

**Use case:** Daily/weekly sales reports, revenue tracking, business analytics
**Returns:** Aggregated metrics for recent orders
**Performance notes:** Indexed on created_at. Exclude cancelled orders for revenue calculations.

### Query Pattern: High value orders

Identify large orders for special handling or fraud review.

```sql
-- Find high-value orders (> $500)
SELECT id, user_id, total, status, created_at
FROM orders
WHERE total > 500.00
  AND status = 'pending'
ORDER BY total DESC;
```

**Use case:** Fraud detection, VIP customer service, special fulfillment
**Returns:** Expensive orders needing attention
**Performance notes:** No index on total currently. Add if frequently filtered by amount.

### Query Pattern: Orders with user details

Join with users table to get customer information.

```sql
-- Get pending orders with customer details
SELECT o.id as order_id,
       o.total,
       o.created_at,
       u.name,
       u.email
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending'
ORDER BY o.created_at ASC;
```

**Use case:** Customer service, order notifications, fulfillment with customer contact
**Returns:** Orders enriched with user information
**Performance notes:** Efficient join due to foreign key index on user_id.

## Relationships

- **Related tables:** users (many orders belong to one user)
- **Join patterns:**
  - `orders.user_id = users.id` - Primary relationship for getting customer details
  - Common to filter orders by date range and join with users for reporting

## Examples

Typical order records:
```
1. Recent pending order:
   id: 1001
   user_id: 42
   total: 127.50
   status: "pending"
   created_at: 2024-12-24 10:15:00

2. Delivered order:
   id: 995
   user_id: 33
   total: 45.99
   status: "delivered"
   created_at: 2024-12-20 14:30:00

3. Cancelled order:
   id: 888
   user_id: 42
   total: 299.00
   status: "cancelled"
   created_at: 2024-12-18 09:00:00
```

Value distributions:
- total: Range from $5 to $2,000, average ~$75, median ~$50
- status: ~30% pending, ~50% delivered, ~15% shipped, ~5% cancelled
- created_at: Peaks during holiday seasons and weekends
- user_id: ~70% of users have 1-2 orders, ~20% have 3-5, ~10% are repeat customers (6+)

## Notes

- **Data quality considerations:**
  - ~0.5% of orders have mismatched totals vs. line items (legacy import issue)
  - Some test orders exist with total=$0.01 from development
  - Status transitions not always logged in audit table for orders before v1.5
- **Historical context:**
  - Originally tracked more detailed status (processing, packed, in_transit) but simplified to current 4 states
  - Foreign key constraint on user_id enforced from v1.0
- **Known issues:**
  - No cascade delete - if user is deleted, their orders remain orphaned (intentional for audit)
  - Missing shipped_at and delivered_at timestamp fields (only have created_at)
- **Performance:**
  - Indexes on: user_id, created_at
  - Consider partitioning by created_at for multi-year data
  - Archive old delivered orders annually to separate table
