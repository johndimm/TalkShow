function startButton(event) {
  var textDisplay = $("#resultsText").css("display");
  if (textDisplay == 'block') {
    useTextInput();
  } else {
    startAudioButton(event);
  }
}

function onLoad() {

  for (var i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
  }
  select_language.selectedIndex = 6;
  updateCountry();
  select_dialect.selectedIndex = 6;
}

function useTextInput() {
}

function onResize() {
}

function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  if (list[1].length == 1) {
    select_dialect.style.visibility = 'hidden';
    bounceLanguage();
  } else {
    select_dialect.style.visibility = 'visible';
  }
}

function searchInternet (query, nHits) {
}

function onEnded() {
//  textToSpeech("more stuff");
//  alert("ended");
  return;
  setTimeout(function() {
    var e = '';
    startAudioButton(e);
  }, 1000);
  
}

function html5_audio(){
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
}
 
var play_html5_audio = false;
if(html5_audio()) play_html5_audio = true;
 
// var snd = new Audio(); 
function play_sound(url){
    if(play_html5_audio){
        var snd = new Audio(url);
 //       snd.url = url;
//		snd.autoplay = true;
        snd.load();
        snd.play();
		snd.addEventListener("ended", onEnded);
    }else{
        $("#sound").remove();
        var sound = $("<embed id='sound' type='audio/mpeg' />");
        sound.attr('src', url);
        sound.attr('loop', false);
        sound.attr('hidden', true);
        sound.attr('autostart', true);
        $('body').append(sound);
    }
}

function textToSpeech(txt) {
  play_sound("http://translate.google.com/translate_tts?ie=UTF-8&q="+encodeURIComponent(txt)+"&tl=en&total=1&idx=0prev=input");  
}

var g_txt = '';

function onSpeechEnd() {
  textToSpeech(g_txt);
  initSpeechRecognition();
  g_txt = '';
}

function findNamedEntities (txt, completePhrase) {
  if (!completePhrase) return;
  txt = txt.trim();
  if (txt == '') return;
	
  translation_div.innerHTML += ' ' + txt;
 
   g_txt += txt;
   
  // Stop audio.
//   var e = ''; 
//  startAudioButton(e);
//  textToSpeech(txt);
  
//  var requestStr = "http://translate.google.com/translate_tts?tl=en&q=" + escape(txt);
//  g_win = window.open(requestStr, "_blank");
//  g_win.onload = textSpeechWinOpened();
}