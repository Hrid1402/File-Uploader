-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_parentID_fkey";

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "parentID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentID_fkey" FOREIGN KEY ("parentID") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
