# Coachs Sportifs

Annuaire de coachs sportifs : les coachs créent un profil (photo, vidéo courte,
sport(s) pratiqué(s), réseaux sociaux), un administrateur valide chaque profil,
puis les élèves parcourent l'annuaire par catégorie de sport et contactent le
coach par email ou via la messagerie interne à l'app.

## Stack

- [Next.js](https://nextjs.org) (App Router) — front + back dans une seule app
- [Prisma](https://www.prisma.io) + PostgreSQL — persistance des données
- Fichiers uploadés stockés sur disque (volume Docker), servis comme fichiers statiques
- [Nodemailer](https://nodemailer.com) — notifications par email (optionnel, via SMTP)
- Docker / docker-compose — déploiement

## Développement local

Prérequis : Node.js 22+, Docker.

```bash
npm install
cp .env.example .env
docker compose up -d db
npx prisma migrate dev
npm run dev
```

L'app est disponible sur http://localhost:3000 (ou le port passé à `next dev`).

### Modèle de données

Le schéma Prisma est dans [prisma/schema.prisma](prisma/schema.prisma). Après toute modification :

```bash
npx prisma migrate dev --name <description>
```

Les catégories de sport sont une liste fixe (enum `Sport`) définie dans le
schéma et dans [src/lib/sports.ts](src/lib/sports.ts) (labels, icônes,
couleurs). Pour ajouter un sport, ajoutez une valeur à l'enum `Sport`, son
libellé/icône/couleur dans ce fichier, une icône SVG dans `public/sports/`,
puis lancez une migration.

### Photos et vidéos de profil

- Photo : jpg/png/webp, 5 Mo max.
- Vidéo de présentation : mp4/webm, 20 Mo max, et une limite de 30 secondes
  vérifiée côté navigateur avant l'envoi (pas de vérification exacte de la
  durée côté serveur, pour éviter une dépendance à ffmpeg — la limite de
  taille de fichier reste le vrai garde-fou contre l'explosion du stockage).
- Stockées dans `public/uploads/coaches/<id>/` (volume Docker en production).

### Catégorie "Autre"

"Autre" n'est pas une vraie catégorie parcourable (elle n'apparaît jamais dans
la grille de l'accueil ni sur `/sports/AUTRE`) : c'est le mécanisme par lequel
un coach propose un nouveau sport en tapant librement son nom (ex: Escrime).
Ce nom est modifiable par l'administrateur au moment où il valide le profil,
puis affiché tel quel à la place de "Autre" une fois approuvé.

### Photos de catégories

Par défaut, chaque catégorie affiche une icône colorée sur les cartes de
l'accueil. Un administrateur peut uploader une vraie photo par sport depuis
`/admin` (section "Photos des catégories") ; elle est alors utilisée à la
place de l'icône. Stockées dans `public/uploads/categories/` (même volume
Docker que les photos de coach, donc persistant).

### Modération

Chaque nouveau profil est créé avec le statut `PENDING` et n'apparaît pas dans
l'annuaire public tant qu'un administrateur ne l'a pas validé sur `/admin`.

### Comptes et messagerie interne

Un seul point d'entrée pour tout le monde : `/compte/login` (connexion) et
`/compte/inscription` (qui demande d'abord "coach ou élève ?", puis renvoie
vers `/proposer` pour un coach, ou un formulaire simple pour un élève). Une
fois connecté — coach ou élève, chacun avec email + mot de passe — l'espace
unique `/compte` affiche automatiquement le bon contenu : infos du profil et
messages reçus pour un coach, informations et conversations pour un élève. Un
lien "Voir les catégories" y ramène vers l'annuaire.

Un élève doit être connecté pour envoyer un message à un coach depuis sa page
publique (sinon on lui propose de se connecter/s'inscrire, avec retour
automatique sur la page du coach ensuite). Un visiteur non connecté peut
toujours consulter librement l'annuaire et les profils. La conversation
(`/compte/conversations/<id>`) est ensuite consultable par les deux parties
depuis leur espace respectif — la page s'adapte selon qui la consulte.
Un coach crée toujours son compte via `/proposer` (la création de compte va de
pair avec la création du profil), et est automatiquement connecté ensuite.

**Mot de passe** : 12 caractères minimum avec majuscules, minuscules, chiffres
et caractères spéciaux (recommandation CNIL/RGPD pour un mot de passe utilisé
seul), appliqué aux comptes coach et élève. Hachage scrypt + sel aléatoire,
jamais stocké en clair.

**Téléphone** : le numéro du coach n'est jamais public. Il n'est révélé à un
élève, dans le fil de sa conversation, qu'après que le coach lui a répondu au
moins une fois.

**Notifications par email** : optionnelles (voir SMTP ci-dessous), avec deux
niveaux de contrôle cumulatifs — un interrupteur global par utilisateur
(espace coach / espace élève) et un interrupteur par conversation (visible
dans le fil). Un email n'est envoyé que si les deux sont activés. Un email est
aussi envoyé au coach quand l'administrateur approuve son profil.

### Emails (SMTP, optionnel)

Sans configuration, l'envoi d'email est simplement désactivé (aucune erreur,
l'app fonctionne normalement). Pour l'activer, renseignez dans `.env` :

```bash
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"   # "true" si le port utilise TLS implicite (souvent 465)
SMTP_USER="..."
SMTP_PASS="..."
SMTP_FROM="Coachs Sportifs <no-reply@votredomaine.fr>"
```

Vous pouvez pointer `SMTP_HOST` vers n'importe quel serveur SMTP joignable
depuis le conteneur `app` — y compris un conteneur d'envoi d'email que vous
ajoutez vous-même à `docker-compose.yml` (ex: Postfix, Mailu...) sur le même
réseau Docker, en utilisant son nom de service comme `SMTP_HOST`.

## Administration

Rendez-vous sur `/admin` et connectez-vous avec le mot de passe défini dans
`ADMIN_PASSWORD` (variable d'environnement, voir `.env.example`). Depuis cet
espace : approuver/rejeter les profils en attente (et corriger le nom d'un
sport "Autre" au passage), et uploader une photo par catégorie.

Il n'y a pas de compte utilisateur admin : un seul mot de passe partagé
protège tout l'espace via un cookie de session. Changez `ADMIN_PASSWORD` avant
tout déploiement public.

## Déploiement sur un VPS avec Docker

1. Cloner le repo sur le VPS et s'y placer.
2. Copier `.env.example` en `.env` et changer :
   - `ADMIN_PASSWORD` (mot de passe admin)
   - `AUTH_SECRET` (secret de signature des sessions coach/élève — une longue
     chaîne aléatoire, ex: `openssl rand -hex 32`)
   - les identifiants Postgres (`POSTGRES_USER`/`POSTGRES_PASSWORD` dans
     `docker-compose.yml`, et l'URL correspondante dans `.env`)
   - éventuellement les variables `SMTP_*` (voir ci-dessus)
3. Lancer :

```bash
docker compose up -d --build
```

Cette commande construit l'image de l'app, démarre Postgres, applique
automatiquement les migrations (service `migrate`), puis démarre l'app sur le
port `3001` (modifiable dans `docker-compose.yml`). Les fichiers uploadés
(photos/vidéos de coach, photos de catégories) sont conservés dans le volume
Docker `uploads-data`, qui survit aux redéploiements.

4. Mettre un reverse proxy (Nginx, Caddy, Traefik...) devant le port `3001`
   pour exposer l'app en HTTPS sur votre domaine.
5. Une fois le HTTPS en place, ajoutez `COOKIE_SECURE=true` dans `.env` et
   relancez `docker compose up -d --build` pour durcir les cookies de session
   admin/coach/élève (sinon ils fonctionnent aussi en HTTP simple, pratique
   pour tester avant d'avoir configuré le HTTPS).

### Mettre à jour le déploiement

```bash
git pull
docker compose up -d --build
```

Les migrations Prisma en attente sont rejouées automatiquement à chaque
démarrage via le service `migrate`.

## Notes de sécurité

- Le port Postgres n'est exposé que sur `127.0.0.1` (voir `docker-compose.yml`) :
  la base n'est jamais accessible depuis l'extérieur du VPS.
- Changez les identifiants Postgres par défaut (`coaching`/`coaching`),
  `ADMIN_PASSWORD` et `AUTH_SECRET` avant tout déploiement en production.
- Les mots de passe (coach et élève) sont hachés (scrypt + sel aléatoire),
  jamais stockés en clair.
- Le téléphone d'un coach n'est jamais exposé publiquement, seulement dans une
  conversation à laquelle il a déjà répondu.
- Activez `COOKIE_SECURE=true` dès que le HTTPS est en place devant l'app.
