import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { AssessmentFormData, SubmissionRecord } from "@/types/assessment";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssessmentFormData;

    const submissionId = "HT-" + Math.floor(100000 + Math.random() * 900000);
    const submittedAt = new Date().toISOString();

    const record: SubmissionRecord = {
      ...body,
      id: submissionId,
      submittedAt,
      status: "new",
    };

    // 1. Save locally to data/submissions.json (for built-in /admin dashboard)
    try {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dataFilePath = path.join(dataDir, "submissions.json");
      let existing: SubmissionRecord[] = [];
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, "utf8");
        existing = JSON.parse(fileContent);
      }
      existing.unshift(record);
      fs.writeFileSync(dataFilePath, JSON.stringify(existing, null, 2), "utf8");
    } catch (saveErr) {
      console.warn("Could not save to local json file:", saveErr);
    }

    // 2. Post to Google Sheet Webhook (if GOOGLE_SHEET_WEBHOOK_URL is set)
    if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const googleSheetPayload = {
          submissionId,
          submittedAt: new Date().toLocaleString(),
          companyName: body.companyName,
          contactPerson: body.contactPerson,
          email: body.email,
          phone: body.phone,
          website: body.website || "",

          // Business & Operations (Q1 - Q15)
          q1_incentivePerSale: body.q1_incentivePerSale,
          q2_currentCrmTools: body.q2_currentCrmTools,
          q3_targetAudience: body.q3_targetAudience,
          q4_productOrService: body.q4_productOrService,
          q5_salaryStructure: body.q5_salaryStructure,
          expectedOutcome: body.expectedOutcome,
          expectedTurnover: body.expectedTurnover,
          q7_employeeResignationsPerYear: body.q7_employeeResignationsPerYear,
          q8_biggestPainPoint: body.q8_biggestPainPoint,
          q8_voiceUrl: body.q8_voiceUrl || "",
          q9_consultationGoal: body.q9_consultationGoal,
          q9_voiceUrl: body.q9_voiceUrl || "",
          q10_currentProjectDetails: body.q10_currentProjectDetails,
          q11_projectsOnboarded: body.q11_projectsOnboarded,
          q12_totalProjectVolume: body.q12_totalProjectVolume,
          q13_projectsCompleted: body.q13_projectsCompleted,
          q14_socialLinks: (body.q14_socialLinks || [])
            .map((s) => `${s.platform}: ${s.url}`)
            .join(" | "),
          q15_dashboardReports: body.q15_dashboardReports,

          // Sales & Lead Management (Q16 - Q28)
          q16_leadConversionProcess: body.q16_leadConversionProcess,
          q17_industryField: body.q17_industryField,
          q18_establishedYear: body.q18_establishedYear,
          q19_salesTeamSize: body.q19_salesTeamSize,
          q20_salesTeamExperience: body.q20_salesTeamExperience,
          q21_leadGenerationSources: body.q21_leadGenerationSources,
          q22_salesMarketingStrategy: body.q22_salesMarketingStrategy,
          q22_voiceUrl: body.q22_voiceUrl || "",
          q23_dedicatedSalesLead: body.q23_dedicatedSalesLead,
          q24_monthlyConversionRatio: body.q24_monthlyConversionRatio,
          q25_expectedConversionRatio: body.q25_expectedConversionRatio,
          q26_salesTeamChallenges: body.q26_salesTeamChallenges,
          q27_salesTrainingMethod: body.q27_salesTrainingMethod,
          q27_voiceUrl: body.q27_voiceUrl || "",
          q28_stakeholdersInvolved: body.q28_stakeholdersInvolved,
        };

        await fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(googleSheetPayload),
        });
      } catch (sheetErr) {
        console.error("Failed to sync to Google Sheet webhook:", sheetErr);
      }
    }

    // 3. Optional Telegram Notification
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        const telegramText = `🔔 *New Hustlify Assessment Received!*
        
🏢 *Company:* ${body.companyName}
👤 *Contact:* ${body.contactPerson}
📧 *Email:* ${body.email}
📱 *Phone:* ${body.phone}
🌐 *Website:* ${body.website || "N/A"}

🎯 *Key Voice Notes:*
• *Q8 Pain Point:* ${body.q8_voiceUrl ? `[▶️ Play Voice Note](${body.q8_voiceUrl})` : body.q8_biggestPainPoint || "None"}
• *Q9 Consultation Goal:* ${body.q9_voiceUrl ? `[▶️ Play Voice Note](${body.q9_voiceUrl})` : body.q9_consultationGoal || "None"}
• *Q22 Sales Strategy:* ${body.q22_voiceUrl ? `[▶️ Play Voice Note](${body.q22_voiceUrl})` : body.q22_salesMarketingStrategy || "None"}
• *Q27 Sales Training:* ${body.q27_voiceUrl ? `[▶️ Play Voice Note](${body.q27_voiceUrl})` : body.q27_salesTrainingMethod || "None"}

📋 *ID:* \`${submissionId}\`
🕒 *Time:* ${new Date().toLocaleString()}`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramText,
            parse_mode: "Markdown",
            disable_web_page_preview: false,
          }),
        });
      } catch (tgErr) {
        console.error("Telegram notification error:", tgErr);
      }
    }

    return NextResponse.json({
      success: true,
      id: submissionId,
      message: "Assessment successfully recorded",
    });
  } catch (error: unknown) {
    console.error("Submission handler error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record submission" },
      { status: 500 }
    );
  }
}
