#!/bin/bash

# 🚀 Script de déploiement pour OVH
# Ce script aide à automatiser le déploiement et la mise à jour

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="covoiturage-api"
APP_DIR="$HOME/apps/projet-covoiturage/backend"
PM2_NAME="covoiturage-api"

echo -e "${BLUE}🚀 Script de déploiement OVH - Covoiturage API${NC}\n"

# Fonction pour afficher un message de succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher un message d'erreur
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour afficher un message d'info
info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Vérifier si on est dans le bon répertoire
check_directory() {
    if [ ! -f "package.json" ]; then
        error "Ce script doit être exécuté depuis le répertoire backend"
        exit 1
    fi
    success "Répertoire correct"
}

# Menu principal
show_menu() {
    echo -e "\n${BLUE}Que voulez-vous faire ?${NC}"
    echo "1) 📥 Premier déploiement complet"
    echo "2) 🔄 Mettre à jour le code (git pull)"
    echo "3) 🔨 Rebuild et redémarrer"
    echo "4) 🔁 Redémarrer l'application"
    echo "5) 📊 Voir les logs"
    echo "6) 📈 Voir le statut"
    echo "7) 🛑 Arrêter l'application"
    echo "8) ▶️  Démarrer l'application"
    echo "9) 🧪 Tester l'API"
    echo "10) 🧹 Nettoyer (node_modules, dist)"
    echo "0) ❌ Quitter"
    echo -n "Votre choix: "
}

# Premier déploiement
first_deploy() {
    info "Début du premier déploiement..."
    
    # Installer les dépendances
    info "Installation des dépendances..."
    npm install
    if [ $? -eq 0 ]; then
        success "Dépendances installées"
    else
        error "Erreur lors de l'installation des dépendances"
        return 1
    fi
    
    # Vérifier si .env existe
    if [ ! -f ".env" ]; then
        error "Le fichier .env n'existe pas !"
        info "Copiez env.example vers .env et configurez-le"
        echo "cp env.example .env"
        echo "nano .env"
        return 1
    fi
    success "Fichier .env trouvé"
    
    # Créer le dossier logs
    mkdir -p logs
    success "Dossier logs créé"
    
    # Build
    info "Compilation TypeScript..."
    npm run build
    if [ $? -eq 0 ]; then
        success "Build réussi"
    else
        error "Erreur lors du build"
        return 1
    fi
    
    # Démarrer avec PM2
    info "Démarrage avec PM2..."
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start dist/server.js --name "$PM2_NAME"
    fi
    
    if [ $? -eq 0 ]; then
        success "Application démarrée avec PM2"
        pm2 save
        info "Configuration PM2 sauvegardée"
    else
        error "Erreur lors du démarrage"
        return 1
    fi
    
    success "Premier déploiement terminé !"
    info "N'oubliez pas de configurer Nginx et le firewall"
}

# Mettre à jour le code
update_code() {
    info "Mise à jour du code..."
    
    # Sauvegarder les changements locaux
    git stash
    
    # Pull
    git pull origin main
    if [ $? -eq 0 ]; then
        success "Code mis à jour"
    else
        error "Erreur lors du git pull"
        return 1
    fi
    
    # Réinstaller les dépendances
    info "Mise à jour des dépendances..."
    npm install
    
    # Rebuild
    info "Recompilation..."
    npm run build
    
    # Redémarrer
    info "Redémarrage de l'application..."
    pm2 restart "$PM2_NAME"
    
    success "Mise à jour terminée !"
}

# Rebuild et redémarrer
rebuild() {
    info "Rebuild et redémarrage..."
    
    # Build
    npm run build
    if [ $? -eq 0 ]; then
        success "Build réussi"
    else
        error "Erreur lors du build"
        return 1
    fi
    
    # Redémarrer
    pm2 restart "$PM2_NAME"
    success "Application redémarrée"
}

# Redémarrer
restart() {
    info "Redémarrage de l'application..."
    pm2 restart "$PM2_NAME"
    success "Application redémarrée"
}

# Voir les logs
show_logs() {
    info "Affichage des logs (Ctrl+C pour quitter)..."
    pm2 logs "$PM2_NAME"
}

# Voir le statut
show_status() {
    info "Statut de l'application:"
    pm2 status "$PM2_NAME"
    echo ""
    pm2 show "$PM2_NAME"
}

# Arrêter
stop() {
    info "Arrêt de l'application..."
    pm2 stop "$PM2_NAME"
    success "Application arrêtée"
}

# Démarrer
start() {
    info "Démarrage de l'application..."
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start dist/server.js --name "$PM2_NAME"
    fi
    success "Application démarrée"
}

# Tester l'API
test_api() {
    info "Test de l'API..."
    echo ""
    
    # Test local
    echo -e "${BLUE}Test local (localhost:3000):${NC}"
    curl -s http://localhost:3000/health | json_pp 2>/dev/null || curl -s http://localhost:3000/health
    echo ""
    
    # Test via Nginx (si disponible)
    echo -e "${BLUE}Test via Nginx:${NC}"
    if command -v curl &> /dev/null; then
        # Essayer de détecter l'IP ou le domaine
        PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null)
        if [ -n "$PUBLIC_IP" ]; then
            echo "IP publique: $PUBLIC_IP"
            curl -s "http://$PUBLIC_IP/health" | json_pp 2>/dev/null || curl -s "http://$PUBLIC_IP/health"
        fi
    fi
    echo ""
}

# Nettoyer
clean() {
    info "Nettoyage..."
    read -p "Êtes-vous sûr de vouloir supprimer node_modules et dist ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf node_modules dist
        success "Nettoyage terminé"
        info "Exécutez 'npm install' et 'npm run build' pour reconstruire"
    else
        info "Nettoyage annulé"
    fi
}

# Vérifier si PM2 est installé
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        error "PM2 n'est pas installé"
        info "Installez PM2 avec: sudo npm install -g pm2"
        exit 1
    fi
}

# Script principal
main() {
    check_directory
    check_pm2
    
    while true; do
        show_menu
        read choice
        
        case $choice in
            1)
                first_deploy
                ;;
            2)
                update_code
                ;;
            3)
                rebuild
                ;;
            4)
                restart
                ;;
            5)
                show_logs
                ;;
            6)
                show_status
                ;;
            7)
                stop
                ;;
            8)
                start
                ;;
            9)
                test_api
                ;;
            10)
                clean
                ;;
            0)
                info "Au revoir !"
                exit 0
                ;;
            *)
                error "Choix invalide"
                ;;
        esac
        
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
    done
}

# Exécuter le script
main

