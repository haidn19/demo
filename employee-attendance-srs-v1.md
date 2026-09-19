# SRS --- Employee Attendance, Compensation & Overtime Calculation

**Version:** 1.0\
**Scope:** Attendance → Daily Time Calculation → Monthly Bù → OT →
Payroll Input

------------------------------------------------------------------------

## 1. Mục tiêu hệ thống

Hệ thống quản lý thời gian làm việc của nhân viên dựa trên dữ liệu chấm
công `IN/OUT`, từ đó tự động tính:

1.  Thời gian làm việc buổi sáng.
2.  Thời gian làm việc buổi chiều.
3.  Thời gian đi sớm --- Early.
4.  Thời gian đi trễ --- Late.
5.  Thời gian Bù.
6.  Thời gian OT.
7.  Hệ số OT.
8.  Tổng Bù tích lũy trong tháng.
9.  Khoản khấu trừ lương do thiếu thời gian.

Hệ thống **không sử dụng OT để bù cho thời gian thiếu**.

OT và Bù là **hai cơ chế độc lập**.

------------------------------------------------------------------------

## 2. Định nghĩa

  Thuật ngữ    Ý nghĩa
  ------------ ----------------------------------------------------------
  IN           Thời điểm check-in được hệ thống xác định trong ngày
  OUT          Thời điểm check-out được hệ thống xác định trong ngày
  Early        Thời gian nhân viên đến trước 08:30
  Late         Thời gian nhân viên đến sau 08:30
  Morning      Công buổi sáng
  Afternoon    Công buổi chiều
  Bù           Số phút dư/thiếu thời gian làm việc, tích lũy theo tháng
  OT           Thời gian làm thêm, dùng để tính lương
  Normal Day   Ngày làm việc bình thường
  Weekend      Ngày cuối tuần
  Holiday      Ngày lễ

------------------------------------------------------------------------

## 3. Lịch làm việc chuẩn

Một ngày làm việc bình thường:

``` text
08:30 ───────────── 12:00    14:00 ───────────── 17:30
       Morning                    Afternoon

              12:00 ─── 14:00
                    Lunch
```

### 3.1. Thời gian làm việc

  Khoảng thời gian            Thời lượng
  --------------------- ----------------
  08:30 → 12:00                  3.5 giờ
  12:00 → 14:00                Nghỉ trưa
  14:00 → 17:30                  3.5 giờ
  **Tổng công chuẩn**     **7 giờ/ngày**

Hệ thống **không tính thời gian làm việc trong khoảng 12:00--14:00**.

Nếu nhân viên có hoạt động/chấm công trong khoảng này, hệ thống V1
**không tự động xử lý**. HR có thể điều chỉnh dữ liệu sau.

------------------------------------------------------------------------

## 4. Quy tắc xác định IN / OUT

Một nhân viên có thể có nhiều record chấm công trong cùng một ngày.

### 4.1. IN

IN được xác định bằng thời điểm sớm nhất trong ngày:

``` text
IN = MIN(all attendance timestamps)
```

### 4.2. OUT

OUT được xác định bằng thời điểm muộn nhất trong ngày:

``` text
OUT = MAX(all attendance timestamps)
```

### 4.3. Ví dụ

Raw attendance:

``` text
07:45
08:20
12:00
14:00
17:40
18:30
```

Kết quả:

``` text
IN  = 07:45
OUT = 18:30
```

Các record ở giữa không được sử dụng để tạo các khoảng IN/OUT riêng
biệt.

------------------------------------------------------------------------

## 5. Quy tắc Early

Early được tính khi:

``` text
IN < 08:30
```

Hệ thống chỉ bắt đầu tính Early từ:

``` text
07:00
```

Do đó thời gian trước 07:00 không được tính.

### Công thức

``` text
Early = 08:30 - IN
```

Điều kiện:

``` text
07:00 <= IN < 08:30
```

### Ví dụ

``` text
IN = 08:00
```

→ Early = 30 phút

