<?php

$key = $spaceId = $_GET['i'];

if($spaceId != '') {

  $output = '';
  $output = apc_fetch($key);
  if($output == '') {
    //echo "nope";

    $imdbAPI = "http://www.imdbapi.com/?r=json";
    $imdbAPI .= "&i=" . $spaceId;


    ob_start();

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $imdbAPI);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Linux - cURL');
    curl_setopt($ch, CURLOPT_HEADER, 0);

    curl_exec($ch);
    curl_close($ch);
    error_log('calling the API');
    $output = ob_get_contents();
    ob_end_clean();
    
    apc_store($key, $output, 900);
  }
  echo $output;





}
else {
	echo "Nothing to lookup!"; 
}

?>
