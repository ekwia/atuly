import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Memory store for OTPs (Active for 10 minutes)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Chat Endpoint for Jewelry Consultant
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are the premium AI Jewelry Consultant for "Atulya Jewelers". 
Atulya Jewelers was founded in 1985 and is famous for its BIS-hallmarked pure 24K and 22K Gold, brilliant certified Diamonds, and exquisite Sterling Silver collections.
Your goal is to help customers discover the perfect jewelry, assist with sizing, explain precious metals and purity, and recommend items based on occasion (weddings, anniversaries, birthdays), budget, style (traditional Indian, modern minimalist), and gemstone choices (Ruby, Emerald, Sapphire, Pearl).
Be exceptionally polite, warm, luxurious, and helpful. Use Indian Rupees (₹) as the primary currency. Keep answers clear, beautifully structured, and concise. Offer to guide them to specific categories like Rings, Necklaces, Earrings, Bracelets, Bangles, Pendants, or Coins.`,
      },
    });

    if (history && Array.isArray(history)) {
      let promptWithHistory = "";
      for (const msg of history) {
        promptWithHistory += `${msg.role === 'user' ? 'Customer' : 'Consultant'}: ${msg.content}\n`;
      }
      promptWithHistory += `Customer: ${message}\n`;
      const response = await chat.sendMessage({ message: promptWithHistory });
      return res.json({ text: response.text });
    } else {
      const response = await chat.sendMessage({ message: message });
      return res.json({ text: response.text });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error?.message || "An error occurred with the AI assistant." });
  }
});

// Live Gold Rates API
app.get("/api/gold-rates", (req, res) => {
  res.json({
    "24K": 5200,
    "22K": 4800,
    "18K": 4000,
    "Silver": 75,
    "Platinum": 3200
  });
});

// Send OTP API for Direct Register / Login
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const isAtulyaDomain = trimmedEmail.endsWith("@atulyagold.com");
    const isAdminEmail = trimmedEmail === "vaidwanprince@gmail.com" || trimmedEmail === "videads@gmail.com";

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    otpStore.set(trimmedEmail, { code, expiresAt });

    console.log(`\n========================================`);
    console.log(`[SECURE SSO] OTP Generated for ${trimmedEmail}`);
    console.log(`[SECURE SSO] Code: ${code}`);
    console.log(`========================================\n`);

    const hasSmtp = process.env.SMTP_USER && process.env.SMTP_PASS;

    if (hasSmtp) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: process.env.SMTP_FROM || '"Atulya Secure SSO" <no-reply@atulyagold.com>',
          to: trimmedEmail,
          subject: `${code} is your Atulya Jewelers Access Verification Code`,
          html: `
            <div style="font-family: 'Georgia', serif; max-width: 500px; margin: 0 auto; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 24px; background: #ffffff; color: #1e293b;">
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 28px; color: #b45309; font-weight: 900; letter-spacing: 2px;">✦ ATULYA ✦</span>
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #64748b; margin-top: 5px;">Sovereign Jewelers</p>
              </div>
              <h2 style="font-size: 20px; text-align: center; color: #0f172a; margin-bottom: 10px; font-weight: 800;">Verify Your Access</h2>
              <p style="font-size: 13px; line-height: 1.6; text-align: center; color: #475569; margin-bottom: 30px;">
                Use the security verification code below to authorize your registration or sign-in on the Atulya Secure SSO Portal. This code is valid for 10 minutes.
              </p>
              <div style="background: #fafaf9; border: 1.5px dashed #d97706; padding: 20px; text-align: center; border-radius: 16px; margin-bottom: 30px;">
                <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #b45309;">${code}</span>
              </div>
              <p style="font-size: 11px; text-align: center; color: #94a3b8; line-height: 1.5;">
                If you did not request this access verification code, please ignore this email or contact support.<br/>
                &copy; 1985-2026 Atulya Jewelers. All rights reserved.
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        return res.json({ 
          success: true, 
          message: "A verification code has been dispatched to your email address.",
          sandbox: false
        });
      } catch (smtpError) {
        console.error("[SMTP ERROR] Failed to send real mail:", smtpError);
        // Fallback to sandbox mode response on SMTP delivery failure
        return res.json({
          success: true,
          message: "An OTP was generated, but SMTP delivery failed. Using sandbox fallback.",
          sandbox: true,
          code // Provided for ease of preview
        });
      }
    } else {
      // Sandbox mode / no SMTP configured: return the code for testing in the preview
      return res.json({
        success: true,
        message: "A secure verification code has been generated. Sandbox mode fallback.",
        sandbox: true,
        code
      });
    }
  } catch (error: any) {
    console.error("OTP generation error:", error);
    return res.status(500).json({ error: error?.message || "An internal error occurred." });
  }
});

// Verify OTP API
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email address and OTP code are required." });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const stored = otpStore.get(trimmedEmail);

    if (!stored) {
      return res.status(404).json({ error: "No active verification request found for this email address. Please request a new OTP." });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(trimmedEmail);
      return res.status(400).json({ error: "The verification code has expired. Please request a new one." });
    }

    if (stored.code !== otp.trim()) {
      return res.status(400).json({ error: "Incorrect verification code. Please check your spelling and try again." });
    }

    // Success: remove OTP so it cannot be reused
    otpStore.delete(trimmedEmail);

    const isAdmin = trimmedEmail === "vaidwanprince@gmail.com" || trimmedEmail === "videads@gmail.com";

    return res.json({
      success: true,
      role: isAdmin ? "admin" : "user"
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ error: error?.message || "An internal error occurred." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
