import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Mentions Légales — N'OUBLIE JAMAIS" };

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions Légales" updated="25 juin 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site <strong>noubliez-jamais.fr</strong> est édité par :<br />
        <strong>[Nom de la société ou du porteur de projet]</strong><br />
        [Forme juridique] au capital de [montant] €<br />
        Siège social : [Adresse complète]<br />
        SIRET : [Numéro SIRET]<br />
        N° TVA intracommunautaire : [Numéro TVA]<br />
        Email : <a href="mailto:contact@noubliez-jamais.fr">contact@noubliez-jamais.fr</a>
      </p>
      <p>
        Directeur de la publication : <strong>[Nom du responsable]</strong>
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par :<br />
        <strong>Vercel Inc.</strong><br />
        440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
      </p>
      <p>
        La base de données est hébergée par :<br />
        <strong>Neon Technologies Inc.</strong><br />
        <a href="https://neon.tech" target="_blank" rel="noopener noreferrer">neon.tech</a>
      </p>
      <p>
        Les fichiers audio sont stockés par :<br />
        <strong>Vercel Inc.</strong> via Vercel Blob Storage
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&rsquo;ensemble des éléments du site (textes, graphismes, logo, images, structure) est la propriété exclusive de <strong>N&rsquo;OUBLIE JAMAIS</strong> et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, représentation, modification ou exploitation de tout ou partie des éléments du site sans autorisation expresse est interdite.
      </p>

      <h2>Cookies</h2>
      <p>
        Le site utilise uniquement des cookies techniques nécessaires à son fonctionnement (session de paiement Stripe). Aucun cookie publicitaire ou de traçage tiers n&rsquo;est utilisé.
      </p>

      <h2>Liens hypertextes</h2>
      <p>
        Le site peut contenir des liens vers des sites tiers. Le Vendeur n&rsquo;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
      </p>

      <h2>Droit applicable</h2>
      <p>
        Le présent site est soumis au droit français. Tout litige relatif à son utilisation sera soumis à la compétence des tribunaux français.
      </p>
    </LegalLayout>
  );
}
