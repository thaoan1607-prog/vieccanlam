import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// 1. Parse and Classify Endpoint
app.post("/api/ai/parse-and-classify", async (req, res) => {
  try {
    const { text, existingTasks = [] } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập nội dung công việc." });
    }

    if (!apiKey) {
      // Fallback heuristic classification if API key is not available
      return res.json(fallbackParse(text));
    }

    const systemInstruction = `Bạn là trợ lý AI chuyên gia phân tích và tổ chức công việc cá nhân cho ứng dụng "Việc cần làm hôm nay".
NHIỆM VỤ:
Người dùng nhập suy nghĩ, ý tưởng hoặc danh sách công việc tự do (có thể lộn xộn, nhiều dòng, hoặc một đoạn văn dài).
Bạn cần tách thành các công việc riêng lẻ và phân loại theo 4 nhóm ưu tiên:

1. "high_urgent" (🔴 QUAN TRỌNG & KHẨN CẤP):
- Cần thực hiện sớm, có deadline gần (ví dụ: "trước thứ 6", "hạn hôm nay", "gấp").
- NGUYÊN TẮC TUYỆT ĐỐI: KHÔNG ĐƯỢC TỰ Ý ĐÁNH GIÁ LÀ KHẨN CẤP nếu người dùng KHÔNG cung cấp thông tin cho thấy có deadline hoặc tính cấp bách!

2. "medium_important" (🟡 QUAN TRỌNG NHƯNG KHÔNG KHẨN CẤP):
- Cần làm nhưng chưa có deadline gấp, nên chủ động lên lịch (ví dụ: "Làm bài tiếng Nhật", "Học từ vựng N3").

3. "quick_task" (🟢 VIỆC NHỎ / CÓ THỂ LÀM NHANH):
- Công việc đơn giản, có thể hoàn thành trong khoảng 5–15 phút (ví dụ: "Mua đồ ăn cho chó", "Gọi điện cho mẹ", "Dọn phòng ngắn").

4. "someday_idea" (⚪ CHƯA CẦN LÀM / ĐỂ SAU):
- Ý tưởng, dự định tương lai, việc chưa cần thực hiện trong ngày (ví dụ: "Ý tưởng làm bài thuyết trình", "Muốn mua sách tiếng Nhật", "Tìm khóa học mới", "Muốn học thêm Kanji").

NGUYÊN TẮC BẮT BUỘC:
- Giữ nguyên ý nghĩa ban đầu của người dùng, không tự ý thay đổi nội dung làm sai lệch ý muốn.
- Ước lượng thời lượng dự kiến thực tế (ví dụ: "10 phút", "30 phút", "1 giờ").
- Đề xuất khung buổi hợp lý ("morning", "noon", "afternoon", "evening", hoặc null nếu là việc để sau).
- Nếu người dùng KHÔNG cung cấp giờ cụ thể (như 08:00, 19:00), KHÔNG ĐƯỢC TỰ BỊA GIỜ CỤ THỂ!
- Nếu công việc quá mơ hồ (ví dụ: "Làm cái kia", "Xong việc"), hãy thêm câu hỏi làm rõ vào mảng clarificationQuestions để hỏi lại người dùng.`;

    const prompt = `Phân tích và phân loại danh sách công việc sau:
"${text}"

Các công việc hiện có trong hệ thống (để tham khảo, tránh trùng lặp vô lý):
${JSON.stringify(existingTasks.map((t: any) => t.title))}

Trả về JSON có cấu trúc chính xác theo schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Tên công việc (giữ nguyên ý nghĩa người dùng)" },
                  priority: {
                    type: Type.STRING,
                    description: "Phân loại: high_urgent | medium_important | quick_task | someday_idea",
                  },
                  estimatedDuration: { type: Type.STRING, description: "Thời lượng ước tính, ví dụ: '15 phút', '45 phút'" },
                  timeOfDay: {
                    type: Type.STRING,
                    description: "Khung thời gian gợi ý: morning | noon | afternoon | evening | unassigned",
                  },
                  suggestedTime: {
                    type: Type.STRING,
                    description: "Giờ cụ thể (CHỈ ĐIỀN nếu người dùng nói rõ giờ cụ thể như 19:00 hoặc 8h sáng, nếu không thì để chuỗi rỗng '')",
                  },
                  notes: { type: Type.STRING, description: "Ghi chú, deadline hoặc chi tiết người dùng đã đề cập" },
                  isSomeday: { type: Type.BOOLEAN, description: "True nếu là ý tưởng/việc để sau" },
                },
                required: ["title", "priority", "estimatedDuration", "isSomeday"],
              },
            },
            clarificationQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Những câu hỏi làm rõ nếu có công việc quá mơ hồ cần thêm thông tin",
            },
            summaryComment: {
              type: Type.STRING,
              description: "Lời nhắn ngắn gọn, thân thiện bằng tiếng Việt gửi người dùng",
            },
          },
          required: ["tasks", "clarificationQuestions", "summaryComment"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Parse Error:", error);
    // Fallback gracefully if AI model has temporary failure
    const fallback = fallbackParse(req.body.text || "");
    return res.json(fallback);
  }
});

// 2. Schedule Endpoint (Time Blocking or Morning/Noon/Afternoon/Evening)
app.post("/api/ai/schedule", async (req, res) => {
  try {
    const { tasks, freeTime = "" } = req.body;
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: "Không có công việc để xếp lịch." });
    }

    if (!apiKey) {
      return res.json(fallbackSchedule(tasks, freeTime));
    }

    const hasSpecificFreeTime = freeTime && freeTime.trim().length > 0;

    const systemInstruction = `Bạn là trợ lý lập lịch công việc cho ứng dụng "Việc cần làm hôm nay".
QUY TẮC CỐT LÕI TỪ NGƯỜI DÙNG:
1. NẾU người dùng cung cấp thời gian rảnh cụ thể (ví dụ: "08:00 - 12:00 và 14:00 - 18:00" hoặc "từ 9h đến 17h"):
   - Hãy tạo lịch chi tiết theo phương pháp Time Blocking.
   - Bố trí các khối thời gian cụ thể (ví dụ: 08:00 - 09:00: Học tiếng Nhật).
   - Xen kẽ thời gian nghỉ ngắn hợp lý (ví dụ: 09:00 - 09:10: ☕ Nghỉ ngơi giải lao).

2. NẾU người dùng KHÔNG cung cấp thời gian cụ thể:
   - NGUYÊN TẮC BẮT BUỘC: KHÔNG ĐƯỢC TỰ Ý TẠO GIỜ CHÍNH XÁC như 08:00 hoặc 09:30!
   - Thay vào đó, hãy chia thành 4 khung thời gian tự nhiên:
     🌅 Buổi sáng (morning)
     ☀️ Buổi trưa (noon)
     🌇 Buổi chiều (afternoon)
     🌙 Buổi tối (evening)
   - Sắp xếp các việc quan trọng & khẩn cấp lên đầu khung buổi thích hợp, việc nhẹ nhàng vào cuối buổi.`;

    const prompt = `Lập lịch cho danh sách công việc sau:
${JSON.stringify(tasks.map((t: any) => ({ id: t.id, title: t.title, priority: t.priority, estimatedDuration: t.estimatedDuration, notes: t.notes })))}

Thời gian rảnh người dùng cung cấp: "${freeTime}"
(hasSpecificFreeTime: ${hasSpecificFreeTime})

Hãy tạo lịch trình thông minh, khoa học và tránh quá tải.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasExactHours: {
              type: Type.BOOLEAN,
              description: "True nếu người dùng có cung cấp giờ rảnh cụ thể và lập theo Time Blocking",
            },
            timeBlocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING, description: "ID của công việc tương ứng (hoặc 'break' nếu là giờ nghỉ)" },
                  title: { type: Type.STRING, description: "Tên công việc hoặc tên khoảng nghỉ" },
                  period: {
                    type: Type.STRING,
                    description: "morning | noon | afternoon | evening",
                  },
                  periodLabel: {
                    type: Type.STRING,
                    description: "Ví dụ: '🌅 Buổi sáng', '☀️ Buổi trưa', '🌇 Buổi chiều', '🌙 Buổi tối'",
                  },
                  timeSlot: {
                    type: Type.STRING,
                    description: "Ví dụ: '08:00 – 09:00' (nếu có giờ cụ thể) hoặc 'Đầu buổi sáng' (nếu không có giờ)",
                  },
                  duration: { type: Type.STRING, description: "Thời lượng (ví dụ: '45 phút', '10 phút nghỉ')" },
                  isBreak: { type: Type.BOOLEAN, description: "True nếu là khoảng nghỉ phục hồi năng lượng" },
                  advice: { type: Type.STRING, description: "Mẹo nhỏ để thực hiện hiệu quả" },
                },
                required: ["title", "period", "periodLabel", "timeSlot", "isBreak"],
              },
            },
            coachingMessage: {
              type: Type.STRING,
              description: "Lời động viên và nhận xét tích cực về lịch trình hôm nay",
            },
          },
          required: ["hasExactHours", "timeBlocks", "coachingMessage"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Schedule Error:", error);
    return res.json(fallbackSchedule(req.body.tasks || [], req.body.freeTime || ""));
  }
});

