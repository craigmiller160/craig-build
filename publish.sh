#!/bin/bash

check_status() {
  status=$1

  if [[ $status -ne 0 ]]; then
    exit 1
  fi
}

get_version() {
  jq -r .version < package.json
}

increment_beta_if_necessary() {
  version=$1

  if [[ $version =~ ^(.*)-beta\.([0-9]+)$ ]]; then
    base_version="${BASH_REMATCH[1]}"
    beta_number="${BASH_REMATCH[2]}"

    new_beta_number=$((beta_number + 1))

    new_version="${base_version}-beta.${new_beta_number}"

    echo "$new_version"
  else
    echo "$version"
  fi
}

version=$(get_version)
check_status $?

new_version=$(increment_beta_if_necessary "$version")
check_status $?

exit 0

npm version --allow-same-version --no-git-tag-version $1 && npm publish
if [ $? -eq 0 ]; then
  git add package.json
  git commit -m "Bumped version"
  git push
fi
