# 🎯 Système d'Administration - Plateforme de Covoiturage

## 📋 Vue d'ensemble

Ce document décrit le système d'administration complet créé pour la plateforme de covoiturage avec 3 niveaux de privilèges :

### 1. **Super Admin** 
- Contrôle total de l'application
- Gestion du pourcentage/commission sur les courses  
- Ajout et gestion des admins
- Accès à toutes les statistiques
- Gestion globale des utilisateurs et conducteurs

### 2. **Admin** (par zone)
- Gère une zone géographique spécifique (wilaya)
- Appelle les chauffeurs de sa zone
- Vérifie les transferts/paiements des chauffeurs
- Peut bloquer/débloquer les comptes des chauffeurs
- Accès aux statistiques de sa zone

### 3. **Modérateur**
- Modération du contenu
- Gestion des signalements
- Consultation des statistiques basiques

---

## 🗂️ Fichiers créés

### Modèles (Models)

#### 1. `backend/src/models/admin.model.ts`
**Interface IAdmin:**
```typescript
{
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: 'super_admin' | 'admin' | 'moderator'
  zone?: { wilaya: string, cities: string[] }
  permissions: string[]
  isActive: boolean
  createdBy?: ObjectId
  lastLogin?: Date
}
```

**Permissions par rôle:**
- **Super Admin:** manage_admins, manage_users, manage_drivers, manage_commissions, manage_payments, view_all_stats, block_users, manage_content
- **Admin:** view_zone_drivers, verify_payments, block_drivers, call_drivers, view_zone_stats  
- **Modérateur:** view_reports, manage_content, view_stats

#### 2. `backend/src/models/payment.model.ts`
**Interface IPayment:**
```typescript
{
  driver: ObjectId
  amount: number
  period: { month: number, year: number }
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: Date
  paidDate?: Date
  paymentMethod?: 'cash' | 'bank_transfer' | 'mobile_payment'
  transactionReference?: string
  verifiedBy?: ObjectId
  notes?: string
  trips: ObjectId[]
  totalEarnings: number
  commissionRate: number
}
```

### Contrôleurs (Controllers)

#### 3. `backend/src/controllers/admin-auth.controller.ts`
**Endpoints:**
- `POST /api/admin/auth/login` - Connexion admin
- `POST /api/admin/auth/create-super-admin` - Créer le premier super admin (avec clé secrète)
- `GET /api/admin/auth/me` - Obtenir le profil admin connecté
- `PUT /api/admin/auth/change-password` - Changer le mot de passe

#### 4. `backend/src/controllers/admin.controller.ts`
**Endpoints:**
- `POST /api/admin/admins` - Créer un nouvel admin (super_admin only)
- `GET /api/admin/admins` - Liste des admins (super_admin only)
- `GET /api/admin/admins/:id` - Détails d'un admin
- `PUT /api/admin/admins/:id` - Mettre à jour un admin
- `DELETE /api/admin/admins/:id` - Supprimer un admin
- `GET /api/admin/drivers` - Liste des conducteurs (filtré par zone pour admin)
- `PUT /api/admin/drivers/:id/block` - Bloquer/Débloquer un conducteur
- `GET /api/admin/stats` - Statistiques générales

#### 5. `backend/src/controllers/payment.controller.ts`
**Endpoints:**
- `POST /api/admin/payments/generate-monthly` - Générer les paiements mensuels
- `GET /api/admin/payments` - Liste des paiements
- `GET /api/admin/payments/:id` - Détails d'un paiement
- `PUT /api/admin/payments/:id/verify` - Vérifier et marquer un paiement comme payé
- `GET /api/admin/payments/overdue` - Paiements en retard
- `GET /api/admin/payments/stats` - Statistiques des paiements

#### 6. `backend/src/controllers/commission.controller.ts`
**Endpoints:**
- `GET /api/admin/commission/current` - Taux de commission actuel
- `POST /api/admin/commission` - Définir un nouveau taux (super_admin only)
- `GET /api/admin/commission/history` - Historique des changements
- `GET /api/admin/commission/calculate` - Calculer la commission pour un montant donné
- `GET /api/admin/commission/revenue` - Revenus de commission par période
- `GET /api/admin/commission/projections` - Projections de revenus

### Middlewares

#### 7. `backend/src/middlewares/admin-auth.ts`
**Fonctions:**
- `protectAdmin` - Vérifier l'authentification admin
- `restrictTo(...roles)` - Restreindre l'accès à certains rôles
- `checkPermission(permission)` - Vérifier une permission spécifique

### Routes

#### 8. `backend/src/routes/admin.routes.ts`
Toutes les routes admin regroupées avec les middlewares appropriés.

---

## 🔐 Sécurité

### Authentification
- JWT Token avec type 'admin' pour différencier des utilisateurs normaux
- Middleware `protectAdmin` vérifie le token et le type
- Vérification de l'état actif du compte admin

### Permissions
- Système de permissions granulaires
- Middleware `restrictTo` pour filtrer par rôle
- Middleware `checkPermission` pour vérifier des permissions spécifiques

### Mot de passe
- Hashage avec bcrypt (salt de 10)
- Minimum 8 caractères
- Endpoint dédié pour le changement de mot de passe

---

## 💰 Système de Commission

