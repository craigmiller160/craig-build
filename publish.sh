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

is_beta() {
  version="$1"

  if [[ $version =~ ^(.*)-beta\.([0-9]+)$ ]]; then
    return 0
  else
    return 1
  fi
}

increment_beta_if_necessary() {
  version="$1"

  if  is_beta "$version" ; then
    base_version="${BASH_REMATCH[1]}"
    beta_number="${BASH_REMATCH[2]}"

    new_beta_number=$((beta_number + 1))

    new_version="${base_version}-beta.${new_beta_number}"

    echo "$new_version"
  else
    echo "$version"
  fi
}

npm_publish() {
  version="$1"

  if is_beta "$version" ; then
    npm version \
      --allow-same-version \
      --no-git-tag-version \
      "$1"
  else
    npm version \
      --allow-same-version \
      "$1"
  fi

  npm publish
}

commit_package_json_changes() {
  changes=$(git status --porcelain | grep "package.json")
  if [[ "$changes" =~ ^\sM\spackage\.json$ ]]; then
    git add package.json
    git commit -m "Bumped version"
    git push
  fi
}

version=$(get_version)
check_status $?

new_version=$(increment_beta_if_necessary "$version")
check_status $?

echo "Publishing version $new_version"

npm_publish "$new_version"
check_status $?

commit_package_json_changes
check_status $?