-- Migration: Rename column_id from 'in-progress' to 'implement'
-- Description: Update all cards with column_id='in-progress' to column_id='implement'

-- Update all cards in the 'in-progress' column to 'implement'
UPDATE cards SET column_id = 'implement' WHERE column_id = 'in-progress';
