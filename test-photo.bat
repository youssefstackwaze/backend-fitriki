@echo off
REM Script de test rapide pour l'upload de photos (Windows)
REM Usage: test-photo.bat

echo.
echo ===========================================
echo   Test de l'Upload de Photos de Profil
echo ===========================================
echo.

REM Vérifier qu'on est dans le bon dossier
if not exist "package.json" (
    echo [31mErreur : Ce script doit etre execute depuis le dossier backend/[0m
    echo   Utilisez : cd backend && test-photo.bat
    exit /b 1
)

echo [32m1. Verification du fichier .env...[0m
if not exist ".env" (
    echo [31mFichier .env introuvable![0m
    echo   Creez-le a partir de env.example
    exit /b 1
)
echo [32m   OK - Fichier .env trouve[0m
echo.

echo [32m2. Verification des variables Cloudinary...[0m
findstr /C:"CLOUDINARY_CLOUD_NAME=dmxpnnptr" .env >nul
if %errorlevel% neq 0 (
    echo [33m   Attention : CLOUDINARY_CLOUD_NAME non configure[0m
) else (
    echo [32m   OK - Variables configurees[0m
)
echo.

echo [32m3. Installation des dependances...[0m
call npm install --silent >nul 2>&1
echo [32m   OK - Dependances installees[0m
echo.

echo [32m4. Compilation du code TypeScript...[0m
call npm run build >nul 2>&1
if %errorlevel% neq 0 (
    echo [31mErreur de compilation[0m
    exit /b 1
)
echo [32m   OK - Compilation reussie[0m
echo.

echo [32m5. Test de connexion Cloudinary...[0m
echo.
node dist\scripts\test-cloudinary.js
set TEST_RESULT=%errorlevel%
echo.

if %TEST_RESULT% equ 0 (
    echo.
    echo ===========================================
    echo   [32mTOUS LES TESTS ONT REUSSI ![0m
    echo   [32mL'upload de photos est pret[0m
    echo   [32mVous pouvez lancer : npm run dev[0m
    echo ===========================================
    echo.
    echo [36mPour tester dans l'app :[0m
    echo   1. Lancez : npm run dev
    echo   2. Ouvrez l'app sur votre telephone
    echo   3. Allez dans Profil - Tapez sur l'avatar
    echo   4. Choisissez une photo
    echo.
) else (
    echo.
    echo ===========================================
    echo   [31mEchec du test Cloudinary[0m
    echo   [33mVerifiez votre configuration[0m
    echo ===========================================
    echo.
    echo [36mSolutions :[0m
    echo   1. Verifiez vos credentials Cloudinary
    echo   2. Verifiez votre connexion internet
    echo   3. Consultez GUIDE_PHOTO_PROFIL.md
    echo.
    exit /b 1
)

