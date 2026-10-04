# 📧 Configuration de l'Envoi d'Emails

## Vue d'ensemble

Le système envoie automatiquement un email aux nouveaux administrateurs/modérateurs avec leurs identifiants de connexion dès qu'ils sont créés par un super admin.

## ✨ Fonctionnalités

- **Email automatique** lors de la création d'un admin/modérateur
- **Template HTML élégant** avec design moderne
- **Informations incluses** :
  - Email de connexion
  - Mot de passe (en clair, pour la première connexion)
  - Rôle assigné (Super Admin, Admin, Modérateur)
  - Wilaya assignée (si applicable)
  - Lien direct vers la plateforme d'administration

## 🔧 Configuration Requise

### Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` du backend :

```env
# ==========================================
# EMAIL - NODEMAILER
# ==========================================

# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_app_password_gmail
SMTP_FROM=votre_email@gmail.com

# Nom de l'application (affiché dans les emails)
APP_NAME=Covoiturage

# URL de l'interface admin (pour le bouton "Se connecter")
ADMIN_URL=http://localhost:3000/admin
```

## 📧 Configuration Gmail (Recommandé)

### Option 1 : App Password (Plus Sécurisé)

1. **Activer la validation en deux étapes** sur votre compte Google :
   - Allez sur https://myaccount.google.com/security
   - Activez la "Validation en deux étapes"

2. **Créer un App Password** :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et votre appareil
   - Copiez le mot de passe généré (16 caractères)
   - Utilisez-le dans `SMTP_PASS`

3. **Configuration** :
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=votre.email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop  # App Password généré
   SMTP_FROM=votre.email@gmail.com
   ```

### Option 2 : Autoriser les applications moins sécurisées (Non recommandé)

⚠️ **Cette méthode est moins sécurisée et n'est plus supportée par Google.**

## 📧 Autres Services SMTP

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre_api_key_sendgrid
SMTP_FROM=votre_email_verifie@domaine.com
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre_password_mailgun
SMTP_FROM=votre_email@domaine.com
```

### AWS SES (Amazon Simple Email Service)

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_access_key_id
SMTP_PASS=votre_secret_access_key
SMTP_FROM=votre_email_verifie@domaine.com
```

### Mailtrap (Développement/Test uniquement)

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=votre_username_mailtrap
SMTP_PASS=votre_password_mailtrap
SMTP_FROM=test@example.com
```

## 🎨 Template d'Email

L'email envoyé contient :

### Design Adaptatif par Rôle

- **Super Admin** : Header rouge avec icône 👑
- **Admin** : Header bleu avec icône 🛡️
- **Modérateur** : Header vert avec icône ⚙️

### Contenu

```
┌─────────────────────────────────────┐
│      [ICÔNE] Covoiturage           │ ← Header coloré selon le rôle
│   Plateforme d'Administration      │
├─────────────────────────────────────┤
│                                     │
│   🎉                               │
│   Bienvenue [Prénom Nom] !         │
│   Votre compte administrateur a    │
│   été créé avec succès.            │
│                                     │
│   [Badge du rôle]                  │
│                                     │
│   [Wilaya assignée si applicable]  │
│                                     │
│   ┌──────────────────────────┐    │
│   │ 🔐 Vos identifiants      │    │
│   │                          │    │
│   │ 📧 Email: xxx@xxx.com    │    │
│   │ 🔑 Mot de passe: xxxxxx  │    │
│   └──────────────────────────┘    │
│                                     │
│   ⚠️ Important : Changez votre     │
│   mot de passe à la première       │
│   connexion.                        │
│                                     │
│   [🚀 Se connecter maintenant]     │
│                                     │
│   📱 Que pouvez-vous faire ?       │
│   • Gérer les utilisateurs         │
│   • Consulter les statistiques     │
│   • Modérer les contenus           │
│   • Gérer les commissions          │
│                                     │
├─────────────────────────────────────┤
│   Covoiturage                      │
│   Cet email contient des           │
│   informations confidentielles     │
└─────────────────────────────────────┘
```

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais commiter le fichier .env** dans Git
2. **Utiliser des App Passwords** plutôt que le mot de passe principal
3. **Changer les mots de passe** dès la première connexion
4. **Vérifier les logs** pour détecter les échecs d'envoi

### En Production

- Utilisez un service professionnel (SendGrid, AWS SES, Mailgun)
- Activez DKIM et SPF pour votre domaine
- Surveillez les taux de délivrabilité
- Respectez les limites d'envoi

## 🧪 Test de la Configuration

### Mode Développement

En mode développement, les identifiants sont également affichés dans la console :

```bash
✅ Email d'identifiants envoyé à admin@example.com
📧 Message ID: <12345@domain.com>

🎉 NOUVEL ADMIN CRÉÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Nom: Jean Dupont
📧 Email: admin@example.com
🔑 Mot de passe: SecurePass123!
👑 Rôle: Administrateur
📍 Wilaya: Alger
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Tester avec Mailtrap

Pour tester sans envoyer de vrais emails :

1. Créez un compte sur https://mailtrap.io
2. Copiez les identifiants SMTP
3. Utilisez-les dans votre `.env`
4. Tous les emails seront capturés par Mailtrap

## 🐛 Dépannage

### L'email n'est pas envoyé

1. **Vérifier les logs** dans la console backend
2. **Tester la connexion SMTP** :
   ```bash
   telnet smtp.gmail.com 587
   ```
3. **Vérifier les variables d'environnement** :
   ```bash
   echo $SMTP_USER
   echo $SMTP_HOST
   ```

### Erreur "Invalid login"

- Pour Gmail : Vérifiez que vous utilisez un App Password
- Vérifiez que la validation en deux étapes est activée
- Vérifiez que l'email et le mot de passe sont corrects

### Emails dans les spams

- Configurez SPF et DKIM pour votre domaine
- Utilisez un service professionnel en production
- Évitez les mots déclencheurs de spam

### Limites d'envoi

- **Gmail gratuit** : ~500 emails/jour
- **SendGrid Free** : 100 emails/jour
- **Mailgun Free** : 5000 emails/mois
- **AWS SES** : 62000 emails/mois (avec EC2)

## 📝 Exemple Complet

### Fichier .env

```env
# Application
NODE_ENV=development
PORT=5000
APP_NAME=Covoiturage Algérie
ADMIN_URL=http://localhost:3000/admin

# Database
MONGODB_URI=mongodb://localhost:27017/covoiturage

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=covoiturage.algerie@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=covoiturage.algerie@gmail.com
```

### Test

Créez un admin via l'interface et vérifiez :
- ✅ La console affiche les identifiants
- ✅ L'email est reçu
- ✅ Le template est bien formaté
- ✅ Le lien fonctionne

## 🎯 Flux Complet

```
Super Admin crée un nouvel admin
          ↓
Backend sauvegarde l'admin
          ↓
Backend envoie l'email automatiquement
          ↓
Nouvel admin reçoit ses identifiants
          ↓
Nouvel admin se connecte
          ↓
Nouvel admin change son mot de passe
```

## 📚 Ressources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Mailgun Documentation](https://documentation.mailgun.com/)

---

**Note** : L'envoi d'email est conçu pour ne pas bloquer la création de l'admin. Si l'email échoue, l'admin est quand même créé et vous pouvez voir les identifiants dans les logs du serveur.