// 3. Assistant Chat Endpoint ("Trợ lý hôm nay")
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history = [], currentTasks = [] } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Tin nhắn không hợp lệ." });
    }

    if (!apiKey) {
      return res.json({
        reply: `Chào bạn! Tôi đã ghi nhận: "${message}". Tôi có thể giúp bạn sắp xếp theo mức độ ưu tiên hoặc tạo lịch cho hôm nay.`,
        extractedTasks: [
          {
            title: message.trim(),
            priority: "medium_important",
            estimatedDuration: "30 phút",
            timeOfDay: "morning",
            isSomeday: false,
          },
        ],
        clarificationQuestions: [],
        suggestedActions: ["Thêm vào việc hôm nay", "Sắp xếp theo độ ưu tiên", "Lập lịch trong ngày"],
      });
    }

    const systemInstruction = `Bạn là "Trợ lý hôm nay" - trợ lý AI cá nhân đắc lực và ân cần trong ứng dụng "Việc cần làm hôm nay".
MỤC TIÊU CỐT LÕI:
"Đừng để người dùng phải nhớ mọi thứ trong đầu."
Người dùng chỉ cần nghĩ ra việc, nói với bạn, và bạn giúp chuyển hóa chúng thành các đầu việc rõ ràng, dễ làm.

VÍ DỤ TIÊU BIỂU:
Người dùng: "Tôi phải học tiếng Nhật, làm bài tập, dọn phòng và mua đồ."
Bạn trả lời: "Tôi đã ghi lại 4 việc cho bạn:
1. Học tiếng Nhật
2. Làm bài tập
3. Dọn phòng
4. Mua đồ
Bạn muốn tôi sắp xếp chúng theo mức độ ưu tiên hay tạo lịch cho hôm nay?"

NGUYÊN TẮC:
1. Giữ nguyên ý nghĩa ban đầu của người dùng, không tự ý thay đổi hoặc tự bịa ra việc người dùng chưa nói.
2. Nếu có việc quá mơ hồ (ví dụ: "làm bài tập" mà không rõ bài gì, hoặc "làm việc quan trọng"), bạn hãy ưu tiên hỏi lại người dùng để lập lịch chính xác thay vì tự suy đoán.
3. Không tự ý gán nhãn Khẩn cấp nếu không có deadline hay tính cấp bách.
4. Trích xuất danh sách các công việc cụ thể vào mảng extractedTasks để người dùng có thể bấm 1 nút là thêm ngay vào danh sách.
5. Luôn giữ giọng điệu thân thiện, nhẹ nhàng, truyền cảm hứng và không phán xét.`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [
          {
            text: `Tin nhắn của người dùng: "${message}"\nDanh sách công việc hiện tại của người dùng: ${JSON.stringify(
              currentTasks.map((t: any) => ({ title: t.title, completed: t.completed }))
            )}`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Câu trả lời của Trợ lý hôm nay, rõ ràng, ân cần, định dạng Markdown đẹp",
            },
            extractedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Tên công việc" },
                  priority: { type: Type.STRING, description: "high_urgent | medium_important | quick_task | someday_idea" },
                  estimatedDuration: { type: Type.STRING, description: "Thời lượng ước tính, ví dụ: '15 phút', '1 giờ'" },
                  timeOfDay: { type: Type.STRING, description: "morning | noon | afternoon | evening" },
                  suggestedTime: { type: Type.STRING, description: "Giờ cụ thể nếu người dùng có nói rõ" },
                  notes: { type: Type.STRING, description: "Chi tiết/ghi chú" },
                  isSomeday: { type: Type.BOOLEAN, description: "True nếu là ý tưởng/để sau" },
                },
                required: ["title", "priority", "estimatedDuration", "isSomeday"],
              },
            },
            clarificationQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Câu hỏi cần làm rõ nếu thông tin còn thiếu",
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Các nút hành động nhanh gợi ý (ví dụ: 'Thêm 4 việc này', 'Xếp lịch hôm nay')",
            },
          },
          required: ["reply", "extractedTasks", "suggestedActions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({ error: "Lỗi kết nối với Trợ lý AI. Vui lòng thử lại sau." });
  }
});

