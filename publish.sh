#!/bin/sh

yarn publish --no-git-tag-version --new-version $1
git add package.json
git commit -m "Bumped version"
git push