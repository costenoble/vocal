import { Fragment } from "react";
import { Document, Page, View, Text, Image, Svg, Path, Rect } from "@react-pdf/renderer";

// Mêmes tables que src/app/api/pdf/[id]/route.ts (design de la carte).
const PAPERS: Record<string, { bg: string; text: string; accent: string; darkQr: boolean }> = {
  ivoire: { bg: "#F5EED5", text: "#1C1410", accent: "#8B6510", darkQr: false },
  nacre: { bg: "#F9F8F3", text: "#1C1410", accent: "#8B6510", darkQr: false },
  lin: { bg: "#DFD0B4", text: "#2A1B0E", accent: "#6B4C1E", darkQr: false },
  noir: { bg: "#18120C", text: "#F0E8D8", accent: "#D4A832", darkQr: true },
};

const FONT_FAMILY: Record<string, string> = {
  playfair: "Playfair Display",
  inter: "Inter",
  script: "Dancing Script",
};

// mm -> pt (react-pdf travaille en points, 1mm = 2.834645669pt) et px -> pt
// (1px CSS = 1/96in = 0.75pt) pour conserver la taille physique du design
// d'origine (pensé pour l'impression navigateur en px/mm).
const mm = (n: number) => n * 2.834645669;
const px = (n: number) => n * 0.75;
const em = (fontSizePt: number, emValue: number) => fontSizePt * emValue;

// Texte agrandi de 15% par rapport au design d'origine (retour client :
// lisibilité à l'impression), sans toucher aux marges/tailles d'images.
const TEXT_SCALE = 1.15;
const fs = (n: number) => px(n) * TEXT_SCALE;

// Logo agrandi (retour client, deux fois : toujours trop discret à
// l'impression même après un premier passage à 1.15 — on monte davantage).
const LOGO_SCALE = 1.45;
const logoSize = (n: number) => px(n) * LOGO_SCALE;

const CARD_WIDTH = mm(105);
const CARD_HEIGHT = mm(148);

function HeartLine({ color, widthPct }: { color: string; widthPct: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: px(5), width: `${widthPct}%` }}>
      <View style={{ flex: 1, height: 0.5, backgroundColor: color, opacity: 0.45 }} />
      <Svg width={px(8)} height={px(8)} viewBox="0 0 16 16">
        <Path
          d="M8 14l-1-0.9C3.5 10.2 1 8.1 1 5.5 1 3.4 2.7 2 4.5 2c1.2 0 2.4.6 3.5 1.7C9.1 2.6 10.3 2 11.5 2 13.3 2 15 3.4 15 5.5c0 2.6-2.5 4.7-6 8.6L8 14z"
          fill={color}
          fillOpacity={0.7}
        />
      </Svg>
      <View style={{ flex: 1, height: 0.5, backgroundColor: color, opacity: 0.45 }} />
    </View>
  );
}

function InsetFrame({ color }: { color: string }) {
  return (
    <View
      style={{
        position: "absolute",
        top: mm(5),
        left: mm(5),
        right: mm(5),
        bottom: mm(5),
        borderWidth: 0.5,
        borderColor: color,
        borderStyle: "solid",
        opacity: 0.4,
      }}
    />
  );
}

