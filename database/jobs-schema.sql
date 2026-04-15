CREATE SCHEMA IF NOT EXISTS jobs;

CREATE TABLE jobs.jobs (
    id UUID NOT NULL,
    title VARCHAR(300) NOT NULL,
    description VARCHAR(4000) NOT NULL,
    status VARCHAR(32) NOT NULL,
    street VARCHAR(500) NOT NULL,
    city VARCHAR(200) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    latitude NUMERIC(18, 8) NULL,
    longitude NUMERIC(18, 8) NULL,
    scheduled_date TIMESTAMPTZ NULL,
    assignee_id UUID NULL,
    customer_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    notes VARCHAR(2000) NULL,
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    signature_url VARCHAR(2000) NULL,
    cancelled_at TIMESTAMPTZ NULL,
    cancel_reason VARCHAR(2000) NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_jobs PRIMARY KEY (id)
);

CREATE INDEX ix_jobs_organization_id ON jobs.jobs (organization_id);
CREATE INDEX ix_jobs_organization_id_status ON jobs.jobs (organization_id, status);
CREATE INDEX ix_jobs_organization_id_scheduled_date ON jobs.jobs (organization_id, scheduled_date);

CREATE TABLE jobs.job_photos (
    id UUID NOT NULL,
    job_id UUID NOT NULL,
    url VARCHAR(2000) NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL,
    caption VARCHAR(500) NULL,
    CONSTRAINT pk_job_photos PRIMARY KEY (id),
    CONSTRAINT fk_job_photos_jobs_job_id FOREIGN KEY (job_id)
        REFERENCES jobs.jobs (id) ON DELETE CASCADE
);

CREATE INDEX ix_job_photos_job_id ON jobs.job_photos (job_id);

CREATE TABLE jobs.outbox_messages (
    id UUID NOT NULL,
    type VARCHAR(256) NOT NULL,
    content JSONB NOT NULL,
    occurred_on TIMESTAMPTZ NOT NULL,
    processed_on TIMESTAMPTZ NULL,
    CONSTRAINT pk_outbox_messages PRIMARY KEY (id)
);

CREATE INDEX ix_outbox_messages_processed_on ON jobs.outbox_messages (processed_on);
CREATE INDEX ix_outbox_messages_occurred_on ON jobs.outbox_messages (occurred_on);