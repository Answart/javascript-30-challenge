const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
      if ("srcObject" in video) {
        // Older browsers may not have srcObject
        video.srcObject = stream;
      } else {
        // Avoid using this in new browsers, as it is going away.
        video.src = window.URL.createObjectURL(stream);
      }
      video.onloadedmetadata = function() {
        video.play();
      };
    })
    .catch(err => {
      console.error('lame-o!', err);
    })
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);

    // mess with them

    // pixels = redEffect(pixels);
    // ctx.putImageData(pixels, 0,0);

    // pixels = rgbSplit(pixels);
    // ctx.globalAlpha = 0.1;

    // pixels = greenScreen(pixels);

    // put them back
    ctx.putImageData(pixels, 0, 0);
    // debugger;
  }, 16);
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play();

  // take the data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${data}" alt="Handsome" />`;
  link.textContent = 'Download Image;'
  strip.insertBefore(link, strip.firsChild);
}

function redEffect(pixels) {
  console.log('redEffect');
  for(let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; // red
    pixels.data[i + 1] = pixels.data[i + 1] + 80; // green
    pixels.data[i + 2] = pixels.data[i + 2] * 4; // blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  console.log('rgbSplit');
  for(let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i - 100] = pixels.data[i + 0]; // red
    pixels.data[i + 300] = pixels.data[i + 1]; // green
    pixels.data[i - 0] = pixels.data[i + 2]; // blue
  }
  return pixels;
}

function greenScreen(pixels) {
  console.log('greenScreen');
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i+4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
        // take it out!
        pixels.data[i + 3] = 0;
      }
  }

  return pixels;
}


getVideo();

video.addEventListener('canplay', paintToCanvas);
