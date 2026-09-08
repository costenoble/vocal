import { Document, Page, View, Text } from "@react-pdf/renderer";

const mm = (n: number) => n * 2.834645669;
const px = (n: number) => n * 0.75;
const em = (fontSizePt: number, emValue: number) => fontSizePt * emValue;

const INK = "#1C1410";
const MUTED = "#7A6455";
const GOLD = "#B8861A";
// Équivalent opaque de rgba(184,134,26,0.3) sur fond blanc — react-pdf/pdfkit
// n'applique pas correctement l'alpha des couleurs rgba() sur les bordures.
const GOLD_BORDER = "#EADBBA";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: px(6), gap: px(12) }}>
      <Text
        style={{
          width: px(140),
          fontSize: px(10.5),
          textTransform: "uppercase",
          letterSpacing: em(px(10.5), 0.06),
          color: MUTED,
        }}
      >
        {label}
      </Text>
      <Text style={{ flex: 1, fontSize: px(13), fontWeight: 600, color: INK }}>{value || "—"}</Text>
    </View>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: GOLD_BORDER,
        borderRadius: 10,
        padding: px(18),
        marginTop: px(16),
      }}
    >
      <Text
        style={{
          fontSize: px(11),
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: em(px(11), 0.12),
          color: GOLD,
          marginBottom: px(6),
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

export type OrderSheetPdfData = {
  slug: string;
  createdFormatted: string;
  paid: boolean;
  orderId: string | null;
  productName: string | null;
  reference: string | null;
  productSize: string | null;
  fromName: string;
  toName: string;
  date: string | null;
  message: string | null;
  accessCode: string | null;
  shipName: string | null;
  shipAddress: string | null;
  shipComplement: string | null;
  shipPostalCode: string | null;
  shipCity: string | null;
  shipCountry: string | null;
  buyerEmail: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
};

export function OrderSheetDocument({ data }: { data: OrderSheetPdfData }) {
  const hasShipping = Boolean(data.shipName || data.shipAddress);

  return (
    <Document title={`Bon de commande — ${data.fromName} pour ${data.toName}`}>
      <Page size="A4" style={{ padding: mm(20), fontFamily: "Inter", backgroundColor: "#FFFFFF" }}>
        <View style={{ height: px(5), backgroundColor: GOLD, borderRadius: 3, marginBottom: px(20) }} />

        <Text
          style={{
            fontSize: px(20),
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: em(px(20), 0.12),
            color: INK,
          }}
        >
          Bon de commande
        </Text>
        <Text style={{ fontSize: px(10.5), color: MUTED, marginTop: px(4) }}>
          Réf. {data.slug} · Commandée le {data.createdFormatted} · {data.paid ? "Payée" : "En attente de paiement"}
          {data.orderId ? ` · Commande groupée ${data.orderId}` : ""}
        </Text>

        <Box title="Bijou à préparer">
          <Field label="Produit" value={data.productName || ""} />
          {data.reference ? <Field label="Référence" value={data.reference} /> : null}
          <Field label="Taille" value={data.productSize || "Taille unique"} />
        </Box>

        <Box title="Carte vocale">
          <Field label="De" value={data.fromName} />
          <Field label="Pour" value={data.toName} />
          {data.date ? <Field label="Date / occasion" value={data.date} /> : null}
          {data.message ? <Field label="Message imprimé" value={data.message} /> : null}
          {data.accessCode ? (
            <View style={{ alignItems: "center", marginTop: px(10) }}>
              <Text
                style={{
                  fontSize: px(10),
                  textTransform: "uppercase",
                  letterSpacing: em(px(10), 0.1),
                  color: MUTED,
                }}
              >
                Code d&apos;accès (à imprimer au dos de la carte)
              </Text>
              <Text
                style={{
                  fontSize: px(22),
                  fontWeight: 900,
                  letterSpacing: em(px(22), 0.28),
                  color: GOLD,
                  marginTop: px(2),
                }}
              >
                {data.accessCode}
              </Text>
            </View>
          ) : null}
        </Box>

        <Box title="Livraison">
          {hasShipping ? (
            <Text style={{ fontSize: px(13), color: INK, lineHeight: 1.7 }}>
              <Text style={{ fontWeight: 700 }}>{data.shipName}</Text>
              {"\n"}
              {data.shipAddress}
              {data.shipComplement ? `, ${data.shipComplement}` : ""}
              {"\n"}
              {data.shipPostalCode} {data.shipCity} · {data.shipCountry}
            </Text>
          ) : (
            <Text style={{ fontSize: px(12), color: MUTED, fontStyle: "italic" }}>
              Remise en main propre (vente boutique) — pas d&apos;adresse.
            </Text>
          )}
          {data.buyerEmail ? (
            <Text style={{ fontSize: px(11), color: MUTED, marginTop: px(8) }}>Email acheteur : {data.buyerEmail}</Text>
          ) : null}
          {data.trackingNumber ? (
            <Text style={{ fontSize: px(11), color: MUTED, marginTop: px(4) }}>
              Suivi : <Text style={{ fontWeight: 700 }}>{data.trackingNumber}</Text>
              {data.trackingCarrier ? ` (${data.trackingCarrier})` : ""}
            </Text>
          ) : null}
        </Box>
      </Page>
    </Document>
  );
}
