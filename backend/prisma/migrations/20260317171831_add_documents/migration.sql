-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentNumber" TEXT,
    "type" TEXT NOT NULL,
    "documentDate" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "paymentMethod" TEXT,
    "paymentDueDate" TEXT,
    "clientCompany" TEXT,
    "clientFirstName" TEXT,
    "clientLastName" TEXT,
    "clientStreet" TEXT,
    "clientPostalCode" TEXT,
    "clientCity" TEXT,
    "carLicensePlate" TEXT NOT NULL,
    "carManufacturer" TEXT NOT NULL,
    "carModel" TEXT NOT NULL,
    "carVin" TEXT,
    "carMileage" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DocumentPosition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "text" TEXT,
    "articleId" TEXT,
    "description" TEXT,
    "pricePerUnit" DECIMAL,
    "amount" DECIMAL,
    "discount" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentPosition_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_documentNumber_key" ON "Document"("documentNumber");
