const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const Buffer = require("buffer").Buffer;
const { PDFExtract } = require("pdf.js-extract");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pdfExtract = new PDFExtract();

class AIService {
  async analyzeCVWithGemini(cvUrl, requiredFields) {
    try {
      if (cvUrl.includes("drive.google.com")) {
        const fileType = await this.detectGoogleDriveFileType(cvUrl);

        if (fileType === "pdf") {
          return await this.analyzePDFWithText(cvUrl, requiredFields);
        } else if (fileType === "image") {
          return await this.analyzeImageWithVision(cvUrl, requiredFields);
        } else {
          return {
            EC: 1,
            EM: "Unsupported CV format. Only PDF and common image formats are supported.",
            data: null,
          };
        }
      }

      const isPDF = this.isPDFUrl(cvUrl);
      const isImage = this.isImageUrl(cvUrl);

      if (isPDF) {
        return await this.analyzePDFWithText(cvUrl, requiredFields);
      } else if (isImage) {
        return await this.analyzeImageWithVision(cvUrl, requiredFields);
      } else {
        return {
          EC: 1,
          EM: "Unsupported CV format. Only PDF and common image formats are supported.",
          data: null,
        };
      }
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("Failed to analyze CV with Gemini AI");
    }
  }

  async analyzeImageWithVision(imageUrl, requiredFields) {
    try {
      const directUrl = this.convertToDirectDownloadUrl(imageUrl);

      const imageData = await this.downloadCVContent(directUrl);
      const base64Image = Buffer.from(imageData).toString("base64");
      const mimeType = this.getMimeType(directUrl);

      const prompt = this.buildPrompt(requiredFields);

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
      ]);

      const response = await result.response;
      const aiResponseText = response.text();

      // Parse và validate
      const extractedData = this.parseAIResponse(aiResponseText);
      const validation = this.validateExtractedData(
        extractedData,
        requiredFields,
      );

