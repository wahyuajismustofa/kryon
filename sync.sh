#!/bin/bash

# Tarik perubahan dari remote
git fetch origin main

# Cek apakah lokal berbeda dengan remote
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "Ada perbedaan antara lokal dan remote. Menarik perubahan..."
  git pull origin main
else
  echo "Tidak ada perbedaan dengan remote."
fi

# Cek apakah ada perubahan lokal (belum di-commit)
if [ -n "$(git status --porcelain)" ]; then
  echo "Ada perubahan lokal. Menambahkan dan mengirim..."
  
  # Mendapatkan waktu saat ini dalam format HH:MM DD/MM/YYYY
  TIMESTAMP=$(date +"%H:%M %d/%m/%Y")

  # Commit dengan pesan yang menyertakan waktu saat ini
  git add .
  git commit -m "Auto-sync $TIMESTAMP"
  git push origin main
else
  echo "Tidak ada perubahan lokal. Tidak ada yang perlu disinkronkan."
fi
