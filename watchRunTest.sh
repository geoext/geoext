# ======================================================================
#@author Kai Volland
#inotify is required to use this Script http://wiki.ubuntuusers.de/inotify
#apt-get install inotify-tools
# ======================================================================

while true; do inotifywait -e modify -rq test/ src/ --format %T' '%w%f' modified ' --timefmt %T &&
 ./node_modules/phantomjs/bin/phantomjs ./node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee test/index.html;
done
