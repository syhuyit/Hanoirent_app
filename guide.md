# HƯỚNG DẪN DỰ ÁN HANOIRENT (DEVELOPER & ARCHITECTURE GUIDE)

> **Chào mừng bạn đến với dự án Hanoirent!**  
> Tài liệu này được biên soạn chi tiết nhằm giúp bất kỳ ai (developer mới, người đọc đồ án, người kiểm thử) có thể nhanh chóng nắm bắt bức tranh toàn cảnh, kiến trúc hệ thống, cấu trúc mã nguồn và bắt đầu chạy dự án ngay trong vài phút.

---

## 1. Tổng quan Dự án (Project Overview)

**Hanoirent** là nền tảng công nghệ hỗ trợ tìm kiếm và quản lý phòng trọ, căn hộ cho thuê minh bạch tại khu vực Hà Nội. Ứng dụng giải quyết triệt để các vấn nạn nhức nhối trên thị trường hiện nay: môi giới lừa đảo, chi phí điện nước "mập mờ", tin ảo, phòng đã cho thuê nhưng vẫn để tin.

### Các Giá Trị Cốt Lõi:
1. **Kiểm duyệt 100% (Zero Fake Listings):** Mọi bài đăng của Chủ trọ đều phải qua hàng chờ phê duyệt của Admin trước khi được phát hành ra công chúng.
2. **Minh bạch Chi phí Sinh hoạt:** Không chỉ có giá thuê, từng đơn giá điện (VNĐ/kWh), nước (VNĐ/m³), mạng internet và phí dịch vụ chung đều được niêm yết rõ ràng.
3. **Tiện ích Hiện đại:** Hỗ trợ tìm kiếm theo tiêu chí thực tế như: **Hỗ trợ sạc xe đạp/xe máy điện**, **Cho nuôi thú cưng**, **Giờ giấc tự do 24/7**, **Chỗ để xe**, **Điều hòa**, **Bình nóng lạnh**.
4. **Trực quan & Hiện đại:** Giao diện Dark Theme cao cấp, bộ lọc đa chiều (Quận/Huyện, Phường/Xã, Loại hình, Khoảng giá, Tiện ích), thư viện ảnh tương tác Cloudinary.

---

## 2. Công nghệ Sử dụng (Tech Stack)

### Phía Backend (`hanoirent-backend`):
- **Ngôn ngữ & Framework:** Java 17, Spring Boot 3.2.0
- **Bảo mật & Xác thực:** Spring Security, BCrypt, JWT (JJWT 0.11.5)
- **Cơ sở dữ liệu & ORM:** PostgreSQL, Spring Data JPA, Hibernate
- **Dynamic Search & Query:** JPA Criteria API, Spring Data JPA `Specification`, `Pageable`
- **Quản lý Hình ảnh:** Cloudinary Java SDK (tích hợp fallback ảnh tự động chất lượng cao)
- **Tiện ích:** Lombok, Jakarta Validation

### Phía Frontend (`hanoirent-frontend`):
- **Core:** React 19, Vite 8
- **Định tuyến (Routing):** React Router DOM v7
- **Giao diện & Styling:** Tailwind CSS v4, Lucide React Icons
- **HTTP Client:** Axios (kết hợp Request Interceptor tự động gắn Bearer Token)

---

## 3. Kiến trúc Phân Quyền & Luồng Hoạt động (User Roles & Workflows)

Hệ thống phân chia 3 vai trò người dùng rõ ràng (`Role`):

```
                        ┌──────────────────┐
                        │   ĐĂNG NHẬP /    │
                        │    ĐĂNG KÝ       │
                        └────────┬─────────┘
                                 │
                 Kiểm tra Role của tài khoản
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
 ┌───────────────┐       ┌───────────────┐       ┌───────────────────┐
 │     ADMIN     │       │   LANDLORD    │       │  TENANT / GUEST   │
 │ (Quản trị)    │       │   (Chủ trọ)   │       │   (Người thuê)    │
 └───────┬───────┘       └───────┬───────┘       └─────────┬─────────┘
         │                       │                         │
         ▼                       ▼                         ▼
   Điều hướng:             Điều hướng:               Điều hướng:
    `/admin`                `/my-posts`                  `/`
- Duyệt bài PENDING     - Đăng bài mới (+ảnh)     - Tìm kiếm đa tiêu chí
- Từ chối bài rác       - Sửa bài đăng            - Lọc chi phí, tiện ích
- Quản lý tin toàn sàn  - Đánh dấu "Đã thuê"      - Xem chi tiết (`/room/:id`)
                        - Xóa bài của mình        - Gọi điện trực tiếp chủ trọ
```

---

## 4. Cấu trúc Thư mục Chi tiết (Directory Structure)

