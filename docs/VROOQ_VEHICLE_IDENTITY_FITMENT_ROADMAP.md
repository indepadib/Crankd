# VROOQ — référentiel véhicule, carte grise et compatibilité pièces

## État vérifié au 22/11/2026
- Dans Supabase, `vehicles` contient marque, modèle, année, image et propriétaire. Pas de finition, code moteur, variant, VIN ou plaque.
- Les annonces de pièces déclarent `compatible_make`, `compatible_model`, `compatible_year_from/to`, et éventuellement une référence OEM.
- Le filtre actuel compare marque/modèle/année **déclarés**. Ce n'est pas un système de compatibilité certifié.
- L'identification par VIN prévue côté interface utilise NHTSA vPIC, référentiel public essentiellement américain. Cette passerelle est volontairement **désactivée par défaut** via `ENABLE_EXTERNAL_VIN_LOOKUP`. Elle n'enregistre aucun VIN, n'offre ni preuve de propriété ni correspondance catalogue OEM.
- Aucun accès licencié à TecDoc/TecAlliance, constructeur, NARSA ou registre marocain par immatriculation n'est connecté. Ne rien deviner à partir des plaques.

## Architecture cible à réaliser après contrats et audit CNDP
1. **Création garage V0 (disponible)** : marque, modèle, année confirmés manuellement, suggestions de clubs et recherche d'annonces déclarées compatibles. Ne pas appeler cela « confirmé ».
2. **VIN V1** : après avis juridique et consentement éclairé pour fournisseur externe, contrat TecAlliance ou fournisseur équivalent, quotas et contrôle de couverture Maroc ; recherche via service serveur authentifié, limitation de débit, journaux anonymisés, pas de CIN/plaque/VIN dans analytics. Revue humaine des résultats incertains.
3. **Carte grise V2** : extraction locale ou serveur conforme depuis photo seulement avec consentement et information. Ne conserver ni photo complète, ni nom/adresse du titulaire, ni numéro carte grise si ces champs ne sont pas indispensables. Permettre correction avant enregistrement ; accès utilisateur seul. Concevoir droits d'effacement/rétention.
4. **Immatriculation V3** : seulement si source légitime, base de données autorisée et contrat permettent une recherche d'un véhicule marocain. Une plaque n'est pas automatiquement une clé publique librement exploitable.
5. **Compatibilité pièces** : intégrer catalogue OEM/TecDoc sous licence avec identifiants de véhicule (type, motorisation, période de production, code moteur, options). Stocker des relations `vehicle_variant -> part_reference` avec source, licence, version, intervalle de validité, niveau de confiance. Vérifier la correspondance OEM avant le paiement réel.
6. **État UX** : distinguer `Caractéristiques déclarées`, `Identification fournisseur à confirmer`, `Compatibilité vérifiée avec référence constructeur`. Ne jamais attribuer le dernier sans source.

## Communautés
- Actuellement « JDM Legends », « Euro Outlaws », « Genesis Tribe » et d'autres clubs de thème, pas une communauté par marque.
- Le nouveau formulaire propose des clubs compatibles avec la marque/le modèle ; aucune adhésion silencieuse. Ajouter une proposition de club dédié par marque seulement après création modérée et politique de visibilité.
- L'adhésion peut être publique selon la politique du club : checkbox de consentement explicite.

## Expériences de contrôle
A. Utilisateur ajoute Toyota Auris 2014 → pièce Toyota Auris millésime déclaré affichée avec un avertissement OEM.
B. Même utilisateur essaie une pièce Hyundai → absente du filtre garage mais visible en filtrage général.
C. Utilisateur ajoute Genesis Coupé → proposition Genesis Tribe ; aucune adhésion sans case cochée.
D. Vendeur ne peut pas publier sans boutique ; nom/contact privé du vendeur ne deviennent pas publics.
E. Recherche VIN disabled → message transparent, création manuelle toujours fonctionnelle.
F. Erreur serveur → aucune donnée inventée ; formulaire reste ouvert et réessayable.

## Conditions pour lancement commercial
- Atteindre un catalogue minimum réel avec identifiants OEM saisis par vendeurs et modération.
- Contrat et documentation fournisseur VIN/fitment (couverture Maroc vérifiée par échantillon réel).
- Vérifier conformité CNDP, consentement, autorisations/transferts éventuels, durée de conservation et droit d'effacement.
- Tester au moins 20 combinaisons de véhicules marocains (diesel, essence, années, versions importées) avec référence constructeurs/garages.
- Faire contrôler les pièces sensibles de sécurité avant toute promesse de compatibilité.
