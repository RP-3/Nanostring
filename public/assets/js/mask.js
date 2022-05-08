// Mask (by setting RGB = 255,0,0) every pixel in the img/canvas that (r+g+b)/3 > threshold.
function pixelMask(img, canvas, threshold){
    console.log(`pixelMask::threshold(${threshold})`);
    const ctx = canvas.getContext("2d");
    const start = Date.now();
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, _] = [data[i], data[i+1], data[i+2], data[i+3]];
        const avg = (r + g + b) / 3;

        if(avg > threshold){
            data[i] = 255;
            data[i+1] = 0;
            data[i+2] = 0;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    console.log(`pixelMask complete in ${Date.now() - start}ms`);
}

// Converts the PNG to a strictly two-colour image using the following rules:
// 1. If a pixel is green (0,255,0), it is converted to black, else
// 2. If a pixel is red (255,0,0), it is converted to white, else
// 3. It is converted to black,
// where black is (0,0,0) and white is (255,255,255).
// If that sounds overcomplicated, it is. We're basically converting red things to white, and everything else to black,
// but I wanted to formally spell out the rules.
function finaliseMask(img, canvas){
    console.log(`finalisation`);
    const start = Date.now();
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // save the pixels that will eventually be white
    const whitePixels = [];
    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, _] = [data[i], data[i+1], data[i+2], data[i+3]];
        if(r === 255 && b === 0 && g === 0) whitePixels.push(i);
    }

    // make everything else black
    ctx.drawImage(img, 0, 0);
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;
        data[i+1] = 0;
        data[i+2] = 0;
    }

    // paint the white ones white.
    whitePixels.forEach((i) => {
        data[i] = 255;
        data[i+1] = 255;
        data[i+2] = 255;
    })

    ctx.putImageData(imageData, 0, 0);
    console.log(`finalisation complete in ${Date.now() - start}ms`);
}

// DoubleMask (by setting RGB = 0,255,0) every pixel in the writeCanvas who's corresponding pixel in the readCanvas has
// RGB = 255,0,0, in effect deleniating pixels to be 'subtracted' from the writeCanvas mask in a subsequent step.
function subtractMask(readCanvas, writeCanvas, writeImg){
    console.log(`subtraction`);
    const start = Date.now();
    const writeCtx = writeCanvas.getContext("2d");
    const writeImgData = writeCtx.getImageData(0, 0, writeCanvas.width, writeCanvas.height);
    const writeData = writeImgData.data;

    const wasRed = new Set();
    for (let i = 0; i < writeData.length; i += 4) {
        const r = writeData[i];
        if(r === 255) wasRed.add(i);
    }

    writeCtx.drawImage(writeImg, 0, 0);

    const readCtx = readCanvas.getContext("2d");
    const readImgData = readCtx.getImageData(0, 0, readCanvas.width, readCanvas.height);
    const readData = readImgData.data;

    for (let i = 0; i < readData.length; i += 4) {
        const [r, g, b, _] = [readData[i], readData[i+1], readData[i+2], readData[i+3]];
        if(r === 255 && g === 0 && b === 0){ // red pixel in second slice
            writeData[i] = 0;
            writeData[i+1] = 255; // pure green
            writeData[i+2] = 0;
        } else if(wasRed.has(i)){ // red pixel in third slice
            writeData[i] = 255; // pur red
            writeData[i+1] = 0;
            writeData[i+2] = 0;
        }
    }
    writeCtx.putImageData(writeImgData, 0, 0);
    console.log(`subtraction complete in ${Date.now() - start}ms`);
}

// Mask (by setting RGB = 255,0,0) every pixel in the img/canvas that (r+g+b)/3 > threshold and that is part of a
// contiguous set of at least minSize pixels. Contiguous means vertically or horizontally (but not diagonally) adjacent.
function pixelGraphMask(img, canvas, threshold, minSize){
    console.log(`pixelGraphMask::threshold(${threshold})::minSize(${minSize})`);
    const start = Date.now();

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const seen = new Array(width * canvas.height).fill(false);
    const colored = new Array(width * canvas.height).fill(false);
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, canvas.height);
    const data = imageData.data;

    const bigEnough = (c) => {
        const stack = [c];
        let size = 0;

        while(stack.length){
            const i = stack.pop();
            if(seen[i] || i < 0 || i >= data.length) continue; // seen or OOB
            seen[i] = true;
            const [r, g, b, _] = [data[i], data[i+1], data[i+2], data[i+3]];
            const avg = (r + g + b) / 3;
            if(avg >= threshold){
                size++;
                if(size >= minSize) return true;
                stack.push(i+4, i-4, i - width*4, i + width*4);
            }

        }

        return false;
    };

    const paintIsland = (c) => {
        const stack = [c];

        while(stack.length){
            const i = stack.pop();
            if(colored[i] || i < 0 || i >= data.length) continue; // colored or OOB
            colored[i] = true;
            const [r, g, b, _] = [data[i], data[i+1], data[i+2], data[i+3]];
            const avg = (r + g + b) / 3;
            if(avg >= threshold){
                // color
                data[i] = 255;
                data[i+1] = 0;
                data[i+2] = 0;
                // recurse
                stack.push(i+4, i-4, i - width*4, i + width*4);
            }
        }
    }

    for (let i = 0; i < data.length; i += 4) {
        if(bigEnough(i)) paintIsland(i);
    }
    ctx.putImageData(imageData, 0, 0);
    console.log(`pixelGraphMask complete in ${Date.now() - start}ms`);
}

// Mask (by setting RGB = 255,0,0) every pixel in the img/canvas for which the surrounding `radius` pixels above, below,
// left and right have a mean brightness [(r+g+b)/3] > threshold.
function kernelmask(img, canvas, threshold, radius){
    console.log(`kernelMask::threshold(${threshold})::radius(${radius})`);
    const start = Date.now();
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const targetCells = [];
    for (let i = 0; i < data.length; i += 4) {
        if(avgKernel(canvas, data, i, radius) > threshold){
            targetCells.push(i);
        }
    }

    targetCells.forEach((i) => {
        data[i] = 255;
        data[i+1] = 0;
        data[i+2] = 0;
    });

    ctx.putImageData(imageData, 0, 0);
    console.log(`kernelmask complete in ${Date.now() - start}ms`);
}

// Returns the mean brightness for a kernel originating at i and radiating `radius` pixels out (up, down, left, right).
function avgKernel(canvas, data, i, radius){
    const width = canvas.width;

    const pixels = [];
    const topLeft = i - (radius * width * 4) - (radius * 4);
    for(let row=0; row<radius*2; row++){
        const rowStart = topLeft + (row*width*4);
        for(let col=0; col < radius*2; col++){
            const pixel = rowStart + (col * 4);
            if(pixel < 0 || pixel > data.length) continue;
            const [r, g, b, _] = [data[pixel], data[pixel+1], data[pixel+2], data[pixel+3]];
            const avg = (r + g + b) / 3;
            pixels.push(avg);
        }
    }

    const totalLuminance = pixels.reduce((a, b) => a + b);
    return totalLuminance / pixels.length;
}
