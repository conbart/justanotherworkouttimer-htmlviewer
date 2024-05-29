// Autor: Torsten Kockler
// 2024

// Variablen und Konstanten

let sets = [];
let reps = 0;
let exercises = [];
let workoutName = "";
let currentSetsIndex = 0;
let currentRep = 0;
let currentExerciseIndex = 0;
let timer;
let isTimerRunning = false;
let duration = 0;
let currentDuration = 0;
let minutes = 0;
let seconds = 0;
let displayMinutes = "";
let displaySeconds = "";
let workoutTime = 0;
let currentWorkoutTime = 0;
let hideNext = true;
let currentSetsDisplay = "";
let nextSetsDisplay = "";
let intro = true;
const introDuration = 10;
const audioHigh = document.getElementById('high');
const audioLow = document.getElementById('low');

// Funktion zum Auslesen der URL-Parameter
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// AJAX Lade Workout Datei
fetch('./workouts/'+getParameterByName('w'))
.then(response => response.json())
.then(data => {
    workoutName = data.title;
    sets = data.sets;
    startWorkout();
})
.catch(error => console.error('Error:', error));

// "Pause / Play" Knopf
document.getElementById('pauseButton').addEventListener('click', function() {
    if (isTimerRunning) {
        // Timer anhalten
        clearInterval(timer);
        isTimerRunning = false;
        document.getElementById('pauseButton').innerHTML='&#x25b6;';
    } 
    else {
        // Timer wieder starten
        timer = setInterval(updateTimer, 1000);
        isTimerRunning = true;
        document.getElementById('pauseButton').innerHTML='&#x25ae;&#x25ae;';
    }
});

// "Weiter" Knopf
document.getElementById('nextButton').addEventListener('click', function() {
    if (isTimerRunning) {
        // Timer anhalten
        clearInterval(timer);
        isTimerRunning = false;
        
        // Wenn es eine nächste Übung in dem Set gibt springe zu dieser Übung
        if (currentExerciseIndex+1 < exercises.length) {
            currentExerciseIndex++;
        }
        else {
            // Wenn es eine Weitere Wiederholung in dem Set gibt springe wieder zur ersten Übung im Set
            if (currentRep+1 <= reps) { 
                currentRep++;
                currentExerciseIndex = 0;
            }
            else {
                // Wenn es ein nächstes Set gibt springe zur ersten Übung in diesem Set
                if (currentSetsIndex+1 < sets.length) {
                    currentSetsIndex++;
                    currentRep = 1;
                    currentExerciseIndex = 0;                 
                }
            }
        }
        
        // Zeiten zurücksetzen
        currentDuration = exercises[currentExerciseIndex].duration;
        calculateCurrentWorkoutTime();
        
        // Timer wieder starten
        timer = setInterval(updateTimer, 1000);
        isTimerRunning = true;
        // Anzeige updaten
        updateDisplay();        
    }
});

// "Zurück" Knopf
document.getElementById('backButton').addEventListener('click', function() {
    if (isTimerRunning) {
        // Timer anhalten
        clearInterval(timer);
        isTimerRunning = false;
        
        // Wenn es eine vorherige Übung in dem Set gibt springe zu dieser Übung
        if (currentExerciseIndex-1 >= 0) {
            currentExerciseIndex--;
        }
        else {
            // Wenn es eine Vorherige Wiederholung in dem Set gibt springe zur letzten Übung in der vorherigen Wiederholung im Set
            if (currentRep-1 > 0) { 
                currentRep--;
                currentExerciseIndex = sets[currentSetsIndex].exercises.length-1;
            }
            else {
                // Wenn es ein vorheriges Set gibt springe zur letzten Übung in diesem Set
                if (currentSetsIndex-1 >= 0) {
                    currentSetsIndex--;
                    currentRep = sets[currentSetsIndex].repetitions;
                    currentExerciseIndex = sets[currentSetsIndex].exercises.length-1;               
                }
            }
        }
        
        // Zeiten zurücksetzen
        currentDuration = exercises[currentExerciseIndex].duration;
        calculateCurrentWorkoutTime();        
        
        // Timer wieder starten
        timer = setInterval(updateTimer, 1000);
        isTimerRunning = true;
        // Anzeige updaten
        updateDisplay();        
    }
});

