-- =============================================
-- ADD SAVINGS COLUMNS TO SCORES TABLE
-- Epic 5: Comparison Engine - Cost Savings Tracking
-- =============================================

-- Add savings columns to scores table
-- These track the total potential savings identified by the comparison engine
ALTER TABLE scores
ADD COLUMN IF NOT EXISTS total_monthly_savings NUMERIC(10, 2) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_annual_savings NUMERIC(10, 2) DEFAULT 0 NOT NULL;

-- Add constraints to ensure savings are non-negative
ALTER TABLE scores
ADD CONSTRAINT check_monthly_savings_non_negative
  CHECK (total_monthly_savings >= 0);

ALTER TABLE scores
ADD CONSTRAINT check_annual_savings_non_negative
  CHECK (total_annual_savings >= 0);

-- Add comments for documentation
COMMENT ON COLUMN scores.total_monthly_savings IS 'Total estimated monthly savings from redundancy, outdated tools, and overpriced subscriptions';
COMMENT ON COLUMN scores.total_annual_savings IS 'Total estimated annual savings (monthly * 12)';
