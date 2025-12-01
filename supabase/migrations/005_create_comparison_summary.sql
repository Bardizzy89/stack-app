-- =============================================
-- CREATE COMPARISON SUMMARY TABLE
-- Epic 5: Comparison Engine - Full Analysis Storage
-- =============================================

-- Create comparison_summary table
-- Stores the complete comparison analysis between current and optimal stacks
CREATE TABLE IF NOT EXISTS comparison_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES stacks(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Full comparison data as JSONB
  -- Contains gaps, redundancy, outdated tools, visualizations, action items
  comparison_json JSONB NOT NULL,

  -- Denormalized fields for quick access and filtering
  tech_health_score INTEGER NOT NULL CHECK (tech_health_score >= 0 AND tech_health_score <= 100),
  gaps_score INTEGER NOT NULL CHECK (gaps_score >= 0 AND gaps_score <= 20),
  redundancy_score INTEGER NOT NULL CHECK (redundancy_score >= 0 AND redundancy_score <= 20),
  total_monthly_savings NUMERIC(10, 2) NOT NULL CHECK (total_monthly_savings >= 0),
  total_annual_savings NUMERIC(10, 2) NOT NULL CHECK (total_annual_savings >= 0),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_comparison_summary_stack_id ON comparison_summary(stack_id);
CREATE INDEX IF NOT EXISTS idx_comparison_summary_tech_health_score ON comparison_summary(tech_health_score);
CREATE INDEX IF NOT EXISTS idx_comparison_summary_savings ON comparison_summary(total_monthly_savings DESC);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_comparison_summary_json ON comparison_summary USING GIN (comparison_json);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE comparison_summary ENABLE ROW LEVEL SECURITY;

-- Users can view their own comparison summaries
CREATE POLICY "Users can view own comparison summaries"
  ON comparison_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = comparison_summary.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

-- Users can insert their own comparison summaries
CREATE POLICY "Users can insert own comparison summaries"
  ON comparison_summary FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = comparison_summary.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

-- Users can update their own comparison summaries
CREATE POLICY "Users can update own comparison summaries"
  ON comparison_summary FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = comparison_summary.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

-- Users can delete their own comparison summaries
CREATE POLICY "Users can delete own comparison summaries"
  ON comparison_summary FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = comparison_summary.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================

-- Automatically update updated_at timestamp
CREATE TRIGGER update_comparison_summary_updated_at
  BEFORE UPDATE ON comparison_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE comparison_summary IS 'Stores complete comparison analysis between users current stack and optimal stack recommendations';
COMMENT ON COLUMN comparison_summary.comparison_json IS 'Full JSON structure containing gaps, redundancy, outdated tools, visualizations, and action items';
COMMENT ON COLUMN comparison_summary.tech_health_score IS 'Overall tech stack health score (0-100, higher is better)';
COMMENT ON COLUMN comparison_summary.gaps_score IS 'Score for missing/incomplete categories (0-20, higher is better)';
COMMENT ON COLUMN comparison_summary.redundancy_score IS 'Score for tool redundancy (0-20, higher is better, lower means more redundancy)';
COMMENT ON COLUMN comparison_summary.total_monthly_savings IS 'Total estimated monthly savings from all recommendations';
COMMENT ON COLUMN comparison_summary.total_annual_savings IS 'Total estimated annual savings (monthly * 12)';
