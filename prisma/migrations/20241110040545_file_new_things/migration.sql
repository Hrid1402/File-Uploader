/*
  Warnings:

  - Added the required column `bytes` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `format` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "bytes" BIGINT NOT NULL,
ADD COLUMN     "format" TEXT NOT NULL;
