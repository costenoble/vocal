import { Fragment } from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";

// Mêmes conversions que CardDocument.tsx (mm/px -> pt), pour rester cohérent
// visuellement entre les pages carte et bon de commande d'un même PDF.
const mm = (n: number) => n * 2.834645669;
const px = (n: number) => n * 0.75;
const em = (fontSizePt: number, emValue: number) => fontSizePt * emValue;

const PAGE_WIDTH = mm(105);
const PAGE_HEIGHT = mm(148);

const INK = "#1C1410";
const MUTED = "#7A6455";
const GOLD = "#B8861A";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: px(12) }}>
      <Text
        style={{
          fontSize: px(9.5),
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: em(px(9.5), 0.12),
          color: GOLD,
        }}
      >
        {title}
      </Text>
      <View style={{ height: 0.75, backgroundColor: GOLD, opacity: 0.3, marginTop: px(3), marginBottom: px(6) }} />
      {children}
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: px(3), gap: px(8) }}>
      <Text
        style={{
          width: px(64),
          fontSize: px(7.5),
          textTransform: "uppercase",
          letterSpacing: em(px(7.5), 0.04),
          color: MUTED,
          lineHeight: 1.3,
        }}
      >
        {label}
      </Text>
      <Text style={{ flex: 1, fontSize: px(11), fontWeight: 800, color: INK, lineHeight: 1.3 }}>{value || "—"}</Text>
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
  shipPhone: string | null;
  shipAddress: string | null;
  shipComplement: string | null;
  shipPostalCode: string | null;
  shipCity: string | null;
  shipCountry: string | null;
  buyerEmail: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
};

// Page(s) bon de commande seules (sans wrapper <Document>), au même format
// A6 que la carte, pour pouvoir être combinées dans un seul PDF. Le contenu
// n'est pas contraint en hauteur : s'il dépasse une page A6 (message ou
// adresse très longs), react-pdf ajoute automatiquement une page A6
// supplémentaire — pas de troncature ni de chevauchement.
export function OrderSheetA6Pages({ data }: { data: OrderSheetPdfData }) {
  const hasShipping = Boolean(data.shipName || data.shipAddress);

  return (
    <Fragment>
      <Page size={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }} style={{ padding: mm(7), fontFamily: "Inter", backgroundColor: "#FFFFFF" }}>
        <View style={{ height: px(3), backgroundColor: GOLD, borderRadius: 2 }} />

        <Text
          style={{
            fontSize: px(15),
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: em(px(15), 0.08),
            color: INK,
            marginTop: px(10),
          }}
        >
          Bon de commande
        </Text>
        <Text style={{ fontSize: px(7.5), color: MUTED, marginTop: px(3), lineHeight: 1.4 }}>
          Réf. {data.slug} · {data.createdFormatted} · {data.paid ? "Payée" : "En attente de paiement"}
          {data.orderId ? ` · Groupée ${data.orderId}` : ""}
        </Text>

        <Section title="Bijou à préparer">
          <Field label="Produit" value={data.productName || ""} />
          {data.reference ? <Field label="Référence" value={data.reference} /> : null}
          <Field label="Taille" value={data.productSize || "Taille unique"} />
        </Section>

        <Section title="Carte vocale">
          <Field label="De" value={data.fromName} />
          <Field label="Pour" value={data.toName} />
          {data.date ? <Field label="Date / occasion" value={data.date} /> : null}
          {data.message ? <Field label="Message" value={data.message} /> : null}
          {data.accessCode ? (
            <View style={{ alignItems: "center", marginTop: px(8) }}>
              <Text
                style={{
                  fontSize: px(7.5),
                  textTransform: "uppercase",
                  letterSpacing: em(px(7.5), 0.06),
                  color: MUTED,
                  textAlign: "center",
                }}
              >
                Code d&apos;accès (au dos de la carte)
              </Text>
              <Text
                style={{
                  fontSize: px(20),
                  fontWeight: 900,
                  letterSpacing: em(px(20), 0.24),
                  color: GOLD,
                  marginTop: px(2),
                }}
              >
                {data.accessCode}
              </Text>
            </View>
          ) : null}
        </Section>

        <Section title="Livraison">
          {hasShipping ? (
            <Text style={{ fontSize: px(11), color: INK, lineHeight: 1.5 }}>
              <Text style={{ fontWeight: 800 }}>{data.shipName}</Text>
              {data.shipPhone ? ` · ${data.shipPhone}` : ""}
              {"\n"}
              {data.shipAddress}
              {data.shipComplement ? `, ${data.shipComplement}` : ""}
              {"\n"}
              {data.shipPostalCode} {data.shipCity} · {data.shipCountry}
            </Text>
          ) : (
            <Text style={{ fontSize: px(10), color: MUTED, fontStyle: "italic" }}>
              Remise en main propre (vente boutique) — pas d&apos;adresse.
            </Text>
          )}
          {data.buyerEmail ? (
            <Text style={{ fontSize: px(8.5), color: MUTED, marginTop: px(6) }}>Email : {data.buyerEmail}</Text>
          ) : null}
          {data.trackingNumber ? (
            <Text style={{ fontSize: px(8.5), color: MUTED, marginTop: px(3) }}>
              Suivi : <Text style={{ fontWeight: 800 }}>{data.trackingNumber}</Text>
              {data.trackingCarrier ? ` (${data.trackingCarrier})` : ""}
            </Text>
          ) : null}
        </Section>
      </Page>
    </Fragment>
  );
}

export function OrderSheetDocument({ data }: { data: OrderSheetPdfData }) {
  return (
    <Document title={`Bon de commande — ${data.fromName} pour ${data.toName}`}>
      <OrderSheetA6Pages data={data} />
    </Document>
  );
}
