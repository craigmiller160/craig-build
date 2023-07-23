#!/bin/sh

npm version --allow-same-version --no-git-tag-version $1 && npm publish
if [ $? -eq 0 ]; then
  git add package.json
  git commit -m "Bumped version"
  git push
fi
