import fs from 'fs';

// Read full generated schema from WSL or Windows
let fullSql = fs.readFileSync('d:/Startup/scripts/full_schema.sql', 'utf8');

let initSql = fullSql;

// 1. Remove OrderStatusHistory table definition
initSql = initSql.replace(/-- CreateTable\s+CREATE TABLE "OrderStatusHistory" \([\s\S]*?\);\n/g, '');

// 2. Remove OrderStatusHistory indexes
initSql = initSql.replace(/-- CreateIndex\s+CREATE INDEX "OrderStatusHistory_[^"]+" ON "OrderStatusHistory"[^;]+;\n/g, '');

// 3. Remove OrderStatusHistory foreign keys
initSql = initSql.replace(/-- AddForeignKey\s+ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT[^;]+;\n/g, '');

// 4. Remove the 4 lifecycle columns from CREATE TABLE "Order"
initSql = initSql.replace(/\s+"substitutionNotes" TEXT,\n/g, '\n');
initSql = initSql.replace(/\s+"fulfillmentNotes" TEXT,\n/g, '\n');
initSql = initSql.replace(/\s+"statusReason" TEXT,\n/g, '\n');
initSql = initSql.replace(/\s+"updatedBy" TEXT,\n/g, '\n');

// 5. Remove the 3 snapshot columns from CREATE TABLE "OrderItem"
initSql = initSql.replace(/\s+"productName" TEXT,\n/g, '\n');
initSql = initSql.replace(/\s+"brand" TEXT,\n/g, '\n');
initSql = initSql.replace(/\s+"packSize" TEXT,\n/g, '\n');

const dir = 'd:/Startup/packages/database/prisma/migrations/20261115000000_init';
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + '/migration.sql', initSql);
console.log('Successfully created 20261115000000_init/migration.sql, character length:', initSql.length);