### Calcul
- Formule: `prix_client = prix_conducteur / (1 - taux_commission)`
- Commission par défaut: 16%
- Historique de tous les changements de taux
- Date d'effet pour chaque changement

### Paiements Mensuels
1. Génération automatique des paiements pour tous les conducteurs
2. Calcul basé sur les trajets complétés du mois
3. Date limite: 5ème jour du mois suivant
4. Statuts: pending → paid/overdue
5. Blocage automatique des conducteurs en retard de paiement

---

## 📊 Statistiques Disponibles

### Pour Super Admin
- Nombre total de conducteurs
- Nombre total de passagers
- Conducteurs bloqués/actifs
- Total des trajets
- Revenus de commission (par période)
- Projections de revenus

### Pour Admin (par zone)
- Conducteurs de sa zone
- Conducteurs bloqués dans sa zone
- Statistiques de paiement de sa zone

### Pour Modérateur
- Statistiques de base
- Rapports de modération

---

## 🚀 Utilisation

### 1. Créer le premier Super Admin

```bash
POST /api/admin/auth/create-super-admin
{
  "email": "superadmin@covoiturage.com",
  "password": "SecurePassword123",
  "firstName": "Admin",
  "lastName": "Principal",
  "phoneNumber": "0555000000",
  "secretKey": "VOTRE_CLE_SECRETE_ENV"
}
```

**Important:** Définir `SUPER_ADMIN_SECRET_KEY` dans le fichier `.env`

### 2. Se connecter

```bash
POST /api/admin/auth/login
{
  "email": "superadmin@covoiturage.com",
  "password": "SecurePassword123"
}
```

Retour:
```json
{
  "success": true,
  "data": {
    "admin": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Créer un Admin de zone

```bash
POST /api/admin/admins
Authorization: Bearer {token_super_admin}
{
  "email": "admin.alger@covoiturage.com",
  "password": "Password123",
  "firstName": "Admin",
  "lastName": "Alger",
  "phoneNumber": "0555111111",
  "role": "admin",
  "zone": {
    "wilaya": "Alger",
    "cities": ["Alger Centre", "Bab Ezzouar", "Kouba", "Rouiba"]
  }
}
```

### 4. Générer les paiements mensuels

```bash
POST /api/admin/payments/generate-monthly
Authorization: Bearer {token_super_admin}
{
  "month": 10,
  "year": 2025
}
```

### 5. Vérifier un paiement

```bash
PUT /api/admin/payments/{paymentId}/verify
Authorization: Bearer {token_admin}
{
  "paymentMethod": "bank_transfer",
  "transactionReference": "TRX123456789",
  "notes": "Paiement vérifié et conforme"
}
```

### 6. Bloquer un conducteur

```bash
PUT /api/admin/drivers/{driverId}/block
Authorization: Bearer {token_admin}
{
  "reason": "Non-paiement de la commission du mois d'octobre 2025"
}
```

### 7. Changer le taux de commission

```bash
POST /api/admin/commission
Authorization: Bearer {token_super_admin}
{
  "rate": 18,
  "effectiveDate": "2025-11-01",
  "reason": "Augmentation des coûts opérationnels"
}
```

---

## 🔄 Workflow Typique

### Fin de mois (pour Super Admin)
1. Générer les paiements mensuels
2. Consulter les statistiques de revenus
3. Notifier les admins de zone

### Gestion des paiements (pour Admin de zone)
1. Consulter la liste des paiements de sa zone
2. Appeler les conducteurs pour vérification
3. Marquer les paiements comme vérifiés
4. Bloquer les conducteurs en retard si nécessaire
5. Débloquer après réception du paiement

### Gestion quotidienne
1. Consulter les paiements en retard
2. Vérifier les nouveaux conducteurs
3. Gérer les blocages/déblocages
4. Consulter les statistiques

---

## 📝 Notes Importantes

1. **Sécurité:** Le token admin est différent du token utilisateur (type 'admin' vs 'user')
2. **Zone:** Seuls les admins (pas super_admin) ont une zone assignée
3. **Permissions:** Toujours vérifiées avant chaque action sensible
4. **Paiements:** Blocage automatique en cas de non-paiement après la date limite
5. **Commission:** Historique complet de tous les changements de taux
6. **Audit:** Tous les changements sont tracés (createdBy, verifiedBy, etc.)

---

## ⚠️ TODO Avant la mise en production

- [ ] Définir `SUPER_ADMIN_SECRET_KEY` dans les variables d'environnement
- [ ] Créer le premier super admin
- [ ] Définir les zones géographiques (wilayas)
- [ ] Créer les admins de zone
- [ ] Tester le workflow complet de paiement
- [ ] Configurer les notifications (email/SMS) pour les admins
- [ ] Créer l'interface frontend du dashboard admin
- [ ] Configurer les sauvegardes automatiques
- [ ] Mettre en place le monitoring des paiements

---

## 🎨 Prochaines étapes

1. **Frontend:** Créer le dashboard admin React/React Native
2. **Notifications:** Système d'alertes pour paiements en retard
3. **Rapports:** Export Excel/PDF des paiements et statistiques
4. **Automatisation:** Rappels automatiques pour les paiements
5. **Analytics:** Graphiques et tableaux de bord avancés

