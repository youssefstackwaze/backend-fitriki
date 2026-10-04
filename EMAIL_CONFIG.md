# 📧 Configuration de l'envoi d'emails

Ce guide explique comment configurer l'envoi de vrais emails pour la vérification des comptes.

## 🚀 Option 1 : Gmail (Recommandé pour développement)

### Étape 1 : Créer un App Password Gmail

1. **Allez sur** : https://myaccount.google.com/security
2. **Activez la vérification en 2 étapes** (si ce n'est pas déjà fait)
3. **Allez sur** : https://myaccount.google.com/apppasswords
4. **Créez un nouveau mot de passe d'application**
   - Sélectionnez "Autre (nom personnalisé)"
   - Entrez "Covoiturage App"
   - Cliquez sur "Générer"
5. **Copiez le mot de passe** généré (16 caractères)

### Étape 2 : Configurer le fichier .env

Modifiez le fichier `.env` dans le dossier backend :

```env
# Email (SMTP)
APP_NAME=Covoiturage
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Le mot de passe d'application généré
SMTP_FROM=votre-email@gmail.com
```

### Étape 3 : Redémarrer le serveur

```bash
cd backend
npm run dev
```

---

## 🔧 Option 2 : Mailtrap (Idéal pour tests)

Mailtrap capture tous les emails sans les envoyer réellement.

### Configuration :

1. **Créez un compte** : https://mailtrap.io
2. **Copiez les credentials SMTP**
3. **Modifiez .env** :

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=votre-username-mailtrap
SMTP_PASS=votre-password-mailtrap
SMTP_FROM=noreply@covoiturage.com
```

---

## 📮 Option 3 : SendGrid (Production)

### Configuration :

1. **Créez un compte** : https://sendgrid.com
2. **Créez une API Key**
3. **Modifiez .env** :

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
SMTP_FROM=noreply@votredomaine.com
```

---

## 📱 SMS (Pour la vérification téléphone)

Actuellement, les SMS sont simulés (affichés dans la console).

Pour envoyer de vrais SMS en production :

### Option : Twilio

1. **Installez Twilio** :
```bash
npm install twilio
```

2. **Ajoutez dans .env** :
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

3. **Décommentez le code dans** `backend/src/config/email.ts`

---

## ✅ Test

Après configuration :

1. **Démarrez le backend** : `npm run dev`
2. **Dans l'app mobile**, cliquez sur "Vérifier" à côté de l'email
3. **Cliquez sur "Envoyer le code"**
4. **Vérifiez votre boîte email** pour recevoir le code
5. **Entrez le code** dans l'application

---

## 🐛 Dépannage

### Erreur "Invalid login" avec Gmail

- ✅ Vérifiez que vous utilisez un **App Password**, pas votre mot de passe Gmail
- ✅ Activez la vérification en 2 étapes
- ✅ Vérifiez que SMTP_USER et SMTP_FROM sont identiques

### Les emails ne sont pas reçus

- ✅ Vérifiez le dossier spam
- ✅ Vérifiez les logs du serveur backend
- ✅ Testez avec Mailtrap d'abord

### Erreur "Connection timeout"

- ✅ Vérifiez votre pare-feu
- ✅ Vérifiez que le port 587 est ouvert
- ✅ Essayez avec port 465 et SMTP_SECURE=true

---

## 📝 Format de l'email envoyé

L'email de vérification contient :

- ✅ Un design professionnel HTML
- ✅ Le code de vérification à 6 chiffres
- ✅ Le nom de l'utilisateur personnalisé
- ✅ Un message de bienvenue
- ✅ Information d'expiration (15 minutes)
- ✅ Version texte brut (fallback)

---

## 🔒 Sécurité

- ✅ Codes de 6 chiffres aléatoires
- ✅ Expiration après 15 minutes
- ✅ Stockage sécurisé dans MongoDB
- ✅ Codes supprimés après vérification
- ✅ Limite de tentatives (à implémenter si besoin)

---

## 📚 Documentation

- [Nodemailer](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Mailtrap](https://mailtrap.io/blog/nodemailer-gmail/)
- [SendGrid](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)

