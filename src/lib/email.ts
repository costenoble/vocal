import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

const FROM =
  process.env.EMAIL_FROM ??
  process.env.RESEND_FROM ??
  "N'OUBLIE JAMAIS <noreply@oubliejamaisbijoux.fr>";

interface OrderEmailParams {
  to: string;
  fromName: string;
  toName: string;
  listenUrl: string;
  pdfUrl: string;
  plan: string;
  accessCode?: string;
  /** Nom du produit physique commandé (ex. "Bracelet N'OUBLIE JAMAIS") —
   *  présent uniquement pour les commandes avec un bijou. Change le
   *  contenu de l'email : la carte est imprimée par nos soins, l'acheteur
   *  n'a rien à imprimer lui-même. */
  productName?: string;
  /** true si une adresse de livraison a été renseignée (expédition postale) ;
   *  false pour une remise en main propre (vente boutique). */
  shipped?: boolean;
}

export async function sendOrderConfirmation(params: OrderEmailParams) {
  const { to, fromName, toName, listenUrl, pdfUrl, plan, accessCode, productName, shipped } = params;
  const isPhysical = !!productName;

  const subject = isPhysical
    ? `Merci pour votre commande — ${productName}`
    : `✦ Votre carte N'OUBLIE JAMAIS est prête`;

  const physicalDelivery = shipped
    ? `Votre <strong>${escapeHtml(productName!)}</strong> et sa carte vocale imprimée vont être préparés avec soin et expédiés sous <strong>3 à 5 jours ouvrés</strong> à l'adresse indiquée lors de la commande.`
    : `Votre <strong>${escapeHtml(productName!)}</strong> et sa carte vocale imprimée vous attendent en boutique.`;

  const intro = isPhysical
    ? `<h1>Merci pour votre commande !</h1>
      <p>Bonjour,</p>
      <p>Nous confirmons la réception de votre commande. Le message vocal que vous avez enregistré pour <strong>${escapeHtml(toName)}</strong> a été précieusement conservé.</p>
      <p>${physicalDelivery}</p>`
    : `<h1>Votre carte est prête ✦</h1>
      <p>Bonjour,</p>
      <p>Votre message vocal personnalisé a bien été créé. Il suffit maintenant d'imprimer votre carte et de l'offrir à <strong>${escapeHtml(toName)}</strong>.</p>`;

  const accessCodeNote = isPhysical
    ? `Ce code sera imprimé sur la carte glissée dans votre coffret — il protège l'écoute du message et sera demandé à ${escapeHtml(toName)}.`
    : `Ce code est demandé au destinataire avant l'écoute du message. Il figure aussi sur la carte imprimée.`;

  const actionButtons = isPhysical
    ? `<a href="${listenUrl}" class="btn">Aperçu de la page d'écoute</a>`
    : `<a href="${listenUrl}" class="btn">Voir la page d'écoute</a>
       <a href="${pdfUrl}" class="btn btn-outline">Télécharger la carte PDF</a>`;

  const footerDetail = isPhysical
    ? `<strong>Produit :</strong> ${escapeHtml(productName!)} · <strong>Lien d'écoute :</strong> <a href="${listenUrl}" style="color:#B8861A;">${listenUrl}</a>`
    : `<strong>Plan :</strong> ${plan} · <strong>Lien d'écoute :</strong> <a href="${listenUrl}" style="color:#B8861A;">${listenUrl}</a>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject,
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

      ${intro}

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

      ${accessCode ? `
      <div class="names" style="text-align:center;">
        <span class="name-label">Code d'accès confidentiel</span>
        <div style="font-size:26px; font-weight:900; letter-spacing:0.4em; color:#B8861A; font-family:sans-serif; margin-top:6px;">${escapeHtml(accessCode)}</div>
        <p style="font-size:12px; color:#7A6455; margin:10px 0 0;">${accessCodeNote}</p>
      </div>` : ""}

      <p style="text-align:center; margin: 20px 0;">
        ${actionButtons}
      </p>

      <p style="font-size:13px; color:#7A6455;">
        ${footerDetail}
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

// Coque commune aux emails secondaires (réponse, suivi)
function emailShell(inner: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0E8D8;font-family:Georgia,serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="background:#FAF6EF;border-radius:16px;overflow:hidden;border:1px solid rgba(184,134,26,0.2);">
    <div style="height:4px;background:linear-gradient(to right,#8B6510,#D4A832,#8B6510);"></div>
    <div style="padding:36px 32px;">
      <div style="font-size:18px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#1C1410;font-family:sans-serif;">N'OUBLIE JAMAIS</div>
      <div style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#B8861A;font-family:sans-serif;margin-top:4px;">Un souvenir qui traverse le temps</div>
      ${inner}
    </div>
    <div style="text-align:center;padding:20px;border-top:1px solid rgba(184,134,26,0.15);">
      <p style="font-size:11px;color:#7A6455;font-family:sans-serif;margin:0;">N'OUBLIE JAMAIS · Un message unique, un souvenir précieux.</p>
    </div>
  </div>
</div>
</body>
</html>`.trim();
}