// 4. Daily Summary Endpoint ("Tóm tắt cuối ngày")
app.post("/api/ai/daily-summary", async (req, res) => {
  try {
    const { completedTasks = [], pendingTasks = [] } = req.body;

    if (!apiKey) {
      return res.json({
        completedCount: completedTasks.length,
        pendingCount: pendingTasks.length,
        summaryText: `Hôm nay bạn đã hoàn thành ${completedTasks.length} việc! Còn lại ${pendingTasks.length} việc có thể nhẹ nhàng chuyển sang ngày mai.`,
        encouragement: "Mỗi bước đi nhỏ đều đưa bạn đến gần mục tiêu hơn. Hãy nghỉ ngơi thật ngon nhé!",
      });
    }

    const prompt = `Tổng kết ngày hôm nay:
- Đã hoàn thành (${completedTasks.length} việc): ${completedTasks.map((t: any) => t.title).join(", ") || "Chưa có"}
- Chưa hoàn thành (${pendingTasks.length} việc): ${pendingTasks.map((t: any) => t.title).join(", ") || "Không có việc nào tồn đọng"}

YÊU CẦU ĐẶC BIỆT TỪ NGƯỜI DÙNG:
1. Bản tổng kết ngắn gọn, ấm áp.
2. Nêu rõ số lượng đã hoàn thành và chưa hoàn thành.
3. Liệt kê công việc còn lại.
4. Gợi ý chuyển những việc chưa xong sang ngày mai một cách dễ chịu.
5. TUYỆT ĐỐI KHÔNG TẠO CẢM GIÁC TRÁCH MÓC hoặc khiến người dùng cảm thấy thất bại! Thay vào đó là sự động viên, thấu hiểu.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là trợ lý tổng kết cuối ngày giàu sự đồng cảm và tích cực.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Tiêu đề: ví dụ '📊 TỔNG KẾT HÔM NAY'" },
            summaryText: { type: Type.STRING, description: "Nội dung tóm tắt chi tiết, ấm áp" },
            encouragement: { type: Type.STRING, description: "Lời khích lệ chân thành, giúp thư giãn cuối ngày" },
            tomorrowSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Gợi ý các công việc ưu tiên nên chuyển sang ngày mai",
            },
          },
          required: ["title", "summaryText", "encouragement"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      completedCount: completedTasks.length,
      pendingCount: pendingTasks.length,
      ...parsed,
    });
  } catch (error: any) {
    console.error("AI Summary Error:", error);
    return res.json({
      completedCount: req.body.completedTasks?.length || 0,
      pendingCount: req.body.pendingTasks?.length || 0,
      title: "📊 TỔNG KẾT HÔM NAY",
      summaryText: "Hôm nay bạn đã rất nỗ lực. Những việc còn lại có thể dời sang ngày mai một cách nhẹ nhàng!",
      encouragement: "Đừng quên dành thời gian thư giãn tối nay nhé!",
    });
  }
});

// 5. Breakdown Task into Subtasks Endpoint
app.post("/api/ai/breakdown-subtasks", async (req, res) => {
  try {
    const { title, description = "" } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Tiêu đề công việc không hợp lệ." });
    }

    if (!apiKey) {
      return res.json({
        subtasks: [
          { id: `sub-${Date.now()}-1`, title: "Tìm tài liệu và chuẩn bị", completed: false },
          { id: `sub-${Date.now()}-2`, title: "Thực hiện nội dung chính", completed: false },
          { id: `sub-${Date.now()}-3`, title: "Kiểm tra và hoàn thiện", completed: false },
        ],
      });
    }

    const systemInstruction = `Bạn là trợ lý giúp chia nhỏ công việc phức tạp thành các bước nhỏ dễ làm (subtasks) cho ứng dụng "Việc cần làm hôm nay".
YÊU CẦU:
- Phân tích tên công việc và tạo 3 đến 6 bước nhỏ cụ thể, logic, tuần tự.
- Mỗi bước phải ngắn gọn, dễ hiểu, có động từ hành động.
- Trả về danh sách mảng các chuỗi hành động.`;

    const prompt = `Hãy chia nhỏ công việc này thành các bước subtask dễ làm:
Tên công việc: "${title}"
Mô tả thêm: "${description}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Danh sách các bước công việc nhỏ",
            },
          },
          required: ["subtasks"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const subtasks = (parsed.subtasks || []).map((st: string, idx: number) => ({
      id: `sub-${Date.now()}-${idx}`,
      title: st,
      completed: false,
    }));

    return res.json({ subtasks });
  } catch (error: any) {
    console.error("AI Subtasks Error:", error);
    return res.json({
      subtasks: [
        { id: `sub-${Date.now()}-1`, title: "Chuẩn bị các thông tin cần thiết", completed: false },
        { id: `sub-${Date.now()}-2`, title: "Thực hiện từng phần của công việc", completed: false },
        { id: `sub-${Date.now()}-3`, title: "Xem lại và kiểm tra kết quả", completed: false },
      ],
    });
  }
});

