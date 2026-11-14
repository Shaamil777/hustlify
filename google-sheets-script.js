/**
 * =========================================================================
 * Hustlify Sales School Pvt. Ltd. | Corporate Consultation
 * Google Sheets Apps Script Webhook (Full 9-Section Corporate Specification)
 * =========================================================================
 * 
 * HOW TO UPDATE IN GOOGLE SHEETS (Takes 1 Minute):
 * 1. Open your Google Sheet.
 * 2. In the top menu, click: "Extensions" > "Apps Script".
 * 3. Delete existing code, paste this entire script, and click "Save" (Ctrl + S).
 * 4. Click the blue "Deploy" button (top right) > "Manage deployments".
 * 5. Click the Edit (pencil) icon next to the active deployment.
 * 6. Under "Version", choose "New version".
 * 7. Click "Deploy".
 * 
 * NOTE ON SHEET HEADERS:
 * If your current sheet already has previous column headers from earlier versions,
 * either:
 * - Create a new blank Tab/Sheet at the bottom, OR
 * - Delete Row 1 (the header row) so the script automatically populates all 64
 *   new formatted column headers on the next submission!
 * =========================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Setup headers automatically if first row is empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Submission ID",
        "Submission Date",

        // 1. Company Overview
        "Company Name",
        "Contact Person",
        "Designation",
        "Industry / Field",
        "Business Location",
        "Email",
        "Phone",
        "Website",
        "Year Established",
        "Brief Description of Business",

        // 2. Products & Services
        "Products/Services Offered",
        "Offering Type",
        "Primary Target Customers",
        "Approximate Price Range",
        "Competitor Differentiation",

        // 3. Business Objectives
        "Primary Business Goals",
        "Areas to Improve",

        // 4. Sales Department
        "Sales Team Size",
        "Dedicated Sales Lead",
        "Sales Team Experience",
        "Sales Team Management",
        "Sales Channels Used",
        "Sales Team Challenges",
        "Lead Conversion Process",

        // 5. Marketing & Lead Generation
        "Marketing & Customer Attraction (Text)",
        "Marketing & Customer Attraction (Voice Note)",
        "Paid Advertising",
        "Where Enquiries Come From",
        "Major Marketing Challenges",
        "Social Media / Web Links",

        // 6. Sales Performance
        "Monthly Customers / Sales",
        "Average Transaction Value",
        "Achieving Sales Targets",
        "Difficulties Preventing Performance",
        "Monthly Conversion Ratio",
        "Expected Conversion Ratio",
        "Incentive per Sale",
        "Salary Structure",
        "Employee Resignations/Year",

        // 7. Business Operations & Customer Management
        "Customer Enquiries & Follow-up",
        "CRM & Info Tools",
        "Delivery Method",
        "Customer Support & Complaints",
        "Dashboard Reports",
        "Current Project Details",
        "Projects Onboarded",
        "Total Project Volume",
        "Projects Completed",

        // 8. Leadership, Team & Management
        "Who Manages Sales & Marketing",
        "Employee Training Method (Text)",
        "Employee Training Method (Voice Note)",
        "Employee Performance Evaluation",
        "Team-Management Challenges",

        // 9. Business Challenges & Consultation Expectations
        "Three Biggest Problems (Text)",
        "Three Biggest Problems (Voice Note)",
        "Department Needing Most Improvement",
        "Specific Problems to Investigate",
        "Consultation Goals (Text)",
        "Consultation Goals (Voice Note)",
        "Expected Consultation Outcomes",
        "Expected Turnover After Consultation",
        "Additional Information / Notes"
      ];
      sheet.appendRow(headers);
      
      // Style headers row
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#064e3b"); // Emerald 900
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

      // 1. Company Overview
      data.companyName || "",
      data.contactPerson || "",
      data.designation || "",
      data.industryField || "",
      data.businessLocation || "",
      data.email || "",
      data.phone || "",
      data.website || "",
      data.establishedYear || "",
      data.businessDescription || "",

      // 2. Products & Services
      data.productsServicesOffered || "",
      data.productOrService || "",
      data.targetAudience || "",
      data.approximatePriceRange || "",
      data.competitorDifferentiation || "",

      // 3. Business Objectives
      data.primaryBusinessGoals || "",
      data.areasToImprove || "",

      // 4. Sales Department
      data.salesTeamSize || "",
      data.dedicatedSalesLead || "",
      data.salesTeamExperience || "",
      data.salesTeamManagement || "",
      data.salesChannels || "",
      data.salesTeamChallenges || "",
      data.leadConversionProcess || "",

      // 5. Marketing & Lead Generation
      data.salesMarketingStrategy || "",
      q22VoiceFormula,
      data.paidAdvertising || "",
      data.leadGenerationSources || "",
      data.marketingChallenges || "",
      data.socialLinks || "",

      // 6. Sales Performance
      data.monthlyCustomerSalesVolume || "",
      data.averageTransactionValue || "",
      data.achievingSalesTargets || "",
      data.salesPerformanceDifficulties || "",
      data.monthlyConversionRatio || "",
      data.expectedConversionRatio || "",
      data.incentivePerSale || "",
      data.salaryStructure || "",
      data.employeeResignationsPerYear || "",

      // 7. Business Operations & Customer Management
      data.customerEnquiriesFollowup || "",
      data.currentCrmTools || "",
      data.deliveryMethod || "",
      data.customerSupportHandling || "",
      data.dashboardReports || "",
      data.currentProjectDetails || "",
      data.projectsOnboarded || "",
      data.totalProjectVolume || "",
      data.projectsCompleted || "",

      // 8. Leadership, Team & Management
      data.stakeholdersInvolved || "",
      data.salesTrainingMethod || "",
      q27VoiceFormula,
      data.employeePerformanceEvaluation || "",
      data.teamManagementChallenges || "",

      // 9. Business Challenges & Consultation Expectations
      data.biggestPainPoint || "",
      q8VoiceFormula,
      data.departmentNeedingImprovement || "",
      data.specificProblemsToInvestigate || "",
      data.consultationGoal || "",
      q9VoiceFormula,
      data.expectedOutcome || "",
      data.expectedTurnover || "",
      data.additionalNotes || ""
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
