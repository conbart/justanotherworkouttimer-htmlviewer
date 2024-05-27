<?php
$directory = "./workouts";

if (is_dir($directory)) {
  $files = array_diff(scandir($directory), array('..','.'));
  header('Content-Type: application/json');
  echo json_encode($files);
}
else {
  echo "Das Verzeichnis existiert nicht.";
}
?>
