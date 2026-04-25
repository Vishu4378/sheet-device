import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSubmissionNotification(
  toEmail: string,
  formTitle: string,
  data: Record<string, unknown>
) {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151">${k}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">${v}</td></tr>`)
    .join("");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "noreply@sheetform.app",
    to: toEmail,
    subject: `New submission for "${formTitle}"`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1f2937;margin-bottom:4px">New Form Submission</h2>
        <p style="color:#6b7280;margin-top:0">Someone submitted your form <strong>${formTitle}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          ${rows}
        </table>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">Powered by SheetForm</p>
      </div>
    `,
  });
}