### A. Backend (`hanoirent-backend/src/main/java/com/hanoirent/backend/`)
```
backend/
├── config/
│   └── SecurityConfig.java          # Cấu hình Spring Security, CORS, lọc request
├── controller/
│   ├── AuthController.java          # API /api/auth (Đăng ký, Đăng nhập)
│   ├── PostController.java          # API /api/posts (Tìm kiếm, xem, tạo, sửa, xóa, duyệt bài)
│   └── UploadController.java        # API /api/upload/images (Tải ảnh lên Cloudinary)
├── dto/
│   ├── AuthResponse.java            # DTO trả về sau đăng nhập (kèm Token)
│   ├── CreatePostRequest.java       # DTO tạo & sửa bài đăng phòng trọ
│   ├── LoginRequest.java            # DTO tiếp nhận email + password
│   ├── PostFilterRequest.java       # DTO bộ lọc tìm kiếm đa tiêu chí & phân trang
│   └── RegisterRequest.java         # DTO đăng ký tài khoản mới
├── entity/
│   ├── District.java                # Enum 12 Quận/Huyện Hà Nội
│   ├── Post.java                    # Entity bài đăng (Status: PENDING, APPROVED, REJECTED)
│   ├── PostStatus.java              # Enum trạng thái duyệt
│   ├── PropertyType.java            # Enum loại hình (ROOM, MINI_APARTMENT, SERVICE_APARTMENT, HOUSE)
│   ├── Role.java                    # Enum vai trò (ADMIN, LANDLORD, TENANT)
│   ├── Room.java                    # Entity phòng (giá, diện tích, điện, nước, tiện ích, ảnh...)
│   └── User.java                    # Entity người dùng
├── repository/
│   ├── PostRepository.java          # JPA Repo kế thừa JpaSpecificationExecutor
│   ├── RoomRepository.java          # JPA Repo thao tác với bảng rooms
│   └── UserRepository.java          # JPA Repo tìm kiếm theo Email, Số điện thoại
├── service/
│   ├── AuthService.java             # Logic đăng nhập, đăng ký, đối soát mật khẩu
│   ├── CloudinaryService.java       # Xử lý upload ảnh Cloudinary + fallback Unsplash
│   └── PostService.java             # Nghiệp vụ bài đăng: tìm kiếm nâng cao, tạo, sửa, xóa, duyệt
└── specification/
    └── PostSpecification.java       # Xây dựng câu truy vấn động (JPA Criteria Predicates)
```

### B. Frontend (`hanoirent-frontend/src/`)
```
frontend/src/
├── api/
│   └── axios.js                     # Cấu hình Axios BaseURL & gắn Bearer Token
├── components/
│   ├── Navbar.jsx                   # Thanh điều hướng Dark Theme, nhận diện Role thông minh
│   └── ProtectedRoute.jsx           # Bảo vệ các Route yêu cầu quyền (Admin, Landlord)
├── constants/
│   └── roomConstants.js             # Dữ liệu dùng chung: Danh sách Quận, Loại hình, Khoảng giá
├── pages/
│   ├── AdminDashboard.jsx           # Giao diện duyệt bài chờ duyệt (PENDING) cho Admin
│   ├── CreatePost.jsx               # Form đăng bài trọ mới: chọn loại hình, tiện ích, upload ảnh
│   ├── Home.jsx                     # Trang chủ: Bộ lọc tìm kiếm đa năng, tabs loại hình, phân trang
│   ├── Login.jsx                    # Màn hình đăng nhập & điều hướng thông minh theo Role
│   ├── MyPosts.jsx                  # Quản lý bài đăng của riêng Chủ trọ (Đã cho thuê / Mở lại / Sửa / Xóa)
│   ├── Register.jsx                 # Màn hình đăng ký thành viên
│   ├── RoomDetail.jsx               # Trang chi tiết phòng trọ: Album ảnh, bảng chi phí, hotline
│   └── UpdatePost.jsx               # Form cập nhật thông tin phòng & quản lý album ảnh
├── App.jsx                          # Cấu hình Router toàn ứng dụng
└── main.jsx                         # Điểm khởi chạy React DOM
```

---

## 5. Hướng dẫn Khởi chạy Dự án (Getting Started)

### Bước 1: Chuẩn bị Môi trường
- **Java Development Kit (JDK):** Phiên bản 17 trở lên (`java -version`).
- **Node.js & npm:** Node 18+ (`node -v` và `npm -v`).
- **PostgreSQL:** Tạo database có tên `hanoirent_db`.

### Bước 2: Cấu hình Cơ sở dữ liệu Backend
Mở file `hanoirent-backend/src/main/resources/application.properties` và điều chỉnh thông số PostgreSQL của bạn nếu khác mặc định:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hanoirent_db
spring.datasource.username=postgres
spring.datasource.password=123456

# Cấu hình Cloudinary (đã tích hợp sẵn key demo, có fallback nếu không có mạng)
cloudinary.cloud-name=adsmcr83
cloudinary.api-key=161618513986267
cloudinary.api-secret=LK7bY7jfzmOLF_h0uuUMVYv-byY
```

### Bước 3: Khởi động Backend
Mở Terminal tại thư mục `hanoirent-backend`:
```bash
# Trên Windows PowerShell:
./mvnw.cmd spring-boot:run

