// Extract the second and third images from a stacked tiff of size 3.
// Save each as a separate 8-bit PNG adopting the following filename transformation:
// t(x.tiff) -> (x_2.png, x_3.png)
//
// Run with java -jar -Xmx4096m ~/Applications/ImageJ.app/Contents/Java/ij.jar --headless -macro extract.js

importClass(Packages.ij.IJ);
importClass(Packages.ij.plugin.frame.RoiManager);
importClass(Packages.ij.gui.GenericDialog);

var args = getArgument().split(','); // args arrive as a single string
var inputFilePath = args[0];
var outputPath = args[1];

imp = IJ.openImage(inputFilePath);

var inputFileName = inputFilePath.split('/').pop().replace('tiff', '');

IJ.run(imp, "8-bit", "");
imp.show();
IJ.saveAs(imp, "PNG", outputPath+inputFileName+'_2.png');
IJ.run("Quit");
