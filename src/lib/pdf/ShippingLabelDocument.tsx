import { Document, Page, View, Text } from "@react-pdf/renderer";

// Mêmes conversions que les autres documents PDF (mm/px -> pt).
const mm = (n: number) => n * 2.834645669;
const px = (n: number) => n * 0.75;
const em = (fontSizePt: number, emValue: number) => fontSizePt * emValue;

const LABEL_WIDTH = mm(100);
const LABEL_HEIGHT = mm(150);

const INK = "#1C1410";
const MUTED = "#7A6455";

// Adresse d'expédition fixe — N'OUBLIE JAMAIS.
const SENDER = {
  name: "N'OUBLIE JAMAIS.NJ",
  address: "2 Boulevard des Dames",
  cityLine: "13002 Marseille",
};

function Divider() {
  return <View style={{ height: 1, backgroundColor: INK, opacity: 0.15, marginVertical: px(10) }} />;
}

function PlaceholderZone({ label }: { label: string }) {
  return (
    <View
      style={{
        height: mm(22),
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: MUTED,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: px(9),
          textTransform: "uppercase",
          letterSpacing: em(px(9), 0.1),
          color: MUTED,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export type ShippingLabelData = {
  shipName: string | null;
  shipAddress: string | null;
  shipComplement: string | null;
  shipPostalCode: string | null;
  shipCity: string | null;
  shipCountry: string | null;
};

// Taille adaptative : une étiquette est un support physique fixe (pas de
// 2e page possible comme sur la carte) — une adresse inhabituellement
// longue doit réduire le texte plutôt que déborder.
function destinataireFontSize(data: ShippingLabelData): number {
  const chars = [data.shipName, data.shipAddress, data.shipComplement, data.shipPostalCode, data.shipCity, data.shipCountry]
    .filter(Boolean)
    .join(" ").length;
  if (chars > 150) return 13;
  if (chars > 100) return 16;
  if (chars > 70) return 19;
  return 22;
}

export function ShippingLabelDocument({ data }: { data: ShippingLabelData }) {
  const destSize = destinataireFontSize(data);
  return (
    <Document title={`Étiquette d'expédition — ${data.shipName ?? ""}`}>
      <Page
        size={{ width: LABEL_WIDTH, height: LABEL_HEIGHT }}
        style={{ padding: mm(7), fontFamily: "Inter", backgroundColor: "#FFFFFF" }}
      >
        {/* Expéditeur */}
        <Text
          style={{
            fontSize: px(9),
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: em(px(9), 0.1),
            color: MUTED,
            marginBottom: px(6),
          }}
        >
          Expéditeur
        </Text>
        <Text style={{ fontSize: px(12), fontWeight: 800, color: INK, lineHeight: 1.4 }}>{SENDER.name}</Text>
        <Text style={{ fontSize: px(12), color: INK, lineHeight: 1.4 }}>{SENDER.address}</Text>
        <Text style={{ fontSize: px(12), color: INK, lineHeight: 1.4 }}>{SENDER.cityLine}</Text>

        <Divider />

        {/* Destinataire */}
        <Text
          style={{
            fontSize: px(13),
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: em(px(13), 0.1),
            color: INK,
            marginBottom: px(10),
          }}
        >
          Destinataire
        </Text>
        <Text style={{ fontSize: px(destSize), fontWeight: 800, color: INK, lineHeight: 1.35 }}>
          {data.shipName || "—"}
        </Text>
        <Text style={{ fontSize: px(destSize), fontWeight: 800, color: INK, lineHeight: 1.35, marginTop: px(4) }}>
          {data.shipAddress || ""}
          {data.shipComplement ? `, ${data.shipComplement}` : ""}
        </Text>
        <Text style={{ fontSize: px(destSize), fontWeight: 800, color: INK, lineHeight: 1.35 }}>
          {data.shipPostalCode} {data.shipCity}
        </Text>
        {data.shipCountry && data.shipCountry.trim() !== "France" ? (
          <Text style={{ fontSize: px(destSize), fontWeight: 800, color: INK, lineHeight: 1.35 }}>{data.shipCountry}</Text>
        ) : null}

        <Divider />

        <PlaceholderZone label="Zone timbre" />

        <Divider />

        <PlaceholderZone label="Zone sticker de suivi" />
      </Page>
    </Document>
  );
}
