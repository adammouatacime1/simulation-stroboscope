@echo off
setlocal
title Stroboscope
cd /d "%~dp0"
if errorlevel 1 goto dossier_introuvable

where node >nul 2>&1
if errorlevel 1 goto node_manquant
where npm.cmd >nul 2>&1
if errorlevel 1 goto node_manquant

if exist "node_modules\.bin\vite.cmd" goto demarrer
echo Premiere utilisation : installation des composants...
echo Une connexion Internet est necessaire. Veuillez patienter.
call npm ci
if errorlevel 1 goto installation_echouee

:demarrer
echo Ouverture de Stroboscope dans votre navigateur...
echo Gardez cette fenetre ouverte ou reduite pendant l'utilisation.
echo Pour arreter l'application, fermez cette fenetre.
echo.
call npm run dev -- --host 127.0.0.1 --open
if errorlevel 1 goto demarrage_echoue
exit /b 0

:node_manquant
echo Node.js est introuvable. Installez Node.js 24 LTS depuis :
echo https://nodejs.org/fr
echo Puis relancez ce fichier.
pause
exit /b 1

:installation_echouee
echo.
echo L'installation a echoue. Verifiez votre connexion Internet.
echo Prenez une photo du message ci-dessus pour demander de l'aide.
pause
exit /b 1

:demarrage_echoue
echo.
echo Le demarrage a echoue. Prenez une photo du message ci-dessus.
pause
exit /b 1

:dossier_introuvable
echo Le dossier de l'application est inaccessible.
echo Extrayez entierement le ZIP dans un dossier local, puis recommencez.
pause
exit /b 1
