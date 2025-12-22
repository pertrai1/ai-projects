import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "fs";

const DB_DIR = "./data/databases";
const DB_PATH = `${DB_DIR}/ecommerce.db`;

// Create databases directory if it doesn't exist
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// Create database
const db = new Database(DB_PATH);

console.log("Creating ecommerce database...\n");

// Create tables
console.log("Creating tables...");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log("✓ Tables created\n");

// Insert sample data
console.log("Inserting sample data...");

// Users
const insertUser = db.prepare(`
  INSERT INTO users (name, email, created_at)
  VALUES (?, ?, ?)
`);

const users = [
  ["Alice Johnson", "alice@example.com", "2024-01-15 10:30:00"],
  ["Bob Smith", "bob@example.com", "2024-02-20 14:22:00"],
  ["Carol White", "carol@example.com", "2024-03-10 09:15:00"],
  ["David Brown", "david@example.com", "2024-04-05 16:45:00"],
  ["Eve Davis", "eve@example.com", "2024-05-12 11:20:00"],
  ["Frank Miller", "frank@example.com", "2024-06-18 13:30:00"],
  ["Grace Lee", "grace@example.com", "2024-07-22 15:10:00"],
  ["Henry Wilson", "henry@example.com", "2024-08-30 10:05:00"],
  ["Iris Taylor", "iris@example.com", "2024-09-14 12:40:00"],
  ["Jack Anderson", "jack@example.com", "2024-10-25 14:55:00"],
];

const insertMany = db.transaction((items: any[]) => {
  for (const item of items) {
    insertUser.run(...item);
  }
});

insertMany(users);
console.log(`✓ Inserted ${users.length} users`);

// Products
const insertProduct = db.prepare(`
  INSERT INTO products (name, price, category, stock)
  VALUES (?, ?, ?, ?)
`);

const products = [
  ['Laptop Pro 15"', 1299.99, "Electronics", 25],
  ["Wireless Mouse", 29.99, "Electronics", 150],
  ["USB-C Cable", 12.99, "Electronics", 200],
  ["Office Chair", 249.99, "Furniture", 45],
  ["Standing Desk", 599.99, "Furniture", 30],
  ['Monitor 27"', 349.99, "Electronics", 60],
  ["Keyboard Mechanical", 89.99, "Electronics", 80],
  ["Desk Lamp", 39.99, "Furniture", 100],
  ["Notebook Set", 15.99, "Office Supplies", 300],
  ["Pen Pack", 8.99, "Office Supplies", 500],
  ["Webcam HD", 79.99, "Electronics", 70],
  ["Headphones", 149.99, "Electronics", 90],
  ["Coffee Mug", 12.99, "Kitchen", 250],
  ["Water Bottle", 19.99, "Kitchen", 180],
  ["Backpack", 59.99, "Accessories", 120],
];

const insertManyProducts = db.transaction((items: any[]) => {
  for (const item of items) {
    insertProduct.run(...item);
  }
});

insertManyProducts(products);
console.log(`✓ Inserted ${products.length} products`);

// Orders
const insertOrder = db.prepare(`
  INSERT INTO orders (user_id, total, status, created_at)
  VALUES (?, ?, ?, ?)
`);

// Generate realistic orders
const statuses = ["pending", "shipped", "delivered", "cancelled"];
const orders = [
  [1, 1329.98, "delivered", "2024-11-01 10:15:00"],
  [2, 249.99, "delivered", "2024-11-02 14:30:00"],
  [1, 89.99, "delivered", "2024-11-05 09:20:00"],
  [3, 599.99, "shipped", "2024-11-10 16:45:00"],
  [4, 349.99, "delivered", "2024-11-12 11:30:00"],
  [2, 12.99, "delivered", "2024-11-15 13:20:00"],
  [5, 1299.99, "shipped", "2024-11-18 10:00:00"],
  [6, 159.98, "delivered", "2024-11-20 15:45:00"],
  [3, 39.99, "pending", "2024-12-01 12:30:00"],
  [7, 1949.97, "shipped", "2024-12-05 14:20:00"],
  [8, 29.99, "delivered", "2024-12-08 10:10:00"],
  [4, 79.99, "pending", "2024-12-10 16:30:00"],
  [9, 149.99, "shipped", "2024-12-12 11:45:00"],
  [10, 32.98, "delivered", "2024-12-15 13:50:00"],
  [1, 249.99, "pending", "2024-12-18 09:30:00"],
  [2, 599.99, "pending", "2024-12-19 14:15:00"],
  [5, 89.99, "shipped", "2024-12-20 10:20:00"],
];

const insertManyOrders = db.transaction((items: any[]) => {
  for (const item of items) {
    insertOrder.run(...item);
  }
});

insertManyOrders(orders);
console.log(`✓ Inserted ${orders.length} orders\n`);

// Create indexes
console.log("Creating indexes...");
db.exec("CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);");
db.exec(
  "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);",
);
db.exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);");
console.log("✓ Indexes created\n");

// Show summary
console.log("Database Summary:");
console.log("=".repeat(40));

const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
  count: number;
};
const productCount = db
  .prepare("SELECT COUNT(*) as count FROM products")
  .get() as { count: number };
const orderCount = db.prepare("SELECT COUNT(*) as count FROM orders").get() as {
  count: number;
};

console.log(`Users:    ${userCount.count}`);
console.log(`Products: ${productCount.count}`);
console.log(`Orders:   ${orderCount.count}`);
console.log("=".repeat(40));

db.close();

console.log("\nDatabase created successfully at:", DB_PATH);
console.log("\nYou can now run queries against this database!\n");
