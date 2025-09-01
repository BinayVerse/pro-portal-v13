-- Provento.ai Database Schema
-- PostgreSQL 14+ compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    avatar_url TEXT,
    company VARCHAR(255),
    department VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_company ON users(company);

-- Document categories table
CREATE TABLE document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- hex color
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL,
    size BIGINT NOT NULL,
    category_id UUID REFERENCES document_categories(id),
    uploaded_by UUID REFERENCES users(id) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed', 'archived')),
    file_path TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    word_count INTEGER,
    page_count INTEGER,
    language VARCHAR(10) DEFAULT 'en',
    summary TEXT,
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    query_count INTEGER DEFAULT 0,
    last_queried_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for documents
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_metadata ON documents USING GIN(metadata);
CREATE INDEX idx_documents_text_search ON documents USING GIN(to_tsvector('english', name || ' ' || COALESCE(summary, '') || ' ' || COALESCE(extracted_text, '')));

-- Document queries table
CREATE TABLE document_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) NOT NULL,
    query_text TEXT NOT NULL,
    response_text TEXT,
    confidence_score DECIMAL(3,2),
    tokens_used INTEGER,
    response_time_ms INTEGER,
    sources JSONB DEFAULT '[]',
    successful BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for document queries
CREATE INDEX idx_queries_document ON document_queries(document_id);
CREATE INDEX idx_queries_user ON document_queries(user_id);
CREATE INDEX idx_queries_created_at ON document_queries(created_at);
CREATE INDEX idx_queries_successful ON document_queries(successful);

-- Integrations table
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('slack', 'teams', 'whatsapp', 'imessage', 'google-drive')),
    name VARCHAR(255) NOT NULL,
    connected BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
    config JSONB NOT NULL DEFAULT '{}',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for integrations
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_created_by ON integrations(created_by);

-- Integration messages table
CREATE TABLE integration_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    external_message_id VARCHAR(255),
    channel_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    message_text TEXT NOT NULL,
    response_text TEXT,
    attachments JSONB DEFAULT '[]',
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for integration messages
CREATE INDEX idx_integration_messages_integration ON integration_messages(integration_id);
CREATE INDEX idx_integration_messages_processed ON integration_messages(processed);
CREATE INDEX idx_integration_messages_created_at ON integration_messages(created_at);

-- API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    permissions JSONB DEFAULT '[]',
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for API keys
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(active);

-- Sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    refresh_token_hash VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sessions
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Database connections table (for PostgreSQL integration feature)
CREATE TABLE database_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 5432,
    database_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password_encrypted TEXT NOT NULL,
    ssl_enabled BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    last_connected_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for database connections
CREATE INDEX idx_db_connections_created_by ON database_connections(created_by);
CREATE INDEX idx_db_connections_status ON database_connections(status);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_categories_updated_at BEFORE UPDATE ON document_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_database_connections_updated_at BEFORE UPDATE ON database_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO document_categories (name, description, color) VALUES
('Legal', 'Legal documents and contracts', '#dc2626'),
('Finance', 'Financial reports and documents', '#059669'),
('HR', 'Human resources documents', '#7c3aed'),
('Marketing', 'Marketing materials and campaigns', '#ea580c'),
('Operations', 'Operational procedures and documents', '#0284c7'),
('General', 'General documents and files', '#6b7280');

-- Create default admin user (password: admin123)
-- Note: In production, change this password immediately
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@provento.ai', '$2b$10$rQo7jzIzE1GjN1cVk1qc9O9mE8vK3xK5lP6dJ8vK3xK5lP6dJ8vK3x', 'Admin', 'User', 'admin');
