-- =============================================
-- ADD NOTES COLUMN TO STACK ITEMS
-- Epic 4: Current Stack Input Enhancement
-- =============================================

-- Add notes column to stack_items table
-- Allows users to add additional context/information about each tool
ALTER TABLE stack_items
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN stack_items.notes IS 'Additional notes or context about the tool (max 500 chars in app validation)';
