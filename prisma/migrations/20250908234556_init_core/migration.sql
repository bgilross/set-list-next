-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'PLAYED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."Artist" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT,
    "displayName" TEXT NOT NULL,
    "slug" TEXT,
    "publicBlurb" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Setlist" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Song" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "spotifyId" TEXT,
    "name" TEXT NOT NULL,
    "artistName" TEXT,
    "album" TEXT,
    "year" INTEGER,
    "userTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SetlistSong" (
    "setlistId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "SetlistSong_pkey" PRIMARY KEY ("setlistId","songId")
);

-- CreateTable
CREATE TABLE "public"."SongRequest" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "setlistId" TEXT,
    "songId" TEXT,
    "rawSongTitle" TEXT,
    "audienceSession" TEXT,
    "audienceUserId" TEXT,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "tipCents" INTEGER DEFAULT 0,
    "currency" TEXT DEFAULT 'USD',
    "message" TEXT,
    "responseMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SongRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_firebaseUid_key" ON "public"."Artist"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_slug_key" ON "public"."Artist"("slug");

-- CreateIndex
CREATE INDEX "Setlist_artistId_isActive_idx" ON "public"."Setlist"("artistId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Song_spotifyId_key" ON "public"."Song"("spotifyId");

-- CreateIndex
CREATE INDEX "Song_artistId_idx" ON "public"."Song"("artistId");

-- CreateIndex
CREATE INDEX "Song_spotifyId_idx" ON "public"."Song"("spotifyId");

-- CreateIndex
CREATE INDEX "SetlistSong_setlistId_position_idx" ON "public"."SetlistSong"("setlistId", "position");

-- CreateIndex
CREATE INDEX "SongRequest_artistId_status_idx" ON "public"."SongRequest"("artistId", "status");

-- CreateIndex
CREATE INDEX "SongRequest_createdAt_idx" ON "public"."SongRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Setlist" ADD CONSTRAINT "Setlist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Song" ADD CONSTRAINT "Song_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SetlistSong" ADD CONSTRAINT "SetlistSong_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "public"."Setlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SetlistSong" ADD CONSTRAINT "SetlistSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SongRequest" ADD CONSTRAINT "SongRequest_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SongRequest" ADD CONSTRAINT "SongRequest_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "public"."Setlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SongRequest" ADD CONSTRAINT "SongRequest_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;
