-- Initial database schema for Motia HVAC CRM

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Shapes persistence table
CREATE TABLE IF NOT EXISTS shapes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- HVAC projects table
CREATE TABLE IF NOT EXISTS hvac_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    status TEXT DEFAULT 'inquiry',
    requirements TEXT,
    budget_min INTEGER,
    budget_max INTEGER,
    location TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Workflow phases tracking
CREATE TABLE IF NOT EXISTS workflow_phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    phase_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    completed_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES hvac_projects (id)
);

-- Research queries cache
CREATE TABLE IF NOT EXISTS research_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_hash TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    results TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON hvac_projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created ON hvac_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_project ON workflow_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_research_hash ON research_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_research_expires ON research_cache(expires_at);
