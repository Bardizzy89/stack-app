-- =============================================
-- EPIC 6: TECH HEALTH SCORING SYSTEM
-- =============================================
-- This migration formalizes the scoring system with:
-- 1. Historical tracking (remove UNIQUE constraint)
-- 2. Component scores (gaps, redundancy, outdated, cost efficiency)
-- 3. Structured breakdown storage (JSONB)
-- 4. Updated_at tracking

-- =============================================
-- STEP 1: Remove UNIQUE constraint for historical tracking
-- =============================================
-- Epic 6 requires multiple score records per stack for trend analysis
ALTER TABLE scores
DROP CONSTRAINT IF EXISTS scores_stack_id_key;

-- =============================================
-- STEP 2: Add missing component score columns
-- =============================================

-- Outdated Tool Score (0-20)
-- Penalty for tools that have better/cheaper alternatives
ALTER TABLE scores
ADD COLUMN IF NOT EXISTS outdated_score INTEGER DEFAULT 0
  CHECK (outdated_score >= 0 AND outdated_score <= 20);

-- Cost Efficiency Score (0-40)
-- Largest weight - reflects spending efficiency
ALTER TABLE scores
ADD COLUMN IF NOT EXISTS cost_efficiency_score INTEGER DEFAULT 0
  CHECK (cost_efficiency_score >= 0 AND cost_efficiency_score <= 40);

-- =============================================
-- STEP 3: Add structured data columns
-- =============================================

-- Score Breakdown (JSONB)
-- Stores detailed calculation breakdown for transparency
ALTER TABLE scores
ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}'::jsonb;

-- Metadata (JSONB)
-- Future-proof field for algorithm versions, context, etc.
ALTER TABLE scores
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Updated At (TIMESTAMPTZ)
-- Track when scores are recalculated
ALTER TABLE scores
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- =============================================
-- STEP 4: Create index for historical queries
-- =============================================

-- Index for fetching latest score per stack
CREATE INDEX IF NOT EXISTS idx_scores_stack_id_created_at
  ON scores(stack_id, created_at DESC);

-- Index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_scores_breakdown
  ON scores USING GIN (score_breakdown);

-- =============================================
-- STEP 5: Add trigger for updated_at
-- =============================================

CREATE TRIGGER update_scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 6: Update old component score columns
-- =============================================
-- Remove obsolete columns that don't align with Epic 6
-- (Keep for now to avoid breaking existing data, but mark deprecated)

COMMENT ON COLUMN scores.coverage_score IS 'DEPRECATED: Use gaps_score instead';
COMMENT ON COLUMN scores.hygiene_score IS 'DEPRECATED: Replaced by cost_efficiency_score';
COMMENT ON COLUMN scores.ai_readiness_score IS 'DEPRECATED: Not used in Epic 6';
COMMENT ON COLUMN scores.security_score IS 'DEPRECATED: Not used in Epic 6';