const BTN = `display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#D4A832,#8B6510);color:white !important;text-decoration:none;border-radius:30px;font-family:sans-serif;font-weight:700;font-size:14px;letter-spacing:0.05em;`;

// Le destinataire a répondu par un message vocal → on prévient l'acheteur.
export async function sendReplyNotification(params: {
  to: string;
  replierName: string;
  toName: string;
  listenUrl: string;
}) {
  const { to, replierName, toName, listenUrl } = params;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `♥ ${replierName || toName} vous a répondu`,
    html: emailShell(`
      <h1 style="font-size:24px;color:#1C1410;margin:24px 0 8px;">Vous avez reçu une réponse ♥</h1>
      <p style="font-size:15px;color:#4A3728;line-height:1.7;margin:0 0 16px;">
        <strong>${escapeHtml(replierName || toName)}</strong> a écouté votre carte vocale et vous a laissé
        une réponse en retour. Elle vous attend sur la page de votre carte.
      </p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${listenUrl}" style="${BTN}">Écouter la réponse</a>
      </p>
      <p style="font-size:12px;color:#7A6455;">Si la carte est protégée, utilisez le code d'accès reçu lors de votre commande.</p>
    `),
  });
}

// Message du formulaire de contact → boîte SAV (reply-to = le visiteur).
export async function sendContactNotification(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const { name, email, subject, message } = params;
  const to = process.env.CONTACT_EMAIL ?? "contact@oubliejamaisbijoux.fr";
  await resend.emails.send({
    from: FROM,
    to,
    replyTo: email,
    subject: `Contact — ${subject} — ${name}`,
    html: emailShell(`
      <h1 style="font-size:22px;color:#1C1410;margin:24px 0 8px;">Nouveau message de contact</h1>
      <p style="font-size:14px;color:#4A3728;line-height:1.7;margin:0 0 6px;"><strong>De :</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p style="font-size:14px;color:#4A3728;line-height:1.7;margin:0 0 16px;"><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
      <div style="background:rgba(184,134,26,0.07);border-radius:12px;padding:16px 20px;border:1px solid rgba(184,134,26,0.15);">
        <p style="font-size:14px;color:#4A3728;line-height:1.7;margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
      <p style="font-size:12px;color:#7A6455;margin-top:16px;">Répondez directement à cet email pour répondre à ${escapeHtml(name)}.</p>
    `),
  });
}

