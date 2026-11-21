# VROOQ — Audit produit, conversion et plan d'action 90 jours
Date : 21 novembre 2026. Sources : GitHub indepadib/Crankd, Supabase Crankd et pages officielles des partenaires. Les conclusions venant de tests utilisateur, des prestataires ou de la rentabilité restent des hypothèses à vérifier.

## Baseline vérifiée
- 2 utilisateurs, 2 profils, 3 véhicules, 4 posts, 1 annonce voiture, 1 annonce pièce active, 0 comptes vendeurs, 0 commandes de pièces, 6 communautés.
- Le site n'a donc pas encore prouvé l'acquisition ou la transaction. Ne pas publier de chiffres fictifs. Une annonce de pièce existe sans compte vendeur activé ; son auteur doit créer une boutique pour accepter une nouvelle commande selon le RPC v2.

## Positionnement
Promesse lancement Maroc : « Trouve une pièce réellement disponible pour ta voiture, chez un vendeur identifiable, sans quitter VROOQ pour la commander. »
La communauté et le garage numérique sont les leviers de rétention, pas une raison de multiplier les choix dès le premier écran. Démarrer Casablanca/Mohammedia/Rabat, puis élargir.
Concurrents documentés : Automa, Parts24, Piecify et sites généralistes. Differenciation : référence OEM, compatibilité véhicule, vendeur vérifié, checkout sécurisé, vrai suivi.

## Audit par parcours
1. Visiteur : homepage riche mais narratif international anglophone, inventaire visuel et anciens chiffres/témoignages non vérifiés. Corriger avec trois CTA « Trouver », « Vendre », « Découvrir », supprimer fausse preuve sociale.
2. Inscription : ancienne redirection Feed même sans session confirmée ; lien « Forgot? » inerte. Porter récupération e-mail/reset et rediriger selon session réelle Supabase.
3. Première session : aucune orientation par objectif. Ajouter guide contextuel avec 3 chemins, progression courte, réouverture d'aide, possibilité d'ignorer.
4. Achat : catalogue et filtres en place mais compatibilité déclarative, pas de vérification OEM/VIN. Éviter de promettre une garantie de compatibilité non construite. Frais transport inconnus, réservations non payées.
5. Vente : 0 vendeur au 21/11 malgré une annonce pièce ; seller onboarding présent, compte gratuit, vérification à traiter. La demande doit dépendre de la disponibilité et de la conformité.
6. Communauté : Garage, Feed, Clubs, Convoys riches mais mélange FR/EN, grandes pages (>160k caractères pour garage) et données locales/mock encore à auditer. Séparer « découverte » et « transaction ».
7. Confiance : défauts, retours, vol de pièces, airbags/éléments sécurité, modération, suspension, KYC/KYB, remboursements et réclamations doivent avoir des politiques explicites.

## Cathedis : ce qui est prouvé et ce qui ne l'est pas
Dans GitHub privé indepadib/jotya, CathedisService.ts simule encore : génération aléatoire de CTH, suivi fictif et devis à tarifs codés en dur. CarrierFactory force Cathedis ; le code de labels ne produit pas de vrai BL. NE PAS réutiliser cela tel quel.
Le dépôt contient Docs API Cathedis v5 1.pdf mais le connecteur GitHub retourne un contenu binaire illisible. Revue complète de ce PDF non effectuée.
Les opérations à implémenter en contractuel : URL officielle, authentification, cities, devis réel, création de livraison en prépayé (pas COD), bon de livraison, pickup, tracking, statuts, retour et réconciliation.
Interdire les faux numéros, facturer uniquement sur devis prestataire, bloquer expédition tant que paiement PSP non confirmé.

## ChariPay et ChariBaaS
ChariPay dispose publiquement de docs de checkout hébergé, sessions, transactions, remboursements et webhooks. ChariBaaS annonce une offre distincte multi-vendeurs : split, KYC/KYB, comptes de paiement vendeurs et payouts.
Le devis commercial doit confirmer l'éligibilité de VROOQ et le protocole exact. FAQ publique : sandbox gratuit, activation annoncée à 6 000 MAD TTC et commission à négocier.
Aucune donnée carte dans VROOQ. Paiement établi uniquement après webhook authentifié + rapprochement, jamais sur redirection client. Remboursement et litiges indispensables avant collection réelle.
Sources : https://www.baas.ma/en/marketplace-payment-morocco ; https://www.baas.ma/fr/faq ; https://charipay.ma/fr/api-docs

