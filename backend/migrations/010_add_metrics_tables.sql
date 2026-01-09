-- Migration: Add metrics tables for analytics and performance tracking

-- Create project_metrics table
CREATE TABLE IF NOT EXISTS project_metrics (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,

    -- Token metrics
    total_input_tokens INTEGER DEFAULT 0,
    total_output_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,

    -- Time metrics
    avg_execution_time_ms INTEGER,
    min_execution_time_ms INTEGER,
    max_execution_time_ms INTEGER,
    total_execution_time_ms BIGINT,

    -- Cost metrics
    total_cost_usd NUMERIC(10, 6),
    cost_by_model TEXT, -- JSON stored as text

    -- Productivity metrics
    cards_completed INTEGER DEFAULT 0,
    cards_in_progress INTEGER DEFAULT 0,
    success_rate REAL,

    -- Temporal aggregations
    metrics_date DATE,
    metrics_hour INTEGER,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES active_project(id)
);

-- Create execution_metrics table
CREATE TABLE IF NOT EXISTS execution_metrics (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    project_id TEXT NOT NULL,

    -- Execution details
    command TEXT,
    model_used TEXT,

    -- Time metrics
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INTEGER,

    -- Token metrics
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,

    -- Cost metrics
    estimated_cost_usd NUMERIC(10, 6),

    -- Status
    status TEXT,
    error_message TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (execution_id) REFERENCES executions(id),
    FOREIGN KEY (card_id) REFERENCES cards(id),
    FOREIGN KEY (project_id) REFERENCES active_project(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_metrics_project_date
    ON project_metrics(project_id, metrics_date);

CREATE INDEX IF NOT EXISTS idx_execution_metrics_project_started
    ON execution_metrics(project_id, started_at);

CREATE INDEX IF NOT EXISTS idx_execution_metrics_card
    ON execution_metrics(card_id);

CREATE INDEX IF NOT EXISTS idx_execution_metrics_execution
    ON execution_metrics(execution_id);
