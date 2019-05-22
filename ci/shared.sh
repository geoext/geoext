#!/usr/bin/env bash
set -e

# ------------------------------------------------------------------------------
# This script is supposed to be called from Travis continuous integration server
#
# It contains a basic check that will abort if the script is executed elsewhere.
#
# Basically we set up shared variables here that are used in the main ci-script
# `ci/update-gh-pages.sh`.
# ------------------------------------------------------------------------------

# Only do something on travis
if [ "$TRAVIS" != "true" ]; then
    echo "This script is supposed to be run inside the travis environment."
    exit 1
fi

# Where we will downloaded fils go? Cached between builds via travis
DOWN_DIR="$TRAVIS_BUILD_DIR/__download"

# The version of ExtJS to download and configure the sencha workspace with
SENCHA_EXTJS_VERSION="6.2.0"

# The name of the package
GEOEXT_PACKAGE_NAME="GeoExt" # see the 'name'-prop of package.json
GEOEXT_PACKAGE_VERSION=$(node -e 'console.log(require("./package.json").version)')
