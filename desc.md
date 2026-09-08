# TÀI LIỆU ĐẶC TẢ YÊU CẦU DỰ ÁN (PROJECT REQUIREMENTS SPECIFICATION)
**Tên dự án:** Nền tảng Khám phá và Cho thuê Bất động sản Tương tác (Hanoirent)
**Nền tảng:** Web Application
**Khu vực triển khai:** Thành phố Hà Nội

---

## 1. MÔ TẢ TỔNG QUAN (PROJECT OVERVIEW)
Dự án Hanoirent là một nền tảng Web Application kết nối trực tiếp giữa người có nhu cầu thuê chỗ ở (phòng trọ, chung cư mini, nhà nguyên căn) và chủ nhà. Khác với các trang rao vặt truyền thống dạng danh sách nhàm chán, hệ thống áp dụng cơ chế "Social Feed" - cho phép người dùng lướt xem các không gian sống dưới dạng thẻ đa phương tiện trực quan (hình ảnh/video, tóm tắt thông tin). 

Đặc biệt, hệ thống giải quyết vấn nạn lừa đảo thông qua cơ chế: Thu phí khởi tạo tài khoản đối với Chủ cho thuê, đồng thời Quản trị viên sẽ kiểm duyệt thủ công 100% bài đăng mới. Các tính năng tương tác trực tiếp (Gọi điện, Chat Realtime) cũng được tích hợp ngay trên nền tảng.

---

## 2. PHÂN QUYỀN VÀ TÍNH NĂNG CHI TIẾT (ACTORS & FEATURES)

### 2.1. Người thuê (Tenant)
*   **Trải nghiệm Khám phá (Social Feed):** Xem danh sách bài đăng dưới định dạng cuộn dọc trực quan. Mỗi bài đăng hiển thị ngay ảnh nổi bật, mức giá, địa chỉ tóm tắt và thẻ tag tiện ích.
*   **Bộ lọc Tìm kiếm Nâng cao:**
    *   Theo khu vực: Quận/Huyện, Xã/Phường tại Hà Nội.
    *   Theo loại hình: Phòng trọ, Chung cư mini, Căn hộ dịch vụ, Nhà nguyên căn.
    *   Theo chi phí: Khoảng giá thuê, Đơn giá điện (VNĐ/số), Nước (VNĐ/khối), Internet (VNĐ/tháng).
    *   Theo tiện ích và quy định: Số chỗ để xe, Có/Không cho sạc xe điện, Giờ giấc tự do, Nuôi thú cưng, v.v.
*   **Chi tiết phòng:** Xem album ảnh/video, đọc mô tả chi tiết, xem vị trí trên bản đồ (hiển thị địa chỉ chi tiết cụ thể đến số nhà/ngõ).
*   **Tương tác:**
    *   Gắn sao/Lưu bài đăng để xem lại.
    *   Click-to-call: Gọi điện trực tiếp vào số điện thoại của Chủ nhà.
    *   In-app Messaging (Chat trực tiếp): Nhắn tin thời gian thực với Chủ nhà thông qua giao diện như Zalo/Messenger thu nhỏ.

### 2.2. Chủ cho thuê (Landlord)
*   **Xác thực và Trả phí:** Đăng ký tài khoản và đóng một khoản phí dịch vụ ban đầu/định kỳ (qua cổng thanh toán giả lập) để kích hoạt quyền đăng bài, giúp thanh lọc đối tượng lừa đảo.
*   **Quản lý Tin đăng (CRUD Operations):**
    *   *Tạo bài đăng:* Điền form chi tiết về cấu trúc địa chỉ (Dropdown chọn Quận/Phường, Textbox nhập số nhà/ngõ cụ thể), thông số giá cả (tiền phòng, điện, nước, mạng, rác), mô tả bãi xe và các quy định khác.
    *   *Upload Media:* Tải lên nhiều hình ảnh hoặc video mô tả chân thực căn phòng.
