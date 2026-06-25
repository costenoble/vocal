import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Politique de Confidentialité — N'OUBLIE JAMAIS" };

export default function Confidentialite() {
  return (
    <LegalLayout title="Politique de Confidentialité" updated="25 juin 2026">
      <p>
        La protection de vos données personnelles est une priorité pour <strong>N&rsquo;OUBLIE JAMAIS</strong>. Cette politique décrit les données collectées, leur utilisation et vos droits conformément au Règlement Général sur la Protection des Données (RGPD).
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        <strong>[Nom de la société]</strong><br />
        [Adresse]<br />
        Email : <a href="mailto:contact@noubliez-jamais.fr">contact@noubliez-jamais.fr</a>
      </p>

      <h2>2. Données collectées</h2>
      <p>Lors de l&rsquo;utilisation du service, nous collectons :</p>
      <ul>
        <li><strong>Email</strong> — fourni lors du paiement, pour l&rsquo;envoi de la confirmation de commande</li>
        <li><strong>Prénom de l&rsquo;expéditeur et du destinataire</strong> — pour personnaliser la carte</li>
        <li><strong>Message vocal</strong> — enregistré ou importé par l&rsquo;utilisateur</li>
        <li><strong>Date</strong> — indiquée sur la carte</li>
        <li><strong>Données de paiement</strong> — traitées directement par Stripe, non stockées par nos soins</li>
      </ul>

      <h2>3. Finalités du traitement</h2>
      <p>Les données sont collectées pour :</p>
      <ul>
        <li>L&rsquo;exécution du contrat (création et délivrance de la carte vocale)</li>
        <li>L&rsquo;envoi de la confirmation de commande par email</li>
        <li>La gestion et la maintenance du service</li>
      </ul>
      <p>Nous ne vendons, ne louons et ne partageons pas vos données avec des tiers à des fins commerciales.</p>

      <h2>4. Sous-traitants</h2>
      <p>Nous faisons appel aux sous-traitants suivants :</p>
      <ul>
        <li><strong>Stripe</strong> — traitement des paiements (politique : <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer">stripe.com/fr/privacy</a>)</li>
        <li><strong>Vercel</strong> — hébergement du site et stockage des fichiers audio</li>
        <li><strong>Neon</strong> — base de données</li>
        <li><strong>Resend</strong> — envoi des emails transactionnels</li>
      </ul>

      <h2>5. Durée de conservation</h2>
      <p>
        Vos données sont conservées aussi longtemps que votre carte vocale est active. En cas de suppression de votre carte ou de cessation du service, les données sont supprimées dans un délai de 30 jours.
      </p>

      <h2>6. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Droit d&rsquo;accès</strong> — obtenir une copie de vos données</li>
        <li><strong>Droit de rectification</strong> — corriger des données inexactes</li>
        <li><strong>Droit à l&rsquo;effacement</strong> — demander la suppression de vos données</li>
        <li><strong>Droit d&rsquo;opposition</strong> — s&rsquo;opposer à certains traitements</li>
        <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format lisible</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@noubliez-jamais.fr">contact@noubliez-jamais.fr</a>
      </p>
      <p>
        Vous pouvez également adresser une réclamation à la <strong>CNIL</strong> : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>
      </p>

      <h2>7. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou altération. Les communications entre votre navigateur et nos serveurs sont chiffrées via HTTPS/TLS.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Le site utilise uniquement des cookies strictement nécessaires au fonctionnement du paiement (session Stripe). Vous ne pouvez pas les désactiver sans altérer le service.
      </p>
    </LegalLayout>
  );
}
