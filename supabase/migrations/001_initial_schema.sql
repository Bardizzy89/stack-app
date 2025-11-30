-- =============================================
-- THE STACK APP - INITIAL DATABASE SCHEMA
-- =============================================

-- 1. BUSINESS PROFILES TABLE
-- Stores business information for each user
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  state TEXT,
  team_type TEXT,
  revenue_band TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- 2. STACKS TABLE
-- Represents a complete tech stack assessment for a user
CREATE TABLE IF NOT EXISTS stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. STACK ITEMS TABLE
-- Individual tools/software within a stack
CREATE TABLE IF NOT EXISTS stack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES stacks(id) ON DELETE CASCADE NOT NULL,
  tool_name TEXT NOT NULL,
  category TEXT NOT NULL,
  monthly_cost NUMERIC(10, 2),
  seats INTEGER,
  renewal_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. SCORES TABLE
-- Tech health scores for each stack assessment
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES stacks(id) ON DELETE CASCADE NOT NULL,
  tech_health_score INTEGER NOT NULL CHECK (tech_health_score >= 0 AND tech_health_score <= 100),
  gaps_score INTEGER DEFAULT 0 CHECK (gaps_score >= 0 AND gaps_score <= 20),
  redundancy_score INTEGER DEFAULT 0 CHECK (redundancy_score >= 0 AND redundancy_score <= 20),
  coverage_score INTEGER DEFAULT 0 CHECK (coverage_score >= 0 AND coverage_score <= 20),
  hygiene_score INTEGER DEFAULT 0 CHECK (hygiene_score >= 0 AND hygiene_score <= 15),
  ai_readiness_score INTEGER DEFAULT 0 CHECK (ai_readiness_score >= 0 AND ai_readiness_score <= 15),
  security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(stack_id)
);

-- 5. RECOMMENDATIONS TABLE
-- AI-generated recommendations for stack improvements
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES stacks(id) ON DELETE CASCADE NOT NULL,
  recommendation_text TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. PAYMENTS TABLE
-- Track Stripe payments for assessments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES stacks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- amount in cents
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stacks_user_id ON stacks(user_id);
CREATE INDEX IF NOT EXISTS idx_stacks_payment_status ON stacks(payment_status);
CREATE INDEX IF NOT EXISTS idx_stack_items_stack_id ON stack_items(stack_id);
CREATE INDEX IF NOT EXISTS idx_scores_stack_id ON scores(stack_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_stack_id ON recommendations(stack_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stack_id ON payments(stack_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session_id ON payments(stripe_session_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- BUSINESS PROFILES POLICIES
-- =============================================

CREATE POLICY "Users can view own business profile"
  ON business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profile"
  ON business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile"
  ON business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business profile"
  ON business_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- STACKS POLICIES
-- =============================================

CREATE POLICY "Users can view own stacks"
  ON stacks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stacks"
  ON stacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stacks"
  ON stacks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stacks"
  ON stacks FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- STACK ITEMS POLICIES
-- =============================================

CREATE POLICY "Users can view own stack items"
  ON stack_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = stack_items.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own stack items"
  ON stack_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = stack_items.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own stack items"
  ON stack_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = stack_items.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own stack items"
  ON stack_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = stack_items.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

-- =============================================
-- SCORES POLICIES
-- =============================================

CREATE POLICY "Users can view own scores"
  ON scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = scores.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own scores"
  ON scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = scores.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own scores"
  ON scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = scores.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

-- =============================================
-- RECOMMENDATIONS POLICIES
-- =============================================

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = recommendations.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = recommendations.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = recommendations.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own recommendations"
  ON recommendations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stacks
      WHERE stacks.id = recommendations.stack_id
      AND stacks.user_id = auth.uid()
    )
  );

-- =============================================
-- PAYMENTS POLICIES
-- =============================================

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stacks_updated_at
  BEFORE UPDATE ON stacks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