*   **Quản lý Trạng thái:** Khi đã chốt được khách thuê, Chủ nhà click nút "Đã cho thuê". Hệ thống tự động gỡ bài đăng khỏi luồng hiển thị (Feed) để tránh bị làm phiền, nhưng vẫn giữ lại trong kho lưu trữ của Chủ nhà để tái kích hoạt khi khách trả phòng.
*   **Quản lý Tương tác:** Nhận và trả lời tin nhắn từ Người thuê thông qua hệ thống Chat nội bộ.

### 2.3. Quản trị viên (Administrator)
*   **Kiểm duyệt Bài đăng (Moderation):** Nhận thông báo khi có bài đăng mới/cập nhật. Admin kiểm tra tính hợp lý của hình ảnh, địa chỉ, mức giá. Admin có thể "Duyệt" (phát hành bài đăng) hoặc "Từ chối" (kèm theo hộp thoại nhập lý do để thông báo lại cho Chủ nhà).
*   **Quản lý Người dùng & An toàn:** 
    *   Tiếp nhận các lượt báo cáo (Report) từ Người thuê.
    *   Khóa/Đình chỉ vĩnh viễn (Ban) đối với các tài khoản Chủ nhà hoặc Người thuê có hành vi lừa đảo, spam, vi phạm tiêu chuẩn.
*   **Thống kê (Dashboard):** Xem tổng quan số lượng bài đăng, lượng người dùng đăng ký mới và tổng doanh thu từ phí đăng ký của Chủ nhà.

---

## 3. QUYẾT ĐỊNH CÔNG NGHỆ (TECHNOLOGY STACK)

### 3.1. Frontend (Giao diện người dùng)
*   **Core Library:** **ReactJS** (Tạo trải nghiệm mượt mà, không load lại trang - Single Page Application, rất phù hợp cho mô hình "Social Feed").
*   **Styling:** **Tailwind CSS** kết hợp với **Ant Design** hoặc **MUI** (Để đẩy nhanh tốc độ code giao diện và đảm bảo tính thẩm mỹ hiện đại).
*   **Tương lai (Phục vụ tính năng 3D):** Sử dụng `React Three Fiber` hoặc `Pannellum` cho trải nghiệm xem không gian 360 độ/3D.

### 3.2. Backend (Máy chủ xử lý logic)
*   **Framework:** **Java Spring Boot**. Đảm bảo cấu trúc code chặt chẽ, dễ bảo trì, cực kỳ mạnh mẽ cho các dự án quy mô lớn của sinh viên CNTT.
*   **Security:** **Spring Security + JWT** (JSON Web Token) để xử lý đăng nhập, phân quyền 3 mảng (Admin, Landlord, Tenant).
*   **ORM:** **Spring Data JPA / Hibernate** (Ánh xạ cơ sở dữ liệu quan hệ sang đối tượng Java).
*   **Realtime Communication:** **WebSocket** kết hợp **STOMP protocol** để xây dựng tính năng nhắn tin trực tiếp (Chat).

### 3.3. Cơ sở dữ liệu (Database) & Lưu trữ (Storage)
*   **Cơ sở dữ liệu chính:** **PostgreSQL**.
    *   *Lý do:* Hệ thống quản lý rất nhiều liên kết phức tạp (Chủ nhà -> Phòng -> Lịch sử chat -> Thanh toán -> Lịch sử duyệt bài). PostgreSQL đảm bảo tính toàn vẹn dữ liệu (ACID) tuyệt đối. Đặc biệt, PostgreSQL hỗ trợ PostGIS cực tốt cho dữ liệu tọa độ không gian, làm tiền đề vững chắc để sau này em mở rộng tính năng Bản đồ (tìm trọ quanh đây).
*   **Lưu trữ Media:** **Cloudinary** hoặc **AWS S3** (Chỉ lưu đường dẫn ảnh/video vào PostgreSQL, file thực tế sẽ được đưa lên Cloud để giảm tải cho server).