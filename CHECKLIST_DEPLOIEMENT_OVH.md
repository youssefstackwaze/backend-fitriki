# ✅ Checklist de Déploiement OVH

Imprimez ou gardez ce document ouvert pendant le déploiement.

---

## 📋 AVANT DE COMMENCER

### Prérequis
- [ ] J'ai un serveur VPS OVH avec Ubuntu
- [ ] J'ai l'adresse IP du serveur : `__________________`
- [ ] J'ai les identifiants SSH
- [ ] J'ai un compte MongoDB Atlas configuré
- [ ] J'ai un compte Cloudinary configuré
- [ ] J'ai préparé mon fichier `.env` avec toutes les variables

### Informations à avoir sous la main

```
┌─────────────────────────────────────────────────┐
│  IP du serveur OVH : ________________           │
│  Utilisateur SSH : ubuntu / root                │
│  Mot de passe : ________________                │
│                                                  │
│  MongoDB URI : mongodb+srv://...                │
│  Cloudinary Cloud Name : ________________       │
│  Cloudinary API Key : ________________          │
│  Cloudinary API Secret : ________________       │
│                                                  │
│  Nom de domaine (optionnel) : ____________      │
└─────────────────────────────────────────────────┘
```

---

## 🚀 DÉPLOIEMENT - ÉTAPES

### ⏱️ Temps estimé : 30-45 minutes

---

## ÉTAPE 1 : Connexion et préparation (5 min)

```bash
ssh ubuntu@VOTRE-IP-OVH
```

- [ ] Connexion SSH réussie
- [ ] Je suis connecté au serveur

```bash
sudo apt update
sudo apt upgrade -y
```

- [ ] Système mis à jour

---

## ÉTAPE 2 : Installation de Node.js (5 min)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

- [ ] Node.js v18.x installé
- [ ] npm installé
- [ ] Versions affichées correctement

---

## ÉTAPE 3 : Installation de Git (2 min)

```bash
sudo apt install git -y
git --version
```

- [ ] Git installé

---

## ÉTAPE 4 : Cloner le projet (5 min)

**Option A : Via GitHub**
```bash
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/VOTRE-USERNAME/projet-covoiturage.git
cd projet-covoiturage/backend
```

- [ ] Projet cloné
- [ ] Je suis dans le dossier `backend`

**Option B : Via SCP (depuis votre PC)**
```bash
scp -r C:\Users\youss\OneDrive\Bureau\projet-covoiturage\backend ubuntu@VOTRE-IP:~/apps/
```

---

## ÉTAPE 5 : Configuration .env (5 min)

```bash
cd ~/apps/projet-covoiturage/backend
nano .env
```

- [ ] Fichier `.env` créé
- [ ] `NODE_ENV=production` ✓
- [ ] `PORT=3000` ✓
- [ ] `MONGODB_URI` configuré ✓
- [ ] `JWT_SECRET` changé (différent du dev) ✓
- [ ] `JWT_REFRESH_SECRET` changé ✓
- [ ] `CLOUDINARY_*` configuré ✓
- [ ] `SMTP_*` configuré ✓
- [ ] `FRONTEND_URL` configuré ✓
- [ ] Fichier sauvegardé (Ctrl+X, Y, Entrée)

---

## ÉTAPE 6 : Installation et build (5 min)

```bash
npm install
```

