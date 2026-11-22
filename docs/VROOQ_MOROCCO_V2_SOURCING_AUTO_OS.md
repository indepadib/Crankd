# VROOQ Maroc V2 — OS Automobile et sourcing de pièces

Date : 22/11/2026 · Implémentation PR #30

## Produit

**Automobiliste** : saisit une voiture et ses caractéristiques → consigne un entretien selon type d'intervention → cherche une pièce → si absente, dépose une demande de devis → compare les offres réellement envoyées.

**Vendeur** : active sa boutique → sélectionne les catégories et marques qu'il source → consulte les demandes correspondantes → propose son prix, son délai, son état et des frais de livraison optionnels.

Un compte VROOQ permet les deux usages.

## Référentiel voitures

- VehiclesDB 2026.11.12 (17/11/2026), CC BY 4.0 : 380 marques auto/utilitaires, 6 533 modèles dédupliqués, imports possibles sans restriction de pays.
- Recherche marque puis modèle, insensible aux accents/casse et saisie libre pour les voitures rares/importées.
- Ceci n’est **pas** le registre national NARSA ni une preuve d'homologation, ni un catalogue exhaustif de tous les véhicules du monde.
- Crédit visible dans le sélecteur + notices obligatoires dans web/public/vehicle-data-attribution.md.
- VIN 17 caractères facultatif, RLS propriétaire, stockage après consentement, VIN masqué en UI, suppression possible. Pas d'analyse US NHTSA ni transfert à un marchand.

## Entretien

- 36 règles dans web/lib/maintenance.ts, avec obligation de kilométrage différenciée.
- Vidange moteur / courroie de distribution : kilométrage obligatoire. Carrosserie/lavage/accessoire : non demandé. Autres cas selon type.
- Echéance future kilométrique facultative fournie par l'utilisateur ; **pas de calendrier constructeur inventé**.
- Historique maintenance_logs avec code d'intervention, unité kilométrique pour les nouvelles saisies. Les anciennes lignes sans unité restent inconnues.
- Coût des nouvelles interventions exprimé en MAD.

## Architecture RFQ

Tables (migrations Supabase Crankd, déjà appliquées) :
- backend/09_morocco_maintenance_rules.sql
- backend/10_morocco_parts_rfq.sql
- backend/11_private_vin_optional.sql

Part requests : véhicule/moteur, type, famille de pièce, OEM facultatif, état, quantité, ville, notes. Aucun numéro de téléphone ni e-mail de client exposé aux vendeurs.

Part seller specialties : familles de pièces et marques. Matching : vendeur actif + catégorie + marque. Les demandes ne deviennent visibles que dans l’inbox des boutiques correspondantes. **Aucune notification SMS/email/push automatique en V2**.

Part quotes : prix MAD, frais transport éventuels, délai annoncé, état, référence, commentaire, nom public déclaré de la boutique. Un devis par vendeur et demande. L’acheteur peut comparer plusieurs prix et clôturer sa demande. **Aucune acceptation payante ni logistique déclenchée**.

L'objectif d’obtenir des devis dans les 24h est seulement un objectif opérationnel : non garanti tant que réseau marchand et notifications ne sont pas en place.

## QA terrain

1. Toyota Auris diesel 2014 : marque/modèle trouvables, ajout VIN optionnel avec consentement, lisible uniquement au propriétaire, effaçable.
2. Vidange/courroie sans kilométrage refusées ; lavage/carrosserie sans kilométrage accepté ; échéance personnalisée facultative.
3. Client poste une demande Alternateur Toyota Auris, Casablanca ; catégories moteur et marque Toyota ciblées.
4. Boutique A moteur/Toyota, B carrosserie/Renault, C moteur/toutes marques ; A et C voient la demande, B ne la voit pas.
5. A et C font chacun un devis authentique, comparables par client ; 2e devis identique par même vendeur bloqué.
6. Clôture : propriétaire conserve historique, boutique ne reçoit plus la demande dans les ouvertes.
7. Pannes JWT et tests RLS sur comptes distincts, Safari/Android, mobile 375px, aucun paiement, aucun faux devis.

## Équipe et tickets

- Data auto / VIN Maroc et imports sous licence : #27, #31.
- Maintenance mécanique / revue des 36 règles / rappels légitimes : #32.
- Commercial/Seller Ops + notifications/mesure de 2 devis en 24h : #33, #29.
- Validation QA mobile et profils authentifiés : #26.
- Sécurité Supabase et comptes : #34.
- PSP, Cathedis et transaction réelle : #28.

KPIs à instrumenter : demandes créées, vendeurs éligibles, temps 1er devis, temps 2e devis, % demandes avec ≥2 devis, satisfaction, conversion. Aucun indicateur chiffré sans événements réels.
