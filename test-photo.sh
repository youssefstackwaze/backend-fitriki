#!/bin/bash

# Script de test rapide pour l'upload de photos
# Usage: ./test-photo.sh

echo "🧪 Test de l'Upload de Photos de Profil"
echo "======================================="
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis le dossier backend/"
    echo "   Utilisez : cd backend && ./test-photo.sh"
    exit 1
fi

echo "1️⃣ Vérification du fichier .env..."
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env introuvable!"
    echo "   Créez-le à partir de env.example"
    exit 1
fi

echo "✅ Fichier .env trouvé"
echo ""

echo "2️⃣ Vérification des variables Cloudinary..."
if grep -q "CLOUDINARY_CLOUD_NAME=dmxpnnptr" .env && \
   grep -q "CLOUDINARY_API_KEY=854231211996854" .env && \
   grep -q "CLOUDINARY_API_SECRET=" .env; then
    echo "✅ Variables Cloudinary configurées"
else
    echo "⚠️  Variables Cloudinary manquantes ou incomplètes"
    echo "   Vérifiez votre fichier .env"
fi
echo ""

echo "3️⃣ Installation des dépendances..."
npm install --silent
echo "✅ Dépendances installées"
echo ""

echo "4️⃣ Compilation du code TypeScript..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Compilation réussie"
else
    echo "❌ Erreur de compilation"
    exit 1
fi
echo ""

echo "5️⃣ Test de connexion Cloudinary..."
node dist/scripts/test-cloudinary.js
TEST_RESULT=$?
echo ""

if [ $TEST_RESULT -eq 0 ]; then
    echo "🎉 ====================================== 🎉"
    echo "   ✅ TOUS LES TESTS ONT RÉUSSI !"
    echo "   ✅ L'upload de photos est prêt"
    echo "   ✅ Vous pouvez lancer : npm run dev"
    echo "🎉 ====================================== 🎉"
    echo ""
    echo "📱 Pour tester dans l'app :"
    echo "   1. Lancez : npm run dev"
    echo "   2. Ouvrez l'app sur votre téléphone"
    echo "   3. Allez dans Profil → Tapez sur l'avatar"
    echo "   4. Choisissez une photo"
else
    echo "❌ ====================================== ❌"
    echo "   ❌ Échec du test Cloudinary"
    echo "   ⚠️  Vérifiez votre configuration"
    echo "❌ ====================================== ❌"
    echo ""
    echo "💡 Solutions :"
    echo "   1. Vérifiez vos credentials Cloudinary"
    echo "   2. Vérifiez votre connexion internet"
    echo "   3. Consultez GUIDE_PHOTO_PROFIL.md"
    exit 1
fi

