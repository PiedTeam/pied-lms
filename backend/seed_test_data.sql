-- LƯU Ý: Dự án của bạn sử dụng Snake Case (chữ thường, gạch dưới) cho Database.
-- Hãy đảm bảo thay thế 'USER_ID_CUA_HOC_SINH' bằng ID thật của một User có role Student trong bảng "asp_net_users".

-- 1. Xóa dữ liệu cũ (Tùy chọn)
-- DELETE FROM enrollments;
-- DELETE FROM course_prerequisites;
-- DELETE FROM courses;

-- 2. Thêm 3 khóa học mẫu (Sử dụng snake_case cho tên cột)
INSERT INTO courses (title, description, thumbnail_path, start_date, end_date, status, slug, tags, created_at, max_capacity, current_enrollment)
VALUES 
('Khóa học C# Cơ bản', 'Học C# từ con số 0', null, NOW() + INTERVAL '10 days', NOW() + INTERVAL '40 days', 'Active', 'csharp-basic', '["C#", "Basic"]', NOW(), 50, 0),
('Khóa học C# Nâng cao', 'C# chuyên sâu và LINQ', null, NOW() + INTERVAL '15 days', NOW() + INTERVAL '45 days', 'Active', 'csharp-advanced', '["C#", "Advanced"]', NOW(), 30, 0),
('Khóa học ASP.NET Core API', 'Xây dựng Web API với Minimal APIs', null, NOW() + INTERVAL '20 days', NOW() + INTERVAL '60 days', 'Active', 'aspnet-core-api', '["ASP.NET Core", "API"]', NOW(), 20, 0);

-- Lấy ID của các khóa học vừa thêm
DO $$
DECLARE
    v_course_basic_id INT;
    v_course_adv_id INT;
    v_course_api_id INT;
BEGIN
    SELECT id INTO v_course_basic_id FROM courses WHERE slug = 'csharp-basic' LIMIT 1;
    SELECT id INTO v_course_adv_id FROM courses WHERE slug = 'csharp-advanced' LIMIT 1;
    SELECT id INTO v_course_api_id FROM courses WHERE slug = 'aspnet-core-api' LIMIT 1;

    -- 3. Thiết lập điều kiện tiên quyết (Prerequisites)
    -- C# Nâng cao yêu cầu phải học C# Cơ bản
    INSERT INTO course_prerequisites (prerequisite_course_id, course_id)
    VALUES (v_course_basic_id, v_course_adv_id) ON CONFLICT DO NOTHING;

    -- ASP.NET Core yêu cầu phải học C# Nâng cao
    INSERT INTO course_prerequisites (prerequisite_course_id, course_id)
    VALUES (v_course_adv_id, v_course_api_id) ON CONFLICT DO NOTHING;
END $$;

-- (Tùy chọn) 4. Giả lập một học sinh đã hoàn thành khóa C# Cơ bản
-- Nếu bạn có một UserId cụ thể (ví dụ: '550e8400-e29b-41d4-a716-446655440000'), 
-- hãy bỏ comment đoạn dưới và thay bằng ID thật:

/*
DO $$
DECLARE
    v_course_basic_id INT;
    v_student_id UUID := '550e8400-e29b-41d4-a716-446655440000'; -- THAY BẰNG ID CỦA STUDENT TRONG BẢNG "asp_net_users"
BEGIN
    SELECT id INTO v_course_basic_id FROM courses WHERE slug = 'csharp-basic' LIMIT 1;

    INSERT INTO enrollments (id, user_id, course_id, status, payment_proof_key, notes, created_at)
    VALUES (uuid_generate_v4(), v_student_id, v_course_basic_id, 'Completed', null, 'Đã hoàn thành khóa học từ trước', NOW());
END $$;
*/
