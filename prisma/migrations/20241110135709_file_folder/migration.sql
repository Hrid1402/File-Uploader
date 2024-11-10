-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_folderID_fkey";

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "folderID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderID_fkey" FOREIGN KEY ("folderID") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