- [ ] Dépendances installées (pas d'erreurs critiques)

```bash
npm run build
```

- [ ] Build réussi
- [ ] Dossier `dist/` créé

```bash
ls -la dist/
```

- [ ] Fichiers compilés présents

---

## ÉTAPE 7 : Installation de PM2 (2 min)

```bash
sudo npm install -g pm2
pm2 --version
```

- [ ] PM2 installé

---

## ÉTAPE 8 : Démarrage avec PM2 (3 min)

```bash
mkdir -p logs
pm2 start dist/server.js --name covoiturage-api
pm2 status
```

- [ ] Application démarrée
- [ ] Statut "online" ✓

```bash
pm2 logs covoiturage-api --lines 20
```

- [ ] Pas d'erreurs dans les logs
- [ ] Message "Serveur démarré sur le port 3000" visible

```bash
curl http://localhost:3000/health
```

- [ ] Réponse JSON reçue
- [ ] `"success": true` visible

---

## ÉTAPE 9 : Configuration PM2 au démarrage (2 min)

```bash
pm2 startup
```

- [ ] Commande exécutée (copier-coller la commande affichée)
- [ ] Commande `sudo env PATH=...` exécutée

```bash
pm2 save
```

- [ ] Configuration sauvegardée

---

## ÉTAPE 10 : Installation de Nginx (3 min)

```bash
sudo apt install nginx -y
sudo systemctl status nginx
```

- [ ] Nginx installé
- [ ] Nginx actif (vert)

---

## ÉTAPE 11 : Configuration Nginx (5 min)

```bash
sudo nano /etc/nginx/sites-available/covoiturage-api
```

**Copier cette configuration :**

```nginx
server {
    listen 80;
    server_name VOTRE-DOMAINE-OU-IP;
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- [ ] Configuration collée
- [ ] `server_name` modifié avec votre domaine/IP
- [ ] Fichier sauvegardé

```bash
sudo ln -s /etc/nginx/sites-available/covoiturage-api /etc/nginx/sites-enabled/
sudo nginx -t
```

- [ ] Test config : "syntax is ok" ✓
- [ ] Test config : "test is successful" ✓

```bash
sudo systemctl restart nginx
```

- [ ] Nginx redémarré sans erreur

---

## ÉTAPE 12 : Configuration du Firewall (3 min)

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
sudo ufw enable
```

**⚠️ IMPORTANT : Autorisez le port 22 (SSH) en PREMIER !**

- [ ] Port 22 autorisé ✓
- [ ] Port 80 autorisé ✓
- [ ] Port 443 autorisé ✓
- [ ] Firewall activé ✓

---

## ÉTAPE 13 : SSL avec Let's Encrypt (5 min)

**⚠️ Seulement si vous avez un nom de domaine**

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.votre-domaine.com
```

- [ ] Certbot installé
- [ ] Email fourni
- [ ] Termes acceptés
- [ ] Redirection HTTPS choisie (option 2)
- [ ] Certificat obtenu ✓

**OU passez à l'étape suivante si vous n'avez pas de domaine**

---

## ÉTAPE 14 : Configuration MongoDB Atlas (2 min)

Sur https://cloud.mongodb.com :

- [ ] IP du serveur OVH ajoutée dans Network Access
- [ ] Connexion testée depuis le serveur

```bash
cd ~/apps/projet-covoiturage/backend
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ OK')).catch(e => console.log('❌', e.message));"
```

- [ ] "✅ OK" affiché

---

## ÉTAPE 15 : Tests finaux (5 min)

### Test 1 : Local
```bash
curl http://localhost:3000/health
```
- [ ] ✅ Répond avec JSON

### Test 2 : Via Nginx (IP)
```bash
curl http://VOTRE-IP-OVH/health
```
- [ ] ✅ Répond avec JSON

### Test 3 : Via domaine (si applicable)
```bash
curl https://api.votre-domaine.com/health
```
- [ ] ✅ Répond avec JSON

### Test 4 : Depuis votre navigateur
Ouvrez : `http://VOTRE-IP-OVH/health`

- [ ] ✅ Page affiche JSON
- [ ] `"success": true`
- [ ] `"environment": "production"`

---

## 🎉 DÉPLOIEMENT TERMINÉ !

### ✅ Vérifications finales

- [ ] API accessible depuis Internet
- [ ] MongoDB connecté
- [ ] PM2 configuré pour redémarrer au boot
- [ ] Nginx configuré comme reverse proxy
- [ ] Firewall activé et configuré
- [ ] SSL configuré (si domaine)
- [ ] Logs accessibles via `pm2 logs`

---

## 📝 INFORMATIONS À NOTER

```
┌─────────────────────────────────────────────────┐
│  URL de l'API :                                  │
│  http://____________________/                    │
│  ou                                              │
│  https://____________________/                   │
│                                                  │
│  Health check :                                  │
│  http://____________________/health              │
│                                                  │
│  Date de déploiement : ___/___/______           │
└─────────────────────────────────────────────────┘
```

---

## 🔄 MISE À JOUR DU FRONTEND

Maintenant, mettez à jour votre app mobile :

1. **Ouvrez** : `covoiturage-app/config/api.ts`

2. **Modifiez** :
```typescript
export const API_URL = 'https://VOTRE-URL/api';
```

3. **Recompilez** l'application mobile

- [ ] URL API mise à jour dans le frontend
- [ ] Application mobile recompilée
- [ ] Tests effectués sur l'app mobile

---

## 📱 TESTS DE L'APPLICATION COMPLÈTE

- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Création de trajet fonctionne
- [ ] Recherche de trajets fonctionne
- [ ] Réservation fonctionne
- [ ] Upload de photo de profil fonctionne
- [ ] Notifications fonctionnent

---

## 🛠️ COMMANDES DE MAINTENANCE

**Sauvegardez ces commandes :**

```bash
# Se connecter
ssh ubuntu@VOTRE-IP

# Voir le statut
pm2 status

# Voir les logs
pm2 logs

# Redémarrer
pm2 restart covoiturage-api

# Mettre à jour le code
cd ~/apps/projet-covoiturage/backend
git pull
npm install
npm run build
pm2 restart covoiturage-api
```

---

## 🆘 EN CAS DE PROBLÈME

### L'API ne répond pas
```bash
pm2 logs covoiturage-api
pm2 restart covoiturage-api
```

### Nginx erreur 502
```bash
sudo systemctl status nginx
pm2 status
sudo tail -f /var/log/nginx/error.log
```

### Erreur MongoDB
```bash
# Vérifier le .env
cat .env | grep MONGODB_URI
# Vérifier MongoDB Atlas (whitelist IP)
```

---

## 📞 RESSOURCES

- Guide complet : `DEPLOYMENT_OVH.md`
- Commandes utiles : `COMMANDES_OVH.md`
- Documentation API : `API.md`
- Script d'aide : `./deploy-ovh.sh`

---

## ✨ FÉLICITATIONS !

Votre backend est maintenant en production sur OVH ! 🎉

**Prochaines étapes :**
- [ ] Configurer un nom de domaine personnalisé (optionnel)
- [ ] Mettre en place un monitoring (PM2 Plus)
- [ ] Configurer des backups automatiques MongoDB
- [ ] Tester la charge et les performances
- [ ] Documenter l'architecture pour votre équipe

---

**Date de déploiement :** ___/___/______

**Déployé par :** ___________________

**Notes :**
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________

