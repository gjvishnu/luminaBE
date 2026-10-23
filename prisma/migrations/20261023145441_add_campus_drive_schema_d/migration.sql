-- CreateEnum
CREATE TYPE "DriveStatus" AS ENUM ('UPCOMING', 'REGISTRATION_OPEN', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT');

-- CreateEnum
CREATE TYPE "DriveDepartment" AS ENUM ('CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL');

-- CreateEnum
CREATE TYPE "Degree" AS ENUM ('BTECH', 'BE', 'MCA', 'MSC', 'MTECH');

-- CreateEnum
CREATE TYPE "SelectionStage" AS ENUM ('APTITUDE', 'TECHNICAL', 'HR', 'GROUP_DISCUSSION', 'ONLINE_TEST', 'INTERVIEW', 'OFFER');

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_drives" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "drive_date_time" TIMESTAMP(3) NOT NULL,
    "registration_deadline" TIMESTAMP(3),
    "status" "DriveStatus" NOT NULL DEFAULT 'UPCOMING',
    "job_type" "JobType" NOT NULL,
    "departments" "DriveDepartment"[],
    "eligibleDegrees" "Degree"[],
    "minimum_cgpa" DOUBLE PRECISION,
    "backlogs_allowed" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "salary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_drives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drive_roles" (
    "id" SERIAL NOT NULL,
    "drive_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required_skills" TEXT[],
    "vacancies" INTEGER NOT NULL DEFAULT 1,
    "salary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drive_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "companies"("name");

-- CreateIndex
CREATE INDEX "campus_drives_company_id_idx" ON "campus_drives"("company_id");

-- CreateIndex
CREATE INDEX "campus_drives_drive_date_time_idx" ON "campus_drives"("drive_date_time");

-- CreateIndex
CREATE INDEX "campus_drives_status_idx" ON "campus_drives"("status");

-- CreateIndex
CREATE INDEX "drive_roles_drive_id_idx" ON "drive_roles"("drive_id");

-- AddForeignKey
ALTER TABLE "campus_drives" ADD CONSTRAINT "campus_drives_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_roles" ADD CONSTRAINT "drive_roles_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "campus_drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
