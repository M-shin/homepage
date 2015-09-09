<?php

  // Check if all of the necessary "write data" parameters are set
  if (isset($_GET['name']) && isset($_GET['time']) && isset($_GET['value'])) {

    // Check if this person already has a directory
    if (!file_exists($_GET['name'] . '.d')) {
      
      // If not, then create one
      mkdir($_GET['name'] . '.d');

    }

    // Open a file handle for the file that we are going to write to. We do this in append mode
    $handle = fopen($_GET['name'] . '.d/scores-file' . $_GET['name'] . '.txt', 'a');

    // Write the actual data
    fwrite($handle, $_GET['time'] . ': ' . $_GET['value'] . "\n");

    // Close the file handle
    fclose($handle);

    // Ayy lmao, success
    echo 'success';

    // This conditional checks if the person is using the lookup feature (I should be ashamed that I would refer to this as a "feature")
  } else if (isset($_GET['name'])){

    // Check if the person even exists
    if (!file_exists($_GET['name'] . '.d')) {

      // If the person doesn't exist, let the guy know
      echo 'fnf';
    } else {

      // If the person does exist, give the requester the requested stuff
      $handle = fopen($_GET['name'] . '.d/scores-file' . $_GET['name'] . '.txt', 'r');

      // Classic sequential file read here
      $contents = '';
      while(!feof($handle)) {
        $contents = $contents . fgets($handle) . '<br>';
      }

      // Close the file handle because that's important
      fclose($handle);

      // Return the requested information
      echo($contents);
    }
  } else {
    // Used to have a message here, but took it out to avoid suspicion
  }
?>			