-- Update all quizlets with level = 0 to level = 1 (Easy)
-- This fixes old data that was created before the Level column was properly configured

UPDATE question_quizs
SET level = 1
WHERE level = 0 OR level IS NULL;

-- Update all questions with level = 0 to level = 1 (Easy)
UPDATE questions
SET level = 1
WHERE level = 0 OR level IS NULL;
