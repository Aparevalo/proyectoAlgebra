const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const description = document.getElementById('prediction');
const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
const inputError = document.getElementById('input-error');

let model;

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
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
        classifyImage();
      })
      .catch((error) => {
        console.error('Error al acceder a la cámara:', error);
      });
  } else {
    console.error('El navegador no admite la API getUserMedia');
  }
}

mobilenet.load().then((m) => {
  model = m;
  document.body.classList.remove('loading');
  startCamera();
}).catch((error) => {
  console.error('Error al cargar el modelo:', error);
});