// Email J+3 : "votre proche a-t-il écouté ?" avec le compteur d'écoutes.
export async function sendFollowupEmail(params: {
  to: string;
  toName: string;
  listenUrl: string;
  viewCount: number;
}) {
  const { to, toName, listenUrl, viewCount } = params;
  const heard = viewCount > 0;
  await resend.emails.send({
    from: FROM,
    to,
    subject: heard
      ? `✦ Bonne nouvelle — votre carte pour ${toName} a été ouverte`
      : `✦ Votre carte pour ${toName} attend d'être offerte`,
    html: emailShell(`
      <h1 style="font-size:24px;color:#1C1410;margin:24px 0 8px;">${heard ? "Votre message a trouvé son destinataire ♥" : "Et si c'était le moment ?"}</h1>
      <p style="font-size:15px;color:#4A3728;line-height:1.7;margin:0 0 16px;">
        ${heard
          ? `La page de votre carte pour <strong>${escapeHtml(toName)}</strong> a été ouverte <strong>${viewCount} fois</strong>. Votre voix fait son chemin.`
          : `Votre carte vocale pour <strong>${escapeHtml(toName)}</strong> n'a pas encore été scannée. Peut-être le moment d'offrir votre coffret — ou de vérifier que la carte est bien arrivée ?`}
      </p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${listenUrl}" style="${BTN}">Voir la page d'écoute</a>
      </p>
    `),
  });
}

// Notification au vendeur : "nouvelle commande de X" — envoyée à l'adresse
// de gestion (ORDER_NOTIFICATION_EMAIL, ou CONTACT_EMAIL à défaut) à chaque
// vente en ligne payée via Stripe.
export async function sendNewOrderNotification(params: {
  fromName: string;
  toName: string;
  buyerEmail: string | null;
  productLabel: string;
  price: number;
  shipName?: string | null;
  shipAddress?: string | null;
  shipComplement?: string | null;
  shipPostalCode?: string | null;
  shipCity?: string | null;
  shipCountry?: string | null;
  adminUrl: string;
}) {
  const {
    fromName, toName, buyerEmail, productLabel, price,
    shipName, shipAddress, shipComplement, shipPostalCode, shipCity, shipCountry, adminUrl,
  } = params;

  const to = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.CONTACT_EMAIL ?? "contact@oubliejamaisbijoux.fr";

  const hasShipping = !!(shipAddress || shipCity);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Nouvelle commande de ${fromName} — ${price.toFixed(2).replace(".", ",")} €`,
    html: emailShell(`
      <h1 style="font-size:22px;color:#1C1410;margin:24px 0 8px;">Nouvelle commande reçue</h1>
      <p style="font-size:14px;color:#4A3728;line-height:1.7;margin:0 0 16px;">
        <strong>${escapeHtml(fromName)}</strong> vient de commander pour <strong>${escapeHtml(toName)}</strong>.
      </p>
      <div style="background:rgba(184,134,26,0.07);border-radius:12px;padding:16px 20px;margin:0 0 16px;border:1px solid rgba(184,134,26,0.15);">
        <p style="font-size:14px;color:#4A3728;line-height:1.8;margin:0;">
          <strong>Produit :</strong> ${escapeHtml(productLabel)}<br/>
          <strong>Montant :</strong> ${price.toFixed(2).replace(".", ",")} €<br/>
          ${buyerEmail ? `<strong>Email acheteur :</strong> ${escapeHtml(buyerEmail)}<br/>` : ""}
        </p>
      </div>
      ${hasShipping ? `
      <div style="background:rgba(184,134,26,0.07);border-radius:12px;padding:16px 20px;margin:0 0 16px;border:1px solid rgba(184,134,26,0.15);">
        <p style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#7A6455;margin:0 0 6px;">Adresse de livraison</p>
        <p style="font-size:14px;color:#4A3728;line-height:1.7;margin:0;">
          ${escapeHtml(shipName ?? "")}<br/>
          ${escapeHtml(shipAddress ?? "")}${shipComplement ? `, ${escapeHtml(shipComplement)}` : ""}<br/>
          ${escapeHtml(shipPostalCode ?? "")} ${escapeHtml(shipCity ?? "")} · ${escapeHtml(shipCountry ?? "")}
        </p>
      </div>` : `<p style="font-size:12px;color:#7A6455;margin:0 0 16px;">Pas d'adresse — vente boutique ou remise en main propre.</p>`}
      <p style="text-align:center;margin:24px 0;">
        <a href="${adminUrl}" style="${BTN}">Voir dans l'espace admin</a>
      </p>
    `),
  });
}
