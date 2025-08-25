-- CODAI Database Seed Data
-- Insert test data
INSERT INTO users (username, email, password_hash) VALUES 
    ('admin', 'admin@codai.com', 'hashed_password_123'),
    ('test_user', 'test@codai.com', 'hashed_password_456'),
    ('demo_user', 'demo@codai.com', 'hashed_password_789');

INSERT INTO projects (name, description, user_id) VALUES 
    ('MemorAI Project', 'Advanced memory management system', 1),
    ('RomAI Project', 'AI reasoning and optimization', 2),
    ('BancAI Project', 'Banking AI solutions', 1);

INSERT INTO ai_models (name, model_type, version, config) VALUES 
    ('GPT-4o', 'language_model', 'v1.0', '{"temperature": 0.7, "max_tokens": 4096}'),
    ('BERT-Encoder', 'encoder', 'v2.1', '{"hidden_size": 768, "num_layers": 12}'),
    ('Vision-Transformer', 'vision_model', 'v1.5', '{"patch_size": 16, "embed_dim": 768}');

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models(model_type);

SELECT 'Test data and indexes created successfully' as result;