@echo off
title Laboratorio Algoritmi UNICT
echo Avvio del server React in corso... 
echo Il browser si aprira' in automatico tra pochi secondi!

:: Si sposta nella cartella esatta in cui si trova questo file .bat
cd /d "%~dp0"

:: Avvia il server locale e apre il browser
npm run dev -- --open