/*
  Warnings:

  - You are about to alter the column `oilChangeKm` on the `Car` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `timingBeltKm` on the `Car` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
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
    "oilChangeKm" REAL,
    "tires" TEXT,
    "inspectionDate" TEXT,
    "vin" TEXT,
    "timingBeltKm" REAL,
    "timingBeltDate" TEXT,
    "documentField2" TEXT,
    "documentField3" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Car" ("color", "comment", "createdAt", "documentField2", "documentField3", "engineCapacity", "enginePower", "firstRegistration", "fuelType", "id", "inspectionDate", "licensePlate", "manufacturer", "model", "oilChangeDate", "oilChangeKm", "timingBeltDate", "timingBeltKm", "tires", "updatedAt", "vin") SELECT "color", "comment", "createdAt", "documentField2", "documentField3", "engineCapacity", "enginePower", "firstRegistration", "fuelType", "id", "inspectionDate", "licensePlate", "manufacturer", "model", "oilChangeDate", "oilChangeKm", "timingBeltDate", "timingBeltKm", "tires", "updatedAt", "vin" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
