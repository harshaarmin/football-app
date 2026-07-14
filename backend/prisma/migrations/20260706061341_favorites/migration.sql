/*
  Warnings:

  - You are about to drop the column `favoritePlayer` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `favoriteTeam` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "favoritePlayer",
DROP COLUMN "favoriteTeam";

-- CreateTable
CREATE TABLE "FavoriteTeam" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamLogo" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "FavoriteTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoritePlayer" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "playerPhoto" TEXT,
    "teamName" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "FavoritePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteMatch" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "kickoff" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "FavoriteMatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FavoriteTeam" ADD CONSTRAINT "FavoriteTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritePlayer" ADD CONSTRAINT "FavoritePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMatch" ADD CONSTRAINT "FavoriteMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
