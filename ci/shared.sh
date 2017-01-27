#!/usr/bin/env bash
set -e

# ------------------------------------------------------------------------------
# This script is supposed to be called from Travis continuous integration server
#
# It contains a basic check that will abort if the script is executed elsewhere.
#
# Basically we set up shared variables here that are used in the main ci-scripts
# `ci/create-sencha-environment.sh` and `ci/create-sencha-package`.
# ------------------------------------------------------------------------------

# Only do something on travis
if [ "$TRAVIS" != "true" ]; then
    echo "This script is supposed to be run inside the travis environment."
    exit 1
fi

# Where we will downloaded fils go? Cached between builds via travis
DOWN_DIR="$TRAVIS_BUILD_DIR/__download"

# Where we will we install the sencha cmd? Cached between builds via travis
INSTALL_DIR="$TRAVIS_BUILD_DIR/__install"

# The sencha workspace, won't be cached but be regenerated on every build
SENCHA_WS="/tmp/sencha-workspace"

# Where will the source of the GeoExt package live in the sencha workspace?
GEOEXT_IN_SENCHA_WS_FOLDER="$SENCHA_WS/packages/geoext3"

# A temporary directory into which we'll extract a generated package to
# gather some statistics for the build
STATS_DIR="/tmp/build-stats"

# This is the executable sencha command once it has been installed
SENCHA_CMD="$INSTALL_DIR/sencha"

# The version of sencha command to download and install
SENCHA_CMD_VERSION="6.2.1.29"

# The version of ExtJS to download and configure the sencha workspace with
SENCHA_EXTJS_VERSION="6.2.0"

# The resource of GeoExt we copy over from the current PR or build over to
# the $GEOEXT_IN_SENCHA_WS_FOLDER
COPY_RESOURCES=".sencha resources sass src package.json build.xml LICENSE"

# The name of the package
GEOEXT_PACKAGE_NAME="GeoExt" # see the 'name'-prop of package.json
GEOEXT_PACKAGE_VERSION=$(node -e 'console.log(require("./package.json").version)')

# Properties to create a local package repository
GEOEXT_REPO_NAME="GeoExt Contributors" # see the 'creator'-prop of package.json
GEOEXT_REPO_EMAIL="dev@geoext.org"
