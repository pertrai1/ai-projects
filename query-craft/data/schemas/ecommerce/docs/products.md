# Table: products

## Purpose

Maintains the product catalog including pricing, inventory levels, and categorization. This table represents all items available for purchase in the e-commerce store.

## Business Context

- **Owner:** Catalog Management and Inventory teams
- **Sensitivity:** Internal (pricing and inventory are business-sensitive)
- **Update frequency:** Batch updates nightly for prices; real-time for inventory
- **Business rules:**
  - Price must be positive (> 0)
  - Stock levels update on every order and restock
  - Products are never deleted, only marked as discontinued (soft delete pattern)
  - Category taxonomy is managed separately but referenced here

## Columns

### id

- **Type:** integer
- **Description:** Unique identifier for each product
- **Domain:** Sequential integers starting from 1
- **Nullable:** No (Primary Key)
- **Notes:** Auto-incremented. Product IDs are stable and never reused.

### name

- **Type:** varchar(255)
- **Description:** Display name of the product shown to customers
- **Domain:** UTF-8 text, typically 10-100 characters
- **Nullable:** No
- **Notes:** Searchable field. Should be descriptive and include key product attributes. Marketing team has write access.

### price

- **Type:** decimal(10,2)
- **Description:** Current selling price in USD
- **Domain:** Positive decimal numbers with 2 decimal places (0.01 to 99,999,999.99)
- **Nullable:** No
- **Notes:** Represents final price including any base discounts. Promotional pricing handled separately. Historical prices not tracked in this table.

### category

- **Type:** varchar(100)
- **Description:** Product category for filtering and navigation
- **Domain:** Predefined categories (electronics, clothing, books, home, toys, etc.)
- **Nullable:** Yes (can be NULL for uncategorized products)
- **Notes:** Free-text field currently, migration to foreign key planned. Case-sensitive. Inconsistent capitalization exists in legacy data.

### stock

- **Type:** integer
- **Description:** Current available inventory count
- **Domain:** Non-negative integers (0 to 999,999)
- **Nullable:** Yes (Default: 0)
- **Notes:** Real-time inventory. 0 = out of stock. Negative values indicate data issues. Updated transactionally with orders.

## Common Queries

### Query Pattern: Get products by category

Find all products in a specific category for browse pages.

```sql
-- Get all electronics products in stock
SELECT id, name, price, stock
FROM products
WHERE category = 'electronics'
  AND stock > 0
ORDER BY name;
```

**Use case:** Category browse pages, filtered product listings
**Returns:** List of products with pricing and availability
**Performance notes:** No index on category currently. Consider adding for large catalogs.

### Query Pattern: Low stock alert

Identify products that need restocking.

```sql
-- Find products with low inventory (< 10 units)
SELECT id, name, category, stock, price
FROM products
WHERE stock < 10
  AND stock > 0
ORDER BY stock ASC, name;
```

**Use case:** Inventory management, reorder alerts, warehouse operations
**Returns:** Products running low on stock
**Performance notes:** Full table scan. Run during off-peak hours for large catalogs.

### Query Pattern: Price range filter

Find products within a price range (common e-commerce filter).

```sql
-- Get products between $10 and $50
SELECT id, name, price, category, stock
FROM products
WHERE price BETWEEN 10.00 AND 50.00
  AND stock > 0
ORDER BY price ASC;
```

**Use case:** Price filter on product listing pages
**Returns:** Products within specified price range
**Performance notes:** Consider index on (price, stock) for common price range queries.

### Query Pattern: Search products by name

Text search in product names.

```sql
-- Find products matching search term
SELECT id, name, price, category, stock
FROM products
WHERE name ILIKE '%laptop%'
  AND stock > 0
ORDER BY name;
```

**Use case:** Product search, autocomplete
**Returns:** Products matching search term
**Performance notes:** ILIKE is case-insensitive but slower. Consider full-text search for production.

## Relationships

- **Related tables:** orders (indirectly through order_items, not in current schema)
- **Join patterns:**
  - Typically standalone queries
  - Future: JOIN with order_items for purchase history analysis

## Examples

Typical product records:
```
1. Electronics:
   id: 101
   name: "Wireless Bluetooth Headphones"
   price: 79.99
   category: "electronics"
   stock: 45

2. Books:
   id: 205
   name: "The Great Gatsby"
   price: 12.99
   category: "books"
   stock: 0  (out of stock)

3. Uncategorized:
   id: 542
   name: "Mystery Box"
   price: 25.00
   category: NULL
   stock: 5
```

Value distributions:
- price: Range from $0.99 to $1,999.99, median ~$35
- stock: 60% products have stock > 0, 40% out of stock
- category: Top categories: electronics (30%), clothing (25%), books (20%), other (25%)

## Notes

- **Data quality considerations:**
  - ~5% of products have inconsistent category capitalization ("Electronics" vs "electronics")
  - Some legacy products have $0.00 price (discontinued items)
  - Negative stock values indicate data sync issues with inventory system
- **Historical context:** Stock tracking added in v1.2, previously manual
- **Known issues:** Category field needs normalization to foreign key (planned for Q1 2026)
- **Performance:** Large catalogs (100K+ products) may need partitioning by category
