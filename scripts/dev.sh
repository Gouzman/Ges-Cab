#!/bin/bash

# Démarrer le serveur en arrière-plan
node src/server.js &
SERVER_PID=$!

# Démarrer le client Vite
npm run dev

# Quand le client se termine, arrêter le serveur
kill $SERVER_PID