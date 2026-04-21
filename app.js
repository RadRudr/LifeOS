// =====================
// STATE VARIABLES
// =====================

let watchId = null;

let isRunning = false;
let isPaused = false;

let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;

let totalDistance = 0; // meters
let runPoints = [];

alert("Distance Fiix")

// =====================
// UI ELEMENTS
// =====================

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const finishBtn = document.getElementById("finishBtn");

const timeDisplay = document.getElementById("time");
const distanceDisplay = document.getElementById("distance");


// =====================
// START RUN
// =====================

startBtn.addEventListener("click", () => {
  console.log("Start clicked!");

  isRunning = true;
  isPaused = false;

  startTime = Date.now();

  // UI update
  startBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
  finishBtn.style.display = "inline-block";

  // reset data
  runPoints = [];
  totalDistance = 0;

  startTimer();
  startGPS();
});


// =====================
// PAUSE RUN
// =====================

pauseBtn.addEventListener("click", () => {
  isPaused = true;

  clearInterval(timerInterval);
  elapsedTime += Date.now() - startTime;

  pauseBtn.style.display = "none";
  resumeBtn.style.display = "inline-block";

  console.log("Paused");
});


// =====================
// RESUME RUN
// =====================

resumeBtn.addEventListener("click", () => {
  isPaused = false;

  startTime = Date.now();

  resumeBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";

  startTimer();

  console.log("Resumed");
});


// =====================
// FINISH RUN
// =====================

finishBtn.addEventListener("click", () => {
  isRunning = false;

  clearInterval(timerInterval);

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  startBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
  finishBtn.style.display = "none";

  console.log("Run finished");
  console.log("Total Distance (m):", totalDistance.toFixed(2));
});


// =====================
// TIMER
// =====================

function startTimer() {
  timerInterval = setInterval(() => {
    let currentTime;

    if (isPaused) {
      currentTime = elapsedTime;
    } else {
      currentTime = elapsedTime + (Date.now() - startTime);
    }

    const seconds = Math.floor(currentTime / 1000) % 60;
    const minutes = Math.floor(currentTime / 60000);

    timeDisplay.textContent =
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // 🔥 ADD THIS
    distanceDisplay.textContent = totalDistance.toFixed(5);

  }, 1000);
}


// =====================
// GPS TRACKING
// =====================

function startGPS() {
  if (!navigator.geolocation) {
    console.log("Geolocation not supported");
    return;
  }

  watchId = navigator.geolocation.watchPosition((position) => {
    if (!isRunning || isPaused) return;

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const newPoint = { lat, lon };

    runPoints.push(newPoint);

    if (runPoints.length > 1) {
      const prev = runPoints[runPoints.length - 2];

      const dist = calculateDistance(prev, newPoint);

      // ignore GPS noise
      if (dist > 0.3 && dist < 50) {
        totalDistance += dist;
      }

    }

  }, (error) => {
    console.log("GPS error:", error.message);
  }, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  });
}


// =====================
// DISTANCE FUNCTION (METERS)
// =====================

function calculateDistance(p1, p2) {
  const R = 6371000; // meters

  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lon - p1.lon) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) *
    Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}