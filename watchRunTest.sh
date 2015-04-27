# ======================================================================
#@author Kai Volland
#inotify is required to use this Script http://wiki.ubuntuusers.de/inotify
#apt-get install inotify-tools
# ======================================================================

while true; do inotifywait -e modify -rq test/ src/ --format %T' '%w%f' modified ' --timefmt %T &&
 npm test;
done
