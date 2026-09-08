import { Document } from "@react-pdf/renderer";
import { CardRectoVersoPages, type CardPdfData } from "./CardDocument";
import { OrderSheetA6Pages, type OrderSheetPdfData } from "./OrderSheetDocument";

// PDF unique, 3 pages A6 : carte (recto, verso) puis bon de commande —
// pratique en une seule ouverture dans Epson Smart Panel plutôt que deux
// documents séparés. Réservé à l'admin (le bon de commande contient
// l'adresse et l'email de l'acheteur).
export function FullOrderDocument({ card, order }: { card: CardPdfData; order: OrderSheetPdfData }) {
  return (
    <Document title={`Carte + bon de commande — ${order.fromName} pour ${order.toName}`}>
      <CardRectoVersoPages data={card} />
      <OrderSheetA6Pages data={order} />
    </Document>
  );
}
