#!/bin/bash
DATE=$(date +"%d/%m/%Y")

git checkout --orphan temp_branch
git add .
git commit -m "$DATE" || echo "no changes"
git branch -D master 2>/dev/null
git branch -m master
git push origin master -f