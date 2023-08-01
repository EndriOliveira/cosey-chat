/*
  Warnings:

  - You are about to drop the column `phoneId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Phone` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_phoneId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phoneId",
ADD COLUMN     "phone" VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE "Phone";
