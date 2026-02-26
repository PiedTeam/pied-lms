# Test Case: Chức năng Submit Bài Làm

## Mô tả
Test case này kiểm tra chức năng submit bài làm của học sinh, bao gồm:
- Submit nhiều lần (auto-save)
- Submit lần cuối (final submission)
- Kiểm tra không thể submit sau khi đã final
- Kiểm tra deadline

## Yêu cầu
- API đang chạy tại `http://localhost:5211`
- Database đã được seed với admin và teacher
- Sử dụng VS Code với extension REST Client hoặc công cụ tương tự

## Các bước test

### 1. Chuẩn bị dữ liệu

#### Bước 1.1: Login as Admin
```http
POST http://localhost:5211/api/auth/login
Content-Type: application/json

{
  "email": "admin@pied.com",
  "password": "AdminPassword123!"
}
```
**Kết quả mong đợi:** Nhận được token, lưu vào `@adminToken`

#### Bước 1.2: Tạo tài khoản Student
```http
POST http://localhost:5211/api/auth/register
Content-Type: application/json

{
  "email": "student1@test.com",
  "password": "Student123!",
  "firstName": "Test",
  "lastName": "Student",
  "role": "Student"
}
```
**Kết quả mong đợi:** Tạo thành công, lưu `userId` vào `@studentId`

#### Bước 1.3: Login as Student
```http
POST http://localhost:5211/api/auth/login
Content-Type: application/json

{
  "email": "student1@test.com",
  "password": "Student123!"
}
```
**Kết quả mong đợi:** Nhận được token, lưu vào `@studentToken`

#### Bước 1.4: Login as Teacher
```http
POST http://localhost:5211/api/auth/login
Content-Type: application/json

{
  "email": "teacher@pied.com",
  "password": "TeacherPassword123!"
}
```
**Kết quả mong đợi:** Nhận được token, lưu vào `@teacherToken`

### 2. Tạo Exam và Exam Room

#### Bước 2.1: Tạo Exam (as Teacher)
```http
POST http://localhost:5211/api/exams
Authorization: Bearer {{teacherToken}}
Content-Type: application/json

{
  "title": "C Programming Test",
  "description": "Basic C programming exam",
  "totalMarks": 100,
  "passingMarks": 60
}
```
**Kết quả mong đợi:** Tạo thành công, lưu `id` vào `@examId`

#### Bước 2.2: Tạo Exam Room (as Teacher)
```http
POST http://localhost:5211/api/exam-rooms
Authorization: Bearer {{teacherToken}}
Content-Type: application/json

{
  "name": "C Programming Room 1",
  "description": "First C programming exam room",
  "startTime": "2026-02-26T14:00:00Z",
  "endTime": "2026-02-26T16:00:00Z",
  "durationInMinutes": 60
}
```
**Kết quả mong đợi:** Tạo thành công, lưu `id` vào `@examRoomId` và `roomCode` vào `@roomCode`

#### Bước 2.3: Gán Exam vào Room (as Teacher)
```http
POST http://localhost:5211/api/exam-rooms/{{examRoomId}}/exams/{{examId}}
Authorization: Bearer {{teacherToken}}
```
**Kết quả mong đợi:** Gán thành công

#### Bước 2.4: Enroll Student vào Room (as Teacher)
```http
POST http://localhost:5211/api/exam-rooms/{{examRoomId}}/enroll
Authorization: Bearer {{teacherToken}}
Content-Type: application/json

{
  "studentIds": ["{{studentId}}"]
}
```
**Kết quả mong đợi:** Enroll thành công

### 3. Test Submit Functionality

#### Bước 3.1: Student bắt đầu làm bài
```http
POST http://localhost:5211/api/participations/start
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "roomCode": "{{roomCode}}",
  "examId": "{{examId}}"
}
```
**Kết quả mong đợi:** 
- Bắt đầu thành công
- Nhận được `participationId`, lưu vào `@participationId`
- Có `deadline` được tính từ thời gian bắt đầu + duration