→ Bù = -30 phút

------------------------------------------------------------------------

## 6. Quy tắc Late

Late chỉ áp dụng đối với ngày làm việc bình thường.

### 6.1. Từ 08:30 đến trước 09:00

Thời gian trễ được tính hệ số `×1`.

Ví dụ:

``` text
IN = 08:45
```

→ Late = 15 phút

→ Bù = +15 phút

### 6.2. Từ 09:00 đến trước 09:30

Thời gian trễ được tính hệ số `×2`.

Ví dụ:

``` text
IN = 09:10
```

→ Late = 10 phút

→ Bù = +20 phút

Công thức:

``` text
Weighted Late = Late Minutes × 2
```

------------------------------------------------------------------------

## 7. Mất công buổi sáng

Nếu:

``` text
IN >= 09:30
```

thì nhân viên được xác định là:

> **Mất công buổi sáng**

Điểm biên:

``` text
09:30 chính xác = mất công sáng
```

### Kết quả

``` text
Morning = 0
```

Phần Afternoon vẫn được tính bình thường.

Ví dụ:

``` text
IN  = 10:00
OUT = 17:30
```

Kết quả:

``` text
Morning   = 0
Afternoon = 3.5 giờ
Bù        = 0
```

Thời gian thiếu buổi sáng **không được cộng vào Bù**.

------------------------------------------------------------------------

## 8. Quy tắc quên checkout

Đối với **ngày làm việc bình thường**, nếu nhân viên có IN nhưng không
có checkout phù hợp:

``` text
OUT = 17:30
```

Hệ thống sử dụng `17:30` làm thời điểm OUT mặc định.

### Ví dụ

``` text
IN = 08:30
Không có OUT
```

Hệ thống tính:

``` text
IN  = 08:30
OUT = 17:30
```

Sau đó tính công bình thường.

### Trường hợp IN sau 09:30

Ví dụ:

``` text
IN = 10:00
Không có OUT
```

Hệ thống:

``` text
OUT       = 17:30
Morning   = 0
Afternoon = 3.5h
Bù        = 0
```

------------------------------------------------------------------------

## 9. Quy tắc Bù

Bù là **số dư thời gian được tích lũy theo tháng**, không phải giá trị
được quyết toán độc lập từng ngày.

### 9.1. Quy ước dấu

``` text
Bù < 0
→ Nhân viên dư thời gian

Bù = 0
→ Cân bằng

Bù > 0
→ Nhân viên thiếu thời gian
```

### 9.2. Early tạo Bù âm

Ví dụ:

``` text
IN = 08:00
```

Early:

``` text
30 phút
```

Bù:

``` text
-30 phút
```

### 9.3. Late ×1 tạo Bù dương

Ví dụ:

``` text
IN = 08:45
```

Late:

``` text
15 phút
```

Bù:

``` text
+15 phút
```

### 9.4. Late ×2 tạo Bù dương theo trọng số

Ví dụ:

``` text
IN = 09:10
```

Late thực tế:

``` text
10 phút
```

Bù:

``` text
10 × 2 = +20 phút
```

------------------------------------------------------------------------

## 10. Khoảng 17:30 → 18:00

Đối với ngày làm việc bình thường:

``` text
17:30 → 18:00
```

được tính là thời gian Bù âm.

Ví dụ:

``` text
OUT = 18:00
```

→ Bù = -30 phút

------------------------------------------------------------------------

## 11. OT

OT bắt đầu **sau 18:00** đối với ngày làm việc bình thường.

``` text
17:30 → 18:00 = Bù
> 18:00        = OT
```

### Ví dụ

``` text
OUT = 18:30
```

Kết quả:

``` text
Bù = -30 phút
OT = 30 phút
```

OT **không được dùng để bù vào Bù**.

------------------------------------------------------------------------

## 12. Hệ số OT

### 12.1. Ngày làm việc bình thường

``` text
OT Rate = 150%
```

### 12.2. Cuối tuần

