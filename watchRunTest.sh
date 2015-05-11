#!/usr/bin/env bash

# ======================================================================
# @author Kai Volland
# inotify is required to use this Script http://wiki.ubuntuusers.de/inotify
# apt-get install inotify-tools
# ======================================================================

function require_program_or_exit {
  command -v $1 >/dev/null 2>&1 || { echo >&2 "Program '$1' is required but isn't installed. Aborting."; exit 1; }
}

# check if we have inotifywait, node and npm
require_program_or_exit "inotifywait"
require_program_or_exit "node"
require_program_or_exit "npm"


FOLDERS="test/ src/";
WAIT_FOR_CHANGES="Waiting for changes in these folders: $FOLDERS";

# Capture CTRL-C (SIGINT=2) and exit
trap 'echo "... Exiting as requested"; exit 0;' 2

echo $WAIT_FOR_CHANGES;
while true; do inotifywait -e modify -rq $FOLDERS --format %T' '%w%f' modified ' --timefmt %T &&
  npm test;
  echo $WAIT_FOR_CHANGES;
done