## Funnel analytique
- Acquisition : landing_visit → CTA_cliqué → inscription_démarrée → compte_confirmé.
- Acheteur : guide_achat → recherche → fiche_vérifiée → demande → devis → session_paiement → paiement_vérifié → livraison_confirmée.
- Vendeur : contacté → réponse → boutique_ouverte → contrôle_conformité → première_annonce → trois_annonces → première_vente_payée.
- Social : véhicule_ajouté → premier_post → retour_semaine_4.
Ne jamais envoyer e-mail, VIN, CIN ou adresse postale dans analytics. Les métriques proviennent d'événements consentis, et jamais de chiffre déclaré sans source. La vente = paiement authentifié ET livraison confirmée, non demande.

## J0–J7 : corriger le tunnel (P0)
Responsables : UX/Product, Engineering, Trust.
Fusion du guide première session, correction signup/reset, homepage honnête. Tests mobiles iPhone/Android (320/375/390 px), clavier, accessibilité, 5 tests utilisateurs non assistés. Chaque testeur doit trouver comment acheter ou vendre une pièce sans instruction orale.
Indicateurs : taux d'inscription→première action, temps jusqu'à la première recherche ou annonce, erreurs par parcours.
Livrable : aucune navigation en cul-de-sac ni affirmation factice.

## J8–J21 : offre et mesure (P1)
Responsables : Sales, Growth, Data.
20 vendeurs qualifiés cible, 100 pièces réelles visées, onboarding 1:1 avec garages/démolisseurs/spécialistes, catalogue OEM et photos. CRM prospects avec statuts identifié→contacté→réponse→démo→inscrit→première annonce.
Priorité contenu pédagogique organique FR/Darija, moteurs de recherche, Google Search Console, UTM et publications approuvées sur groupes auto. Pas de spam/automation abusive.
Indicateurs : vendeurs actifs, pièces réelles, recherches sans résultats, taux de publication finalisé, rétention.

## J22–J45 : paiement et transport (P1)
Responsables : Payments/Trust, Logistics, Engineering.
Dossier commercial ChariPay+ChariBaaS, validation sandbox (3DS, webhooks, splits, KYC, remboursements); contrat API Cathedis (devis, création étiquette, suivi, retour, expédition assurée) et fallback Amana manuel. Prix total item+livraison validé AVANT capture. Tester doublons, rupture de stock, non-livraison, retour, refus, contestation, chargeback.
Ne jamais activer du paiement réel avant validations PSP/règles et support.

## J46–J90 : conversion et ville 2 (P2)
Responsables : Growth, Sales, Product.
Lancer vagues vendeurs à Casablanca/Mohammedia/Rabat, ambassadeurs auto, SEO pages référencées sur annonces réelles (référence OEM/constructeur/modèle), vidéos courtes et partenariats garages.
Cibles expérimentales J+90 : 100 vendeurs actifs, 1000 annonces réelles, paiement/livraison réels seulement après test, 25% des nouveaux inscrits ajoutent un véhicule, retour semaine 4 mesuré. Ce sont des objectifs internes, pas des prévisions financières.

## Critères d'expansion internationale
Au moins 3 mois de livraison payée réelle, incidentologie maîtrisée, contribution unitaire non négative, fournisseur de paiement/transport légalement compatible avec chaque pays.
Préparer code adaptateurs PSP/logistique et modèle multi-devise, unités, langues FR/AR/EN, politiques locales sur pièces reconditionnées/interdites, identification vendeur par pays. Ne pas basculer mondial avant preuve du Maroc.

## Livrables et risques à traiter avant lancement
- Event tracking, SEO, consentement données, CGV/CGU, fiscalité/commission, droit de rétractation/retours, assistance humaine, protection contre pièces volées/dangereuses.
- RLS Supabase, droits clients, vérification vendeur et webhooks paiement. Pas de virement direct sur le compte de la plateforme.
- Cathedis PDF v5 à examiner depuis une copie lisible ou accès contractuel ; ne pas affirmer une API intégrée tant qu'aucun BL et vrai suivi vérifiés ne fonctionnent.

## Frameworks & skills utilisés pour structurer ce travail
Apple-design : emilkowalski/skills (feedback, accessibilité, animations sobres).
Grill-me/grilling : mattpocock/skills (challenger les décisions et leurs dépendances).
Humanizer : blader/humanizer (copie concrète, pas de fausse emphase).
Video-agent-skills : Melvynx/video-agent-skills (scripts courtes vidéos, publication seulement avec compte connecté).
Marketingskills : coreyhaines31/marketingskills (CRO, SEO, acquisition, AARRR).
Références et licences à vérifier par skill avant tout copier/coller ; aucune installation sur serveur n'est impliquée par cette documentation.
