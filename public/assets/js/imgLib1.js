window.addEventListener("load", function() {
    const canvas = document.getElementById("canvas-1");
    const uploadFile = document.getElementById("upload-file-1");
    let img = new Image();
    let threshold = 100;
    let kernelSize = 3;
    let fileName = "";
    // upload File
    uploadFile.addEventListener("change", () => {
        const file = document.getElementById("upload-file-1").files[0];

        const reader = new FileReader();
        if(!file) return alert("No file found");
        fileName = file.name;
        reader.readAsDataURL(file);

        // add image to canvas
        const ctx = canvas.getContext("2d");
        reader.addEventListener("load", () => {
            img = new Image();
            img.src = reader.result;
            img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            };
        }, false);
    });

    const downloadBtn = document.getElementById("download-1");
    downloadBtn.addEventListener("click", () => {
        let newFilename = fileName.substring(0, fileName.length - 4) + "_masked.png";
        const link = document.createElement("a");
        link.download = newFilename;
        link.href = canvas.toDataURL("image/png", 1);
        link.dispatchEvent(new MouseEvent("click"));
    });

    const finaliseBtn = document.getElementById("finalise-1");
    finaliseBtn.addEventListener("click", () => finaliseMask(img, canvas));

    const thresholdSlider = document.getElementById("threshold-1");
    thresholdSlider.addEventListener(('change'), (e) => {
        threshold = parseInt(e.target.value);
        maskButton.click();
    });

    const kernelSlider = document.getElementById("kernel-1");
    kernelSlider.addEventListener(('change'), (e) => {
        kernelSize = parseInt(e.target.value);
        maskButton.click();
    });

    const maskButton = document.getElementById("mask-1");
    maskButton.addEventListener("click", () => {
        const value = document.querySelector('input[name="method-1"]:checked').value;
        if(value === 'kernel') kernelmask(img, canvas, threshold, kernelSize);
        if(value === 'pixelGraph') pixelGraphMask(img, canvas, threshold, kernelSize*10);
        if(value === 'pixel') pixelMask(img, canvas, threshold);
    });
});
