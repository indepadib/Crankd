# VROOQ — correctifs fiabilité / mobile, 21 novembre 2026

## Problèmes confirmés dans le code
1. `useFeed.ts` injectait 3 faux posts locaux avec milliers de likes/vues. Les vrais posts Supabase étaient mélangés à des données uniquement locales, trompant le visiteur.
2. `create/page.tsx` enregistrait post, annonce voiture et événement seulement dans le navigateur si l'insertion échouait, puis affichait le feed ou la marketplace comme si la publication avait réussi.
3. `marketplace/page.tsx` mélangeait les annonces voiture de production à des faux brouillons locaux, avec photo de remplacement d'un véhicule sans rapport.
4. Sur mobile le bouton `+` ouvre un long formulaire à sélectionner. Désormais le menu propose clairement 5 actions et dirige vers l'étape demandée.
5. Une annonce de pièce pouvait montrer un formulaire de commande complet alors que le vendeur n'avait pas de compte boutique actif ; le RPC refusait seulement après saisie des coordonnées.

## Changements effectués
- `web/hooks/useFeed.ts` : feed Supabase réel uniquement, erreur affichable, compteur limité aux anciens brouillons restés sur l'appareil (jamais présentés comme publiés).
- `web/components/Feed.tsx` : suppression du tuner décoratif sans fonctionnalité, avis sur anciens brouillons, état vide utile.
- `web/app/(app)/create/page.tsx` : aucune redirection après échec SQL ; erreur affichée sans perte du formulaire, choix direct via paramètre `?type=`.
- `web/app/(app)/marketplace/page.tsx` : seulement annonces voiture réellement présentes en base, erreurs et anciens brouillons signalés, bouton « Effacer » réellement fonctionnel.
- `web/components/QuickCreateMenu.tsx` + Dock : menu mobile explicite et accessible.
- `backend/05_seller_checkout_preflight.sql` + fiche pièce : fonction SQL booléenne très limitée, test réel du statut vendeur avant présentation du formulaire, aucune donnée vendeur privée exposée.

## Vérifications et contraintes
Migration 05 appliquée en Supabase Crankd `fmvlrvigmptprtwpoanc` ; résultats SQL succès. Aucun paiement, livraison automatique ou faux statut créé.
Le code est travaillé sur branche isolée avant fusion et tests GitHub CI/Netlify.
Les anciens posts et annonces en localStorage ne sont pas supprimés automatiquement, puisqu'il peut s'agir de contenu utilisateur non synchronisé. Ils ne sont désormais plus montrés aux autres comme publics. Une future fonctionnalité d'export/republication peut être envisagée.
La page Garage contient encore des indicateurs de santé/fiabilité simulés et d'autres activités locales. Éviter de faire croire que ce sont des diagnostics ou certifications. Créer ticket d'audit séparé.
Les parcours de commentaires, likes et événements restent à refondre avec persistance réelle et contrôle des erreurs. Ne pas présenter cela comme déjà corrigé.
Les tests de bout en bout nécessitent un appareil réel et deux comptes utilisateurs, à réaliser après build/preview.

## Règles de release
- Types et build Next.js validés.
- CI lint focalisé sur les nouveaux composants.
- Vérifier le site mobile en preview avant merge ; ne pas fusionner si build échoue.
- Aucun paiement ChariPay ni transport Cathedis réels activés.