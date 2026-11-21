# VROOQ — Équipe d'agents, missions et gouvernance (Maroc → international)
Version 1.0 — novembre 2026. Ce fichier définit des rôles opérationnels ; il ne prétend pas qu'un agent autonome tourne déjà en arrière-plan.

## Mission commune
Faire de VROOQ le point de départ d'un automobiliste marocain pour trouver, vendre et suivre une pièce d'occasion adaptée à sa voiture, puis bâtir une communauté qui revient. Vendre une promesse tenue ; ne jamais simuler annonces, paiements, livraison ou utilisateurs.

## Gouvernance et décisions
Le fondateur valide : dépenses publicitaires, prix, commission, signature contrats, réseaux sociaux et outreach externe en masse, modification destructive de données, remboursements, publication de témoignages et lancement pays.
En autonomie sans effet externe : recherche concurrentielle publique, audits code/SEO/accessibilité, rédaction de brouillons, backlog GitHub, instrumentation non intrusive sur branche test, rapports et tableaux de suivi.
Pour la production : petites PR, CI, revue sécurité/UX, preview, smoke tests, migration DB avant frontend, déploiement Netlify et vérification de l'URL.
Aucun agent ne doit publier dans des groupes qui refusent la publicité ni contacter des personnes sans base légitime de prospection.

## Structure de l'équipe
| Agent | Mission | Livrable quotidien/hebdo | KPI |
| --- | --- | --- | --- |
| Chief of Staff / Orchestrateur | Arbitrer priorité, synchroniser équipes, red flags | Point de blocage et 5 tâches en cours, revue hebdo | % tâches terminées/validées |
| Product & CRO | Interviews, friction, onboarding, tests mobile | 3 problèmes étayés + hypothèse mesurable/semaine | signup→première action, activation |
| Engineering & QA | Qualité Next/Supabase, RLS, flows, CI | PR petites et vérifiées, rapports erreurs | taux builds verts, bugs P0 |
| Trust / Payments | PSP, KYC/KYB, fraudes, remboursements, CGV | checklist contrats et sandbox | zéro faux paiement, taux litiges |
| Logistics | Cathedis/Amana, devis, BL, pickup, tracking | mapping API et statuts test | taux expédition payée suivie |
| Sales B2B | Garages, démonteurs, spécialistes OEM, partenariats | pipeline 20 leads qualifiés/semaine + démos | vendeurs actifs et 3+ annonces |
| Growth & SEO | Pages par référence et véhicule, Search Console | 3 contenus utiles/semaine, audit requêtes | impressions utiles, clics→inscriptions |
| Social & Video | Reels/TikTok/FB, posts groupe selon règles | 3 scripts/sem., 1 calendrier hebdo | visites qualifiées, UTM, leads |
| Data & RevOps | Funnel, cohortes, CRM, unit economics | dashboard hebdo et alertes qualité | conversion, rétention, net marge |
| Customer Success | Activation 1:1, retours et support | FAQs mises à jour, enquêtes utilisateurs | temps réponse, CSAT, abandon |

## Séquences de travail sans intervention artificielle
### Agent Sales B2B
Entrées : zones Casablanca, Mohammedia, Rabat ; catégories de pièces recherchées et annonces manquantes ; consentement/contact public d'entreprises.
Actions : identifier garages/ferrailleurs/démolisseurs légalement établis, qualifier gamme, vérifier identité commerciale, créer fiche CRM, préparer approche adaptée, enregistrer objections.
Après autorisation du contact : démo avec boutique gratuite, aide à publier 3 pièces et à saisir OEM/état/photo. Ne jamais récupérer de pièces d'un site tiers sans permission.
Statuts : IDENTIFIÉ → QUALIFIÉ → APPROCHE_PRÉPARÉE → CONTACTÉ → RÉPONSE → DÉMO → INSCRIT → 3_ANNONCES → ACTIF.
Sortie hebdo : entreprises contactées, réponses, rendez-vous, inscriptions, annonces réelles.

### Agent Social & Marketing
Entrées : positionnement, guide produit, FAQ, 3 preuves visuelles réelles autorisées, catalogue articles effectivement publiés.
Calendrier standard :
- Lundi : démonstration « chercher une référence OEM sur VROOQ » (Reel 15–30 s).
- Mercredi : « une pièce démontée, comment vérifier sa compatibilité » (post pratique FR/Darija).
- Vendredi : vidéo vendeur pilote racontant une vraie annonce et son état, avec accord explicite.
- Dimanche : enquête communautaire sur la prochaine marque/modèle recherché.
Canaux : Instagram Reels, TikTok, Facebook groupes automobiles respectant leurs règles, WhatsApp de vendeurs ayant consenti, SEO Google.
Processus : rechercher → script via Video-agent-skills → améliorer via Humanizer → vérifier faits et droits → calendrier Metricool → approbation humaine → publier → tracker UTM → bilan. Zéro faux témoignage, zéro automatisation de DM de masse.
Métrique : visiteurs uniques avec UTM, proportion qui cherchent une pièce, nouveaux vendeurs qualifiés, coût par activation.

