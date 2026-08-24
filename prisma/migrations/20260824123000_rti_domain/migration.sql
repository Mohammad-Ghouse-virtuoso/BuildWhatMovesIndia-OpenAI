-- CreateEnum
CREATE TYPE "RtiStatus" AS ENUM ('drafted', 'submitted', 'received', 'processing', 'additional_information', 'response_ready', 'response_received', 'appeal_prepared', 'appeal_submitted');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('prepared', 'submitted');

-- CreateTable
CREATE TABLE "DemoUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'citizen',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicAuthority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "is_demo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PublicAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RtiRequest" (
    "id" TEXT NOT NULL,
    "registration_number" TEXT,
    "user_id" TEXT NOT NULL,
    "authority_id" TEXT NOT NULL,
    "original_question" TEXT NOT NULL,
    "clarified_question" TEXT NOT NULL,
    "draft_text" TEXT NOT NULL,
    "status" "RtiStatus" NOT NULL,
    "information_categories" TEXT[],
    "requested_items" JSONB NOT NULL DEFAULT '[]',
    "submitted_at" TIMESTAMPTZ,
    "response_due_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "RtiRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RtiEvent" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "type" "RtiStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "RtiEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "synthetic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "draft_text" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemoUser_email_key" ON "DemoUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RtiRequest_registration_number_key" ON "RtiRequest"("registration_number");

-- CreateIndex
CREATE INDEX "RtiRequest_user_id_idx" ON "RtiRequest"("user_id");

-- CreateIndex
CREATE INDEX "RtiRequest_status_idx" ON "RtiRequest"("status");

-- CreateIndex
CREATE INDEX "RtiEvent_request_id_timestamp_idx" ON "RtiEvent"("request_id", "timestamp");

-- CreateIndex
CREATE INDEX "Document_request_id_idx" ON "Document"("request_id");

-- CreateIndex
CREATE INDEX "Appeal_request_id_idx" ON "Appeal"("request_id");

-- AddForeignKey
ALTER TABLE "RtiRequest" ADD CONSTRAINT "RtiRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "DemoUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtiRequest" ADD CONSTRAINT "RtiRequest_authority_id_fkey" FOREIGN KEY ("authority_id") REFERENCES "PublicAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RtiEvent" ADD CONSTRAINT "RtiEvent_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "RtiRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "RtiRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "RtiRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
