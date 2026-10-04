# 🚀 Guide de Déploiement - Vue d'ensemble

Ce dossier contient tout ce dont vous avez besoin pour déployer votre backend Covoiturage sur différentes plateformes.

## 📚 Documentation disponible

### 1. 🏢 **DEPLOYMENT_OVH.md** ⭐ RECOMMANDÉ POUR VOUS
Guide complet et détaillé pour déployer sur un **serveur VPS OVH**.

**Contenu :**
- ✅ Installation pas à pas de Node.js, PM2, Nginx
- ✅ Configuration SSL avec Let's Encrypt
- ✅ Sécurisation du serveur (Firewall)
- ✅ Scripts de maintenance et mise à jour
- ✅ Dépannage et résolution de problèmes

**Quand l'utiliser :** Si vous avez un serveur VPS chez OVH (ou autre hébergeur VPS)

📖 [Ouvrir DEPLOYMENT_OVH.md](./DEPLOYMENT_OVH.md)

---

### 2. ⚡ **RESUME_DEPLOYMENT_OVH.md**
Version **ultra-rapide** du guide OVH pour les développeurs expérimentés.

**Contenu :**
- ⚡ Commandes essentielles uniquement
- ⚡ Configuration minimale
- ⚡ Pas d'explications détaillées

**Quand l'utiliser :** Si vous connaissez déjà Linux et voulez juste un aide-mémoire

📖 [Ouvrir RESUME_DEPLOYMENT_OVH.md](./RESUME_DEPLOYMENT_OVH.md)

---

### 3. 📄 **DEPLOYMENT.md**
Guide de déploiement général couvrant **plusieurs plateformes**.

**Contenu :**
- 🌐 Render (gratuit, facile)
- 🚂 Railway (moderne)
- 🟣 Heroku (classique)
- 💻 VPS générique (DigitalOcean, AWS EC2, OVH...)
- 🍃 Configuration MongoDB Atlas

**Quand l'utiliser :** Si vous hésitez entre plusieurs plateformes ou voulez une vue d'ensemble

📖 [Ouvrir DEPLOYMENT.md](./DEPLOYMENT.md)

---

### 4. 🐳 **DOCKER_GUIDE.md** et autres fichiers Docker
Guide pour déployer avec Docker et Docker Compose.

**Fichiers Docker disponibles :**
- `Dockerfile` - Image Docker de l'API
- `docker-compose.yml` - Orchestration complète (API + MongoDB)
- `DOCKER_GUIDE.md` - Guide d'utilisation
- `DOCKER_DEPLOY.md` - Déploiement Docker en production

**Quand l'utiliser :** Si vous préférez Docker ou avez une infrastructure conteneurisée

