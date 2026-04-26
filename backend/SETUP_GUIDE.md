# 🚀 Hướng dẫn cài đặt Pied-LMS cho bạn bè

Chào bạn! Để chạy được dự án này sau khi clone code về, bạn cần thực hiện các bước sau:

## 1. Các file cần gửi cho bạn (Quan trọng)

Vì các file cấu hình chứa thông tin bảo mật và môi trường local nên đã bị chặn không push lên Git. Bạn cần copy và gửi cho bạn mình 3 file này:

1.  `backend/.env`
2.  `backend/Src/PIED_LMS.API/appsettings.json`
3.  `backend/Src/PIED_LMS.API/appsettings.Development.json`

**Yêu cầu bạn của bạn:** Copy 3 file này vào đúng thư mục tương ứng trong project đã clone.

---

## 2. Công cụ cần cài đặt

- **.NET 9.0 SDK** (để chạy Backend)
- **Node.js** (phiên bản 18 trở lên, để chạy Frontend)
- **Docker Desktop** (bắt buộc để chạy Database và tính năng chấm code)
- **SQL Client** (như TablePlus, DBeaver hoặc pgAdmin) để kiểm tra DB nếu cần.

---

## 3. Các bước khởi chạy

### Bước 1: Khởi động Database & Infrastructure

Mở terminal tại thư mục gốc của project và chạy:

```bash
cd backend
docker-compose up -d
```

_Lưu ý: Đảm bảo Docker Desktop đang chạy._

### Bước 2: Chạy Backend (API)

Mở một terminal mới:

```bash
cd backend/Src/PIED_LMS.API
dotnet watch run
```

Backend sẽ khởi chạy tại: `http://localhost:5211` (hoặc port bạn đã cấu hình trong `appsettings.json`).
Swagger UI thường ở: `http://localhost:5211/swagger`

### Bước 3: Chạy Frontend

Mở một terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ khởi chạy tại: `http://localhost:3000`

---

## 4. Một số lưu ý

- **Database:** Nếu bạn của bạn muốn dùng DB local thay vì Docker, hãy sửa `ConnectionStrings` trong `appsettings.json`.
- **Compiler:** Dự án này có tính năng compiler chạy trong Docker. Nếu chạy trên Windows, hãy đảm bảo Docker Desktop đang ở chế độ "Linux Containers".
- **Migrations:** Nếu DB chưa có table, chạy lệnh sau ở thư mục `backend`:
    ```bash
    dotnet ef database update --project Src/PIED_LMS.Persistence --startup-project Src/PIED_LMS.API
    ```
    _(Cần cài đặt `dotnet-ef` tool: `dotnet tool install --global dotnet-ef`)_

Chúc bạn và bạn của bạn code vui vẻ! 🚀

---

## 5. Quy ước OpenAPI cho backend (mới)

Để tránh mapping OpenAPI thủ công lặp lại ở tầng Presentation, endpoint `ServiceResponse<T>` nên dùng helper:

- `WithServiceResponseOpenApi<T>(ServiceResponseStatusProfile profile)`
- `WithServiceResponseOpenApi<T>(params int[] statusCodes)`

Ví dụ:

```csharp
group.MapGet("/{id}", GetById)
    .WithName("GetById")
    .RequireAuthorization()
    .WithServiceResponseOpenApi<MyResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);
```

Quy tắc áp dụng:

1. Không viết chuỗi `.WithOpenApi().Produces<ServiceResponse<...>>()` lặp lại cho endpoint mới nếu có thể dùng helper.
2. Chỉ dùng custom `statusCodes` khi profile chuẩn chưa đủ.
3. Security trong Swagger sẽ tự suy luận theo metadata `RequireAuthorization` / `AllowAnonymous`, không cần hardcode public endpoint list.
