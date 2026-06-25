import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Conditions Générales de Vente — N'OUBLIE JAMAIS" };

export default function CGV() {
  return (
    <LegalLayout title="Conditions Générales de Vente" updated="25 juin 2026">
      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>N&rsquo;OUBLIE JAMAIS</strong> (ci-après « le Vendeur ») et toute personne physique ou morale souhaitant procéder à un achat via le site <strong>noubliez-jamais.fr</strong> (ci-après « le Client »).
      </p>
      <p>
        Tout achat sur le site implique l&rsquo;acceptation pleine et entière des présentes CGV.
      </p>

      <h2>2. Produits et services</h2>
      <p>
        Le Vendeur propose un service de création de cartes vocales numériques comprenant :
      </p>
      <ul>
        <li>L&rsquo;enregistrement ou l&rsquo;import d&rsquo;un message vocal</li>
        <li>La génération d&rsquo;un QR code unique associé à ce message</li>
        <li>Une page d&rsquo;écoute en ligne accessible via ce QR code</li>
        <li>Un fichier PDF imprimable de la carte</li>
      </ul>

      <h2>3. Prix</h2>
      <p>
        Les prix sont indiqués en euros toutes taxes comprises (TTC). Le Vendeur se réserve le droit de modifier ses prix à tout moment. Les produits sont facturés sur la base des tarifs en vigueur au moment de la validation de la commande.
      </p>
      <ul>
        <li><strong>La Carte</strong> : 14,90 € TTC — 1 carte vocale, lien actif à vie</li>
        <li><strong>Le Coffret</strong> : 34,90 € TTC — 5 cartes vocales, liens actifs à vie</li>
      </ul>

      <h2>4. Paiement</h2>
      <p>
        Le paiement est effectué en ligne, de manière sécurisée, via la plateforme <strong>Stripe</strong>. Les moyens de paiement acceptés sont : carte bancaire (Visa, Mastercard, American Express), Apple Pay et Google Pay.
      </p>
      <p>
        La commande est confirmée après validation du paiement par Stripe. Le Client reçoit un email de confirmation à l&rsquo;adresse fournie lors du paiement.
      </p>

      <h2>5. Accès au service</h2>
      <p>
        Après confirmation du paiement, le Client accède immédiatement au service de création de sa carte vocale. Le service est livré sous forme numérique ; aucune livraison physique n&rsquo;est effectuée.
      </p>

      <h2>6. Droit de rétractation</h2>
      <p>
        Conformément à l&rsquo;article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contenus numériques dont l&rsquo;exécution a commencé avec l&rsquo;accord préalable du consommateur. En accédant au service de création après paiement, le Client renonce expressément à son droit de rétractation.
      </p>

      <h2>7. Durée du service</h2>
      <p>
        Les formules proposées incluent un accès au service à vie. Le message vocal et la page d&rsquo;écoute restent accessibles sans limitation de durée, sous réserve de la continuité du service par le Vendeur.
      </p>
      <p>
        En cas de cessation d&rsquo;activité, le Vendeur s&rsquo;engage à informer les Clients par email au moins 3 mois à l&rsquo;avance.
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        Le Client est seul responsable du contenu du message vocal enregistré. Le Vendeur décline toute responsabilité quant aux contenus illicites, diffamatoires ou portant atteinte à des droits tiers. Le Vendeur se réserve le droit de supprimer tout contenu jugé inapproprié.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Les données collectées lors de la commande (email, prénoms) sont utilisées uniquement pour la gestion du service. Pour plus d&rsquo;informations, consultez notre <a href="/confidentialite">Politique de Confidentialité</a>.
      </p>

      <h2>10. Litiges</h2>
      <p>
        En cas de litige, le Client peut contacter le service client à l&rsquo;adresse <strong>contact@noubliez-jamais.fr</strong>. En cas d&rsquo;échec de la résolution amiable, les tribunaux français seront seuls compétents.
      </p>
    </LegalLayout>
  );
}
