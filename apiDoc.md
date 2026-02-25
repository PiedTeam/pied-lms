# API Documentation

## 1. Authentication

### 1.1. Đăng ký tài khoản

- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Description:** Đăng ký tài khoản mới (Student/Mentor/Admin)
- **Roles:** Public

### 1.2. Đăng nhập

- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Description:** Đăng nhập vào hệ thống
- **Roles:** Public

### 1.3. Đăng xuất

- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **Description:** Đăng xuất khỏi hệ thống
- **Roles:** Authenticated

### 1.4. Làm mới token

- **Method:** `POST`
- **Endpoint:** `/auth/refresh-token`
- **Description:** Làm mới access token
- **Roles:** Authenticated

### 1.5. Lấy thông tin người dùng hiện tại

- **Method:** `GET`
- **Endpoint:** `/auth/me`
- **Description:** Lấy thông tin của người dùng đang đăng nhập
- **Roles:** Authenticated

---

## 2. Course & Class Management

### 2.1. Xem danh sách khóa học

- **Method:** `GET`
- **Endpoint:** `/courses`
- **Description:** Lấy danh sách tất cả khóa học
- **Roles:** Student, Mentor, Admin

### 2.2. Xem chi tiết khóa học

- **Method:** `GET`
- **Endpoint:** `/courses/{id}`
- **Description:** Lấy thông tin chi tiết của một khóa học
- **Roles:** Student, Mentor, Admin

### 2.3. Tạo khóa học mới

- **Method:** `POST`
- **Endpoint:** `/admin/courses`
- **Description:** Tạo khóa học mới
- **Roles:** Admin

### 2.4. Cập nhật khóa học

- **Method:** `PUT`
- **Endpoint:** `/admin/courses/{id}`
- **Description:** Cập nhật thông tin khóa học
- **Roles:** Admin

### 2.5. Xóa khóa học

- **Method:** `DELETE`
- **Endpoint:** `/admin/courses/{id}`
- **Description:** Xóa khóa học
- **Roles:** Admin

### 2.6. Tạo lớp học

- **Method:** `POST`
- **Endpoint:** `/admin/classes`
- **Description:** Tạo lớp học mới (1 timetable - N classes)
- **Roles:** Admin

### 2.7. Xem danh sách lớp học

- **Method:** `GET`
- **Endpoint:** `/classes`
- **Description:** Lấy danh sách tất cả lớp học
- **Roles:** Student, Mentor, Admin

### 2.8. Xem chi tiết lớp học

- **Method:** `GET`
- **Endpoint:** `/classes/{id}`
- **Description:** Lấy thông tin chi tiết của một lớp học
- **Roles:** Student, Mentor, Admin

### 2.9. Xóa lớp học

- **Method:** `DELETE`
- **Endpoint:** `/admin/classes/{id}`
- **Description:** Xóa lớp học
- **Roles:** Admin

### 2.10. Lấy danh sách sinh viên trong lớp

- **Method:** `GET`
- **Endpoint:** `/classes/{id}/students`
- **Description:** Lấy danh sách sinh viên thuộc lớp học
- **Roles:** Student, Mentor, Admin

### 2.11. Quản lý sinh viên trong khóa học

- **Method:** `PUT`
- **Endpoint:** `/admin/courses/{id}/students`
- **Description:** Quản lý danh sách sinh viên trong khóa học (thêm/xóa)
- **Roles:** Admin

---

## 3. Timetable & Slot Management

### 3.1. Xem thời khóa biểu cá nhân

- **Method:** `GET`
- **Endpoint:** `/timetables/me`
- **Description:** Xem thời khóa biểu của người dùng hiện tại
- **Roles:** Student, Mentor, Admin

### 3.2. Xem thời khóa biểu của sinh viên/mentor

- **Method:** `GET`
- **Endpoint:** `/timetables/{userId}`
- **Description:** Xem thời khóa biểu của một người dùng cụ thể
- **Roles:** Mentor, Admin

### 3.3. Tìm kiếm thời khóa biểu theo thời gian cụ thể

- **Method:** `GET`
- **Endpoint:** `/timetables/search`
- **Description:** Tìm kiếm thời khóa biểu theo khoảng thời gian
- **Query Parameters:** `startTime`, `endTime`, `dayOfWeek`
- **Roles:** Mentor, Admin

### 3.4. So sánh sự thay đổi giữa 2 thời khóa biểu

