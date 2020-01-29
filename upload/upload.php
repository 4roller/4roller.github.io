<?
header('Content-Type: application/json');

$message = $_POST['message'];
$filename = $_FILES["file"]["name"];
$test = "blah";

$sample = array(
	'other'=>'this is some return text',
    'message'=>$message,
    'filename'=>$filename,
    'test'=>$test
);
echo json_encode($sample);


?>