``` text
OT Rate = 200%
```

Toàn bộ thời gian làm việc hợp lệ trong ngày cuối tuần được coi là OT.

### 12.3. Ngày lễ

``` text
OT Rate = 300%
```

Toàn bộ thời gian làm việc hợp lệ trong ngày lễ được coi là OT.

### 12.4. Ngày lễ trùng cuối tuần

Ưu tiên:

``` text
Holiday = 300%
```

thay vì:

``` text
Weekend = 200%
```

------------------------------------------------------------------------

## 13. Bù và OT độc lập

Đây là business rule quan trọng.

Ví dụ:

``` text
IN  = 07:30
OUT = 18:30
```

Tính:

``` text
Early:
07:30 → 08:30 = -60 phút

Bù:
17:30 → 18:00 = -30 phút

OT:
18:00 → 18:30 = 30 phút
```

Kết quả:

``` text
Bù = -90 phút
OT = 30 phút
```

Không có phép tính dùng OT để giảm Bù.

------------------------------------------------------------------------

## 14. Ngày cuối tuần và ngày lễ

Ngày cuối tuần/ngày lễ được xử lý khác ngày làm việc bình thường.

### Weekend

Toàn bộ thời gian làm việc hợp lệ:

``` text
→ OT ×200%
```

### Holiday

Toàn bộ thời gian làm việc hợp lệ:

``` text
→ OT ×300%
```

Nếu Holiday trùng Weekend:

``` text
→ OT ×300%
```

------------------------------------------------------------------------

## 15. Tính công Morning / Afternoon

Ngày làm việc bình thường có hai khoảng công:

``` text
Morning:
08:30 → 12:00

Afternoon:
14:00 → 17:30
```

Nếu nhân viên mất buổi sáng:

``` text
Morning = 0
```

Afternoon vẫn được tính độc lập.

Ví dụ:

``` text
IN  = 10:00
OUT = 17:30
```

→

``` text
Morning   = 0
Afternoon = 3.5h
```

------------------------------------------------------------------------

## 16. Tính Bù theo tháng

Mỗi ngày tạo ra một **Bù contribution**.

Ví dụ:

  Ngày     Early   Late    Bù
  ------ ------- ------ -----
  01         -30      0   -30
  02           0    +15   +15
  03           0    +20   +20
  04         -30      0   -30

Cuối tháng:

``` text
Monthly Bù
= -30 + 15 + 20 - 30
= -25 phút
```

Kết quả:

``` text
Bù tháng = -25 phút
```

------------------------------------------------------------------------

## 17. Quy tắc khấu trừ lương

Sau khi tổng hợp Bù của tháng:

``` text
Bù <= 60 phút
→ Không khấu trừ lương
```

Nếu:

``` text
Bù > 60 phút
→ Khấu trừ lương
```

Công thức quy đổi chính xác:

``` text
Bù minutes → Salary deduction
```

sẽ được đặc tả trong Payroll Specification riêng.

------------------------------------------------------------------------

## 18. Daily Calculation Result

Sau khi xử lý attendance, hệ thống nên tạo kết quả tính toán cho từng
ngày, tối thiểu gồm:

``` text
Employee
Date

IN
OUT
Effective OUT

Morning
Afternoon

Early Minutes

Late Minutes
Late Multiplier
Weighted Late Minutes

Daily Bù Contribution

OT Minutes
OT Multiplier
```

Ví dụ:

``` text
Date: 2026-09-10

IN: 08:45
OUT: 18:30

Morning: 3h15
Afternoon: 3h30

Late: 15m
Late Multiplier: 1x
Weighted Late: 15m

Bù:
+15 - 30
= -15m

OT:
30m
Rate: 150%
```

------------------------------------------------------------------------

## 19. Luồng xử lý nghiệp vụ