// Anzeige der Trainingssätze aktualisieren (aktueller und evtl. nächster Satz)
function updateSetsDisplay(){
    
    // Aktueller Satz
    currentSetsDisplay = "";
    for (e = 0; e < exercises.length; e++){
        min = Math.floor(exercises[e].duration / 60);
        sec = exercises[e].duration % 60;        
        if (e == currentExerciseIndex) {
            currentSetsDisplay = `${currentSetsDisplay}<div id='s${currentSetsIndex}e${e}' class='current-sets-display active'><div class="name">${exercises[e].name}</div><div class="duration">Dauer: ${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}</div></div>`;
        }
        else {
            currentSetsDisplay = `${currentSetsDisplay}<div id='s${currentSetsIndex}e${e}' class='current-sets-display inactive'><div class="name">${exercises[e].name}</div><div class="duration">Dauer: ${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}</div></div>`;
        }            
    }
    document.getElementById('current-set-container').innerHTML = currentSetsDisplay;
    
    // Nächster Satz
    nextSetsDisplay = "";
    if (currentSetsIndex+1 < sets.length) { // Gibt es einen weiteren Satz?
        for (e = 0; e < sets[currentSetsIndex+1].exercises.length; e++){
            min = Math.floor(sets[currentSetsIndex+1].exercises[e].duration / 60);
            sec = sets[currentSetsIndex+1].exercises[e].duration % 60;        
            nextSetsDisplay = `${nextSetsDisplay}<div id='s${currentSetsIndex+1}e${e}' class='next-sets-display inactive'><div class="name">${sets[currentSetsIndex+1].exercises[e].name}</div><div class="duration">Dauer: ${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}</div></div>`;
        }
        document.getElementById('next-set-container').innerHTML = nextSetsDisplay;
        document.getElementById('show-next-set').style.visibility = "visible";
    }
    else {    
        document.getElementById('show-next-set').style.visibility = "hidden";
    }
      
}

// Anzeigen aktualisieren (Kopf- und Fußzeile)
function updateDisplay(){
    
    exercises = sets[currentSetsIndex].exercises;
    reps = sets[currentSetsIndex].repetitions;
        
    const displaySet = currentSetsIndex+1;
    const displayExercise = exercises[currentExerciseIndex].name;
    let displayNext = "";
    
    if (exercises[currentExerciseIndex+1]) {
      displayNext = exercises[currentExerciseIndex+1].name;
      hideNext = false;
    }
    else {
      if (currentRep < reps){
        displayNext = sets[currentSetsIndex].exercises[0].name;
        hideNext = false;
      }
      else {
        if (currentSetsIndex+1 < sets.length){
            displayNext = sets[currentSetsIndex+1].exercises[0].name;
            hide=Next = false;
        }
        else {
            hideNext = true;
        }
      }
    }
        
    document.getElementById('set-number').innerText = `Satz ${displaySet}`;
    document.getElementById('timer').innerText = `${displayMinutes}:${displaySeconds}`;
    document.getElementById('exercise-name').innerText = `${displayExercise}`;
    if (hideNext) {
        document.getElementById('next-exercise-name').innerHTML = "";
    }
    else {
        document.getElementById('next-exercise-name').innerHTML = `N&auml;chste &Uuml;bung: ${displayNext}`;
    }
    
    updateSetsDisplay();
    
    document.getElementById('exercise-number').innerHTML = `&Uuml;bung ${((currentRep-1)*exercises.length)+currentExerciseIndex+1} von ${reps*exercises.length}`;
    document.getElementById('repetitions').innerText = `Wiederholung ${currentRep} von ${reps}`;
    document.getElementById('set-number-from-total').innerText = `Satz ${displaySet} von ${sets.length}`;
    
}