function CardPage({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <Page
      size={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      style={{ backgroundColor: bg, position: "relative" }}
    >
      {children}
    </Page>
  );
}

export type CardPdfData = {
  slug: string;
  fromName: string;
  toName: string;
  message: string | null;
  accessCode: string | null;
  paper: string;
  cardFont: string;
  createdAt: Date;
  logoDataUrl: string;
  qrDataUrl: string;
};

// Pages recto + verso seules (sans wrapper <Document>), pour pouvoir les
// combiner avec d'autres pages (ex. bon de commande) dans un même PDF.
export function CardRectoVersoPages({ data }: { data: CardPdfData }) {
  const paper = PAPERS[data.paper] ?? PAPERS.ivoire;
  const nameFamily = FONT_FAMILY[data.cardFont] ?? FONT_FAMILY.playfair;
  const nameItalic = data.cardFont === "inter" ? "normal" : "italic";

  const dateFormatted = data.createdAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const labelStyle = {
    fontSize: fs(9.5),
    fontWeight: 800,
    letterSpacing: em(fs(9.5), 0.22),
    textTransform: "uppercase" as const,
    color: paper.text,
    opacity: 0.45,
    fontFamily: "Inter",
  };

  return (
    <Fragment>
      {/* RECTO */}
      <CardPage bg={paper.bg}>
        <InsetFrame color={paper.accent} />
        <View
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: mm(9),
            paddingHorizontal: mm(8),
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf : pas de prop alt (PDF statique). */}
          <Image src={data.logoDataUrl} style={{ width: logoSize(80), height: logoSize(80 * (715 / 720)) }} />

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: fs(14.5),
                fontWeight: 900,
                letterSpacing: em(fs(14.5), 0.28),
                textTransform: "uppercase",
                color: paper.text,
                fontFamily: "Inter",
              }}
            >
              N&apos;OUBLIE JAMAIS
            </Text>
            <View style={{ height: 0.5, backgroundColor: paper.accent, opacity: 0.35, marginTop: px(5), width: px(140) }} />
          </View>

          <View style={{ width: "72%" }}>
            <HeartLine color={paper.accent} widthPct={100} />
          </View>

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: fs(13),
                color: paper.text,
                opacity: 0.7,
                fontFamily: "Playfair Display",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              Certains messages{"\n"}ne s&apos;oublient pas.
            </Text>
            <Text
              style={{
                fontSize: fs(15.5),
                fontFamily: nameFamily,
                fontStyle: "italic",
                color: paper.accent,
                marginTop: px(5),
              }}
            >
              Ils se portent.
            </Text>
          </View>

          <View
            style={{
              padding: px(7),
              backgroundColor: paper.darkQr ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.88)",
              borderRadius: 6,
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf : pas de prop alt (PDF statique). */}
            <Image src={data.qrDataUrl} style={{ width: px(172), height: px(172) }} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: px(5) }}>
            <Svg width={px(13)} height={px(13)} viewBox="0 0 24 24">
              <Rect x={5} y={2} width={14} height={20} rx={3} stroke={paper.accent} strokeWidth={1.4} fill="none" />
              <Rect x={9} y={18} width={6} height={1.5} rx={0.75} fill={paper.accent} />
            </Svg>
            <Text
              style={{
                fontSize: fs(9.5),
                color: paper.text,
                opacity: 0.55,
                fontFamily: "Inter",
                letterSpacing: em(fs(9.5), 0.04),
              }}
            >
              Scannez, puis saisissez le code au dos
            </Text>
          </View>

          <View style={{ width: "60%" }}>
            <HeartLine color={paper.accent} widthPct={100} />
          </View>
        </View>
      </CardPage>

      {/* VERSO */}
      <CardPage bg={paper.bg}>
        <InsetFrame color={paper.accent} />
        <View
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: mm(9),
            paddingHorizontal: mm(8),
          }}
        >
          <View style={{ width: "65%" }}>
            <HeartLine color={paper.accent} widthPct={100} />
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={labelStyle}>Message de</Text>
            <Text style={{ fontSize: fs(25), fontFamily: nameFamily, fontStyle: nameItalic, color: paper.accent, lineHeight: 1.2 }}>
              {data.fromName}
            </Text>
          </View>

          <View style={{ width: "50%" }}>
            <HeartLine color={paper.accent} widthPct={100} />
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={labelStyle}>Pour</Text>
            <Text style={{ fontSize: fs(25), fontFamily: nameFamily, fontStyle: nameItalic, color: paper.accent, lineHeight: 1.2 }}>
              {data.toName}
            </Text>
          </View>

          {dateFormatted ? (
            <View style={{ alignItems: "center" }}>
              <Text style={labelStyle}>Créé le</Text>
              <Text
                style={{
                  fontSize: fs(12),
                  fontFamily: "Playfair Display",
                  fontStyle: "italic",
                  color: paper.text,
                  opacity: 0.7,
                  marginTop: px(2),
                }}
              >
                {dateFormatted}
              </Text>
            </View>
          ) : null}

          {data.accessCode ? (
            <View
              style={{
                alignItems: "center",
                paddingVertical: px(7),
                paddingHorizontal: px(18),
                borderWidth: 1,
                borderColor: paper.accent,
                borderStyle: "solid",
                borderRadius: 8,
                opacity: 0.95,
              }}
            >
              <Text style={labelStyle}>Code d&apos;accès confidentiel</Text>
              <Text
                style={{
                  fontSize: fs(24),
                  fontWeight: 900,
                  letterSpacing: em(fs(24), 0.34),
                  color: paper.accent,
                  fontFamily: "Inter",
                  marginTop: px(3),
                }}
              >
                {data.accessCode}
              </Text>
            </View>
          ) : null}

          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf : pas de prop alt (PDF statique). */}
          <Image src={data.logoDataUrl} style={{ width: logoSize(48), height: logoSize(48 * (715 / 720)) }} />

          <View style={{ alignItems: "center", paddingHorizontal: px(6) }}>
            {data.message ? (
              <Text
                style={{
                  fontSize: fs(12),
                  fontFamily: nameFamily,
                  fontStyle: "italic",
                  color: paper.text,
                  opacity: 0.75,
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                {data.message}
              </Text>
            ) : null}
            <Text
              style={{
                fontSize: fs(14.5),
                marginTop: px(7),
                fontFamily: nameFamily,
                fontStyle: "italic",
                color: paper.accent,
              }}
            >
              N&apos;oublie jamais.
            </Text>
          </View>

          <Svg width={px(10)} height={px(10)} viewBox="0 0 16 16">
            <Path
              d="M8 14l-1-0.9C3.5 10.2 1 8.1 1 5.5 1 3.4 2.7 2 4.5 2c1.2 0 2.4.6 3.5 1.7C9.1 2.6 10.3 2 11.5 2 13.3 2 15 3.4 15 5.5c0 2.6-2.5 4.7-6 8.6L8 14z"
              fill={paper.accent}
              fillOpacity={0.6}
            />
          </Svg>
        </View>
      </CardPage>
    </Fragment>
  );
}

export function CardDocument({ data }: { data: CardPdfData }) {
  return (
    <Document title={`Carte N'OUBLIE JAMAIS — ${data.fromName} pour ${data.toName}`}>
      <CardRectoVersoPages data={data} />
    </Document>
  );
}
