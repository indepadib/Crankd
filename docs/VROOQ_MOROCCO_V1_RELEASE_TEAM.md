# VROOQ Maroc — Release V1, équipe, responsabilités et critères de sortie
Date : 22/11/2026. **Version pilote**, non transactionnelle ; interdiction de promettre un moteur VIN/OEM, un paiement PSP ou une livraison connectée qui ne sont pas vérifiés.

## Décision produit : un compte, deux espaces
- L'identité est commune : prénom, nom, téléphone, e-mail, ville, pays Maroc, pseudo.
- Espace **Mon Garage** : automobile personnelle, données techniques issues d'une saisie volontaire, clubs et pièces.
- Espace **Ma Boutique** : vendeur de pièces, activation gratuite, boutique + qualité des annonces + demandes.
- Une personne peut posséder des véhicules ET vendre, sans double compte. L'activation vendeur dépend de `part_sellers`; ne jamais déduire des droits sensibles de `user_metadata.role_profile`.
- Inscription en 3 étapes : objectif → informations privées → accès sécurisé. L'accès aux deux usages demeure possible quel que soit le premier choix.

## Politique Morocco-first
- **Devise d'émission des nouvelles annonces : MAD** ; distance des nouvelles annonces de véhicules : km.
- Les anciennes annonces gardent leur devise et unité enregistrées (par exemple USD/mi). **Aucune conversion à un taux figé**.
- Maroc première zone, FR par défaut, Darija/AR ensuite selon tests. L'expansion internationale nécessite localisation, devises, PSP et conformité pays par pays.
- **Le VIN américain NHTSA n'est pas utilisé** : route supprimée. Aucun mapping plaque ou VIN → voiture au Maroc n'est opérationnel actuellement.
- Saisie assistée des champs techniques d'une carte grise marocaine, **sans photo de document** ni identité/immatriculation du titulaire. `vehicle_specs` garde motorisation, énergie, code moteur, CV fiscaux, finition et date ; RLS owner-only.
- Compatibilité : (marque, modèle, année) + filtre additionnel carburant et code moteur s'ils sont renseignés des deux côtés ; toujours **déclarée** par le vendeur et **non certifiée OEM**.
- Clubs : suggestions privées par marque/modèle ; adhésion active seulement après choix explicite.

## Équipe et responsabilités immédiates
| Agent / owner | P0 — maintenant | Critère de réception |
| --- | --- | --- |
| Product / CRO | Valider parcours 1 compte / 2 espaces, test de 5 nouveaux marocains sans assistance | Chacun sait ajouter sa voiture ou activer sa boutique en moins de 3 min, sans navigation en impasse |
| Frontend / UX | Inscription 3 étapes, espace de démarrage, guide mini avec progression réellement vérifiée | iPhone 375px et Android Chrome, accessibilité clavier, aucun recouvrement gênant |
| Backend / Supabase | Migration 07 additive `vehicle_specs`, RLS, données privées ; moteurs décodeurs externes désactivés | Anon interdit, propriétaire A ne voit pas B, schéma & colonnes réellement présents |
| Catalogue / Fitment | Enrichir fiches OEM déclarées et trouver partenaire sous licence TecDoc ou équivalent | 20 véhicules marocains et références testées avant toute étiquette « certifié » |
| Confiance / conformité | CNDP, minimisation carte grise, consentement, vendeur vérifié et politiques d'annonces | Aucun VIN/photo/plaque non justifié n'est conservé, document juridique validé |
| Commerce / Sales | Onboard 20 vendeurs qualifiés et 100 pièces réelles selon autorisations | Photo, prix DH, référence et description sur chaque annonce ; 3 pièces par vendeur pilote |
| Paiement / Finance | ChariPay/ChariBaaS contrat multi-vendeurs, KYC, refunds, split, test sandbox | Premier checkout de test complet vérifié côté PSP avant toute collecte |
| Logistique | Cathedis API v5 vraie (le connecteur Jotya actuel simule le suivi), fallback Amana | Devis, BL et suivi renvoyés par transporteur réel avant lancement |
| Marketing / Growth | Messages SEO FR/Darija, tutoriels fiches et approche garage sans spam | Contenus approuvés, UTM, inscriptions et activations mesurées |
| QA / Data | CI, preview, RLS, funnel et incidents PGRST303 | 0 bug P0 connu sur trois parcours; dashboard activation sans PII |

## Parcours de test manuels obligatoires
1. Nouveau particulier : `/signup` → « J'ai une voiture » → données → mail → `/start` → `/garage/add` → Toyota Auris diesel 2014 → `/marketplace/parts` filtré → club proposé sans adhésion forcée.
2. Nouveau marchand : `/signup` → vendeur → `/start` → activer boutique → première pièce (photos + prix DH + carburant/code moteur) → visible dans catalogue, propriétaire vérifié.
3. Même utilisateur : bascule Garage ↔ Boutique sans se reconnecter, données privées non affichées publiquement.
4. Base historique : annonce de véhicule en USD reste affichée USD ; nouvelle annonce MAD reste MAD, km reste km.
5. Guide : progression « voiture / boutique / annonce » ne passe pas au vert sans action réelle; bouton Vérifier et mini panneau non bloquant; maintien après rafraîchissement.
6. Carte grise : mode transcription saisit seulement données techniques ; aucune photo ni plaque, aucune API NHTSA.
7. RLS : membre A ne lit pas `vehicle_specs` de B ; `anon` ne lit rien, pas de droits de mutation sur `owner_id`.
8. Expiration Auth : vérification session + reconnexion explicite sans boucle de 401, aucun double envoi de commande.
9. Prix marchand : produits à l'unité et transport non chiffré n'affichent pas « livraison gratuite ».
10. Le site reste une **bêta** : aucun paiement réel ou transporteur intégré n'est revendiqué.

## Déploiement / Go-no-go
- [ ] CI 100 % vert (lint ciblé, TypeScript, build Next) et preview Netlify prête.
- [ ] Migration 07 en base Crankd (project ref `fmvlrvigmptprtwpoanc`) avant merge.
- [ ] Tests RLS d'existence des tables et permissions, aucun accès public à `vehicle_specs`.
- [ ] Validation des parcours avec au moins deux sessions et appareils utilisateurs ; sans cela ne pas prétendre « version complète ».
- [ ] Seulement ensuite fusionner et vérifier Netlify production Ready.

## Reste à construire pour la version commerciale complète
- Catalogue VIN/VRM sous licence avec preuve de couverture marocaine, ou partenariat NARSA autorisé ; ne pas scraper un registre national.
- OCR assistée, consentement et minimisation, contrôles CNDP et suppression des documents.
- Compatibilité OEM réellement certifiée avec catalogues partenaires et prise en compte du moteur/finition.
- Checkout carte ChariPay + splits + refunds, transport prépayé Cathedis, bordereaux et tracking vrais, antifraude, support et litiges.
- QA mobile et conversion mesurées sur utilisateurs réels, pas seulement compilation.
Sources : https://www.cndp.ma/faq/ ; https://www.data.gov.ma/data/fr/organization/narsa ; https://vehicle-identification.tecalliance.services/documentation/introduction