// Timer aktualisieren
function updateTimer() {
    
    if (currentDuration > 0 && currentDuration <= 3){
        audioLow.play(); // Play Audio
    }

    if (currentDuration === Math.floor(duration / 2) && !intro){ // Play Audio
        let count = 0; 
        audioLow.addEventListener("ended", function() {
            count++;
            if (count < 2) {
                audioLow.play();
            }
        });
        audioLow.play();
    }
        
    minutes = Math.floor(currentDuration / 60);
    seconds = currentDuration % 60;
    
    displayMinutes = minutes < 10 ? "0" + minutes : minutes;
    displaySeconds = seconds < 10 ? "0" + seconds : seconds;

    document.getElementById('timer').innerText = `${displayMinutes}:${displaySeconds}`;
    
    if(!intro){
        displayPercent = (100*currentDuration)/duration;
    }
    else {
        displayPercent = (100*currentDuration)/introDuration;
    }
    
    document.getElementById('progressBar').value = displayPercent;
    
    currentWorkoutMinutes = Math.floor(currentWorkoutTime / 60);
    currentWorkoutSeconds = currentWorkoutTime % 60;
    workoutMinutes = Math.floor(workoutTime / 60);
    workoutSeconds = workoutTime % 60;
    
    displayCurrentWorkoutMinutes = currentWorkoutMinutes < 10 ? "0" + currentWorkoutMinutes : currentWorkoutMinutes;
    displayCurrentWorkoutSeconds = currentWorkoutSeconds < 10 ? "0" + currentWorkoutSeconds : currentWorkoutSeconds;    
    displayWorkoutMinutes = workoutMinutes < 10 ? "0" + workoutMinutes : workoutMinutes;
    displayWorkoutSeconds = workoutSeconds < 10 ? "0" + workoutSeconds : workoutSeconds;
    
    document.getElementById('workout-time').innerText = `${displayCurrentWorkoutMinutes}:${displayCurrentWorkoutSeconds} von ${displayWorkoutMinutes}:${displayWorkoutSeconds} übrig`;

    // Wenn die aktuelle Übung abgeschlossen ist
    if (currentDuration <= 0) {
        if (!intro) {
            currentExerciseIndex++; // Zur nächsten Übung im Set gehen
        }
        else {
            intro = false;
        }
        audioHigh.play(); // Play Audio

        if (currentExerciseIndex < exercises.length) {
            // Wenn es noch Übungen im Set gibt, zur nächsten Übung gehen
            duration = exercises[currentExerciseIndex].duration;
            currentDuration = duration;
            updateDisplay();       
            currentDuration--;
            currentWorkoutTime--;
        }
        else {
            // Wenn alle Übungen in einer Wiederholung abgeschlossen sind, zur nächsten Wiederholung gehen
            currentExerciseIndex = 0;
            currentRep++;
            if (currentRep <= reps) {
                duration = exercises[currentExerciseIndex].duration;
                currentDuration = duration;
                updateDisplay();
                currentDuration--;
                currentWorkoutTime--;
            }
            else {
                // Wenn alle Übungen im Set abgeschlossen sind, zum nächsten Set gehen
                currentRep = 1;
                currentSetsIndex++;
                if (currentSetsIndex < sets.length) {
                    // Wenn es noch weitere Sets gibt, zur nächsten Übung im neuen Set gehen
                    duration = exercises[currentExerciseIndex].duration;
                    currentDuration = duration;
                    updateDisplay();
                    currentDuration--;
                    currentWorkoutTime--;
                }
                else {
                    // Wenn alle Sets abgeschlossen sind, Workout beenden
                    clearInterval(timer);
                    document.getElementById('exercise-name').innerText = "Workout abgeschlossen";
                    return;
                }
            }
        }
    }
    else {
       currentDuration--;
       currentWorkoutTime--;
    }
}

