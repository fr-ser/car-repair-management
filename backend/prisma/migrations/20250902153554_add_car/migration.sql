-- CreateTable
CREATE TABLE "Car" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstRegistration" TEXT,
    "color" TEXT,
    "manufacturer" TEXT,
    "engineCapacity" TEXT,
    "licensePlate" TEXT,
    "comment" TEXT,
    "fuelType" TEXT,
    "enginePower" TEXT,
    "model" TEXT,
    "oilChangeDate" TEXT,
    "oilChangeKm" INTEGER,
    "tires" TEXT,
    "inspectionDate" TEXT,
    "vin" TEXT,
    "timingBeltKm" INTEGER,
    "timingBeltDate" TEXT,
    "documentField2" TEXT,
    "documentField3" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