- **Method:** `GET`
- **Endpoint:** `/timetables/diff`
- **Description:** So sánh sự khác biệt giữa 2 thời khóa biểu
- **Query Parameters:** `timetableId1`, `timetableId2` hoặc `userId1`, `userId2`
- **Roles:** Mentor, Admin

### 3.5. Xem hoạt động của slot

- **Method:** `GET`
- **Endpoint:** `/slots/{id}/activities`
- **Description:** Xem các hoạt động của một slot cụ thể
- **Roles:** Student, Mentor, Admin

### 3.6. Cập nhật hoạt động của slot

- **Method:** `PUT`
- **Endpoint:** `/admin/slots/{id}/activities`
- **Description:** Cập nhật hoạt động của slot
- **Roles:** Admin

### 3.7. Xem lời khuyên (Advice) của slot

- **Method:** `GET`
- **Endpoint:** `/slots/{id}/advice`
- **Description:** Xem lời khuyên liên quan đến slot
- **Roles:** Student, Mentor, Admin

### 3.8. Tạo/Cập nhật lời khuyên của slot

- **Method:** `POST`
- **Endpoint:** `/slots/{id}/advice`
- **Description:** Tạo hoặc cập nhật lời khuyên cho slot
- **Roles:** Mentor, Admin

### 3.9. Cập nhật lời khuyên của slot

- **Method:** `PUT`
- **Endpoint:** `/slots/{id}/advice/{adviceId}`
- **Description:** Cập nhật lời khuyên cụ thể
- **Roles:** Mentor, Admin

### 3.10. Xóa lời khuyên của slot

- **Method:** `DELETE`
- **Endpoint:** `/slots/{id}/advice/{adviceId}`
- **Description:** Xóa lời khuyên
- **Roles:** Mentor, Admin

### 3.11. Quản lý lịch nghỉ/off slot

- **Method:** `POST`
- **Endpoint:** `/admin/slots/off-management`
- **Description:** Quản lý lịch nghỉ/off slot (liên quan đến Notification feature)
- **Roles:** Admin

---

## 4. Student Management

### 4.1. Tìm kiếm sinh viên

- **Method:** `GET`
- **Endpoint:** `/students/search`
- **Description:** Tìm kiếm sinh viên theo tên, mã sinh viên, email
- **Query Parameters:** `query`, `page`, `pageSize`
- **Roles:** Student, Mentor, Admin

### 4.2. Đăng ký lịch đi Malaysia

- **Method:** `POST`
- **Endpoint:** `/students/malaysia-registration`
- **Description:** Đăng ký lịch đi Malaysia cho sinh viên
- **Roles:** Student

### 4.3. Xem thông tin sinh viên

- **Method:** `GET`
- **Endpoint:** `/students/{id}`
- **Description:** Xem thông tin chi tiết của sinh viên
- **Roles:** Student, Mentor, Admin

### 4.4. Điều chuyển sinh viên thủ công

- **Method:** `POST`
- **Endpoint:** `/admin/students/move`
- **Description:** Điều chuyển sinh viên từ lớp/slot này sang lớp/slot khác
- **Roles:** Admin, Mentor

### 4.5. Xếp sinh viên vào khóa học

- **Method:** `POST`
- **Endpoint:** `/admin/courses/assign-student`
- **Description:** Xếp sinh viên vào khóa học cụ thể
- **Roles:** Admin

### 4.6. Di chuyển sinh viên vào khóa học

- **Method:** `POST`
- **Endpoint:** `/admin/courses/{courseId}/move-student`
- **Description:** Di chuyển sinh viên vào khóa học (từ khóa học khác)
- **Roles:** Admin

### 4.7. Xem trạng thái hiện tại của sinh viên

- **Method:** `GET`
- **Endpoint:** `/admin/students/{id}/state`
- **Description:** Xem toàn bộ trạng thái hiện tại của sinh viên (lớp học, khóa học, thời khóa biểu)
- **Roles:** Admin

### 4.8. Import dữ liệu từ Excel

- **Method:** `POST`
- **Endpoint:** `/admin/data/import-excel`
- **Description:** Import dữ liệu sinh viên, lớp học, khóa học từ file Excel
- **Roles:** Admin

---

## 5. Swap Management (Trao đổi lịch học)

### 5.1. Gửi yêu cầu đổi 1-1 trực tiếp

- **Method:** `POST`
- **Endpoint:** `/students/swaps/direct-request`
- **Description:** Gửi yêu cầu đổi slot trực tiếp với một sinh viên khác
- **Roles:** Student

### 5.2. Xem danh sách yêu cầu đổi trực tiếp

