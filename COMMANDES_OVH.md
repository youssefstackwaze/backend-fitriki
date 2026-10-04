# 🔧 Commandes OVH - Aide-mémoire

Guide rapide des commandes les plus utiles pour gérer votre backend sur OVH.

---

## 🔐 Connexion SSH

```bash
# Se connecter au serveur
ssh ubuntu@votre-ip-ovh

# Se connecter en root
ssh root@votre-ip-ovh

# Se connecter avec une clé SSH
ssh -i ~/.ssh/ma-cle ubuntu@votre-ip-ovh

# Copier une clé SSH vers le serveur
ssh-copy-id ubuntu@votre-ip-ovh
```

---

## 📁 Navigation et fichiers

```bash
# Aller dans le dossier du projet
cd ~/apps/projet-covoiturage/backend

# Voir les fichiers
ls -la

# Voir l'espace disque
df -h

# Voir l'utilisation du dossier actuel
du -sh *

# Trouver des fichiers
find . -name "*.log"

# Editer un fichier
nano fichier.txt
# ou
vim fichier.txt
```

---

## 📦 PM2 (Gestion de l'application)

```bash
# Démarrer l'application
pm2 start dist/server.js --name covoiturage-api

# Avec un fichier de config
pm2 start ecosystem.config.js

# Voir le statut
pm2 status

# Détails complets
pm2 show covoiturage-api

# Voir les logs en temps réel
pm2 logs
pm2 logs covoiturage-api

# Logs des 200 dernières lignes
pm2 logs --lines 200

# Redémarrer
pm2 restart covoiturage-api

# Recharger (zero downtime)
pm2 reload covoiturage-api

# Arrêter
pm2 stop covoiturage-api

# Supprimer de PM2
pm2 delete covoiturage-api

# Monitoring en temps réel
pm2 monit

# Sauvegarder la config PM2
pm2 save

# Démarrage automatique au boot
pm2 startup
pm2 save

# Réinitialiser le démarrage auto
pm2 unstartup

# Voir les infos système
pm2 sysmonit

# Vider les logs
pm2 flush
```

---

## 🔄 Git

```bash
# Cloner un repo
git clone https://github.com/username/repo.git

# Voir les changements
git status

# Voir l'historique
git log --oneline -10

# Sauvegarder les changements locaux
git stash

# Récupérer les dernières modifications
git pull origin main

# Voir la branche actuelle
git branch

# Changer de branche
git checkout nom-branche

# Annuler les modifications locales
git checkout -- .

# Voir les différences
git diff
```

---

## 📦 NPM / Node.js

```bash
# Installer les dépendances
npm install

# Installer une dépendance spécifique
npm install express

# Installer en global
sudo npm install -g pm2

# Voir les packages installés
npm list --depth=0

# Mettre à jour les packages
npm update

# Voir les packages obsolètes
npm outdated

# Nettoyer le cache
npm cache clean --force

# Rebuild
npm run build

# Démarrer en dev
npm run dev

# Démarrer en prod
npm start

# Voir la version de Node
node --version

# Voir la version de npm
npm --version
```

---

## 🌐 Nginx

```bash
# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx

# Recharger la config (sans downtime)
sudo systemctl reload nginx

# Voir le statut
sudo systemctl status nginx

# Arrêter Nginx
sudo systemctl stop nginx

# Démarrer Nginx
sudo systemctl start nginx

# Activer au démarrage
sudo systemctl enable nginx

# Voir les logs d'erreur
sudo tail -f /var/log/nginx/error.log

# Voir les logs d'accès
sudo tail -f /var/log/nginx/access.log

# Voir les 100 dernières lignes
sudo tail -n 100 /var/log/nginx/error.log

# Editer la config
sudo nano /etc/nginx/sites-available/covoiturage-api

# Vérifier les sites actifs
ls -la /etc/nginx/sites-enabled/

# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/covoiturage-api /etc/nginx/sites-enabled/

# Supprimer un lien
sudo rm /etc/nginx/sites-enabled/covoiturage-api
```

---

## 🔥 Firewall (UFW)

