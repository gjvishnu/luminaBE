-- CreateEnum
CREATE TYPE "DriveStatus" AS ENUM ('UPCOMING', 'REGISTRATION_OPEN', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL');

-- CreateEnum
CREATE TYPE "Degree" AS ENUM ('BTECH', 'BE', 'MTECH', 'ME', 'MCA', 'MSC', 'BSC', 'OTHER');

-- CreateEnum
CREATE TYPE "SelectionStage" AS ENUM ('APTITUDE_TEST', 'ONLINE_ASSESSMENT', 'CODING_ROUND', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'GROUP_DISCUSSION', 'CASE_STUDY', 'OTHER');

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "company_website" VARCHAR(255),
    "about_company" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_drives" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "drive_date_time" TIMESTAMPTZ(3) NOT NULL,
    "venue" VARCHAR(255) NOT NULL,
    "registration_end_date" DATE,
    "drive_status" "DriveStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "campus_drives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drive_roles" (
    "id" SERIAL NOT NULL,
    "drive_id" INTEGER NOT NULL,
    "job_role" VARCHAR(150) NOT NULL,
    "job_location" VARCHAR(150),
    "job_type" "JobType" NOT NULL,
    "ctc_package" VARCHAR(100) NOT NULL,
    "skills_required" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "number_of_openings" INTEGER,
    "departments" "Department"[] DEFAULT ARRAY[]::"Department"[],
    "graduation_year" INTEGER NOT NULL,
    "minimum_cgpa" DECIMAL(4,2) NOT NULL,
    "maximum_backlogs" INTEGER,
    "degree" "Degree",
    "other_criteria" TEXT,
    "job_description" TEXT NOT NULL,
    "selection_process" "SelectionStage"[] DEFAULT ARRAY[]::"SelectionStage"[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "drive_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campus_drives_company_id_idx" ON "campus_drives"("company_id");

-- CreateIndex
CREATE INDEX "campus_drives_drive_date_time_idx" ON "campus_drives"("drive_date_time");

-- CreateIndex
CREATE INDEX "campus_drives_drive_status_idx" ON "campus_drives"("drive_status");

-- CreateIndex
CREATE INDEX "drive_roles_drive_id_idx" ON "drive_roles"("drive_id");

-- CreateIndex
CREATE INDEX "drive_roles_graduation_year_idx" ON "drive_roles"("graduation_year");

-- AddForeignKey
ALTER TABLE "campus_drives" ADD CONSTRAINT "campus_drives_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_roles" ADD CONSTRAINT "drive_roles_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "campus_drives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
