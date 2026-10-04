# 📱 Configuration de l'envoi de SMS

Ce guide explique comment configurer l'envoi de vrais SMS pour la vérification des numéros de téléphone.

## 🚀 Configuration avec Twilio (Recommandé)

### Pourquoi Twilio ?

- ✅ **15$ de crédit gratuit** à l'inscription
- ✅ **Simple à configurer**
- ✅ **Fiable et rapide**
- ✅ **Support international**
- ✅ **Excellent pour le développement et la production**

---

## 📝 Étape 1 : Créer un compte Twilio

1. **Allez sur** : https://www.twilio.com/try-twilio
2. **Inscrivez-vous** (gratuit, pas de carte bancaire requise pour l'essai)
3. **Vérifiez votre email**
4. **Vérifiez votre numéro de téléphone** (vous recevrez un SMS)

---

## 🔑 Étape 2 : Récupérer les credentials

### 2.1 Account SID et Auth Token

1. Allez sur votre **Dashboard Twilio** : https://console.twilio.com/
2. Dans la section **"Account Info"**, copiez :
   - **Account SID** (commence par AC...)
   - **Auth Token** (cliquez sur "Show" pour le voir)

### 2.2 Numéro de téléphone Twilio

1. Dans le menu, allez sur **"Phone Numbers" > "Manage" > "Buy a number"**
2. **Sélectionnez un pays** (ex: États-Unis)
3. **Cochez "SMS"** dans les capabilities
4. **Cliquez sur "Search"**
5. **Choisissez un numéro gratuit** (essai) ou payant
6. **Cliquez sur "Buy"**
7. **Copiez votre numéro** (format: +1234567890)

---

## ⚙️ Étape 3 : Configurer le .env

Modifiez le fichier `backend/.env` :

```env
# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=votre-auth-token-ici
TWILIO_PHONE_NUMBER=+12345678901
```

**Important :** 
- L'Account SID commence par **AC**
- Le numéro doit inclure l'**indicatif pays** (+1 pour USA, +33 pour France, etc.)

---

## 🧪 Étape 4 : Test

### En compte d'essai (Trial Account)

Twilio en mode essai peut **SEULEMENT** envoyer des SMS aux numéros vérifiés.

#### Vérifier un numéro de téléphone :

1. Allez sur : https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Cliquez sur **"+ Add a new caller ID"**
3. Entrez votre numéro (avec indicatif pays : +33612345678 pour la France)
4. **Vérifiez le code** reçu par SMS
5. Votre numéro est maintenant autorisé !

### Tester l'envoi :

1. **Redémarrez le serveur backend** : `npm run dev`
2. Dans l'application mobile, allez sur **Profil**
3. Cliquez sur **"Vérifier"** à côté du téléphone
4. Cliquez sur **"Envoyer le code"**
5. **Vérifiez votre téléphone** pour le SMS 📱
6. **Entrez le code** dans l'application

---

## 💰 Étape 5 : Passer en production (Optionnel)

Pour envoyer des SMS à n'importe quel numéro :

1. **Ajoutez des informations de facturation** : https://console.twilio.com/billing
2. **Mettez à niveau votre compte** (aucun minimum requis)
3. Les SMS coûtent environ **0.0075$ par SMS** (États-Unis)

### Tarifs par pays (approximatifs) :

| Pays | Prix par SMS |
|------|-------------|
| 🇺🇸 États-Unis | 0.0075$ |
| 🇫🇷 France | 0.10$ |
| 🇲🇦 Maroc | 0.08$ |
| 🇨🇦 Canada | 0.0075$ |
| 🇬🇧 Royaume-Uni | 0.04$ |

---

## 🌍 Format des numéros de téléphone

### Twilio nécessite le format E.164 :

```
+[code pays][numéro sans 0]

Exemples :
- France : +33612345678 (pas +330612345678)
- Maroc : +212612345678
- USA : +14155551234
```

### Dans votre application :

Le code ajoute automatiquement le **+** si absent :

```typescript
const formattedPhone = phoneNumber.startsWith('+') 
  ? phoneNumber 
  : `+${phoneNumber}`;
```

**Conseil :** Demandez aux utilisateurs d'entrer leur numéro avec l'indicatif pays.

---

## 📊 Monitoring

### Consulter l'historique des SMS :

1. Allez sur : https://console.twilio.com/us1/monitor/logs/sms
2. Vous verrez :
   - ✅ SMS livrés (delivered)
   - ⏳ SMS en cours (sent)
   - ❌ SMS échoués (failed/undelivered)

### Logs dans votre terminal :

```
✅ SMS envoyé à +33612345678
📱 Message SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
🔑 Code: 123456 (en développement seulement)
```

---

## 🔒 Sécurité

### Protéger vos credentials :

- ✅ **Jamais** committer le fichier `.env`
- ✅ Déjà dans `.gitignore`
- ✅ En production, utilisez des variables d'environnement sécurisées
- ✅ Régénérez l'Auth Token si compromis

### Limiter les abus :

Le code actuel inclut :
- ✅ Codes de 6 chiffres aléatoires
- ✅ Expiration après 15 minutes
- ✅ Code supprimé après vérification

**À ajouter en production** :
- Limite de 3 tentatives par heure
- Captcha avant envoi
- Rate limiting par IP

---

## 🐛 Dépannage

### Erreur "Unable to create record"

- ✅ Vérifiez que votre numéro **commence par +**
- ✅ En mode essai, le numéro doit être **vérifié dans Twilio**
- ✅ Vérifiez le format E.164

### Erreur "Authentication Error"

- ✅ Vérifiez l'**Account SID** (commence par AC)
- ✅ Vérifiez l'**Auth Token**
- ✅ Redémarrez le serveur après modification du .env

### SMS non reçu

- ✅ Vérifiez les **logs Twilio** : https://console.twilio.com/us1/monitor/logs/sms
- ✅ Vérifiez que le numéro est **au bon format**
- ✅ En mode essai, vérifiez que le destinataire est **dans la liste des numéros vérifiés**

### Fallback en développement

Si Twilio n'est **pas configuré**, le code s'affiche dans la console :

```
📱 SMS de vérification (Simulé)
📞 Pour: +33612345678
🔑 Code: 123456
⏰ Expire dans 15 minutes
```

---

## 🆚 Alternatives à Twilio

| Service | Avantages | Inconvénients |
|---------|-----------|---------------|
| **Twilio** | ✅ Simple, fiable, essai gratuit | ❌ Coûteux pour gros volume |
| **AWS SNS** | ✅ Moins cher en volume | ❌ Plus complexe à configurer |
| **Vonage (Nexmo)** | ✅ Bons tarifs internationaux | ❌ Interface moins intuitive |
| **Plivo** | ✅ Prix compétitifs | ❌ Documentation limitée |

---

## 📞 Format du SMS envoyé

```
Votre code de vérification Covoiturage: 123456. Expire dans 15 minutes.
```

**Longueur :** ~70 caractères (1 SMS standard = 160 caractères)

---

## 📚 Documentation

- [Twilio - Démarrage rapide](https://www.twilio.com/docs/sms/quickstart)
- [Twilio - Format E.164](https://www.twilio.com/docs/glossary/what-e164)
- [Twilio - Tarification](https://www.twilio.com/sms/pricing)
- [Console Twilio](https://console.twilio.com/)

---

## ✅ Récapitulatif

1. ✅ Créer un compte Twilio (gratuit)
2. ✅ Copier Account SID + Auth Token
3. ✅ Acheter/obtenir un numéro Twilio
4. ✅ Configurer `.env` avec les credentials
5. ✅ En mode essai : Vérifier les numéros destinataires
6. ✅ Redémarrer le serveur backend
7. ✅ Tester l'envoi de SMS depuis l'app

**Coût :** Gratuit en essai (15$ de crédit), puis ~0.0075$ par SMS (USA)

---

**Besoin d'aide ?** Consultez la console Twilio ou les logs du serveur backend ! 🚀

