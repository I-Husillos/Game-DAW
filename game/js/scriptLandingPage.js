const overlay = document.getElementById('playOverlay');
const video = document.getElementById('gameVideo');

// Iniciar reproducción y ocultar overlay
overlay.addEventListener('click', () => {
    video.play().then(() => {
        overlay.style.display = 'none';
    }).catch(() => {
        overlay.style.display = 'flex';
    });
});

// Pausar reproducción al hacer clic sobre el vídeo
video.addEventListener('click', () => {
    if (!video.paused) {
        video.pause();
    }
});

// Mostrar overlay automáticamente al pausar (independientemente de qué lo pause)
video.addEventListener('pause', () => {
    overlay.style.display = 'flex';
});

// Control por teclado usando el objeto Event del DOM
document.addEventListener('keydown', (event) => {
    // Verificar si la tecla presionada es la barra espaciadora
    if (event.code === 'Space') {
        event.preventDefault();

        if(video.paused) {
            video.play().then(() => {
                overlay.style.display = 'none';
            });
        } else {
            video.pause();
        }
    }
});