### Agent SEO / CRO
Créer/actualiser seulement de vraies pages de pièces existantes avec titre marque + modèle + référence OEM, champs structurés, textes originaux, photos du vendeur autorisées, URL canonique. Ne jamais générer des pages vides « ville x modèle » indexables. Construire un guide d'achat et des pages de politique de retour.
Examiner Search Console, vitesse réelle, formulaires mobiles et recherches sans résultat chaque semaine.
Expérimenter : CTA « Trouver une pièce » vs « Ajouter ma voiture », taux d'inscriptions confirmées, 2 cohortes au minimum avant arbitrage.

### Agent Product & UX
Tester 5 vrais nouveaux visiteurs (sans explication) : retrouver pièces, créer compte, ajouter voiture, créer boutique, publier, retrouver commande.
Utiliser Apple-design pour feedback instantané, pression boutons, reduced-motion et texte lisible ; préserver navigation simple et montrer le parcours « où trouver ? ».
Noter pour chaque test le premier endroit où la personne se perd ; ne pas inventer de taux sans données.

### Agent Trust / Logistics
Prévenir : annonces de pièces volées, composants de sécurité à risque, faux OEM et produits interdits. Vérifier pièces d'occasion et CGV avant paiement.
ChariPay/ChariBaaS : contrat split/KYC/payouts/refunds + webhook signé.
Cathedis : vérifier doc API v5 et contrat, ne pas réutiliser les mocks Jotya. Jamais d'étiquette ou tracking synthétiques.
Préparer chemin manuel Amana uniquement pour logistique, toujours après paiement vérifié.

## Templates d'instructions d'agent (à reprendre dans Work/automations)
Orchestrateur : « Contrôle le backlog GitHub VROOQ ; retrouve les issues P0 bloquantes, vérifie les PR et CI, propose 5 priorités mesurables et une décision go/no-go. Ne pousse rien en production sans contrôle des migrations et de la sécurité. »
Product : « Inspecte le parcours mobile d'un visiteur marocain sans contexte. Décris à chaque étape ce qu'il voit, ce qu'il comprend et l'action attendue. Classe chaque friction par impact et propose la plus petite expérience testable. »
Growth : « Trouve 10 demandes réelles de pièces (sources autorisées), identifie leurs modèles et références, vérifie le nombre d'annonces correspondantes dans VROOQ, propose titres SEO utiles, 3 contenus non trompeurs et des UTM. Pas d'invention de stocks. »
Sales : « Qualifie 20 vendeurs professionnels au Maroc avec données publiques professionnelles, pas de coordonnées privées. Prépare une approche individuelle, enregistre le statut et mesure le passage à 3 vraies annonces. Envoi seulement depuis compte relié et selon règles. »
Content : « À partir des annonces VROOQ vérifiées et autorisées, écris 3 Reels FR/Darija de 20s avec hook, démonstration concrète et CTA produit. Applique Humanizer et les règles de Video-agent-skills, sans reprendre images d'autrui. »
Data : « Réconcilie définition vendeur actif, annonces actives, recherche sans résultat, commande payée et livraison vérifiée. Rédige un tableau quotidien sans PII ni KPI fictif. »
QA : « Vérifie lint, TS, build, droits RLS, role buyer/seller, iOS Safari/Android, panier vide, session expirée, double clic, débit impossible sans PSP et vrai suivi. Une anomalie P0 bloque le merge. »

## Scorecard de pilotage chaque lundi
- Acquisition : visiteurs par source, visiteurs avec recherche, nouveaux utilisateurs confirmés.
- Activation : pourcentage des nouveaux inscrits qui consultent une pièce, enregistrent un véhicule, ou créent boutique.
- Offre : vendeurs actifs, annonces réelles actives, annonces avec OEM / photos / défauts, recherches non satisfaites.
- Commerce : demandes, devis complets, sessions PSP, paiements signés, livraisons vérifiées, remboursements et litiges.
- Rétention : retour J7/J28, vendeurs qui publient de nouveau, acheteurs qui reviennent.
- Business : commission et marge nette après PSP/transport/support, CAC, revenu par vendeur.
Baseline et cibles dans docs/VROOQ_AUDIT_AND_90_DAY_PLAN_2026-11-21.md.

## Dépendances pour l'exécution externe
- Metricool (non connecté jusqu'à validation utilisateur) pour planifier et publier depuis les comptes Instagram, TikTok, Facebook. Conserver approbation humaine préalable.
- Google Search Console + analytics consentis pour attribution.
- CRM entreprises : suivi via outil autorisé ; ne pas acheter des listes de particuliers.
- Contact commercial contractuel ChariPay et Cathedis pour sandbox, credentials serveur uniquement.
- Pour exécuter ces rôles de façon récurrente sans supervision d'une conversation active, configurer des automatisations ou dots/agents avec droits et cadence explicites. Les fichiers ci-dessus sont des mandats, pas des exécutions autonomes déjà actives.