📖 [Ouvrir DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

---

## 🛠️ Outils et scripts

### **deploy-ovh.sh** ⭐
Script interactif pour gérer votre déploiement OVH.

**Fonctionnalités :**
- 📥 Premier déploiement automatique
- 🔄 Mise à jour du code (git pull + rebuild)
- 🔁 Redémarrage de l'application
- 📊 Affichage des logs et du statut
- 🧪 Test de l'API
- 🧹 Nettoyage

**Utilisation :**
```bash
# Sur votre serveur OVH
cd ~/apps/projet-covoiturage/backend
./deploy-ovh.sh
```

---

## 🎯 Quelle option choisir ?

### Option 1️⃣ : VPS OVH (Contrôle total) ⭐ VOTRE CAS
**✅ Avantages :**
- Contrôle total sur le serveur
- Pas de limites de ressources
- Prix fixe, pas de surprises
- Bon pour la production en Algérie/France

**❌ Inconvénients :**
- Nécessite des connaissances Linux
- Configuration manuelle
- Maintenance à gérer

**📖 Guide :** `DEPLOYMENT_OVH.md`

**💰 Prix :** À partir de 3-5€/mois pour un VPS starter

---

### Option 2️⃣ : Render / Railway (Facile et rapide)
**✅ Avantages :**
- Déploiement en quelques clics
- Gestion automatique des mises à jour
- SSL automatique
- Interface web pratique

**❌ Inconvénients :**
- Plan gratuit limité (s'endort après inactivité)
- Peut être lent selon l'emplacement
- Moins de contrôle

**📖 Guide :** `DEPLOYMENT.md` (sections Render/Railway)

**💰 Prix :** Gratuit (limité) ou ~7$/mois

---

### Option 3️⃣ : Docker (Portable et reproductible)
**✅ Avantages :**
- Environnement reproductible
- Facile à migrer
- Idéal pour équipes

**❌ Inconvénients :**
- Courbe d'apprentissage
- Overhead de Docker

**📖 Guide :** `DOCKER_GUIDE.md`

**💰 Prix :** Dépend de l'hébergement

---

## 🚀 Démarrage rapide pour OVH

### 1. Préparez votre serveur OVH
- Commandez un VPS sur ovh.com
- Recevez l'IP et les identifiants SSH

### 2. Suivez le guide
```bash
# Sur votre PC, ouvrez le guide
cat backend/DEPLOYMENT_OVH.md

# Ou la version rapide
cat backend/RESUME_DEPLOYMENT_OVH.md
```

### 3. Connectez-vous et déployez
```bash
ssh ubuntu@votre-ip-ovh
# Suivez ensuite les étapes du guide
```

### 4. Utilisez le script d'aide
```bash
cd ~/apps/projet-covoiturage/backend
./deploy-ovh.sh
```

---

## 📋 Checklist avant déploiement

Avant de déployer, assurez-vous d'avoir :

- [ ] **MongoDB** configuré (MongoDB Atlas recommandé)
- [ ] **Cloudinary** configuré (pour les photos de profil)
- [ ] **Gmail App Password** ou SMTP configuré (pour les emails)
- [ ] **Twilio** configuré (optionnel, pour SMS)
- [ ] Les **secrets JWT** différents de ceux en développement
- [ ] Un **nom de domaine** (optionnel mais recommandé)
- [ ] Le fichier `.env` prêt avec toutes les variables

---

## 🔐 Sécurité importante

⚠️ **IMPORTANT :** Ne commitez JAMAIS le fichier `.env` sur Git !

Le fichier `.gitignore` devrait contenir :
```
.env
.env.local
.env.production
```

---

## 🆘 Besoin d'aide ?

### En cas de problème sur OVH :

1. **Consultez la section Dépannage** dans `DEPLOYMENT_OVH.md`

2. **Vérifiez les logs :**
   ```bash
   pm2 logs covoiturage-api
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Testez localement d'abord :**
   ```bash
   curl http://localhost:3000/health
   ```

4. **Vérifiez que les services tournent :**
   ```bash
   pm2 status
   sudo systemctl status nginx
   ```

---

## 📚 Autres documentations utiles

- `API.md` - Documentation complète de l'API
- `README.md` - Documentation générale du backend
- `QUICKSTART.md` - Démarrage rapide en développement
- `EMAIL_CONFIG.md` - Configuration email détaillée
- `CONFIGURATION_CLOUDINARY.md` - Configuration Cloudinary

---

## 🎉 Après le déploiement

Une fois votre backend déployé :

### 1. Notez votre URL API
```
https://api.votre-domaine.com
# ou
http://votre-ip-ovh
```

### 2. Mettez à jour l'app mobile
Dans `covoiturage-app/config/api.ts` :
```typescript
export const API_URL = 'https://api.votre-domaine.com/api';
```

### 3. Testez toutes les fonctionnalités
- ✅ Inscription / Connexion
- ✅ Création de trajet
- ✅ Réservation
- ✅ Upload photo de profil
- ✅ Notifications

### 4. Configurez le monitoring
```bash
pm2 install pm2-logrotate  # Rotation des logs
pm2 set pm2-logrotate:max_size 10M
```

---

## 🔄 Mises à jour régulières

Pour mettre à jour votre code après des modifications :

**Méthode 1 : Avec le script**
```bash
./deploy-ovh.sh
# Choisissez option 2 : Mettre à jour le code
```

**Méthode 2 : Manuellement**
```bash
git pull origin main
npm install
npm run build
pm2 restart covoiturage-api
```

---

## 📞 Support

Pour toute question sur le déploiement :

1. Lisez d'abord le guide approprié (DEPLOYMENT_OVH.md pour OVH)
2. Vérifiez la section dépannage
3. Consultez les logs d'erreur
4. Testez en local d'abord

---

**Bon déploiement ! 🚀**

N'oubliez pas : commencez par `DEPLOYMENT_OVH.md` si vous déployez sur OVH !

