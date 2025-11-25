require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const policyDAO = require("../DAO/policyDAO");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithBotService = async (userMessage) => {
  try {
    const policies = await policyDAO.getAllPolicies();

    if (policies.length === 0) {
      return {
        EC: 1,
        EM: "No policies available",
        data: {
          message: "Xin lỗi, hiện tại chưa có chính sách nào được cập nhật.",
        },
      };
    }

    const policyContext = policies
      .map((p) => {
        const categoryName = {
          leave: "Nghỉ phép",
          salary: "Lương",
          working_hours: "Giờ làm việc",
          benefits: "Phúc lợi",
          discipline: "Kỷ luật",
          recruitment: "Tuyển dụng",
          general: "Chung",
        };
        return `[${categoryName[p.category] || p.category}] ${p.title}\n${p.content}`;
      })
      .join("\n\n---\n\n");

    const prompt = `Bạn là trợ lý HR thông minh của công ty. Nhiệm vụ của bạn là giúp nhân viên và ứng viên hiểu rõ các chính sách của công ty.

**CÁC CHÍNH SÁCH CÔNG TY:**

${policyContext}

**HƯỚNG DẪN:**
- Chỉ trả lời dựa trên các chính sách được cung cấp ở trên
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Nếu câu hỏi không liên quan đến chính sách có sẵn, hãy lịch sự nói rằng bạn không có thông tin đó
- Giữ câu trả lời ngắn gọn nhưng đầy đủ thông tin
- Nếu có nhiều chính sách liên quan, hãy liệt kê rõ ràng

**CÂU HỎI CỦA NGƯỜI DÙNG:**
${userMessage}

**TRẢ LỜI:**`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const botResponse = response.text();

    return {
      EC: 0,
      EM: "Success",
      data: {
        message: botResponse,
      },
    };
  } catch (error) {
    console.error("Service Error - chatWithBotService:", error);

    if (error.message?.includes("API key")) {
      return {
        EC: -2,
        EM: "Invalid API key",
        data: {
          message:
            "Xin lỗi, đã có lỗi với cấu hình chatbot. Vui lòng liên hệ quản trị viên.",
        },
      };
    }

    return {
      EC: -1,
      EM: "Error processing chat",
      data: {
        message: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
      },
    };
  }
};

module.exports = {
  chatWithBotService,
};