```bash
# Voir le statut
sudo ufw status

# Statut détaillé
sudo ufw status verbose

# Activer le firewall
sudo ufw enable

# Désactiver le firewall
sudo ufw disable

# Autoriser un port
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22

# Autoriser une IP spécifique
sudo ufw allow from 1.2.3.4

# Bloquer un port
sudo ufw deny 8080

# Supprimer une règle
sudo ufw delete allow 80

# Réinitialiser toutes les règles
sudo ufw reset

# Voir les règles numérotées
sudo ufw status numbered

# Supprimer une règle par numéro
sudo ufw delete 3
```

---

## 🔒 SSL / Certbot

```bash
# Installer un certificat SSL
sudo certbot --nginx -d api.votre-domaine.com

# Renouveler manuellement
sudo certbot renew

# Tester le renouvellement
sudo certbot renew --dry-run

# Voir les certificats
sudo certbot certificates

# Révoquer un certificat
sudo certbot revoke --cert-path /etc/letsencrypt/live/domain/cert.pem

# Supprimer un certificat
sudo certbot delete --cert-name domain
```

---

## 📊 Monitoring système

```bash
# Voir la RAM et le CPU
htop
# (installer avec: sudo apt install htop)

# Alternative simple
top

# RAM disponible
free -h

# Espace disque
df -h

# CPU et load average
uptime

# Processus qui consomment le plus
ps aux --sort=-%mem | head -10

# Voir les connexions réseau
sudo netstat -tulpn

# Voir qui écoute sur le port 3000
sudo lsof -i :3000

# Voir les connexions actives
ss -tulpn

# Historique des commandes
history

# Rechercher dans l'historique
history | grep nginx

# Voir les logs système
sudo journalctl -xe

# Logs d'un service spécifique
sudo journalctl -u nginx -f
```

---

## 🔄 Transfert de fichiers

### Depuis votre PC vers le serveur

```bash
# Copier un fichier
scp fichier.txt ubuntu@votre-ip-ovh:~/

# Copier un dossier
scp -r dossier/ ubuntu@votre-ip-ovh:~/apps/

# Avec une clé SSH
scp -i ~/.ssh/ma-cle fichier.txt ubuntu@votre-ip-ovh:~/
```

### Depuis le serveur vers votre PC

```bash
# Télécharger un fichier
scp ubuntu@votre-ip-ovh:~/fichier.txt ./

# Télécharger un dossier
scp -r ubuntu@votre-ip-ovh:~/dossier/ ./
```

---

## 🧪 Tests et débogage

```bash
# Tester l'API localement
curl http://localhost:3000/health

# Avec formatage JSON
curl http://localhost:3000/health | json_pp

# Tester via l'IP publique
curl http://votre-ip-ovh/health

# Tester avec verbose
curl -v http://localhost:3000/health

# Envoyer un POST
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Tester MongoDB
mongo --eval 'db.version()'

# Ping un serveur
ping google.com

# Tester une connexion
telnet localhost 3000

# Voir les variables d'environnement
env | grep NODE

# Tester DNS
nslookup votre-domaine.com

# Tracer la route
traceroute votre-domaine.com
```

---

## 🛠️ Maintenance

```bash
# Mettre à jour le système
sudo apt update
sudo apt upgrade -y

# Nettoyer les packages inutilisés
sudo apt autoremove -y
sudo apt autoclean

# Redémarrer le serveur
sudo reboot

# Arrêter le serveur
sudo shutdown -h now

# Programmer un redémarrage
sudo shutdown -r +10  # dans 10 minutes

# Annuler un redémarrage programmé
sudo shutdown -c

# Voir l'uptime
uptime

# Voir les dernières connexions
last -10

# Voir qui est connecté
who

# Historique de redémarrage
last reboot
```

---

## 📝 Permissions et utilisateurs

```bash
# Changer le propriétaire d'un fichier
sudo chown ubuntu:ubuntu fichier.txt

# Changer récursivement
sudo chown -R ubuntu:ubuntu dossier/

# Changer les permissions
chmod 755 script.sh
chmod +x script.sh

# Voir les permissions
ls -la

# Créer un nouvel utilisateur
sudo adduser nouveau-user

# Ajouter au groupe sudo
sudo usermod -aG sudo nouveau-user

# Changer d'utilisateur
su - autre-user

# Revenir à root
exit
```

---

## 🔍 Recherche et filtrage

