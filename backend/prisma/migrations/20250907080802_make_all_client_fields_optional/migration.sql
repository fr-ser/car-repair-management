-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientNumber" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
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
INSERT INTO "new_Client" ("birthday", "city", "clientNumber", "comment", "company", "createdAt", "email", "firstName", "id", "landline", "lastName", "phoneNumber", "postalCode", "street", "updatedAt") SELECT "birthday", "city", "clientNumber", "comment", "company", "createdAt", "email", "firstName", "id", "landline", "lastName", "phoneNumber", "postalCode", "street", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_clientNumber_key" ON "Client"("clientNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
