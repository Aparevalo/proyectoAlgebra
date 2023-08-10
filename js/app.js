const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const description = document.getElementById('prediction');
const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
const inputError = document.getElementById('input-error');
let model;
let currentCamera;

function displayDescription(predictions) {
  const result = predictions.sort((a, b) => a.probability > b.probability)[0];

  if (result.probability > 0.2) {
    const probability = Math.round(result.probability * 100);
    description.innerText = `${probability}% De probabilidad que es ${result.className.replace(',', ' o')}`;
  } else {
    description.innerText = 'No estoy seguro de lo que es';
  }
}

function classifyImage() {
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  model.classify(imageData).then((predictions) => {
    displayDescription(predictions);
    requestAnimationFrame(classifyImage);
  }).catch((error) => {
    console.error('Error al clasificar la imagen:', error);
  });
}

function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        if (videoDevices.length === 0) {
          console.error('No se encontraron cámaras disponibles.');
          return;
        }

        const facingMode = currentCamera === 'rear' ? 'environment' : 'user';
        const constraints = {
          video: { facingMode: { exact: facingMode } }
        };

        navigator.mediaDevices.getUserMedia(constraints)
          .then((stream) => {
            video.srcObject = stream;
            video.play();
            classifyImage();
          })
          .catch((error) => {
            console.error('Error al acceder a la cámara:', error);
          });
      })
      .catch((error) => {
        console.error('Error al enumerar los dispositivos:', error);
      });
  } else {
    console.error('El navegador no admite la API getUserMedia o enumerateDevices');
  }
}

mobilenet.load().then((m) => {
  model = m;
  document.body.classList.remove('loading');
  currentCamera = 'rear'; // Establece la cámara trasera como predeterminada
  startCamera();
}).catch((error) => {
  console.error('Error al cargar el modelo:', error);
});