// Heuristic fallback parsers in case API key is missing or offline
function fallbackParse(text: string) {
  const lines = text
    .split(/\r?\n|;|\.\s+/)
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((l) => l.length > 0);

  const tasks = lines.map((line) => {
    const lower = line.toLowerCase();
    let priority = "medium_important";
    let isSomeday = false;
    let estimatedDuration = "30 phút";
    let suggestedTime = "";

    // Check urgency (deadlines, urgent words)
    if (
      lower.includes("trước") ||
      lower.includes("gấp") ||
      lower.includes("hạn") ||
      lower.includes("khẩn") ||
      lower.includes("hôm nay") ||
      lower.includes("deadline")
    ) {
      priority = "high_urgent";
    } else if (
      lower.includes("ý tưởng") ||
      lower.includes("muốn") ||
      lower.includes("tìm hiểu") ||
      lower.includes("để sau") ||
      lower.includes("sau này") ||
      lower.includes("khóa học mới")
    ) {
      priority = "someday_idea";
      isSomeday = true;
    } else if (
      lower.includes("mua") ||
      lower.includes("gọi") ||
      lower.includes("dọn") ||
      lower.includes("nhắn") ||
      lower.includes("uống") ||
      lower.length < 20
    ) {
      priority = "quick_task";
      estimatedDuration = "15 phút";
    }

    // Time detection (e.g. 19:00, 7h)
    const timeMatch = line.match(/(\d{1,2})[:h](\d{2})?/i);
    if (timeMatch) {
      const h = timeMatch[1].padStart(2, "0");
      const m = timeMatch[2] || "00";
      suggestedTime = `${h}:${m}`;
    }

    return {
      title: line,
      priority,
      estimatedDuration,
      timeOfDay: priority === "high_urgent" ? "morning" : "afternoon",
      suggestedTime,
      notes: "",
      isSomeday,
    };
  });

  return {
    tasks,
    clarificationQuestions: [],
    summaryComment: `Đã phân loại thành công ${tasks.length} công việc cho bạn.`,
  };
}