// Trainingszeit berechnen
function calculateWorkoutTime() {
        // Workouttime berechnen
        for (s=0; s < sets.length; s++) { // Iterate through sets 
            r = sets[s].repetitions;
            for (e=0; e < sets[s].exercises.length; e++) { // Iterate through exercises
                workoutTime = workoutTime + (sets[s].exercises[e].duration * r);
            }
        }
        workoutTime = workoutTime+introDuration;
}

// Trainingszeit neu berechnen (wenn Weiter oder Zurück Knopf gedrückt wurden)
function calculateCurrentWorkoutTime() {
        // Workouttime berechnen anhand der aktuellen Übung (Anfang)
        currentWorkoutTime = 0;
        
        // zuerst alle Übungen im aktuellen Set in der aktuellen Wiederholung
        for (e=currentExerciseIndex; e < sets[currentSetsIndex].exercises.length; e++){
            currentWorkoutTime = currentWorkoutTime + sets[currentSetsIndex].exercises[e].duration;
        }
        
        // nun alle Übungen im aktuellen Set ab der nächsten Wiederholung
        current = sets[currentSetsIndex].repetitions;
        for (r=currentRep+1; r <= sets[currentSetsIndex].repetitions; r++) {
            for (e=0; e < sets[currentSetsIndex].exercises.length; e++){
                currentWorkoutTime = currentWorkoutTime + sets[currentSetsIndex].exercises[e].duration;
            }
        }
        
        // zuletzt alle Übungen ab dem nächsten Set
        for (s=currentSetsIndex+1; s < sets.length; s++) { // Iterate through sets
            r = sets[s].repetitions;
            for (e=0; e < sets[s].exercises.length; e++) { // Iterate through exercises
                currentWorkoutTime = currentWorkoutTime + (sets[s].exercises[e].duration * r);
            }
        }
}


// Beginn des Trainings
function startWorkout() {

        document.getElementById('workout-name').innerHTML = `<a href="index.html">&#x1F860;</a> ${workoutName}`;
        
        exercises = sets[currentSetsIndex].exercises;
        duration = exercises[currentExerciseIndex].duration;
        if (intro) {
            currentDuration = introDuration;
        }
        else {
            currentDuration = duration;    
        }
        
        minutes = Math.floor(currentDuration / 60);
        seconds = currentDuration - minutes * 60;
        
        displayMinutes = minutes < 10 ? "0" + minutes : minutes;
        displaySeconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById('show-next-set').style.visibility = "hidden";
        
        calculateWorkoutTime();
        
        currentWorkoutTime = workoutTime;
        
        currentWorkoutMinutes = Math.floor(currentWorkoutTime / 60);
        currentWorkoutSeconds = currentWorkoutTime % 60;
        workoutMinutes = Math.floor(workoutTime / 60);
        workoutSeconds = workoutTime % 60;
    
        displayCurrentWorkoutMinutes = currentWorkoutMinutes < 10 ? "0" + currentWorkoutMinutes : currentWorkoutMinutes;
        displayCurrentWorkoutSeconds = currentWorkoutSeconds < 10 ? "0" + currentWorkoutSeconds : currentWorkoutSeconds;    
        displayWorkoutMinutes = workoutMinutes < 10 ? "0" + workoutMinutes : workoutMinutes;
        displayWorkoutSeconds = workoutSeconds < 10 ? "0" + workoutSeconds : workoutSeconds;
    
        document.getElementById('workout-time').innerText = `${displayCurrentWorkoutMinutes}:${displayCurrentWorkoutSeconds} von ${displayWorkoutMinutes}:${displayWorkoutSeconds} übrig`;        
        
        
        currentRep = 1;
        
        updateDisplay();
}

