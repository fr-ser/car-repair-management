-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "landline" TEXT,
    "company" TEXT,
    "birthday" DATETIME,
    "comment" TEXT,
    "phoneNumber" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "street" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
