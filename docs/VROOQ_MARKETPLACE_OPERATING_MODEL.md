# VROOQ Parts — modèle opérationnel (novembre 2026)

STATUT : développement en branche ; aucun paiement ou transport réel connecté.

## Règle fondamentale
L’acheteur passe exclusivement par le parcours VROOQ. Un prestataire agréé réalise l’encaissement, la conservation/répartition des fonds, les remboursements et les reversements vendeurs. VROOQ ne doit pas détenir lui-même les fonds des clients ni imposer un règlement vendeur directement. Aucun paiement à la livraison (COD).

## Comptes
- Acheteur : compte VROOQ standard.
- Vendeur : compte VROOQ standard plus enregistrement dans part_sellers (nom boutique, type, ville, téléphone, politique de retour, engagement à respecter les règles).
- Statut de lancement : actif pour publier, mais non vérifié. Ne jamais confondre avec certification KYC/KYB.
- Plans : FREE (0 MAD), PRO et BUSINESS (tarifs et avantages futurs, non facturés). Les statuts, forfaits et vérifications sont non modifiables par le vendeur ; les champs administratifs nécessitent un service privilégié.
- Ne pas collecter CIN/RIB dans les champs publics ; le prestataire de paiement gère les justificatifs d’identité selon le contrat.

## Checkout et commandes
1. Acheteur choisit pièce et lieu, transporteur préféré (Cathedis/Amana) et instrument souhaité (carte, wallet ou réseau de prépaiement).
2. Le RPC v2 vérifie le vendeur, réserve un article de manière atomique et conserve les préférences. La commande est NON PAYÉE : le prix du transport n’est pas encore connu.
3. Vendeur peut accepter ou refuser. L’expédition est bloquée sans confirmation du paiement par le PSP.
4. Futur : VROOQ obtient un devis de livraison du partenaire ; affiche le total, déclenche une transaction par un serveur sécurisé, vérifie le webhook signé et le rapprochement, réserve l’enlèvement, reçoit le suivi, permet retours et remboursements.
5. Aucune carte bancaire brute dans notre base. Jamais de champ payment_status modifiable par le navigateur, le vendeur ou l’acheteur.

## Prestataires à négocier
- ChariBaaS / Chari Pay : split payment, commissions, vendeur KYC/KYB et payouts annoncés ; demander contrat marketplace réel, tarifs, API, webhooks, sandbox, remboursements, chargebacks et délais de reversement.
- NAPS : solution e-commerce et marketplace ; demander confirmation écrite du split et de l’encaissement multi-vendeurs.
- Payzone : challenger sur les cartes, remboursements et services marketplace ; ne pas supposer la capacité de reversement.
- Cathedis : cible principale pour pickup, création de colis, étiquettes, suivi, livraison prépayée et retours ; exiger docs API, identifiants test, prix par zone/poids et SLA.
- Amana : alternative nationale ; opération manuelle pour l’instant tant qu’une API B2B contractuelle n’est pas confirmée.

Sources publiques :
https://www.baas.ma/fr/paiement-marketplace-maroc
https://siteweb.naps.ma/ecommerce-et-marketplaces/
https://developers.payzone.ma/
https://cathedis.ma/
https://www.barid.ma/bamb2cstorefront/fr/simulation/simulationVente
https://maroc.ma/fr/actualites/paiement-electronique-les-etablissements-de-paiement-et-les-filiales-des-banques-autorises-operer-des

## Migration et validation
- Le script backend/03_used_parts_marketplace.sql a été exécuté par le propriétaire et son MVP fonctionne, selon son test.
- Nouveau backend/04_sellers_checkout_carrier_preferences.sql : PAS exécuté, doit être installé sur Supabase Crankd, project ref fmvlrvigmptprtwpoanc avant de fusionner l’interface.
- Le script ajoute part_sellers, policies RLS, droits par colonnes, préférences commande et request_part_order_v2 ; révoque l’ancien RPC de commande ; renforce transition_part_order pour interdire expédition/réception sans paiement.
- Tests : compte vendeur A, acheteur B, vendeur suspendu C ; insertion admin frauduleuse, sur-vente avec deux acheteurs, requête identique répétée, retour de stock annulation, photo, aucun paiement déclenché, aucune expédition sans paiement.
- À faire AVANT transactions réelles : CGV/CGU/CNDP, vérification pièces volées ou sensibles, modération, service client, remboursement et litige, intégration PSP agréée, courier API, suivi et rapprochement financier.

## Skills de référence à mobiliser
Apple-design : https://github.com/emilkowalski/skills
Grill-me : https://github.com/mattpocock/skills
Humanizer : https://github.com/blader/humanizer
Video-agent-skills : https://github.com/Melvynx/video-agent-skills
Marketingskills : https://github.com/coreyhaines31/marketingskills

Ces liens sont des ressources de travail, pas des dépendances exécutées ou installées dans le projet.