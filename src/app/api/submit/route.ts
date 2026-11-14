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

          // Section 1: Company Overview
          companyName: body.companyName || "",
          contactPerson: body.contactPerson || "",
          designation: body.designation || "",
          industryField: body.q17_industryField || "",
          businessLocation: body.businessLocation || "",
          email: body.email || "",
          phone: body.phone || "",
          website: body.website || "",
          establishedYear: body.q18_establishedYear || "",
          businessDescription: body.businessDescription || "",

          // Section 2: Products & Services
          productsServicesOffered: body.productsServicesOffered || "",
          productOrService: body.q4_productOrService || "",
          targetAudience: body.q3_targetAudience || "",
          approximatePriceRange: body.approximatePriceRange || "",
          competitorDifferentiation: body.competitorDifferentiation || "",

          // Section 3: Business Objectives
          primaryBusinessGoals: body.primaryBusinessGoals || "",
          areasToImprove: body.areasToImprove || "",

          // Section 4: Sales Department
          salesTeamSize: body.q19_salesTeamSize || "",
          dedicatedSalesLead: body.q23_dedicatedSalesLead || "",
          salesTeamExperience: body.q20_salesTeamExperience || "",
          salesTeamManagement: body.salesTeamManagement || "",
          salesChannels: body.salesChannels || "",
          salesTeamChallenges: body.q26_salesTeamChallenges || "",
          leadConversionProcess: body.q16_leadConversionProcess || "",

          // Section 5: Marketing & Lead Generation
          salesMarketingStrategy: body.q22_salesMarketingStrategy || "",
          q22_voiceUrl: body.q22_voiceUrl || "",
          paidAdvertising: body.paidAdvertising || "",
          leadGenerationSources: body.q21_leadGenerationSources || "",
          marketingChallenges: body.marketingChallenges || "",
          socialLinks: (body.q14_socialLinks || [])
            .map((s) => `${s.platform}: ${s.url}`)
            .join(" | "),

          // Section 6: Sales Performance
          monthlyCustomerSalesVolume: body.monthlyCustomerSalesVolume || "",
          averageTransactionValue: body.averageTransactionValue || "",
          achievingSalesTargets: body.achievingSalesTargets || "",
          salesPerformanceDifficulties: body.salesPerformanceDifficulties || "",
          monthlyConversionRatio: body.q24_monthlyConversionRatio || "",
          expectedConversionRatio: body.q25_expectedConversionRatio || "",
          incentivePerSale: body.q1_incentivePerSale || "",
          salaryStructure: body.q5_salaryStructure || "",
          employeeResignationsPerYear: body.q7_employeeResignationsPerYear || "",

          // Section 7: Business Operations & Customer Management
          customerEnquiriesFollowup: body.customerEnquiriesFollowup || "",
          currentCrmTools: body.q2_currentCrmTools || "",
          deliveryMethod: body.deliveryMethod || "",
          customerSupportHandling: body.customerSupportHandling || "",
          dashboardReports: body.q15_dashboardReports || "",
          currentProjectDetails: body.q10_currentProjectDetails || "",
          projectsOnboarded: body.q11_projectsOnboarded || "",
          totalProjectVolume: body.q12_totalProjectVolume || "",
          projectsCompleted: body.q13_projectsCompleted || "",

          // Section 8: Leadership, Team & Management
          stakeholdersInvolved: body.q28_stakeholdersInvolved || "",
          salesTrainingMethod: body.q27_salesTrainingMethod || "",
          q27_voiceUrl: body.q27_voiceUrl || "",
          employeePerformanceEvaluation: body.employeePerformanceEvaluation || "",
          teamManagementChallenges: body.teamManagementChallenges || "",

          // Section 9: Business Challenges & Consultation Expectations
          biggestPainPoint: body.q8_biggestPainPoint || "",
          q8_voiceUrl: body.q8_voiceUrl || "",
          departmentNeedingImprovement: body.departmentNeedingImprovement || "",
          specificProblemsToInvestigate: body.specificProblemsToInvestigate || "",
          consultationGoal: body.q9_consultationGoal || "",
          q9_voiceUrl: body.q9_voiceUrl || "",
          expectedOutcome: body.expectedOutcome || "",
          expectedTurnover: body.expectedTurnover || "",
          additionalNotes: body.additionalNotes || "",
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

        const telegramText = `🔔 *New Hustlify Corporate Consultation Form Received!*
        
🏢 *Company:* ${body.companyName}
👤 *Contact:* ${body.contactPerson} (${body.designation})
📧 *Email:* ${body.email}
📱 *Phone:* ${body.phone}
📍 *Location:* ${body.businessLocation || "N/A"}
🌐 *Website:* ${body.website || "N/A"}
📊 *Turnover Expectation:* ${body.expectedTurnover || "N/A"}

🎯 *Key Voice Notes:*
• *3 Biggest Problems (Q8):* ${body.q8_voiceUrl ? `[▶️ Play Voice Note](${body.q8_voiceUrl})` : body.q8_biggestPainPoint || "None"}
• *Consultation Goal (Q9):* ${body.q9_voiceUrl ? `[▶️ Play Voice Note](${body.q9_voiceUrl})` : body.q9_consultationGoal || "None"}
• *Marketing Strategy (Q22):* ${body.q22_voiceUrl ? `[▶️ Play Voice Note](${body.q22_voiceUrl})` : body.q22_salesMarketingStrategy || "None"}
• *Employee Training (Q27):* ${body.q27_voiceUrl ? `[▶️ Play Voice Note](${body.q27_voiceUrl})` : body.q27_salesTrainingMethod || "None"}

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
