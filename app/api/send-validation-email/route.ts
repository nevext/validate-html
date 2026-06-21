import { NextResponse } from "next/server";
import { Resend } from "resend";

interface ChecklistAnswerItem {
  label: string;
  answer: string;
}

interface SendValidationEmailBody {
  ownerEmail: string;
  projectTitle: string;
  buildLabel: string;
  buildUrl: string;
  answers: ChecklistAnswerItem[];
  bugs: string;
  comment: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailHtml(body: SendValidationEmailBody, submittedAt: string): string {
  const answersRows = body.answers
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 10px;color:#555;border-bottom:1px solid #eee;">${escapeHtml(item.label)}</td>
          <td style="padding:6px 10px;font-weight:600;color:#111;border-bottom:1px solid #eee;">${escapeHtml(item.answer)}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:560px;margin:0 auto;">
      <h2 style="margin:0 0 4px;">Nova validação recebida</h2>
      <p style="color:#555;margin:0 0 20px;">
        <strong>${escapeHtml(body.projectTitle)}</strong> · ${escapeHtml(body.buildLabel)}
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">${answersRows}</table>
      ${
        body.bugs.trim()
          ? `<p style="margin:0 0 12px;"><strong>Bugs encontrados:</strong><br/>${escapeHtml(body.bugs)}</p>`
          : ""
      }
      ${
        body.comment.trim()
          ? `<p style="margin:0 0 12px;"><strong>Comentário:</strong><br/>${escapeHtml(body.comment)}</p>`
          : ""
      }
      <p style="color:#888;font-size:13px;margin:20px 0 4px;">Enviado em ${submittedAt}</p>
      ${
        body.buildUrl
          ? `<p style="font-size:13px;"><a href="${escapeHtml(body.buildUrl)}">Ver a build</a></p>`
          : ""
      }
    </div>
  `;
}

export async function POST(request: Request) {
  let body: SendValidationEmailBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  if (!body.ownerEmail || !body.projectTitle || !Array.isArray(body.answers)) {
    return NextResponse.json({ ok: false, error: "Dados incompletos" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY não configurada — email de validação não enviado.");
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY não configurada" }, { status: 500 });
  }

  const submittedAt = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Validate <onboarding@resend.dev>",
      to: body.ownerEmail,
      subject: `Validate: nova validação em "${body.projectTitle}" (${body.buildLabel})`,
      html: buildEmailHtml(body, submittedAt),
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
