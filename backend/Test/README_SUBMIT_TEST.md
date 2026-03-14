# Hướng Dẫn Test Tay (Manual Test) Từ Database Trống
Do Database hiện tại của bạn đang trống, bạn cần phải thiết lập dữ liệu (Tạo bài thi, Tạo Test Case) bằng tài khoản Admin/Giáo viên trước, sau đó mới dùng tài khoản Học sinh để nộp bài (tính năng mới) được.

Dưới đây là luồng chạy (Flow) từng API trên **Swagger** hoặc **Postman** để vòng Test diễn ra hoàn hảo:

### BƯỚC 1: Cập nhật Database
Bạn mở Terminal tại thư mục `backend` và chạy:
```bash
dotnet ef migrations add AddCodeSubmission -s Src/PIED_LMS.API -p Src/PIED_LMS.Persistence
dotnet ef database update -s Src/PIED_LMS.API -p Src/PIED_LMS.Persistence
```

Khởi chạy hệ thống Web API (Swagger). Hệ thống `DbInitializer` sẽ tự động sinh ra sẵn tài khoản Admin, Teacher, Mentor.

---

### BƯỚC 2: Tạo Bài Thi & Test Case (Vai trò Admin/Teacher)

**1. Đăng nhập Admin lấy Token:**
- Gọi API: `POST /api/auth/login`
- Body:
```json
{
  "email": "admin@pied.com",
  "password": "Admin@123"
}
```
> Copy **Token** trả về, kéo lên trên cùng của Swagger nhấn nút **Authorize**, dán Token vào rồi Save.

**2. Tạo một Bài thi (Exam):**
- Gọi API: `POST /api/exams`
- Body:
```json
{
  "title": "Bài thi Test Lịch sử Code",
  "description": "Dùng để test tính năng xem lại code đã submit.",
  "passMarks": 5,
  "totalMarks": 10,
  "isRequirePassword": false,
  "timeLimit": 60,
  "questions": []
}
```
> **Quan trọng:** API sẽ trả về 1 Cấu trúc chứa `id` của bài thi vừa tạo (vd: `3fa85f64-5717-4562-b3fc-2c963f66afa6`). Hãy copy **ID Bài Thi** này để dùng cho các bước sau.

**3. Tạo Test Case cho Bài thi:**
- Gọi API: `POST /api/testcases`
- Đây là API gửi File (`multipart/form-data`), ngay trên Swagger bạn cấu hình:
  - `ExamId`: Dán **ID Bài Thi** vừa copy ở trên.
  - `InputFile`: Chọn 1 file `.txt` chứa input (vd: `1 2`).
  - `OutputFile`: Chọn 1 file `.txt` chứa output mong đợi (vd: `3`).
  - `IsHidden`: `false`
  - `Score`: `10`
- Bấm Execute để lưu Test Case vào hệ thống.

---

### BƯỚC 3: Đăng ký, Đăng nhập và Nộp bài (Vai trò Học Sinh)

Bây giờ bạn cần đóng vai một Học sinh để tham gia thi. Vẫn ở Swagger:

**1. Đăng ký tài khoản Học sinh:**
- Gọi API: `POST /api/auth/register`
- Body:
```json
{
  "email": "student1@pied.com",
  "password": "Password@123",
  "firstName": "Nguyen",
  "lastName": "Hoc Sinh",
  "role": "Student"
}
```

**2. Đăng nhập tài khoản Học sinh:**
- Gọi API: `POST /api/auth/login`
- Body:
```json
{
  "email": "student1@pied.com",
  "password": "Password@123"
}
```
> Copy **Token Học sinh** mới này, nhấn nút Logout cái Authorization cũ trên Swagger đi, rùi **Authorize lại** bằng Token Học sinh này!

**3. BẮT ĐẦU TEST TÍNH NĂNG MỚI (Nộp Code):**
- Kéo xuống danh mục `StudentSubmissions`.
- Gọi API: `POST /api/students/exams/{examId}/submissions`
- Path `examId`: Nhập **ID Bài Thi** đã lưu lại ở Bước 2.
- Body:
```json
{
  "code": "#include <stdio.h>\nint main() { printf(\"Hello System\"); return 0; }",
  "language": "c",
  "optimizationLevel": null
}
```
- Kết quả: Sẽ được máy chấm ngay lập tức và lưu DB!

---

### BƯỚC 4: Kiểm tra Lịch Sử (Tính năng mới)

**1. Liệt kê Lịch sử các lần nộp của Học sinh:**
- Gọi API: `GET /api/students/exams/{examId}/submissions`
- Path `examId`: Nhập **ID Bài Thi**.
- Bạn sẽ thấy List danh sách gửi bài trả về với kết quả `Accepted`/`Failed`, `runtime`, `memory`...
- **Copy trường `id`** (gọi là ID Lần Nộp - Submission ID) trong kết quả trả về.

**2. Xem lại Code Của Lần Nộp Cụ Thể:**
- Gọi API: `GET /api/students/submissions/{id}`
- Path `id`: Nhập lại **Submission ID** vừa copy.
- Kết quả: Bạn sẽ thấy trả về toàn bộ thông tin chi tiết của lần nộp đó, **bao gồm cả trường `"code"`** chứa chính xác đoạn C++ / C bạn đã cặm cụi gõ ở Bước 3!

(Quy trình kết thúc. Chúc bạn test thành công nhé!)
