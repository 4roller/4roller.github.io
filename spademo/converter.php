<?php


$key = $_GET['url'];

//if($key != '') {
if(1) {

  $output = '';
  $output = apc_fetch($key);
  if($output == '') {
    //echo "nope";

    $rssFeed = "http://news.google.com/news?pz=1&cf=all&ned=us&hl=en&output=rss";
    //$rssFeed .= "&u=" . $key;


    ob_start();

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $rssFeed);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Linux - cURL');
    curl_setopt($ch, CURLOPT_HEADER, 0);

    curl_exec($ch);
    curl_close($ch);
    error_log('calling the API');
    $output = ob_get_contents();
    ob_end_clean();
    
    //apc_store($key, $output, 900);
  }
  echo $output;





}
else {
	echo "Nothing to lookup!"; 
}

?>
