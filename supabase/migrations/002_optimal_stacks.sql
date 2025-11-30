-- =============================================
-- EPIC 3 - OPTIMAL TECH STACK ENGINE
-- =============================================

-- 1. CREATE OPTIMAL_STACKS TABLE
-- Stores AI-generated optimal tech stack recommendations
CREATE TABLE IF NOT EXISTS optimal_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES stacks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  industry TEXT NOT NULL,
  company_size_band TEXT NOT NULL,
  team_type TEXT NOT NULL,
  optimal_stack_json JSONB NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  is_cached BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. UPDATE STACKS TABLE
-- Add fields to link stacks to their optimal recommendations
ALTER TABLE stacks
ADD COLUMN IF NOT EXISTS optimal_stack_id UUID REFERENCES optimal_stacks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS optimal_stack_generated_at TIMESTAMPTZ;

-- 3. INDEXES FOR PERFORMANCE
-- Cache lookup index - critical for performance
CREATE INDEX IF NOT EXISTS idx_optimal_stacks_cache_lookup
ON optimal_stacks(industry, company_size_band, team_type)
WHERE is_cached = true;

-- User lookup
CREATE INDEX IF NOT EXISTS idx_optimal_stacks_user_id
ON optimal_stacks(user_id);

-- Stack relationship
CREATE INDEX IF NOT EXISTS idx_optimal_stacks_stack_id
ON optimal_stacks(stack_id);

-- Recent generations
CREATE INDEX IF NOT EXISTS idx_optimal_stacks_generated_at
ON optimal_stacks(generated_at DESC);

-- Index on stacks table for optimal_stack_id
CREATE INDEX IF NOT EXISTS idx_stacks_optimal_stack_id
ON stacks(optimal_stack_id);

-- 4. ROW LEVEL SECURITY
-- Enable RLS on optimal_stacks table
ALTER TABLE optimal_stacks ENABLE ROW LEVEL SECURITY;

-- Users can view their own optimal stacks
CREATE POLICY "Users can view own optimal stacks"
  ON optimal_stacks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own optimal stacks
CREATE POLICY "Users can insert own optimal stacks"
  ON optimal_stacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own optimal stacks
CREATE POLICY "Users can update own optimal stacks"
  ON optimal_stacks FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own optimal stacks
CREATE POLICY "Users can delete own optimal stacks"
  ON optimal_stacks FOR DELETE
  USING (auth.uid() = user_id);

-- Allow users to read cached optimal stacks that match their criteria
-- This enables cache reuse across users for same (industry, size, team)
CREATE POLICY "Users can view cached optimal stacks matching their profile"
  ON optimal_stacks FOR SELECT
  USING (
    is_cached = true
    AND EXISTS (
      SELECT 1 FROM business_profiles bp
      WHERE bp.user_id = auth.uid()
      AND bp.industry = optimal_stacks.industry
      AND bp.company_size = optimal_stacks.company_size_band
      AND bp.team_type = optimal_stacks.team_type
    )
  );

-- 5. TRIGGERS
-- Auto-update updated_at timestamp
CREATE TRIGGER update_optimal_stacks_updated_at
  BEFORE UPDATE ON optimal_stacks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE optimal_stacks IS 'Stores AI-generated optimal tech stack recommendations with caching';
COMMENT ON COLUMN optimal_stacks.optimal_stack_json IS 'Full optimal stack data in JSONB format matching OptimalStack TypeScript type';
COMMENT ON COLUMN optimal_stacks.is_cached IS 'If true, this optimal stack can be reused for other users with matching industry/size/team';
COMMENT ON COLUMN optimal_stacks.version IS 'Version number - increments when user regenerates their optimal stack';
COMMENT ON INDEX idx_optimal_stacks_cache_lookup IS 'Optimizes cache lookup queries by industry/size/team combination';
