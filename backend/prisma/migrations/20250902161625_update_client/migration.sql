/*
  Warnings:

  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Client` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "landline" TEXT,
    "company" TEXT,
    "birthday" TEXT,
    "comment" TEXT,
    "phoneNumber" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "street" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Client" ("birthday", "city", "comment", "company", "createdAt", "email", "firstName", "id", "landline", "lastName", "phoneNumber", "postalCode", "street", "updatedAt") SELECT "birthday", "city", "comment", "company", "createdAt", "email", "firstName", "id", "landline", "lastName", "phoneNumber", "postalCode", "street", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_clientNumber_key" ON "Client"("clientNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
