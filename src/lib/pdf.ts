import puppeteer from "puppeteer";

interface GeneratePdfOptions {
  printUrl: string;
  projectName: string;
  reportId: number;
}

export async function generateReportPdf({
  printUrl,
  projectName,
  reportId,
}: GeneratePdfOptions): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 60000 });

    const safeProject = escapeHtml(projectName);

    const headerTemplate = `
      <div style="width:100%; font-family: Arial, sans-serif; font-size:9px; color:#555;
                  padding:4px 12mm 0 12mm; direction:rtl; display:flex;
                  justify-content:space-between;">
        <span>${safeProject}</span>
        <span>דוח מספר ${reportId}</span>
      </div>`;

    const footerTemplate = `
      <div style="width:100%; font-family: Arial, sans-serif; font-size:9px; color:#555;
                  padding:0 12mm 4px 12mm; direction:rtl; text-align:center;">
        <span>עמוד <span class="pageNumber"></span> מתוך <span class="totalPages"></span></span>
      </div>`;

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: { top: "22mm", bottom: "16mm", left: "12mm", right: "12mm" },
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
