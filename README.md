# 📘 HƯỚNG DẪN TOÀN TẬP: QUẢN TRỊ BOT BÁN HÀNG & MÁY CHỦ LINUX (VPS)

Tài liệu này cung cấp chi tiết toàn bộ các lệnh thao tác trên Bot dành cho Admin và các lệnh thao tác dưới hệ thống máy chủ Linux.

---

## PHẦN 1: TẤT TẦN TẬT CÁC LỆNH TRÊN TELEGRAM (DÀNH CHO ADMIN)

Bạn cần nhắn tin trực tiếp với Bot trên Telegram và gõ các lệnh dưới đây. (Chỉ những ID được cấu hình trong `.env` mới có quyền sử dụng).

### 1. Quản lý Sản Phẩm & Danh Mục
*   `/addcategory [Tên danh mục] | [Emoji]` : Tạo danh mục mới.
    *   *Ví dụ:* `/addcategory Tài khoản Netflix | 🎬`
*   `/addproduct [ID Danh mục] | [Tên sản phẩm] | [Giá tiền]` : Thêm sản phẩm mới.
    *   *Ví dụ:* `/addproduct 1 | Netflix 1 Tháng | 50000`
*   `/listproduct` : Xem danh sách toàn bộ sản phẩm (để lấy ID sản phẩm).
*   `/editprice [ID Sản phẩm] [Giá mới]` : Đổi giá bán.
    *   *Ví dụ:* `/editprice 1 45000`
*   `/editname [ID Sản phẩm] [Tên mới]` : Đổi tên sản phẩm.
    *   *Ví dụ:* `/editname 1 Netflix 1 Tháng (Bảo hành)`
*   `/toggleproduct [ID Sản phẩm]` : Ẩn/Hiện sản phẩm trên Menu của khách.
*   `/deleteproduct [ID Sản phẩm]` : Xóa hoàn toàn sản phẩm khỏi hệ thống.

### 2. Quản lý Kho Hàng (Tài khoản để giao tự động)
*   `/addstock [ID Sản phẩm]` : Thêm tài khoản vào kho.
    *   Sau khi gõ lệnh này, bot sẽ yêu cầu bạn gửi danh sách tài khoản. Bạn dán danh sách vào, **mỗi tài khoản nằm trên 1 dòng**.
    *   *Ví dụ nội dung gửi cho bot:*
        `taikhoan1@gmail.com|matkhau1|profile1`
        `taikhoan2@gmail.com|matkhau2|profile2`
*   `/viewstock [ID Sản phẩm]` : Xem chi tiết các tài khoản đang có trong kho của sản phẩm đó.
*   `/clearstock [ID Sản phẩm]` : Xóa sạch các tài khoản **chưa bán** khỏi kho (dùng khi muốn đổi lô hàng mới).

### 3. Quản lý Đơn Hàng & Tiền Bạc
*   `/addmoney [ID Khách Hàng] [Số tiền]` : **Cộng tiền thủ công** cho khách (hoặc cho chính bạn).
    *   *Ví dụ:* `/addmoney 6976645656 100000` (Cộng 100k).
*   `/pending` : Xem danh sách các đơn hàng khách đã tạo nhưng chưa thanh toán.
*   `/orders` : Xem lịch sử 20 đơn hàng gần nhất.
*   `/confirm [ID Đơn hàng]` : Ép xác nhận thanh toán và giao hàng thủ công (dành cho trường hợp Webhook lỗi hoặc khách chuyển khoản thiếu cần châm chước).
*   `/cancelorder [ID Đơn hàng]` : Hủy một đơn hàng đang chờ.

### 4. Cài đặt Cửa Hàng & Khác
*   `/setshop [Tên Shop] | [@Liên_hệ_hỗ_trợ]` : Đổi tên shop và link liên hệ.
    *   *Ví dụ:* `/setshop Tạp Hóa MMO | @hotrommo`
*   `/broadcast` : Gửi thông báo tới toàn bộ người dùng đã từng nhắn tin cho bot. (Sau khi gõ lệnh, bot sẽ đợi bạn gửi nội dung văn bản).
*   `/users` : Xem danh sách người dùng gần đây.
*   `/stats` : Xem bảng thống kê doanh thu, số đơn, số người dùng...
*   `/sync` : Ra lệnh cho bot lập tức kéo dữ liệu mới nhất từ Google Sheet về (Nếu bạn có cấu hình Sheet).

---

## PHẦN 2: THAO TÁC TRÊN MÁY CHỦ LINUX (VPS)

Nếu bạn không muốn dùng tool `cap_nhat_vps.py` trên Windows mà muốn "try hard" như một dân IT chính hiệu, đây là các lệnh thao tác trực tiếp trên VPS Linux.

*Đăng nhập vào VPS thông qua SSH (Dùng PuTTY, MobaXterm hoặc Termius) bằng:*
*   **IP:** ``
*   **User:** `root`
*   **Mật khẩu:** `d49XCLhSPMyzaFJ7`

### 1. Di chuyển vào thư mục chứa Bot
Tất cả mã nguồn của bạn nằm ở thư mục `/opt/telegram-shop-bot`. Để thao tác, lúc nào cũng phải chui vào thư mục này trước:
```bash
cd /opt/telegram-shop-bot
```

### 2. Sửa file cấu hình (.env) trực tiếp trên Linux
```bash
nano .env
```
*(Cửa sổ soạn thảo sẽ mở ra. Dùng phím mũi tên để di chuyển, sửa xong nhấn `Ctrl + O` -> `Enter` để lưu, sau đó nhấn `Ctrl + X` để thoát).*

### 3. Các lệnh PM2 (Trình quản lý Bot)
Bot của bạn đang được quản gia `pm2` giám sát với tên là `shop-bot`. Đây là các lệnh thần thánh bạn cần biết:

*   **Khởi động lại Bot (Cần thiết mỗi khi sửa code hoặc sửa file .env):**
    ```bash
    pm2 restart shop-bot
    ```
*   **Xem màn hình log (Xem bot đang chạy gì, có ai nhắn tin không):**
    ```bash
    pm2 logs shop-bot
    ```
    *(Nhấn `Ctrl + C` để thoát màn hình log).*
*   **Tắt Bot (Bot sẽ ngưng hoạt động):**
    ```bash
    pm2 stop shop-bot
    ```
*   **Bật lại Bot:**
    ```bash
    pm2 start shop-bot
    ```
*   **Xem danh sách các ứng dụng đang chạy:**
    ```bash
    pm2 status
    ```

### 4. Xóa sạch Database (Làm lại từ đầu)
Nếu bạn test nát bét rồi và muốn làm một gian hàng sạch sẽ mới tinh:
```bash
cd /opt/telegram-shop-bot
pm2 stop shop-bot
rm database.sqlite
pm2 start shop-bot
```
*(Sau thao tác này, bot sẽ tự tạo ra một file database.sqlite mới trắng tinh không tì vết).*

---
> 💡 **Mẹo:** Ghi nhớ 2 lệnh quan trọng nhất trong cuộc đời làm Bot: `nano .env` (để sửa thông tin) và `pm2 restart shop-bot` (để áp dụng thông tin vừa sửa).
