/*
git reset HEAD
git status --porcelain | grep package.json | sed 's/^ M //g' | xargs git add
git status --porcelain | grep -i '^M'
 */

export default {};