```bash
# Rechercher dans les fichiers
grep -r "mot-clé" .

# Rechercher dans les logs
grep "error" logs/pm2-error.log

# Compter les occurrences
grep -c "error" logs/pm2-error.log

# Rechercher avec contexte
grep -C 3 "error" logs/pm2-error.log

# Rechercher et exclure
grep -r "error" . --exclude="*.log"

# Trouver les gros fichiers
find . -type f -size +100M

# Trouver les fichiers modifiés récemment
find . -type f -mtime -1
```

---

## ⚡ Raccourcis clavier utiles

```bash
Ctrl + C    # Arrêter la commande en cours
Ctrl + Z    # Suspendre la commande
Ctrl + D    # Déconnexion / EOF
Ctrl + L    # Effacer l'écran (comme clear)
Ctrl + A    # Début de ligne
Ctrl + E    # Fin de ligne
Ctrl + U    # Effacer jusqu'au début
Ctrl + K    # Effacer jusqu'à la fin
Ctrl + R    # Rechercher dans l'historique
!!          # Répéter la dernière commande
sudo !!     # Répéter avec sudo
```

---

## 🎯 Workflow de mise à jour typique

```bash
# 1. Se connecter
ssh ubuntu@votre-ip-ovh

# 2. Aller dans le projet
cd ~/apps/projet-covoiturage/backend

# 3. Voir le statut actuel
pm2 status

# 4. Récupérer les modifications
git pull origin main

# 5. Installer les nouvelles dépendances
npm install

# 6. Recompiler
npm run build

# 7. Redémarrer l'app
pm2 restart covoiturage-api

# 8. Vérifier les logs
pm2 logs covoiturage-api --lines 50

# 9. Tester
curl http://localhost:3000/health
```

---

## 🆘 Dépannage rapide

### L'API ne répond pas

```bash
# Vérifier si l'app tourne
pm2 status

# Voir les logs
pm2 logs covoiturage-api

# Redémarrer
pm2 restart covoiturage-api

# Vérifier le port
sudo lsof -i :3000
```

### Nginx retourne 502

```bash
# Vérifier Nginx
sudo systemctl status nginx

# Vérifier les logs
sudo tail -f /var/log/nginx/error.log

# Vérifier que l'app tourne
pm2 status

# Tester localement
curl http://localhost:3000/health
```

### Manque d'espace disque

```bash
# Voir l'espace
df -h

# Voir les gros fichiers
du -sh * | sort -hr | head -10

# Nettoyer les logs PM2
pm2 flush

# Nettoyer npm
npm cache clean --force

# Nettoyer le système
sudo apt autoremove -y
sudo apt autoclean
```

### Erreur de permission

```bash
# Voir les permissions
ls -la

# Corriger les permissions
sudo chown -R $USER:$USER .

# Réinstaller node_modules
rm -rf node_modules
npm install
```

---

## 📚 Alias utiles à ajouter

Ajoutez dans `~/.bashrc` :

```bash
# Editer
nano ~/.bashrc

# Ajouter ces lignes
alias pm2logs='pm2 logs covoiturage-api'
alias pm2status='pm2 status'
alias pm2restart='pm2 restart covoiturage-api'
alias apitest='curl http://localhost:3000/health | json_pp'
alias gotoapi='cd ~/apps/projet-covoiturage/backend'
alias update-api='cd ~/apps/projet-covoiturage/backend && git pull && npm install && npm run build && pm2 restart covoiturage-api'

# Recharger
source ~/.bashrc
```

Ensuite, utilisez simplement :
```bash
pm2logs      # Au lieu de pm2 logs covoiturage-api
update-api   # Met à jour tout automatiquement
```

---

## 🎉 Script de déploiement automatique

Utilisez le script fourni :

```bash
cd ~/apps/projet-covoiturage/backend
./deploy-ovh.sh
```

Menu interactif pour :
- 📥 Premier déploiement
- 🔄 Mise à jour
- 🔁 Redémarrage
- 📊 Logs et statut
- 🧪 Tests

---

**Gardez ce fichier sous la main !** 📌

Astuce : Ajoutez ce repo à vos favoris pour accéder rapidement aux commandes.

```bash
# Afficher ce fichier sur le serveur
cat ~/apps/projet-covoiturage/backend/COMMANDES_OVH.md
```

