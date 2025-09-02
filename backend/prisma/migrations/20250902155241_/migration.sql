/*
  Warnings:

  - A unique constraint covering the columns `[carNumber]` on the table `Car` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Car" ADD COLUMN "carNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Car_carNumber_key" ON "Car"("carNumber");