``` text
                    Attendance Records
                           │
                           ▼
                 ┌──────────────────┐
                 │ Normalize IN/OUT │
                 │                  │
                 │ IN  = MIN(time)  │
                 │ OUT = MAX(time)  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Determine Day    │
                 │ Type             │
                 └────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
          Normal       Weekend      Holiday
             │            │            │
             ▼            ▼            ▼
        Morning/       OT ×200%     OT ×300%
        Afternoon
             │
      ┌──────┴──────┐
      ▼             ▼
    Early          Late
      │             │
      ▼             ▼
   Bù âm        Bù dương
      │             │
      └──────┬──────┘
             ▼
        Daily Bù
             │
             ▼
      Monthly Bù Balance
             │
             ▼
      Payroll Calculation
```

------------------------------------------------------------------------

## 20. Các vấn đề KHÔNG thuộc Scope V1

Các trường hợp dưới đây cố tình chưa đưa vào calculation engine hiện
tại. Chúng được xem là **Future Change Request / Enhancement**.

### CR-01 --- HR override attendance

HR có thể sửa:

-   IN
-   OUT
-   Morning
-   Afternoon
-   Bù
-   OT

hoặc yêu cầu hệ thống tính lại.

------------------------------------------------------------------------

### CR-02 --- Employee có Early nhưng rời công ty rồi quay lại sau 09:30

Trường hợp:

``` text
07:30 → rời công ty
10:00 → quay lại
```

Không xử lý tự động bằng nhiều session.

Hệ thống V1 vẫn áp dụng:

``` text
IN  = MIN(timestamp)
OUT = MAX(timestamp)
```

Các trường hợp đặc biệt sẽ được HR xử lý thủ công.

------------------------------------------------------------------------

### CR-03 --- Làm việc trong giờ lunch

Hệ thống V1 **không tự động tính thời gian làm việc 12:00--14:00**.

Nếu nhân viên làm việc trong khoảng này, HR sẽ xử lý/chỉnh sửa sau.

------------------------------------------------------------------------

### CR-04 --- Attendance chỉ có OUT

Chưa đưa vào calculation engine V1.

Sẽ có cơ chế HR xử lý dữ liệu bất thường trong phiên bản sau.

------------------------------------------------------------------------

### CR-05 --- Không có attendance

Việc phân biệt:

``` text
Absent
Leave
Holiday
Day Off
Unpaid Leave
```

sẽ được xử lý bởi module quản lý ngày nghỉ/HR trong phase sau.

------------------------------------------------------------------------

### CR-06 --- Attendance conflict với Leave

Ví dụ:

``` text
Approved Leave
+
Attendance
```

Chưa tự động resolve trong V1.

------------------------------------------------------------------------

### CR-07 --- Công thức tiền khấu trừ Bù

Rule hiện tại mới xác định:

``` text
Bù > 60 phút → có khấu trừ
```

Công thức:

``` text
Bù minutes → Salary deduction
```

sẽ được định nghĩa trong Payroll Specification.

------------------------------------------------------------------------

### CR-08 --- Bù âm có được trả thêm tiền hay không

Hiện tại:

``` text
Bù < 0
```

chỉ thể hiện nhân viên **dư thời gian**.

Chưa tự động chuyển thành tiền lương cộng thêm.

------------------------------------------------------------------------

## 21. Nguyên tắc thiết kế

Nên giữ **3 loại dữ liệu riêng biệt**:

``` text
Raw Attendance
      │
      ▼
Daily Calculation Result
      │
      ├──────────────► OT
      │
      ▼
Monthly Bù Balance
      │
      ▼
Payroll
```

### Raw Attendance

Trả lời:

> Máy chấm công ghi nhận những timestamp nào?

### Daily Calculation

Trả lời:

> Hệ thống tính ngày này như thế nào?

### Monthly Bù

Trả lời:

> Trong tháng nhân viên đang dư/thiếu bao nhiêu thời gian?

### Payroll

Trả lời:

> Cuối cùng nhân viên được/trừ bao nhiêu tiền?

Đây là nền tảng để triển khai calculation engine mà không làm business
logic bị dính chặt vào raw attendance.
