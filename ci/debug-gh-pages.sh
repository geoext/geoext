#!/usr/bin/env bash
set -e

echo "Debugging the update-gh-pages update script"

echo "\$TRAVIS_PULL_REQUEST: $TRAVIS_PULL_REQUEST"
echo "\$TRAVIS_BRANCH: $TRAVIS_BRANCH"

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    echo "This looks like a pull request, not doing anything."
fi

if [[ "$TRAVIS_BRANCH" =~ ^master|v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Target branch is neither 'master' nor expected version, not doing anything."
fi
