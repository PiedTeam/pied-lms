# Fix Quizlet Level Data

## Vấn đề
Dữ liệu quizlet cũ có `level = 0` thay vì 1, 2, 3 (Easy, Medium, Hard).

## Nguyên nhân
Dữ liệu được tạo trước khi cột `level` được thêm vào hoặc có default value không đúng.

## Giải pháp

### Option 1: Chạy SQL Script (Khuyến nghị)
```bash
# Kết nối vào PostgreSQL database
psql -U your_username -d your_database_name

# Chạy script
\i Src/PIED_LMS.Persistence/Migrations/UpdateQuizletLevelData.sql
```

### Option 2: Chạy trực tiếp SQL
```sql
-- Update all quizlets with level = 0 to level = 1 (Easy)
UPDATE question_quizs
SET level = 1
WHERE level = 0 OR level IS NULL;

-- Update all questions with level = 0 to level = 1 (Easy)
UPDATE questions
SET level = 1
WHERE level = 0 OR level IS NULL;
```

### Option 3: Sử dụng pgAdmin hoặc database tool khác
1. Mở pgAdmin hoặc database tool
2. Kết nối vào database
3. Chạy SQL commands ở Option 2

## Kiểm tra
Sau khi chạy script, kiểm tra lại:
```sql
-- Kiểm tra quizlets
SELECT id, title, level FROM question_quizs;

-- Kiểm tra questions
SELECT id, content, level FROM questions LIMIT 10;
```

Tất cả `level` phải là 1, 2, hoặc 3 (không còn 0).

## Lưu ý
- Script này sẽ set tất cả quizlet/question có level = 0 thành level = 1 (Easy)
- Nếu muốn set level khác, có thể sửa script hoặc update thủ công sau
- Backup database trước khi chạy script (khuyến nghị)