# Hoặc kiểm tra biên dịch:
./mvnw.cmd test-compile
```
Backend sẽ khởi động thành công trên cổng: `http://localhost:8080`.

### Bước 4: Khởi động Frontend
Mở một cửa sổ Terminal mới tại thư mục `hanoirent-frontend`:
```bash
npm install
npm run dev
```
Trình duyệt sẽ mở ứng dụng tại địa chỉ: `http://localhost:5173`.

---

## 6. Hướng dẫn Thử nghiệm Các Tính năng Chính (Walkthrough)

### 1. Luồng Người thuê (Tenant / Khách vãng lai):
- Truy cập `http://localhost:5173/`.
- **Lọc theo Loại hình:** Bấm vào các thẻ `Phòng trọ`, `Chung cư mini`, `Căn hộ dịch vụ`, `Nhà nguyên căn`.
- **Lọc theo Khu vực:** Chọn Quận/Huyện và gõ tên Xã/Phường (ví dụ: "Dịch Vọng").
- **Lọc Nâng cao:** Bấm nút **"Lọc"** để mở bảng lọc chuyên sâu:
  - Giới hạn giá điện tối đa (VD: 4.000 đ/số).
  - Giới hạn giá nước tối đa (VD: 30.000 đ/khối).
  - Tích chọn: `Sạc xe điện`, `Nuôi thú cưng`, `Giờ tự do`, `Có điều hòa`, `Bình nóng lạnh`.
- Bấm **"Chi tiết"** để vào trang `/room/:id`: xem album ảnh lớn, bảng chi phí chi tiết, thông tin chủ trọ và nút gọi điện.

### 2. Luồng Chủ trọ (Landlord):
- Đăng ký/Đăng nhập tài khoản có Role là `LANDLORD`.
- Hệ thống tự động chuyển hướng vào **Khu vực Chủ trọ (`/my-posts`)**.
- Bấm **"Đăng bài trọ ngay"** (`/create-post`): điền thông số phòng, chọn loại hình, tải nhiều ảnh từ máy tính.
- Sau khi đăng, bài viết sẽ ở trạng thái `Chờ duyệt` (chưa xuất hiện trên trang chủ).
- Sau khi được Admin duyệt:
  - Nếu phòng đã có người thuê: Bấm **"Đã cho thuê"** $\rightarrow$ Bài viết lập tức bị ẩn khỏi trang chủ của Người thuê.
  - Khi phòng trống trở lại: Bấm **"Mở lại phòng"** $\rightarrow$ Bài viết lập tức hiển thị lại trên trang chủ.
  - Bấm **"Sửa"** (`/update-post/:id`) để cập nhật thông tin hoặc xóa/thêm ảnh.

### 3. Luồng Quản trị viên (Admin):
- Đăng nhập tài khoản có Role là `ADMIN`.
- Hệ thống tự động đưa vào **Trang Quản trị (`/admin`)**.
- Xem danh sách các bài đăng đang chờ duyệt (`PENDING`), kiểm tra nội dung, địa chỉ, ảnh phòng.
- Bấm **"Duyệt bài"** (chuyển trạng thái sang `APPROVED` để phát hành công khai) hoặc **"Từ chối"** (`REJECTED`).

---

## 7. Tài liệu API Tham khảo (API Endpoints)

| Phương thức | Đường dẫn API | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới | Public |
| `POST` | `/api/auth/login` | Đăng nhập hệ thống | Public |
| `GET` | `/api/posts/search` | Tìm kiếm & lọc đa tiêu chí (phân trang) | Public |
| `GET` | `/api/posts/{id}` | Lấy chi tiết bài đăng theo ID | Public |
| `POST` | `/api/upload/images` | Upload nhiều ảnh phòng trọ lên Cloudinary | LANDLORD / ADMIN |
| `POST` | `/api/posts` | Tạo bài đăng phòng trọ mới | LANDLORD / ADMIN |
| `PUT` | `/api/posts/{id}` | Cập nhật bài đăng | Chính chủ Chủ trọ |
| `DELETE` | `/api/posts/{id}?landlordId={id}` | Xóa bài đăng an toàn | Chính chủ Chủ trọ |
| `PUT` | `/api/posts/{id}/availability` | Đánh dấu phòng Đã thuê / Mở lại | Chính chủ Chủ trọ |
| `GET` | `/api/posts/landlord/{id}` | Lấy danh sách bài đăng của Chủ trọ | Chính chủ Chủ trọ |
| `GET` | `/api/posts/pending` | Lấy danh sách bài đăng chờ duyệt | ADMIN |
| `PUT` | `/api/posts/{id}/status?status={STATUS}` | Phê duyệt hoặc từ chối bài đăng | ADMIN |

---
*Dự án được bảo trì và phát triển bởi đội ngũ Hanoirent.*
