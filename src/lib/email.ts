import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

const FROM = process.env.EMAIL_FROM ?? "N'OUBLIE JAMAIS <noreply@noubliejamais.fr>";

interface OrderEmailParams {
  to: string;
  fromName: string;
  toName: string;
  listenUrl: string;
  pdfUrl: string;
  plan: string;
}

export async function sendOrderConfirmation(params: OrderEmailParams) {
  const { to, fromName, toName, listenUrl, pdfUrl, plan } = params;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `✦ Votre carte N'OUBLIE JAMAIS est prête`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #F0E8D8; font-family: Georgia, serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #FAF6EF; border-radius: 16px; overflow: hidden; border: 1px solid rgba(184,134,26,0.2); }
    .stripe { height: 4px; background: linear-gradient(to right, #8B6510, #D4A832, #8B6510); }
    .content { padding: 36px 32px; }
    .logo-text { font-size: 18px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; color: #1C1410; font-family: sans-serif; }
    .tagline { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #B8861A; font-family: sans-serif; margin-top: 4px; }
    h1 { font-size: 24px; color: #1C1410; margin: 24px 0 8px; }
    p { font-size: 15px; color: #4A3728; line-height: 1.7; margin: 0 0 16px; }
    .names { background: rgba(184,134,26,0.07); border-radius: 12px; padding: 16px 24px; margin: 20px 0; border: 1px solid rgba(184,134,26,0.15); }
    .names-row { display: flex; align-items: center; justify-content: center; gap: 12px; }
    .name-block { text-align: center; }
    .name-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #7A6455; font-family: sans-serif; display: block; }
    .name-value { font-size: 20px; color: #B8861A; display: block; margin-top: 2px; }
    .heart { font-size: 18px; color: #B8861A; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #D4A832, #8B6510); color: white !important; text-decoration: none; border-radius: 30px; font-family: sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; margin: 8px 6px; }
    .btn-outline { background: transparent; border: 1.5px solid #B8861A; color: #B8861A !important; }
    .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(184,134,26,0.15); }
    .footer p { font-size: 11px; color: #7A6455; line-height: 1.6; font-family: sans-serif; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="stripe"></div>
    <div class="content">
      <div class="logo-text">N'OUBLIE JAMAIS</div>
      <div class="tagline">Un souvenir qui traverse le temps</div>

      <h1>Votre carte est prête ✦</h1>

      <p>Bonjour,</p>
      <p>Votre message vocal personnalisé a bien été créé. Il suffit maintenant d'imprimer votre carte et de l'offrir à <strong>${escapeHtml(toName)}</strong>.</p>

      <div class="names">
        <div class="names-row">
          <div class="name-block">
            <span class="name-label">De</span>
            <span class="name-value">${escapeHtml(fromName)}</span>
          </div>
          <span class="heart">♥</span>
          <div class="name-block">
            <span class="name-label">Pour</span>
            <span class="name-value">${escapeHtml(toName)}</span>
          </div>
        </div>
      </div>

      <p style="text-align:center; margin: 20px 0;">
        <a href="${listenUrl}" class="btn">Voir la page d'écoute</a>
        <a href="${pdfUrl}" class="btn btn-outline">Télécharger la carte PDF</a>
      </p>

      <p style="font-size:13px; color:#7A6455;">
        <strong>Plan :</strong> ${plan} · <strong>Lien d'écoute :</strong> <a href="${listenUrl}" style="color:#B8861A;">${listenUrl}</a>
      </p>
    </div>

    <div class="footer">
      <p>N'OUBLIE JAMAIS · Un message unique, un souvenir précieux.</p>
      <p>Vous recevez cet email car vous avez passé commande sur notre site.</p>
    </div>
  </div>
</div>
</body>
</html>
    `.trim(),
  });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