function fallbackSchedule(tasks: any[], freeTime: string) {
  const hasExactHours = Boolean(freeTime && freeTime.trim().length > 0);

  const timeBlocks = tasks.map((t, idx) => {
    let period = "morning";
    let periodLabel = "🌅 Buổi sáng";
    let timeSlot = "Buổi sáng";

    if (hasExactHours) {
      const startHour = 8 + Math.floor(idx * 1.5);
      timeSlot = `${String(startHour).padStart(2, "0")}:00 – ${String(startHour + 1).padStart(2, "0")}:00`;
    } else {
      if (idx % 4 === 1) {
        period = "noon";
        periodLabel = "☀️ Buổi trưa";
        timeSlot = "Buổi trưa";
      } else if (idx % 4 === 2) {
        period = "afternoon";
        periodLabel = "🌇 Buổi chiều";
        timeSlot = "Buổi chiều";
      } else if (idx % 4 === 3) {
        period = "evening";
        periodLabel = "🌙 Buổi tối";
        timeSlot = "Buổi tối";
      }
    }

    return {
      taskId: t.id || `task-${idx}`,
      title: t.title,
      period,
      periodLabel,
      timeSlot,
      duration: t.estimatedDuration || "30 phút",
      isBreak: false,
      advice: "Tập trung hoàn thành dứt điểm mục tiêu này",
    };
  });

  return {
    hasExactHours,
    timeBlocks,
    coachingMessage: "Lịch trình cân đối giúp bạn không bị quá tải trong ngày hôm nay!",
  };
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
