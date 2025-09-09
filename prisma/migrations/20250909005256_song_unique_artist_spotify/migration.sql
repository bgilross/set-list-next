/*
  Warnings:

  - A unique constraint covering the columns `[artistId,spotifyId]` on the table `Song` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Song_spotifyId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Song_artistId_spotifyId_key" ON "public"."Song"("artistId", "spotifyId");
