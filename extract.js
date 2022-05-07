// Extract the second and third images from a stacked tiff of size 3.
// Save each as a separate 8-bit PNG adopting the following filename transformation:
// t(x.tiff) -> (x_2.png, x_3.png)
//
// Run with java -jar -Xmx4096m ~/Applications/ImageJ.app/Contents/Java/ij.jar --headless -macro extract.js

importClass(Packages.ij.IJ);
importClass(Packages.ij.plugin.frame.RoiManager);
importClass(Packages.ij.gui.GenericDialog);

var input = "/Users/tubby/code/nanostring/public/workingDirectory/input/";
var output = "/Users/tubby/code/nanostring/public/workingDirectory/output/";

imp = IJ.openImage(input + "001.tiff");
IJ.run(imp, "8-bit", "");
imp.show();
imp.setSlice(2);
IJ.saveAs(imp, "PNG", output + "001_2.png");
IJ.setSlice(3);
IJ.saveAs(imp, "PNG", output + "001_3.png");
imp.close();
IJ.run("Quit");
