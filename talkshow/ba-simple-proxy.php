
<?php  
// make the HTTP request to the requested URL
$url = $_REQUEST['url'];
$content = file_get_contents($url);

// parse all links and forms actions and redirect back to this script
//$content = preg_replace("/some-smart-regex-here/i", "$1 or $2 smart replaces", $content);

echo $content;
?>