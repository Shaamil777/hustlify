/**
 * =========================================================================
 * Hustlify B2B Assessment – Google Sheets Apps Script Webhook
 * =========================================================================
 * 
 * HOW TO SET THIS UP IN 1 MINUTE:
 * 1. Open your Google Sheet (create a blank one if you haven't).
 * 2. In Google Sheets top menu, click: "Extensions" > "Apps Script".
 * 3. Delete any code in the editor, paste this entire script, and click "Save" (Ctrl + S).
 * 4. Click the blue "Deploy" button (top right) > "New deployment".
 * 5. Click the gear icon next to "Select type" > choose "Web app".
 * 6. Set Description: "Hustlify Form Receiver"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"  <-- IMPORTANT!
 * 9. Click "Deploy", approve Google permissions.
 * 10. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 11. Add it to your project's .env file as:
 *     GOOGLE_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/..."
 * =========================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Setup headers automatically if first row is empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "ID",
        "Submission Date",
        "Company Name",
        "Contact Person",
        "Email",
        "Phone",
        "Website",
        // Section 1: Business & Operations
        "Q1. Incentive per sale",
        "Q2. Current CRM tools",
        "Q3. Target audience",
        "Q4. Product or Service",
        "Q5. Salary structure",
        "Expected outcome",
        "Expected turnover after consultation",
        "Employee resignations/yr",
        "Q8. Biggest pain point (Text)",
        "Q8. Biggest pain point (Voice Note)",
        "Q9. Consultation goal (Text)",
        "Q9. Consultation goal (Voice Note)",
        "Q10. Current project details",
        "Q11. Projects onboarded",
        "Q12. Total project volume",
        "Q13. Projects completed",
        "Q14. Social media links",
        "Q15. Dashboard reports",
        // Section 2: Sales & Lead Management
        "Q16. Lead conversion process",
        "Q17. Field / Industry",
        "Q18. Established year",
        "Q19. Sales team size",
        "Q20. Sales team experience",
        "Q21. Lead generation sources",
        "Q22. Sales & marketing strategy (Text)",
        "Q22. Sales & marketing strategy (Voice Note)",
        "Q23. Dedicated sales lead",
        "Q24. Monthly conversion ratio",
        "Q25. Expected conversion ratio",
        "Q26. Sales team challenges",
        "Q27. Sales training method (Text)",
        "Q27. Sales training method (Voice Note)",
        "Q28. Stakeholders involved"
      ];
      sheet.appendRow(headers);
      
      // Style headers row
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e293b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Format Voice Note links as clickable spreadsheet HYPERLINK formulas
    var q8VoiceFormula = data.q8_voiceUrl ? '=HYPERLINK("' + data.q8_voiceUrl + '", "▶️ Play Voice Note")' : "None";
    var q9VoiceFormula = data.q9_voiceUrl ? '=HYPERLINK("' + data.q9_voiceUrl + '", "▶️ Play Voice Note")' : "None";
    var q22VoiceFormula = data.q22_voiceUrl ? '=HYPERLINK("' + data.q22_voiceUrl + '", "▶️ Play Voice Note")' : "None";
    var q27VoiceFormula = data.q27_voiceUrl ? '=HYPERLINK("' + data.q27_voiceUrl + '", "▶️ Play Voice Note")' : "None";

    var newRow = [
      data.submissionId || "",
      data.submittedAt || new Date().toLocaleString(),
      data.companyName || "",
      data.contactPerson || "",
      data.email || "",
      data.phone || "",
      data.website || "",
      // Q1 - Q15
      data.q1_incentivePerSale || "",
      data.q2_currentCrmTools || "",
      data.q3_targetAudience || "",
      data.q4_productOrService || "",
      data.q5_salaryStructure || "",
      data.expectedOutcome || "",
      data.expectedTurnover || "",
      data.q7_employeeResignationsPerYear || "",
      data.q8_biggestPainPoint || "",
      q8VoiceFormula,
      data.q9_consultationGoal || "",
      q9VoiceFormula,
      data.q10_currentProjectDetails || "",
      data.q11_projectsOnboarded || "",
      data.q12_totalProjectVolume || "",
      data.q13_projectsCompleted || "",
      data.q14_socialLinks || "",
      data.q15_dashboardReports || "",
      // Q16 - Q28
      data.q16_leadConversionProcess || "",
      data.q17_industryField || "",
      data.q18_establishedYear || "",
      data.q19_salesTeamSize || "",
      data.q20_salesTeamExperience || "",
      data.q21_leadGenerationSources || "",
      data.q22_salesMarketingStrategy || "",
      q22VoiceFormula,
      data.q23_dedicatedSalesLead || "",
      data.q24_monthlyConversionRatio || "",
      data.q25_expectedConversionRatio || "",
      data.q26_salesTeamChallenges || "",
      data.q27_salesTrainingMethod || "",
      q27VoiceFormula,
      data.q28_stakeholdersInvolved || ""
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Row added successfully" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

