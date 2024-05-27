fetch('dir.php')
.then(response => response.json())
.then(data => {
        const keys = Object.keys(data);
        keys.forEach(key => {
          getWorkoutData(data[key]);
        });
})
.catch(error => console.error('Fehler beim Abrufen der Dateinamen:',error));

function getWorkoutData(filename){
  fetch('./workouts/'+filename)
  .then(response => response.json())
  .then(data => {
     workoutName = data.title;
     sets = data.sets;
     workoutDuration = 0;
     for (s = 0; s < sets.length; s++){
        r = sets[s].repetitions;
        exercises = sets[s].exercises;
        for (e = 0; e < exercises.length ; e++) {
          workoutDuration += (r * exercises[e].duration);
        }
     }
     min = Math.floor(workoutDuration / 60);
     sec = workoutDuration % 60;
     document.getElementById('workouts').innerHTML += `<div class="workout-item"><div class="left"><div class="workout-name">${workoutName}</div><div class="workout-duration">Dauer: ${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}</div></div><div class="right"><button onclick="location.href='./workout.html?w=${filename}'">&#x23F5;</button></div>`;
  });
}

