<?php  
$voice = file_get_contents('http://translate.google.com/translate_tts?tl=en&q=hello'); 
echo $voice;
?>