      return {
        success: true,
        extractedData,
        validation,
      };
    } catch (error) {
      console.error(" Error analyzing image:", error);
      throw new Error("Failed to analyze image with Vision AI");
    }
  }

  async analyzePDFWithText(pdfUrl, requiredFields) {
    try {
      const pdfText = await this.extractTextFromPDF(pdfUrl);

      if (!pdfText || pdfText.trim().length === 0) {
        throw new Error("PDF is empty or unreadable");
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
You are an expert HR assistant. Analyze this CV text and extract the following information.

CV TEXT:
${pdfText}

REQUIRED FIELDS TO EXTRACT:
- Full Name (fullName)
- Email Address (email)
- Phone Number (phone)
- Citizen ID / National ID (citizenId)
- Date of Birth (dob) - format: DD/MM/YYYY or YYYY-MM-DD
- Gender (gender) - male/female/other
- Address (address)

REFERENCE DATA FROM CANDIDATE (for verification):
${JSON.stringify(requiredFields, null, 2)}

INSTRUCTIONS:
1. Extract all visible information from the CV text
2. If a field is not found, set it to null
3. Return ONLY a valid JSON object (no markdown, no explanation)
4. Try to match the format of reference data when possible

REQUIRED JSON FORMAT:
{
  "fullName": "extracted name or null",
  "email": "extracted email or null",
  "phone": "extracted phone or null",
  "citizenId": "extracted citizen ID or null",
  "dob": "extracted DOB or null",
  "gender": "male/female/other or null",
  "address": "extracted address or null"
}

Return ONLY the JSON object.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponseText = response.text();

      // Parse và validate
      const extractedData = this.parseAIResponse(aiResponseText);
      const validation = this.validateExtractedData(
        extractedData,
        requiredFields,
      );

      return {
        success: true,
        extractedData,
        validation,
      };
    } catch (error) {
      console.error("Error analyzing PDF with text:", error);
      throw new Error(`Failed to analyze PDF: ${error.message}`);
    }
  }

  async extractTextFromPDF(pdfUrl) {
    let tempPdfPath = null;

    try {
      let pdfData;

      if (pdfUrl.includes("drive.google.com")) {
        const fileIdMatch = pdfUrl.match(/\/d\/([^/]+)/);
        if (fileIdMatch) {
          const fileId = fileIdMatch[1];
          pdfData = await this.downloadFromGoogleDrive(fileId);
        } else {
          const directUrl = this.convertToDirectDownloadUrl(pdfUrl);
          pdfData = await this.downloadCVContent(directUrl);
        }
      } else {
        pdfData = await this.downloadCVContent(pdfUrl);
      }

      // Create temp directory if not exists
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Save PDF to temp file
      tempPdfPath = path.join(tempDir, `cv_${Date.now()}.pdf`);
      fs.writeFileSync(tempPdfPath, pdfData);

      // Extract text using pdf.js-extract
      const pdfParsed = await pdfExtract.extract(tempPdfPath, {});

      // Combine text from all pages
      let fullText = "";

      if (pdfParsed && pdfParsed.pages) {
        pdfParsed.pages.forEach((page) => {
          if (page.content && Array.isArray(page.content)) {
            page.content.forEach((item) => {
              if (item.str && item.str.trim()) {
                fullText += item.str + " ";
              }
            });
            fullText += "\n";
          }
        });
      }

      // Cleanup temp file
      if (tempPdfPath && fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }

      return fullText;
    } catch (error) {
      if (tempPdfPath && fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }

      console.error("Error extracting text from PDF:", error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async downloadFromGoogleDrive(fileId) {
    try {
      let downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

      let response = await axios.get(downloadUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        maxRedirects: 5,
      });

      const contentType = response.headers["content-type"];

      if (contentType && contentType.includes("text/html")) {
        // Extract confirmation token
        const htmlContent = response.data.toString();
        const confirmMatch = htmlContent.match(/confirm=([^&"]+)/);

        if (confirmMatch) {
          const confirmToken = confirmMatch[1];
          downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;

          response = await axios.get(downloadUrl, {
            responseType: "arraybuffer",
            timeout: 30000,
            headers: {
              "User-Agent": "Mozilla/5.0",
            },
          });
        } else {
          throw new Error(
            "Cannot extract confirmation token from Google Drive",
          );
        }
      }
      return response.data;
    } catch (error) {
      console.error("Error downloading from Google Drive:", error.message);
      throw new Error(`Failed to download from Google Drive: ${error.message}`);
    }
  }

  convertToDirectDownloadUrl(url) {
    if (url.includes("drive.google.com/file")) {
      const fileIdMatch = url.match(/\/d\/([^/]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }

    if (url.includes("docs.google.com/document")) {
      const docIdMatch = url.match(/\/d\/([^/]+)/);
      if (docIdMatch) {
        const docId = docIdMatch[1];
        return `https://docs.google.com/document/d/${docId}/export?format=pdf`;
      }
    }

    return url;
  }

  async detectGoogleDriveFileType(driveUrl) {
    try {
      const fileIdMatch = driveUrl.match(/\/d\/([^/]+)/);
      if (!fileIdMatch) {
        throw new Error("Invalid Google Drive URL");
      }

      const fileId = fileIdMatch[1];
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

      // Make HEAD request to get Content-Type without downloading full file
      const response = await axios.head(downloadUrl, {
        timeout: 10000,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        maxRedirects: 5,
      });

      const contentType = response.headers["content-type"];
      console.log("📦 Detected Content-Type:", contentType);

      // Determine file type from Content-Type
      if (contentType) {
        if (contentType.includes("application/pdf")) {
          return "pdf";
        } else if (
          contentType.includes("image/jpeg") ||
          contentType.includes("image/png") ||
          contentType.includes("image/gif") ||
          contentType.includes("image/webp") ||
          contentType.includes("image/bmp")
        ) {
          return "image";
        } else if (contentType.includes("text/html")) {
          // HTML response means need to download to check
          const fileData = await this.downloadFromGoogleDrive(fileId);
          return this.detectFileTypeFromData(fileData);
        }
      }

      throw new Error("Cannot determine file type from Google Drive");
    } catch (error) {
      console.error("Error detecting Google Drive file type:", error.message);

      try {
        const fileIdMatch = driveUrl.match(/\/d\/([^/]+)/);
        if (fileIdMatch) {
          console.log("🔍 Falling back to download and inspect file data...");
          const fileData = await this.downloadFromGoogleDrive(fileIdMatch[1]);
          return this.detectFileTypeFromData(fileData);
        }
      } catch (Error) {
        throw new Error("Failed to detect Google Drive file type");
      }
    }
  }

  detectFileTypeFromData(fileData) {
    const buffer = Buffer.from(fileData);

    // Check first 20 bytes (for debugging)
    const first20Bytes = [];
    for (let i = 0; i < Math.min(20, buffer.length); i++) {
      first20Bytes.push(buffer[i].toString(16).padStart(2, "0"));
    }

    const searchLimit = Math.min(1024, buffer.length);
    const headerText = buffer.toString("ascii", 0, searchLimit);

    if (headerText.includes("%PDF")) {
      return "pdf";
    }

    // Check JPEG signature: FF D8 FF
    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return "image";
    }

    // Check PNG signature: 89 50 4E 47
    if (
      buffer.length >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return "image";
    }

    // Check GIF signature: GIF87a or GIF89a
    if (buffer.length >= 6 && buffer.toString("ascii", 0, 3) === "GIF") {
      return "image";
    }

    // Check WEBP signature: RIFF....WEBP
    if (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      return "image";
    }

    // Check BMP signature: BM
    if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) {
      return "image";
    }
    throw new Error("Unknown file type - Cannot detect from file signature");
  }

  isPDFUrl(url) {
    return (
      url.toLowerCase().endsWith(".pdf") ||
      url.toLowerCase().includes(".pdf?") ||
      url.includes("export?format=pdf")
    );
  }

  isImageUrl(url) {
    const urlLower = url.toLowerCase();

    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

    for (const ext of imageExtensions) {
      if (urlLower.endsWith(ext) || urlLower.includes(`${ext}?`)) {
        return true;
      }
    }

    if (url.includes("i.ibb.co") || url.includes("ibb.co")) {
      return true;
    }

    if (url.includes("imgur.com") || url.includes("cloudinary.com")) {
      return true;
    }

    return false;
  }

  buildPrompt(requiredFields) {
    return `
You are an expert HR assistant. Analyze this CV image and extract the following information.

REQUIRED FIELDS TO EXTRACT:
- Full Name (fullName)
- Email Address (email)
- Phone Number (phone)
- Citizen ID / National ID (citizenId)
- Date of Birth (dob) - format: DD/MM/YYYY or YYYY-MM-DD
- Gender (gender) - male/female/other
- Address (address)

REFERENCE DATA FROM CANDIDATE (for verification):
${JSON.stringify(requiredFields, null, 2)}

INSTRUCTIONS:
1. Extract all visible information from the CV image
2. If a field is not found or unclear, set it to null
3. Return ONLY a valid JSON object (no markdown, no explanation)
4. Try to match the format of reference data when possible

REQUIRED JSON FORMAT:
{
  "fullName": "extracted name or null",
  "email": "extracted email or null",
  "phone": "extracted phone or null",
  "citizenId": "extracted citizen ID or null",
  "dob": "extracted DOB or null",
  "gender": "male/female/other or null",
  "address": "extracted address or null"
}

Return ONLY the JSON object, nothing else.
`;
  }

  parseAIResponse(aiResponseText) {
    try {
      let cleanedText = aiResponseText.trim();

      // Remove markdown code blocks
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/```\n?/g, "");
      }

      const parsed = JSON.parse(cleanedText);
      return parsed;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.error("Raw response:", aiResponseText);
      throw new Error("Failed to parse AI response as JSON");
    }
  }

  validateExtractedData(extractedData, requiredFields) {
    const missingFields = [];
    const foundFields = [];

    Object.keys(requiredFields).forEach((field) => {
      const extractedValue = extractedData[field];

      if (
        !extractedValue ||
        extractedValue === null ||
        extractedValue === "" ||
        extractedValue === "null"
      ) {
        missingFields.push(field);
      } else {
        foundFields.push(field);
      }
    });

    const totalFields = Object.keys(requiredFields).length;
    const completionRate =
      totalFields > 0
        ? Math.round((foundFields.length / totalFields) * 100)
        : 0;

    const isValid = missingFields.length === 0;

    return {
      isValid,
      completionRate,
      missingFields,
      foundFields,
      reason: isValid
        ? "✅ All required fields are present in CV"
        : `❌ Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  async downloadCVContent(cvUrl) {
    try {
      const response = await axios.get(cvUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        maxRedirects: 5,
      });

      // Validate response is not HTML
      const contentType = response.headers["content-type"];

      if (contentType && contentType.includes("text/html")) {
        throw new Error(
          "Received HTML instead of file. Please ensure file is publicly accessible.",
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error downloading CV:", error.message);
      throw new Error(`Failed to download CV: ${error.message}`);
    }
  }

  getMimeType(url) {
    const extension = url.split(".").pop().split("?")[0].toLowerCase();
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
    };
    return mimeTypes[extension] || "image/jpeg";
  }
}

module.exports = new AIService();
