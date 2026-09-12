A. Phía Backend (hanoirent-backend)

- entity/User.java (và các file Enum Role, District, PostStatus)

Tác dụng: Khai báo cấu trúc bảng CSDL (Database Schema) bằng Java Object.

Điểm cần chú ý: Các Annotation @Entity, @Table(name = "users") giúp Hibernate tự động tạo bảng trong PostgreSQL; @Enumerated(EnumType.STRING) giúp lưu chuỗi chữ vào DB thay vì số Index.

- repository/UserRepository.java

Tác dụng: Lớp giao tiếp trực tiếp với Database.

Điểm cần chú ý: Kế thừa JpaRepository<User, Long> giúp em có sẵn các hàm như save(), findAll(), findById() mà không cần viết lệnh SQL thủ công. Hàm findByEmail() được Spring Data JPA tự động tạo câu query SQL tương ứng.

- dto/RegisterRequest.java & dto/LoginRequest.java

Tác dụng: DTO (Data Transfer Object) làm nhiệm vụ "hộp chứa dữ liệu" gửi từ Frontend lên, tránh việc lộ hoặc thừa các trường thông tin không cần thiết.

- service/AuthService.java

Tác dụng: Chứa toàn bộ logic nghiệp vụ (Business Logic) của ứng dụng.

Điểm cần chú ý: Kiểm tra email đã tồn tại chưa (existsByEmail), so sánh mật khẩu, khởi tạo đối tượng User mới và gọi userRepository.save() để lưu vào PostgreSQL.

- controller/AuthController.java

Tác dụng: Tạo các điểm tiếp nhận request (API Endpoints) để bên ngoài (Frontend/Postman) gọi vào.

Điểm cần chú ý: Dùng @PostMapping("/register") và @PostMapping("/login"), nhận JSON từ client thông qua @RequestBody rồi truyền sang AuthService xử lý.

config/SecurityConfig.java

Tác dụng: Cấu hình bảo mật Spring Security.

Điểm cần chú ý: Dòng .requestMatchers("/api/auth/\*\*").permitAll() mở đường cho các request Đăng ký/Đăng nhập chạy qua mà không bị chặn lại bởi tường lửa bảo mật.

B. Phía Frontend (hanoirent-frontend)
src/api/axios.js

Tác dụng: Khởi tạo một cổng giao tiếp HTTP tập trung tới địa chỉ Backend http://localhost:8080/api.

src/pages/Register.jsx & src/pages/Login.jsx

Tác dụng: Xây dựng giao diện biểu mẫu (Form) bằng React Component và Tailwind CSS.

Điểm cần chú ý: Sử dụng useState để lưu thông tin người dùng gõ trên bàn phím, dùng API.post('/auth/login', formData) để kích hoạt gọi API sang Spring Boot. Sau khi đăng nhập thành công, dùng localStorage.setItem('user', ...) để lưu phiên đăng nhập ở trình duyệt.

src/App.jsx

Tác dụng: Định tuyến trang web (Routing). Khi người dùng vào /login sẽ render file Login.jsx, vào /register sẽ render Register.jsx.

SƠ ĐỒ MÔ TẢ LUỒNG HOẠT ĐỘNG TOÀN DIỆN (LUỒNG ĐĂNG NHẬP)

[1. Người dùng bấm Đăng nhập]
│
▼
[2. Login.jsx (ReactJS)] ──(Gửi dữ liệu JSON qua Axios)──► [3. AuthController (Spring Boot)]
│
(Truyền dữ liệu vào Service)
│
▼
[5. PostgreSQL Database] ◄──(Truy vấn SQL findByEmail)──── [4. AuthService (Business Logic)]
│ │
(Trả kết quả User) (Kiểm tra đúng Mật khẩu?)
│ │
└───────────────────────(Trả kết quả JSON)─────────────────┘
│
▼
[6. Login.jsx nhận dữ liệu] ──► [7. Lưu thông tin vào localStorage & Chuyển sang Trang chủ]

Diễn giải chi tiết:

Frontend (ReactJS): Người dùng nhập Email + Password vào Login.jsx và ấn nút. Hàm handleSubmit chạy, gom dữ liệu vào biến formData.

Axios (HTTP Client): axios.js đóng gói formData thành chuỗi JSON và bắn một request POST tới http://localhost:8080/api/auth/login.

Spring Security & Controller (Spring Boot): SecurityConfig thấy endpoint /api/auth/login hợp lệ nên cho qua. AuthController đón lấy chuỗi JSON, chuyển thành đối tượng LoginRequest và đẩy sang AuthService.

Service & Repository: AuthService gọi UserRepository.findByEmail(). Spring Data JPA biên dịch hàm này thành câu lệnh SQL SELECT \* FROM users WHERE email = ... rồi gửi xuống PostgreSQL.

Database (PostgreSQL): PostgreSQL tìm kiếm dòng dữ liệu khớp với Email và trả kết quả về cho Java.

Xử lý Logic & Phản hồi: AuthService lấy mật khẩu lưu trong DB ra so sánh với mật khẩu người dùng vừa nhập.

Nếu đúng: Trả về thông tin User kèm HTTP Status 200 OK.

Nếu sai: Ném ra ngoại lệ (Exception) trả về HTTP Status 400 Bad Request kèm thông báo lỗi.

Cập nhật UI (ReactJS): Login.jsx nhận kết quả trả về:

Nếu thành công: Lưu dữ liệu User vào bộ nhớ trình duyệt (localStorage) và dùng navigate('/') chuyển sang trang chính.

Nếu thất bại: Nhận dòng thông báo lỗi và hiển thị khung màu đỏ lên màn hình cho người dùng biết.
