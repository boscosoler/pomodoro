const timerDisplay = document.getElementById('timer');
const startPauseBtn = document.getElementById('startPause');
const resetBtn = document.getElementById('reset');
const statusDisplay = document.getElementById('status');
const toggleBtn = document.getElementById('toggle');

let workDuration = 25 * 1; // 25 minutes - testing con 1 en lugar de 60
let breakDuration = 5 * 1; // 5 minutes - testing con 1 en lugar de 60
let timeLeft = workDuration;
let timer = null;
let isRunning = false;
let isWork = true;

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
  
  // Update status with better styling
  if (isWork) {
    statusDisplay.textContent = '⏰ Tiempo de trabajo';
    statusDisplay.style.background = 'rgba(16, 185, 129, 0.1)';
    statusDisplay.style.color = '#059669';
  } else {
    statusDisplay.textContent = '☕ Tiempo de descanso';
    statusDisplay.style.background = 'rgba(245, 158, 11, 0.1)';
    statusDisplay.style.color = '#d97706';
  }
  
  // Update toggle button text and icon
  toggleBtn.innerHTML = isWork ? '⏸️ Cambiar a descanso' : '💼 Cambiar a trabajo';
}

function setStartPauseButtonMode() {
  if (isRunning) {
    startPauseBtn.classList.remove('start-mode');
    startPauseBtn.classList.add('pause-mode');
    startPauseBtn.innerHTML = '⏸️ Pausa';
  } else {
    startPauseBtn.classList.remove('pause-mode');
    startPauseBtn.classList.add('start-mode');
    startPauseBtn.innerHTML = '▶️ Comienza';
  }
}

function addTimerAnimation() {
  timerDisplay.classList.add('working');
}

function removeTimerAnimation() {
  timerDisplay.classList.remove('working');
}

function playNotificationSound() {
  // Create audio context for notification sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

function showNotification() {
  if (Notification.permission === 'granted') {
    const title = isWork ? '¡Tiempo de trabajo terminado!' : '¡Descanso terminado!';
    const body = isWork ? 'Toma un descanso de 5 minutos' : '¡Volvamos al trabajo!';
    new Notification(title, { body, icon: '🍅' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showNotification();
      }
    });
  }
}

function toggleTimer() {
  if (isRunning) {
    // Pause the timer
    isRunning = false;
    clearInterval(timer);
    removeTimerAnimation();
    setStartPauseButtonMode();
  } else {
    // Start the timer
    isRunning = true;
    addTimerAnimation();
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        // Timer finished
        isWork = !isWork;
        timeLeft = isWork ? workDuration : breakDuration;
        updateDisplay();
        playNotificationSound();
        showNotification();
        
        // Add a brief flash effect
        timerDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
          timerDisplay.style.transform = 'scale(1)';
        }, 200);
      }
    }, 1000);
    setStartPauseButtonMode();
  }
}

function resetTimer() {
  isRunning = false;
  clearInterval(timer);
  isWork = true;
  timeLeft = workDuration;
  removeTimerAnimation();
  setStartPauseButtonMode();
  updateDisplay();
  
  // Add reset animation
  timerDisplay.style.transform = 'scale(0.95)';
  setTimeout(() => {
    timerDisplay.style.transform = 'scale(1)';
  }, 150);
}

// Add click animations to buttons
function addButtonClickEffect(button) {
  button.style.transform = 'scale(0.95)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 150);
}

startPauseBtn.addEventListener('click', () => {
  addButtonClickEffect(startPauseBtn);
  toggleTimer();
});

resetBtn.addEventListener('click', () => {
  addButtonClickEffect(resetBtn);
  resetTimer();
});

toggleBtn.addEventListener('click', () => {
  addButtonClickEffect(toggleBtn);
  isWork = !isWork;
  timeLeft = isWork ? workDuration : breakDuration;
  updateDisplay();
});

// Request notification permission on page load
if ('Notification' in window) {
  Notification.requestPermission();
}

// Initialize the display
updateDisplay();
setStartPauseButtonMode(); 