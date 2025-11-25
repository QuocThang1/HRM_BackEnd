require("dotenv").config();
const mongoose = require("mongoose");
const Policy = require("../models/policy");
const connection = require("../config/database");

const samplePolicies = [
  // ========== NGHỈ PHÉP ==========
  {
    title: "Chính sách nghỉ phép năm",
    category: "leave",
    content: `Nhân viên chính thức được hưởng 12 ngày nghỉ phép có lương trong năm.

Quy định chi tiết:
- Phép năm được tính từ ngày ký hợp đồng chính thức
- Nhân viên có thâm niên từ 2 năm trở lên được cộng thêm 1 ngày/năm (tối đa 15 ngày)
- Phải đăng ký trước ít nhất 3 ngày làm việc với quản lý trực tiếp
- Phép năm không sử dụng hết có thể:
  + Chuyển sang năm sau (tối đa 5 ngày)
  + Hoặc quy đổi thành tiền lương theo mức lương cơ bản

Lưu ý: Phép năm không áp dụng cho nhân viên thử việc.`,
    isActive: true,
  },
  {
    title: "Nghỉ ốm và nghỉ thai sản",
    category: "leave",
    content: `NGHỈ ỐM:
- Được nghỉ ốm có lương khi có giấy xác nhận của bác sĩ
- Công ty chi trả 100% lương trong 3 ngày đầu
- Từ ngày thứ 4 trở đi: chi trả theo quy định BHXH
- Phải thông báo trước 8:00 sáng trong ngày nghỉ

NGHỈ THAI SẢN:
- Nhân viên nữ: 6 tháng nghỉ thai sản có lương theo BHXH
- Nhân viên nam: 5 ngày nghỉ chăm sóc vợ sinh con (có lương 100%)
- Thai nghén: được nghỉ khám thai định kỳ (có lương, tối đa 5 lần)`,
    isActive: true,
  },
  {
    title: "Các loại phép khác",
    category: "leave",
    content: `PHÉP HIẾU/HỈ:
- Kết hôn: 3 ngày nghỉ có lương
- Bố/mẹ, vợ/chồng, con qua đời: 5 ngày nghỉ có lương
- Anh chị em ruột qua đời: 2 ngày nghỉ có lương

PHÉP ĐỘT XUẤT:
- Được duyệt trong trường hợp khẩn cấp (tai nạn, bệnh tật,...)
- Phải thông báo và xin phép trong vòng 24h
- Cần có giấy tờ chứng minh sau khi quay lại làm việc

PHÉP BÙ:
- Khi làm thêm giờ, cuối tuần, được nghỉ bù tương ứng
- Phải sử dụng trong vòng 30 ngày
- Phải thỏa thuận trước với quản lý`,
    isActive: true,
  },

  // ========== LƯƠNG THƯỞNG ==========
  {
    title: "Chính sách lương cơ bản",
    category: "salary",
    content: `CẤU TRÚC LƯƠNG:
- Lương cơ bản: Theo thỏa thuận hợp đồng
- Phụ cấp: Ăn trưa 30.000đ/ngày, xăng xe 20.000đ/ngày
- Lương làm thêm giờ:
  + Ngày thường: 150% lương giờ
  + Cuối tuần: 200% lương giờ
  + Lễ/Tết: 300% lương giờ

NGÀY THANH TOÁN:
- Lương tháng: Trả vào ngày 5 hàng tháng
- Nếu ngày 5 rơi vào cuối tuần/lễ: trả trước vào thứ 6
- Chuyển khoản trực tiếp vào tài khoản ngân hàng

TĂNG LƯƠNG:
- Xét tăng lương định kỳ: 1 lần/năm (tháng 1)
- Dựa trên: Hiệu suất công việc, đánh giá năng lực, thâm niên
- Tăng lương đột xuất: Khi được thăng chức hoặc có thành tích xuất sắc`,
    isActive: true,
  },
  {
    title: "Thưởng và đãi ngộ",
    category: "salary",
    content: `THƯỞNG HIỆU SUẤT:
- Thưởng quý: Dựa trên KPI cá nhân (0.5 - 2 tháng lương)
- Đánh giá vào cuối mỗi quý, chi trả vào tháng tiếp theo

THƯỞNG TẾT:
- Tết Âm lịch: Tối thiểu 1 tháng lương
- Dựa trên hiệu suất năm: 1 - 3 tháng lương
- Nhân viên thử việc: 50% mức thưởng

THƯỞNG DỰ ÁN:
- Khi hoàn thành dự án lớn/quan trọng
- Thưởng theo nhóm dựa trên đóng góp
- Quyết định bởi Ban Giám đốc

THƯỞNG THÂM NIÊN:
- 5 năm: 5 triệu + 5 ngày phép
- 10 năm: 10 triệu + 10 ngày phép
- 15 năm trở lên: 20 triệu + 15 ngày phép`,
    isActive: true,
  },

  // ========== GIỜ LÀM VIỆC ==========
  {
    title: "Giờ làm việc chính thức",
    category: "working_hours",
    content: `THỜI GIAN LÀM VIỆC:
- Thứ 2 đến Thứ 6: 8:00 - 17:00
- Nghỉ trưa: 12:00 - 13:00
- Thứ 7, Chủ nhật: Nghỉ

QUY ĐỊNH CHECK-IN/CHECK-OUT:
- Check-in: Trước 8:15 sáng
- Check-out: Sau 17:00 chiều
- Phải chấm công bằng hệ thống (vân tay/thẻ từ)
- Quên chấm công: Phải gửi email giải trình trong ngày

ĐI MUỘN/VỀ SỚM:
- Đi muộn 15 phút: Cảnh cáo
- Đi muộn > 30 phút: Tính 0.5 ngày phép
- Đi muộn > 3 lần/tháng: Trừ lương 1 ngày
- Về sớm không phép: Trừ lương tương ứng

LÀM THÊM GIỜ:
- Phải có sự phê duyệt trước của quản lý
- Tối đa 4 giờ/ngày, 20 giờ/tháng
- Được tính lương hoặc nghỉ bù`,
    isActive: true,
  },
  {
    title: "Làm việc từ xa (Remote)",
    category: "working_hours",
    content: `ĐIỀU KIỆN ĐƯỢC REMOTE:
- Đã qua thử việc và làm việc ít nhất 6 tháng
- Công việc phù hợp với làm việc từ xa
- Có đầy đủ thiết bị và kết nối internet ổn định

QUY ĐỊNH:
- Tối đa 2 ngày/tuần (không áp dụng cho intern)
- Phải đăng ký trước 1 ngày làm việc
- Phải online và sẵn sàng họp từ 8:00 - 17:00
- Vẫn phải check-in/out trên hệ thống online
- Phải hoàn thành đầy đủ công việc được giao

LƯU Ý:
- Trong thời gian thử việc: KHÔNG được remote
- Các vị trí yêu cầu trực tiếp (receptionist, IT support): KHÔNG áp dụng
- Vi phạm quy định: Tạm ngưng quyền remote trong 3 tháng`,
    isActive: true,
  },

  // ========== PHÚC LỢI ==========
  {
    title: "Bảo hiểm và y tế",
    category: "benefits",
    content: `BẢO HIỂM BẮT BUỘC:
- BHXH: 17.5% (Công ty: 10.5%, Nhân viên: 8%)
- BHYT: 4.5% (Công ty: 3%, Nhân viên: 1.5%)
- BHTN: 2% (Công ty: 1%, Nhân viên: 1%)
- Đóng theo lương cơ bản

BẢO HIỂM TỰ NGUYỆN:
- Bảo hiểm sức khỏe cao cấp: Công ty đài 70%
- Bảo hiểm tai nạn 24/24: Công ty đài 100%
- Mức bồi thường tối đa: 200 triệu đồng/năm

CHĂM SÓC SỨC KHỎE:
- Khám sức khỏe định kỳ: 1 lần/năm tại bệnh viện uy tín
- Khám răng: 2 lần/năm (miễn phí)
- Vaccine cúm: Mỗi năm 1 lần (miễn phí)
- Tư vấn sức khỏe online 24/7

HỖ TRỢ NHÀ Ở:
- Nhân viên từ tỉnh xa: Hỗ trợ 2 triệu/tháng trong 6 tháng đầu`,
    isActive: true,
  },
  {
    title: "Các phúc lợi khác",
    category: "benefits",
    content: `ĂN UỐNG:
- Hỗ trợ ăn trưa: 30.000đ/ngày làm việc
- Buffet trái cây, snack, cà phê miễn phí tại pantry
- Teambuilding ăn uống: 1 lần/quý

SINH NHẬT:
- Sinh nhật nhân viên: Quà 500.000đ + nghỉ nửa ngày
- Sinh nhật công ty: Tiệc tất niên, quà tặng

DU LỊCH:
- Du lịch công ty: 1 lần/năm (trong hoặc ngoài nước)
- Team building: 1 lần/quý

HỌC TẬP & PHÁT TRIỂN:
- Hỗ trợ 100% chi phí đào tạo liên quan công việc
- Khóa học ngoại ngữ, kỹ năng mềm: Hỗ trợ 50%
- Thư viện sách chuyên môn miễn phí

THỂ THAO:
- Phòng gym: Miễn phí cho nhân viên
- Câu lạc bộ bóng đá, cầu lông: Thứ 7 hàng tuần
- Yoga: Mỗi chiều thứ 4

HỖ TRỢ GIA ĐÌNH:
- Sinh con: 5 triệu/lần
- Hiếu hỷ: Hỗ trợ từ 2-5 triệu
- Con nhân viên nhập học: Quà 1 triệu`,
    isActive: true,
  },

  // ========== KỶ LUẬT ==========
  {
    title: "Quy tắc ứng xử",
    category: "discipline",
    content: `TRANG PHỤC:
- Thứ 2-5: Trang phục lịch sự, chuyên nghiệp
- Thứ 6: Casual (quần jean, áo thun được phép)
- KHÔNG được: Quần đùi, dép lê, áo hở vai

HÀNH VI TẠI NƠI LÀM VIỆC:
- Giữ im lặng tại khu vực làm việc
- KHÔNG hút thuốc trong văn phòng (chỉ tại khu vực quy định)
- KHÔNG sử dụng điện thoại cá nhân quá 15 phút/ngày
- KHÔNG ăn uống tại bàn làm việc

SỬ DỤNG TÀI SẢN CÔNG TY:
- Laptop, điện thoại: Chỉ phục vụ công việc
- KHÔNG cài đặt phần mềm lạ
- Bảo mật thông tin công ty
- KHÔNG mang tài sản ra ngoài không phép

QUAN HỆ ĐỒNG NGHIỆP:
- Tôn trọng, lịch sự với đồng nghiệp
- KHÔNG quấy rối, phân biệt đối xử
- KHÔNG gây mâu thuẫn, xích mích
- Hợp tác, hỗ trợ lẫn nhau`,
    isActive: true,
  },
  {
    title: "Hình thức kỷ luật",
    category: "discipline",
    content: `MỨC ĐỘ KỶ LUẬT:

1. NHẮC NHỞ (MIỆNG):
- Vi phạm nhỏ lần đầu
- Không ghi vào hồ sơ

2. CẢNH CÁO (BẰNG VĂN BẢN):
- Vi phạm lặp lại hoặc vi phạm mức độ trung bình
- Ghi vào hồ sơ
- Ảnh hưởng đến đánh giá hiệu suất

3. ĐÌNH CHỈ CÔNG TÁC:
- Vi phạm nghiêm trọng
- Không hưởng lương trong thời gian đình chỉ (tối đa 15 ngày)
- Phải có biên bản vi phạm

4. SA THẢI:
- Vi phạm cực kỳ nghiêm trọng
- Vi phạm kỷ luật nhiều lần
- Gây thiệt hại lớn cho công ty
- Không được bồi thường thôi việc

CÁC VI PHẠM DẪN ĐẾN SA THẢI:
- Đánh nhau, hành hung đồng nghiệp
- Trộm cắp tài sản công ty
- Làm giả chứng từ, giấy tờ
- Đi làm muộn > 10 lần/tháng
- Vắng mặt không phép > 5 ngày liên tục
- Tiết lộ bí mật công ty`,
    isActive: true,
  },

  // ========== TUYỂN DỤNG ==========
  {
    title: "Quy trình tuyển dụng",
    category: "recruitment",
    content: `BƯỚC 1: NỘP HỒ SƠ
- Nộp CV qua email: hr@company.com
- Hoặc ứng tuyển trên website
- Tiêu đề email: [Vị trí] - [Họ tên]

BƯỚC 2: SÀNG LỌC HỒ SƠ
- HR xem xét trong vòng 3-5 ngày
- Liên hệ ứng viên phù hợp qua email/phone

BƯỚC 3: PHỎNG VẤN VÒng 1 (HR)
- Tìm hiểu background, kinh nghiệm
- Đánh giá kỹ năng giao tiếp
- Giới thiệu về công ty
- Thời gian: 30-45 phút

BƯỚC 4: PHỎNG VẤN VÒNG 2 (CHUYÊN MÔN)
- Với Team Leader/Manager
- Kiểm tra kiến thức chuyên môn
- Bài test (nếu có)
- Thời gian: 45-60 phút

BƯỚC 5: PHỎNG VẤN VÒNG 3 (GIÁM ĐỐC)
- Chỉ áp dụng với vị trí Manager trở lên
- Đàm phán lương, thỏa thuận điều khoản

BƯỚC 6: OFFER
- Gửi thư mời làm việc (offer letter)
- Ứng viên có 3 ngày để quyết định

BƯỚC 7: ONBOARDING
- Nhập môn, training trong 1 tuần đầu
- Được phân công mentor hỗ trợ`,
    isActive: true,
  },
  {
    title: "Chính sách thử việc",
    category: "recruitment",
    content: `THỜI GIAN THỬ VIỆC:
- Vị trí Staff: 2 tháng
- Vị trí Leader/Manager: 3 tháng
- Intern: 1 tháng

LƯƠNG THỬ VIỆC:
- 85% lương chính thức
- Hưởng đầy đủ các chế độ BHXH
- KHÔNG hưởng thưởng hiệu suất

QUY ĐỊNH:
- Được đào tạo và hướng dẫn công việc
- Đánh giá cuối mỗi tháng
- KHÔNG được nghỉ phép trong thời gian thử việc
- KHÔNG được làm việc từ xa (remote)

ĐÁNH GIÁ CUỐI THỬ VIỆC:
- Tuần cuối thử việc: Đánh giá chính thức
- Dựa trên: Năng lực chuyên môn, thái độ làm việc, khả năng hòa nhập
- Kết quả: 
  + Đạt: Ký hợp đồng chính thức
  + Chưa đạt: Kéo dài thêm 1 tháng hoặc không tiếp tục

QUYỀN LỢI SAU THỬ VIỆC:
- Lương chính thức 100%
- Được hưởng đầy đủ phúc lợi
- Được nghỉ phép năm
- Được tham gia bảo hiểm bổ sung`,
    isActive: true,
  },

  // ========== CHÍNH SÁCH CHUNG ==========
  {
    title: "Bảo mật thông tin",
    category: "general",
    content: `THÔNG TIN BẢO MẬT BAO GỒM:
- Dữ liệu khách hàng
- Thông tin dự án
- Báo cáo tài chính
- Chiến lược kinh doanh
- Mã nguồn, tài liệu kỹ thuật

QUY ĐỊNH:
- KHÔNG được chia sẻ thông tin công ty ra bên ngoài
- KHÔNG được chụp ảnh, photocopy tài liệu không phép
- KHÔNG được sử dụng email công ty cho mục đích cá nhân
- Laptop, USB: Phải mã hóa dữ liệu
- Mật khẩu: Phải thay đổi mỗi 3 tháng

KHI NGHỈ VIỆC:
- Phải trả lại toàn bộ tài liệu, thiết bị
- Xóa mọi dữ liệu công ty trên thiết bị cá nhân
- Ký cam kết bảo mật sau khi nghỉ việc (2 năm)

VI PHẠM:
- Bồi thường thiệt hại
- Xử lý kỷ luật
- Truy cứu trách nhiệm pháp lý nếu cần`,
    isActive: true,
  },
  {
    title: "Chính sách nghỉ việc",
    category: "general",
    content: `THÔNG BÁO NGHỈ VIỆC:
- Nhân viên thường: Trước 30 ngày
- Quản lý: Trước 45 ngày
- Trong thử việc: Trước 3 ngày

QUY TRÌNH:
1. Gửi đơn xin nghỉ việc cho HR và quản lý trực tiếp
2. Bàn giao công việc cho người kế nhiệm
3. Trả lại tài sản, thiết bị công ty
4. Thanh toán các khoản còn thiếu (nếu có)
5. Nhận giấy xác nhận nghỉ việc

THANH TOÁN KHI NGHỈ VIỆC:
- Lương làm việc đến ngày nghỉ
- Phép năm chưa sử dụng (quy đổi thành tiền)
- Trợ cấp thôi việc (nếu làm việc > 12 tháng): 0.5 tháng lương/năm

TRƯỜNG HỢP KHÔNG BỒI THƯỜNG:
- Nghỉ trong thời gian thử việc
- Bị sa thải vì vi phạm kỷ luật
- Tự ý bỏ việc không báo trước

GIẤY XÁC NHẬN:
- Xác nhận thời gian làm việc
- Xác nhận vị trí công việc
- Được cấp trong vòng 5 ngày làm việc`,
    isActive: true,
  },
];

// Function to seed database
const seedPolicies = async () => {
  try {
    // Connect to MongoDB
    await connection();
    console.log("✅ Connected to MongoDB");

    // Clear existing policies
    const deleteResult = await Policy.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing policies`);

    // Insert new policies
    const result = await Policy.insertMany(samplePolicies);
    console.log(`✅ Successfully inserted ${result.length} policies`);

    // Display summary
    console.log("\n📊 Summary by category:");
    const categories = {
      leave: "Nghỉ phép",
      salary: "Lương thưởng",
      working_hours: "Giờ làm việc",
      benefits: "Phúc lợi",
      discipline: "Kỷ luật",
      recruitment: "Tuyển dụng",
      general: "Chung",
    };

    for (const [key, value] of Object.entries(categories)) {
      const count = result.filter((p) => p.category === key).length;
      console.log(`   ${value}: ${count} policies`);
    }

    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding policies:", error);
    process.exit(1);
  }
};

// Run the seed function
seedPolicies();
