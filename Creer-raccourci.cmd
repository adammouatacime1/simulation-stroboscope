@echo off
setlocal
title Creer le raccourci Stroboscope
set "STROBOSCOPE_DIR=%~dp0"
if not exist "%~dp0Demarrer-Stroboscope.cmd" goto lanceur_manquant

powershell.exe -NoLogo -NoProfile -Command "$ErrorActionPreference = 'Stop'; try { $desktop = [Environment]::GetFolderPath('DesktopDirectory'); if (-not $desktop) { throw 'Le dossier Bureau est introuvable.' }; $path = Join-Path $desktop 'Stroboscope.lnk'; $target = Join-Path $env:STROBOSCOPE_DIR 'Demarrer-Stroboscope.cmd'; $shell = New-Object -ComObject WScript.Shell; $shortcut = $shell.CreateShortcut($path); if ((Test-Path -LiteralPath $path) -and $shortcut.TargetPath -ne $target) { throw 'Un autre raccourci Stroboscope existe deja. Renommez-le avant de recommencer.' }; $shortcut.TargetPath = $target; $shortcut.WorkingDirectory = $env:STROBOSCOPE_DIR; $shortcut.WindowStyle = 7; $shortcut.Description = 'Ouvrir le laboratoire Stroboscope'; $shortcut.Save(); Write-Host 'Le raccourci Stroboscope est cree sur votre Bureau.' } catch { Write-Host $_.Exception.Message; exit 1 }"
if errorlevel 1 goto creation_echouee
echo.
echo Desormais, double-cliquez sur Stroboscope sur votre Bureau.
echo Gardez le dossier de l'application a son emplacement actuel.
pause
exit /b 0

:creation_echouee
echo.
echo Le raccourci n'a pas pu etre cree.
echo Vous pouvez aussi faire un clic droit sur Demarrer-Stroboscope.cmd,
echo puis Afficher plus d'options, Envoyer vers, Bureau (creer un raccourci).
pause
exit /b 1

:lanceur_manquant
echo Le fichier Demarrer-Stroboscope.cmd est introuvable.
echo Extrayez entierement le ZIP avant de creer le raccourci.
pause
exit /b 1
