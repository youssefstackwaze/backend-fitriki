@echo off
REM ================================
REM Script de démarrage Docker
REM Backend Covoiturage (Windows)
REM ================================

echo 🐳 Démarrage du Backend Covoiturage avec Docker...
echo.

REM Vérifier si Docker est installé
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker n'est pas installé. Installez-le depuis https://docker.com
    pause
    exit /b 1
)

REM Vérifier si docker-compose est installé
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose n'est pas installé.
    pause
    exit /b 1
)

REM Vérifier si le fichier .env existe
if not exist .env (
    echo ⚠️  Le fichier .env n'existe pas.
    echo 📝 Création depuis le template...
    
    if exist env.docker.template (
        copy env.docker.template .env
        echo ✅ Fichier .env créé !
        echo.
        echo ⚠️  IMPORTANT: Éditez le fichier .env et changez au minimum:
        echo    - JWT_SECRET (OBLIGATOIRE^)
        echo    - MONGO_PASSWORD (recommandé^)
        echo.
        echo Voulez-vous éditer maintenant? (o/n^)
        set /p response=
        if /i "%response%"=="o" (
            notepad .env
        )
    ) else (
        echo ❌ Template env.docker.template introuvable !
        pause
        exit /b 1
    )
)

echo.
echo 🔨 Construction des images Docker...
docker-compose build

echo.
echo 🚀 Démarrage des services...
docker-compose up -d

echo.
echo ⏳ Attente du démarrage complet...
timeout /t 5 /nobreak >nul

echo.
echo 📊 Status des services:
docker-compose ps

echo.
echo ✅ Backend démarré avec succès !
echo.
echo 📍 URL: http://localhost:3000
echo.
echo 📝 Commandes utiles:
echo    - Voir les logs:    docker-compose logs -f backend
echo    - Arrêter:          docker-compose down
echo    - Redémarrer:       docker-compose restart
echo.
echo 🧪 Test de l'API:
curl -s http://localhost:3000/health
if %errorlevel% equ 0 (
    echo ✅ API fonctionne !
) else (
    echo ⚠️  API ne répond pas encore, attendez quelques secondes...
)
echo.
pause


