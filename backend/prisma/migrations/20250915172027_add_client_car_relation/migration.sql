-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carNumber" TEXT,
    "licensePlate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "firstRegistration" TEXT,
    "color" TEXT,
    "engineCapacity" TEXT,
    "comment" TEXT,
    "fuelType" TEXT,
    "enginePower" TEXT,
    "oilChangeDate" TEXT,
    "oilChangeKm" REAL,
    "tires" TEXT,
    "inspectionDate" TEXT,
    "vin" TEXT,
    "timingBeltKm" REAL,
    "timingBeltDate" TEXT,
    "documentField2" TEXT,
    "documentField3" TEXT,
    "clientId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Car_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Car" ("carNumber", "color", "comment", "createdAt", "documentField2", "documentField3", "engineCapacity", "enginePower", "firstRegistration", "fuelType", "id", "inspectionDate", "licensePlate", "manufacturer", "model", "oilChangeDate", "oilChangeKm", "timingBeltDate", "timingBeltKm", "tires", "updatedAt", "vin") SELECT "carNumber", "color", "comment", "createdAt", "documentField2", "documentField3", "engineCapacity", "enginePower", "firstRegistration", "fuelType", "id", "inspectionDate", "licensePlate", "manufacturer", "model", "oilChangeDate", "oilChangeKm", "timingBeltDate", "timingBeltKm", "tires", "updatedAt", "vin" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE UNIQUE INDEX "Car_carNumber_key" ON "Car"("carNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
