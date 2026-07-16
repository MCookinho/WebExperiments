#!/bin/bash

# Quick commit and push script
# Usage: ./deploy.sh "your commit message"

cd "$(dirname "$0")"

if [ -z "$1" ]; then
    echo "Enter commit message:"
    read -r message
else
    message="$1"
fi

echo "Building AnimePointerPointer..."
cd Projects/AnimePointerPointer
npm run build
cd "$(dirname "$0")"

git add .
git commit -m "$message"
git push

echo "Done!"