# HTML Viewer for Android App from F-Droid Store "Just Another Workout Timer":

[Just Another Workout Timer](https://github.com/blockbasti/just_another_workout_timer)

I needed a version of "Just Another Workout Timer" to display on my big screen attached to a Raspberry Pi in my fitness room.
So I hacked a little bit of Javascript and PHP code to create a viewer to show my workouts in my browser on the Raspberry Pi.

I put the code on my server, together with the JSON files that I exported from the Android app.

Well, I thought maybe this could be useful for someone else, so I put it here.

Feel free to use it. Just put the code on a webserver with PHP installed.
Create a workout / workouts in the Android app and export it as json file.
On the webserver create a folder named `workouts/` and put your exported json file(s) there.

That's all folks.

Thanks to [Bastian Block](https://github.com/blockbasti) who created the Android app.
