#!/bin/bash
SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
FILES="$SCRIPTPATH/workingDirectory/masked/*"
OUTPUT="$SCRIPTPATH/workingDirectory/masked8Bit/"

for f in $FILES
do
    if [[ $f == *.png ]]
    then
        echo "Processing $f file..."
        java -jar -Xmx4096m ~/Applications/ImageJ.app/Contents/Java/ij.jar --headless -macro saveAs8Bit.js "$f,$OUTPUT"
    fi
done
