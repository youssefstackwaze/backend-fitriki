/**
 * Configuration PM2 pour le backend Covoiturage
 * 
 * Utilisation :
 *   pm2 start ecosystem.config.js
 *   pm2 restart ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 * 
 * Documentation : https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      // Configuration de l'application principale
      name: 'covoiturage-api',
      
      // Script à exécuter
      script: './dist/server.js',
      
      // Mode d'exécution
      // 'fork' pour une seule instance
      // 'cluster' pour plusieurs instances (load balancing)
      instances: 1,
      exec_mode: 'fork',
      
      // Variables d'environnement
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Variables d'environnement pour le développement
      // Utilisation : pm2 start ecosystem.config.js --env development
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      
      // Variables d'environnement pour la production
      // Utilisation : pm2 start ecosystem.config.js --env production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Gestion des logs
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Rotation des logs automatique (si pm2-logrotate est installé)
      // Installation : pm2 install pm2-logrotate
      
      // Redémarrage automatique
      autorestart: true,
      
      // Délai avant redémarrage (en ms)
      restart_delay: 4000,
      
      // Nombre maximum de redémarrages instables
      max_restarts: 10,
      
      // Temps minimum d'uptime pour considérer l'app stable (en ms)
      min_uptime: '10s',
      
      // Redémarrage si la mémoire dépasse cette limite
      max_memory_restart: '500M',
      
      // Surveiller les changements de fichiers (déconseillé en production)
      watch: false,
      
      // Fichiers/dossiers à ignorer si watch est activé
      ignore_watch: [
        'node_modules',
        'logs',
        '.git',
        'uploads'
      ],
      
      // Interpréteur (node par défaut)
      interpreter: 'node',
      
      // Arguments de l'interpréteur
      // Exemple pour augmenter la mémoire : '--max-old-space-size=4096'
      // interpreter_args: '',
      
      // Comportement lors du kill
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Métriques et monitoring
      // Activer le monitoring (visible avec pm2 monit)
      instance_var: 'INSTANCE_ID',
      
      // Merge logs de toutes les instances
      merge_logs: true,
      
      // Informations supplémentaires dans les logs
      time: true
    }
    
    // Vous pouvez ajouter d'autres applications ici
    // Par exemple, un worker pour les tâches en arrière-plan
    /*
    {
      name: 'covoiturage-worker',
      script: './dist/worker.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      autorestart: true,
      max_memory_restart: '300M'
    }
    */
  ],
  
  // Configuration de déploiement (optionnel)
  // Permet de déployer via : pm2 deploy ecosystem.config.js production
  deploy: {
    production: {
      // Utilisateur SSH
      user: 'ubuntu',
      
      // IP ou hostname du serveur
      host: 'VOTRE-IP-OVH',
      
      // Référence Git à déployer
      ref: 'origin/main',
      
      // URL du repository Git
      repo: 'https://github.com/votre-username/projet-covoiturage.git',
      
      // Chemin sur le serveur où déployer
      path: '/home/ubuntu/apps/projet-covoiturage',
      
      // Commandes à exécuter sur le serveur avant le setup
      'pre-setup': 'echo "Préparation du déploiement..."',
      
      // Commandes à exécuter après le clone
      'post-setup': 'npm install',
      
      // Commandes à exécuter avant le déploiement
      'pre-deploy': 'git fetch --all',
      
      // Commandes à exécuter après le déploiement
      'post-deploy': 'cd backend && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      
      // Variables d'environnement pour le déploiement
      env: {
        NODE_ENV: 'production'
      }
    },
    
    development: {
      user: 'ubuntu',
      host: 'VOTRE-IP-DEV',
      ref: 'origin/develop',
      repo: 'https://github.com/votre-username/projet-covoiturage.git',
      path: '/home/ubuntu/apps/covoiturage-dev',
      'post-deploy': 'cd backend && npm install && npm run build && pm2 reload ecosystem.config.js --env development'
    }
  }
};

/**
 * COMMANDES PM2 UTILES
 * 
 * Démarrage :
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --env production
 * 
 * Gestion :
 *   pm2 restart covoiturage-api
 *   pm2 reload covoiturage-api     # Zero downtime reload
 *   pm2 stop covoiturage-api
 *   pm2 delete covoiturage-api
 * 
 * Monitoring :
 *   pm2 status
 *   pm2 logs covoiturage-api
 *   pm2 monit
 *   pm2 show covoiturage-api
 * 
 * Logs :
 *   pm2 logs covoiturage-api --lines 100
 *   pm2 logs covoiturage-api --err    # Erreurs seulement
 *   pm2 logs covoiturage-api --out    # Sortie standard seulement
 *   pm2 flush                         # Vider tous les logs
 * 
 * Sauvegarde :
 *   pm2 save                          # Sauvegarder la config actuelle
 *   pm2 startup                       # Configurer le démarrage auto
 *   pm2 unstartup                     # Supprimer le démarrage auto
 * 
 * Mise à jour :
 *   pm2 update                        # Mettre à jour PM2
 * 
 * Déploiement automatique :
 *   pm2 deploy ecosystem.config.js production setup    # Premier déploiement
 *   pm2 deploy ecosystem.config.js production          # Déploiement
 *   pm2 deploy ecosystem.config.js production revert 1 # Revenir en arrière
 * 
 * Métriques avancées (nécessite PM2 Plus - gratuit) :
 *   pm2 plus                          # S'inscrire à PM2 Plus
 *   pm2 link [secret] [public]        # Lier au dashboard web
 * 
 * Modules PM2 utiles :
 *   pm2 install pm2-logrotate         # Rotation automatique des logs
 *   pm2 install pm2-auto-pull         # Auto pull depuis Git
 *   pm2 install pm2-server-monit      # Monitoring serveur
 */

/**
 * CONFIGURATION DE LA ROTATION DES LOGS
 * 
 * Après installation de pm2-logrotate :
 * 
 *   pm2 install pm2-logrotate
 *   pm2 set pm2-logrotate:max_size 10M           # Taille max par fichier
 *   pm2 set pm2-logrotate:retain 30              # Garder 30 fichiers
 *   pm2 set pm2-logrotate:compress true          # Compresser les vieux logs
 *   pm2 set pm2-logrotate:dateFormat YYYY-MM-DD  # Format de date
 *   pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # Rotation à minuit
 */

/**
 * CLUSTERING POUR PLUSIEURS INSTANCES
 * 
 * Pour utiliser plusieurs processus (load balancing) :
 * 
 * module.exports = {
 *   apps: [{
 *     name: 'covoiturage-api',
 *     script: './dist/server.js',
 *     instances: 'max',              // Utiliser tous les CPU disponibles
 *     exec_mode: 'cluster',          // Mode cluster au lieu de fork
 *     max_memory_restart: '500M'
 *   }]
 * };
 * 
 * Note : Le clustering nécessite que votre application soit stateless
 * (pas de session en mémoire, utiliser Redis pour les sessions)
 */

/**
 * VARIABLES D'ENVIRONNEMENT DEPUIS .ENV
 * 
 * PM2 peut charger les variables depuis un fichier .env :
 * 
 *   pm2 start ecosystem.config.js --env-file .env
 * 
 * Ou utiliser le module dotenv dans votre code :
 *   require('dotenv').config();
 */

/**
 * MONITORING AVANCÉ
 * 
 * PM2 Plus (gratuit pour 4 serveurs) offre :
 * - Dashboard web
 * - Alertes par email/SMS
 * - Monitoring CPU/RAM/Disque
 * - Historique des métriques
 * - Logs centralisés
 * - Issue tracking
 * 
 * Inscription : https://pm2.io/
 */

