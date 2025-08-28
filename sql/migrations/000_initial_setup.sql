-- CODAI Database Setup - Migration 000
-- Create migration tracking table and initial setup
-- Date: 2025-08-27
-- Version: 1.0.0

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON public.schema_migrations TO codai_user;

-- Insert initial migration record
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('000', 'initial_setup', NOW())
ON CONFLICT (version) DO NOTHING;

-- Success message
SELECT 'Migration tracking table created successfully' as status;