#### Bước 3.2: Submit lần 1 (Auto-save)
```http
POST http://localhost:5211/api/participations/submit
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "participationId": "{{participationId}}",
  "answers": [
    {
      "questionId": "00000000-0000-0000-0000-000000000001",
      "answer": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello World\");\n    return 0;\n}"
    }
  ],
  "isFinalSubmission": false
}
```
**Kết quả mong đợi:**
- Submit thành công
- `isCompleted` = false
- Message: "Answers saved successfully. You can continue working and submit again."

#### Bước 3.3: Submit lần 2 (Update - Auto-save)
```http
POST http://localhost:5211/api/participations/submit
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "participationId": "{{participationId}}",
  "answers": [
    {
      "questionId": "00000000-0000-0000-0000-000000000001",
      "answer": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello World\\n\");\n    return 0;\n}"
    }
  ],
  "isFinalSubmission": false
}
```
**Kết quả mong đợi:**
- Submit thành công
- `isCompleted` = false
- Câu trả lời được cập nhật

#### Bước 3.4: Submit lần cuối (Final)
```http
POST http://localhost:5211/api/participations/submit
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "participationId": "{{participationId}}",
  "answers": [
    {
      "questionId": "00000000-0000-0000-0000-000000000001",
      "answer": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello World\\n\");\n    return 0;\n}"
    }
  ],
  "isFinalSubmission": true
}
```
**Kết quả mong đợi:**
- Submit thành công
- `isCompleted` = true
- `submittedAt` có giá trị
- Message: "Exam submitted successfully. Your answers have been recorded and marked as final."

#### Bước 3.5: Thử submit lại sau khi đã final (Should Fail)
```http
POST http://localhost:5211/api/participations/submit
Authorization: Bearer {{studentToken}}
Content-Type: application/json

{
  "participationId": "{{participationId}}",
  "answers": [
    {
      "questionId": "00000000-0000-0000-0000-000000000001",
      "answer": "Modified code"
    }
  ],
  "isFinalSubmission": false
}
```
**Kết quả mong đợi:**
- Submit thất bại
- Status: 400 Bad Request
- Message: "Exam has already been submitted (final submission)"
- ErrorCode: "ALREADY_SUBMITTED"

### 4. Kiểm tra dữ liệu

#### Bước 4.1: Student xem participations của mình
```http
GET http://localhost:5211/api/participations?pageNumber=1&pageSize=10
Authorization: Bearer {{studentToken}}
```
**Kết quả mong đợi:**
- Thấy participation vừa tạo
- `isCompleted` = true
- `submittedAt` có giá trị

#### Bước 4.2: Teacher xem enrollments của room
```http
GET http://localhost:5211/api/participations/room/{{examRoomId}}?pageNumber=1&pageSize=10
Authorization: Bearer {{teacherToken}}
```
**Kết quả mong đợi:**
- Thấy student đã enroll
- Có thông tin email, tên

## Test Cases Summary

| Test Case | Mô tả | Kết quả mong đợi |
|-----------|-------|------------------|
| TC01 | Submit lần đầu với isFinalSubmission=false | Success, isCompleted=false |
| TC02 | Submit lần 2 để update code | Success, code được update |
| TC03 | Submit lần cuối với isFinalSubmission=true | Success, isCompleted=true |
| TC04 | Submit sau khi đã final | Fail, ALREADY_SUBMITTED |
| TC05 | Submit sau deadline | Auto-mark as final |
| TC06 | Submit với participationId không thuộc về mình | Fail, FORBIDDEN |

## Lưu ý
- Thời gian `startTime` và `endTime` của exam room phải phù hợp để student có thể start exam
- Deadline được tính tự động: startedAt + durationInMinutes
- Sau khi submit final, không thể submit lại
- Sau deadline, mọi submit đều tự động được đánh dấu là final
