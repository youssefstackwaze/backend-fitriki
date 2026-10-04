#!/bin/bash

# ================================
# Script de démarrage Docker
# Backend Covoiturage
# ================================

echo "🐳 Démarrage du Backend Covoiturage avec Docker..."
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installez-le depuis https://docker.com"
    exit 1
fi

# Vérifier si docker-compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    exit 1
fi

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "⚠️  Le fichier .env n'existe pas."
    echo "📝 Création depuis le template..."
    
    if [ -f env.docker.template ]; then
        cp env.docker.template .env
        echo "✅ Fichier .env créé !"
        echo ""
        echo "⚠️  IMPORTANT: Éditez le fichier .env et changez au minimum:"
        echo "   - JWT_SECRET (OBLIGATOIRE)"
        echo "   - MONGO_PASSWORD (recommandé)"
        echo ""
        echo "Voulez-vous éditer maintenant? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        echo "❌ Template env.docker.template introuvable !"
        exit 1
    fi
fi

echo ""
echo "🔨 Construction des images Docker..."
docker-compose build

echo ""
echo "🚀 Démarrage des services..."
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage complet..."
sleep 5

echo ""
echo "📊 Status des services:"
docker-compose ps

echo ""
echo "✅ Backend démarré avec succès !"
echo ""
echo "📍 URL: http://localhost:3000"
echo ""
echo "📝 Commandes utiles:"
echo "   - Voir les logs:    docker-compose logs -f backend"
echo "   - Arrêter:          docker-compose down"
echo "   - Redémarrer:       docker-compose restart"
echo ""
echo "🧪 Test de l'API:"
curl -s http://localhost:3000/health && echo "✅ API fonctionne !" || echo "⚠️  API ne répond pas encore, attendez quelques secondes..."
echo ""