- **Method:** `GET`
- **Endpoint:** `/students/swaps/direct-requests`
- **Description:** Lấy danh sách yêu cầu đổi trực tiếp (đã gửi/nhận)
- **Query Parameters:** `type` (sent/received), `status`
- **Roles:** Student

### 5.3. Chấp nhận/Từ chối yêu cầu đổi trực tiếp

- **Method:** `PUT`
- **Endpoint:** `/students/swaps/direct-requests/{requestId}`
- **Description:** Chấp nhận hoặc từ chối yêu cầu đổi trực tiếp
- **Roles:** Student

### 5.4. Yêu cầu đổi sang slot khác

- **Method:** `POST`
- **Endpoint:** `/students/swaps/slot-request`
- **Description:** Yêu cầu đổi sang một slot khác (không cần đối tác cụ thể)
- **Roles:** Student

### 5.5. Tạo phòng chờ đổi (Swap Room)

- **Method:** `POST`
- **Endpoint:** `/students/swaps/rooms`
- **Description:** Tạo phòng chờ để trao đổi slot với nhiều sinh viên
- **Roles:** Student

### 5.6. Xem danh sách phòng swap

- **Method:** `GET`
- **Endpoint:** `/students/swaps/rooms`
- **Description:** Lấy danh sách các phòng swap (đã tạo/tham gia)
- **Query Parameters:** `type` (created/joined), `status`
- **Roles:** Student

### 5.7. Xem chi tiết phòng swap

- **Method:** `GET`
- **Endpoint:** `/students/swaps/rooms/{roomId}`
- **Description:** Lấy thông tin chi tiết của phòng swap
- **Roles:** Student

### 5.8. Mời sinh viên vào phòng

- **Method:** `POST`
- **Endpoint:** `/students/swaps/rooms/{roomId}/invites`
- **Description:** Mời hoặc gửi yêu cầu cho sinh viên tham gia phòng swap
- **Roles:** Student

### 5.9. Lấy danh sách lời mời trong phòng

- **Method:** `GET`
- **Endpoint:** `/students/swaps/rooms/{roomId}/invites`
- **Description:** Lấy danh sách lời mời đã gửi/nhận trong phòng
- **Roles:** Student

### 5.10. Chấp nhận/Từ chối lời mời vào phòng

- **Method:** `PUT`
- **Endpoint:** `/students/swaps/rooms/{roomId}/invites/{inviteId}`
- **Description:** Chấp nhận hoặc từ chối lời mời tham gia phòng swap
- **Roles:** Student

### 5.11. Gửi tin nhắn trong phòng

- **Method:** `POST`
- **Endpoint:** `/students/swaps/rooms/{roomId}/chats`
- **Description:** Gửi tin nhắn trong phòng swap
- **Roles:** Student

### 5.12. Lấy danh sách tin nhắn

- **Method:** `GET`
- **Endpoint:** `/students/swaps/rooms/{roomId}/chats`
- **Description:** Lấy danh sách tin nhắn trong phòng swap
- **Query Parameters:** `page`, `pageSize`
- **Roles:** Student

### 5.13. Xác nhận phiên đổi lịch (Validate)

- **Method:** `POST`
- **Endpoint:** `/students/swaps/rooms/{roomId}/validate`
- **Description:** Xác nhận hoàn tất phiên đổi lịch trong phòng swap
- **Roles:** Student

---

## 6. History (Lịch sử)

### 6.1. Xem bảng lịch sử trao đổi công khai

- **Method:** `GET`
- **Endpoint:** `/history/swaps/public`
- **Description:** Xem lịch sử trao đổi công khai (tất cả người dùng có thể xem)
- **Roles:** Student, Mentor, Admin

### 6.2. Xem lịch sử trao đổi của tôi

- **Method:** `GET`
- **Endpoint:** `/students/swaps/history`
- **Description:** Xem lịch sử trao đổi của sinh viên hiện tại
- **Roles:** Student

### 6.3. Xem toàn bộ lịch sử trao đổi

- **Method:** `GET`
- **Endpoint:** `/admin/history/swaps`
- **Description:** Xem toàn bộ lịch sử trao đổi trong hệ thống (công khai tất cả)
- **Query Parameters:** `page`, `pageSize`, `startDate`, `endDate`
- **Roles:** Admin

---

## Notes

- Tất cả các endpoint (trừ Authentication) yêu cầu xác thực qua Bearer Token
- Roles được phân quyền: **Public**, **Student**, **Mentor**, **Admin**
- Query parameters tùy chọn có thể được thêm vào để lọc, phân trang
- Status codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`
