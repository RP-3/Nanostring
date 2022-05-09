#!/bin/bash
SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
FILES="$SCRIPTPATH/workingDirectory/input/*"
OUTPUT="$SCRIPTPATH/workingDirectory/output/"

for f in $FILES
do
    if [[ $f == *.tiff ]]
    then
        echo "Processing $f file..."
        java -jar -Xmx4096m ~/Applications/ImageJ.app/Contents/Java/ij.jar --headless -macro extractAll.js "$f,$OUTPUT"
    fi
done
