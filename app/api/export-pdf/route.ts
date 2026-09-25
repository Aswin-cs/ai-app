/**
 * JurisAI Executive PDF Export Route
 * 
 * [FEATURE: Server-Side Executive PDF Summary Export]
 * [SECURITY FEATURE: Multi-Layer XSS Prevention & HTML Sanitization]
 * [PERFORMANCE FEATURE: Optimized Puppeteer Serverless Resource Lifecycle]
 */
import { NextRequest, NextResponse } from "next/server";
import { escapeHtml, safeErrorMessage, sanitizeFileName } from "@/lib/security";
import { getAuthenticatedUser } from "@/lib/authUtils";

function generatePdfHtml(data: any) {
  const documentTitle = escapeHtml(data?.documentTitle || "Legal Analysis Summary");
  const documentType = escapeHtml(data?.documentType || "Legal Document");
  const jurisdiction = escapeHtml(data?.jurisdiction || "");
  const effectiveDate = escapeHtml(data?.effectiveDate || "");
  const summary = escapeHtml(data?.summary || "");
  const overallRiskScore = typeof data?.overallRiskScore === "number"
    ? Math.max(0, Math.min(100, data.overallRiskScore))
    : 0;

  const parties = Array.isArray(data?.parties) ? data.parties : [];
  const risks = Array.isArray(data?.risks) ? data.risks : [];

  const riskScoreColor =
    overallRiskScore >= 70
      ? "#dc2626"
      : overallRiskScore >= 40
      ? "#d97706"
      : "#059669";

  const riskScoreBg =
    overallRiskScore >= 70
      ? "#fef2f2"
      : overallRiskScore >= 40
      ? "#fffbeb"
      : "#ecfdf5";

  const partiesHtml =
    parties.length > 0
      ? `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px;">
        Parties to the Agreement
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        ${parties
          .map(
            (p: any, i: number) => `
          <div style="display: flex; align-items: center; padding: 10px 14px; ${
            i > 0 ? "border-top: 1px solid #f1f5f9;" : ""
          }">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; width: 90px; flex-shrink: 0;">${
              escapeHtml(p?.role)
            }</span>
            <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${
              escapeHtml(p?.name)
            }</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
      : "";

  const risksHtml =
    risks.length > 0
      ? risks
          .map((r: any) => {
            const rawSeverity = String(r?.severity || "info").toLowerCase();
            const isCritical = rawSeverity === "critical";
            const isWarning = rawSeverity === "warning";

            const barColor = isCritical
              ? "#dc2626"
              : isWarning
              ? "#f59e0b"
              : "#94a3b8";

            const badgeBg = isCritical
              ? "#dc2626"
              : isWarning
              ? "#f59e0b"
              : "#475569";

            const cardBg = isCritical
              ? "#fff5f5"
              : isWarning
              ? "#fffbeb"
              : "#f8fafc";

            const cardBorder = isCritical
              ? "#fecaca"
              : isWarning
              ? "#fef3c7"
              : "#e2e8f0";

            const clause = escapeHtml(r?.clause);
            const severity = escapeHtml(rawSeverity);
            const title = escapeHtml(r?.title);
            const statuteReference = escapeHtml(r?.statuteReference);
            const sourceText = escapeHtml(r?.sourceText);
            const explanation = escapeHtml(r?.explanation);

            return `
        <div style="display: flex; background: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 10px; margin-bottom: 16px; overflow: hidden; page-break-inside: avoid;">
          <div style="width: 6px; background: ${barColor}; flex-shrink: 0;"></div>
          <div style="flex: 1; padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-family: monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; background: #ffffff; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 4px;">
                ${clause}
              </span>
              <span style="font-family: monospace; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #ffffff; background: ${badgeBg}; padding: 3px 8px; border-radius: 12px;">
                ${severity}
              </span>
            </div>

            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
              ${title}
            </div>

            ${
              statuteReference
                ? `<div style="font-size: 11px; font-family: monospace; color: #4338ca; background: #ffffff; border: 1px solid #c7d2fe; padding: 4px 10px; border-radius: 6px; margin-bottom: 10px; display: inline-block;">
                ⚖️ ${statuteReference}
              </div>`
                : ""
            }

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px;">
              <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Document Excerpt</div>
              <div style="font-size: 12px; font-style: italic; color: #1e293b; font-family: Georgia, serif; line-height: 1.5;">
                &ldquo;${sourceText}&rdquo;
              </div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
              <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #4f46e5; margin-bottom: 4px;">Statutory Explanation</div>
              <div style="font-size: 12px; color: #334155; line-height: 1.6;">
                ${explanation}
              </div>
            </div>
          </div>
        </div>
      `;
          })
          .join("")
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${documentTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #4f46e5;
      margin-bottom: 24px;
    }
    .badge-type {
      font-family: monospace;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #4f46e5;
      margin-bottom: 6px;
      display: inline-block;
    }
    .title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .meta {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
      display: flex;
      justify-content: center;
      gap: 16px;
    }
    .risk-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: ${riskScoreBg};
      border: 1px solid ${riskScoreColor}40;
      padding: 12px 18px;
      border-radius: 10px;
      margin-bottom: 24px;
    }
    .summary-box {
      border-left: 3px solid #4f46e5;
      padding-left: 14px;
      margin-bottom: 24px;
    }
    .summary-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #4f46e5;
      margin-bottom: 4px;
    }
    .summary-text {
      font-size: 13px;
      line-height: 1.7;
      color: #334155;
    }
    .section-header {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }
    .footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge-type">${documentType}</div>
    <h1 class="title">${documentTitle}</h1>
    <div class="meta">
      ${jurisdiction ? `<span>Jurisdiction: ${jurisdiction}</span>` : ""}
      ${effectiveDate ? `<span>Date: ${effectiveDate}</span>` : ""}
    </div>
  </div>

  <div class="risk-banner">
    <div style="font-size: 13px; font-weight: 700; color: #0f172a;">
      Overall Legal Risk Assessment
    </div>
    <div style="font-size: 14px; font-weight: 800; color: ${riskScoreColor};">
      Score: ${overallRiskScore} / 100
    </div>
  </div>

  ${
    summary
      ? `
  <div class="summary-box">
    <div class="summary-title">AI Executive Summary</div>
    <div class="summary-text">${summary}</div>
  </div>
  `
      : ""
  }

  ${partiesHtml}

  <div class="section-header">Flagged Risk Clauses (${risks.length} Items)</div>
  ${risksHtml}

  <div class="footer">
    Generated by JurisAI Legal Intelligence Engine • Confidential Document Analysis
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  let browser: any = null;
  try {
    // 1. Authenticate user
    const { errorResponse } = await getAuthenticatedUser();
    if (errorResponse) {
      return errorResponse;
    }

    // 2. Parse request body safely
    const body = await request.json();

    // 3. Launch Puppeteer browser matching server/Vercel environment
    let puppeteer: any;
    let launchOptions: any = {};

    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // @ts-ignore
      const chromium: any = (await import("@sparticuz/chromium")).default;
      // @ts-ignore
      puppeteer = (await import("puppeteer-core")).default;
      launchOptions = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };
    } else {
      try {
        puppeteer = (await import("puppeteer")).default;

        // Fallback search for locally installed Chrome or Edge executable on Windows/Mac/Linux
        const fs = await import("fs");
        const localChromePaths = [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
          "/usr/bin/google-chrome",
          "/usr/bin/chromium",
          "/usr/bin/chromium-browser",
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        ];

        let executablePath: string | undefined = undefined;
        for (const p of localChromePaths) {
          if (fs.existsSync(p)) {
            executablePath = p;
            break;
          }
        }

        launchOptions = {
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu",
          ],
          ...(executablePath ? { executablePath } : {}),
        };
      } catch {
        // @ts-ignore
        const chromium: any = (await import("@sparticuz/chromium")).default;
        // @ts-ignore
        puppeteer = (await import("puppeteer-core")).default;
        launchOptions = {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        };
      }
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(15000);

    // 4. Generate HTML content and set page content
    const htmlContent = generatePdfHtml(body);
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 15000 });

    // 5. Generate PDF buffer with format A4 and printBackground true
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "12mm",
        bottom: "12mm",
        left: "12mm",
        right: "12mm",
      },
    });

    await page.close();

    // 6. Return PDF response with headers
    const safeTitle = sanitizeFileName(body?.documentTitle || "Legal_Analysis");
    const filename = `${safeTitle}_Summary.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("❌ [/api/export-pdf] Error generating PDF:", error);
    return NextResponse.json(
      { error: safeErrorMessage(error, "PDF generation failed. Please try again.") },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }
}


