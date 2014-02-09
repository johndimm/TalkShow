// Globals.
var g_finalTranscript = '';
var g_recognizing = false;
//var g_ignoreOnend;
var g_submittedTranscript = '';
var g_speechTimer = 0;
var g_interruptSlideshow = false;
var g_recognition;

init();

function init() {
  if (!('webkitSpeechRecognition' in window)) {
  	openTextInput();
//    upgrade();
    return;
  }

  initSpeechRecognition();
}

function bounceLanguage() {
  if (g_recognizing) {
    g_recognition.stop();
	g_recognizing = false;
    startButton();
  }
}

function initSpeechRecognition() {
  g_recognition = new webkitSpeechRecognition();
  g_recognition.continuous = true;
  g_recognition.interimResults = true;
  g_recognition.onstart = onStart;
  g_recognition.onerror = onError;
  g_recognition.onend = onEnd;
  g_recognition.onresult = onResult;
  g_recognizing = false;
}

function onStart() {
  g_recognizing = true;
  // showInfo('info_speak_now');
  micButtonImg.src = './talkshow/mic-on.png';
}

function onError(event) {
  var restartRequested = false;

  if (event.error == 'network') {
    restartRequested = true;
  }

  if (event.error == 'no-speech') {
    //   showInfo('info_no_speech');
	micButtonImg.src = './talkshow/mic.gif';
//    g_ignoreOnend = true;
    restartRequested = true;
  }

  if (event.error == 'audio-capture') {
 //   showInfo('info_no_microphone');
	micButtonImg.src = './talkshow/mic.gif';
	restartRequested = true;
//    g_ignoreOnend = true;
    // restartRequested = true;
  }

  if (event.error == 'not-allowed') {
//    if (event.timeStamp - g_startTimestamp < 100) {
//      showInfo('info_blocked');
//    } else {
      showInfo('info_denied');
//    }
//    g_ignoreOnend = true;
  }

  if (restartRequested) {
    initSpeechRecognition();
    startButton(event);
  }
}

function onEnd() {
  g_recognizing = false;
  
  micButtonImg.src = './talkshow/mic.gif';
}


function processCompletePhrase() {
  // If we were showing results for only one query, open up now.
//  g_restrictToQuery = false;

  // The user paused while speaking.  We now have a chunk of text, a phrase.
  // Delete text already scanned.  Could just use substring.
  //  var newText = g_finalTranscript.replace(g_submittedTranscript, '');
  var newText = g_finalTranscript.substr(g_submittedTranscript.length);

  // Save current chunk.
  g_submittedTranscript = g_finalTranscript;

  g_interruptSlideshow = true;

  // Check for named entities. 
  
  if (chkBoxSearchNames.checked)
    findNamedEntities(newText, true);

  // Search the whole phrase, even if there were entities.
  // Don't look up long queries, they are probably not meant by the user to be searched.
  //if (newText.length < 50) {
  if (chkBoxSearchPhrases.checked) {
    console.log("searching for complete phrase: " + newText);
    searchInternet(newText, g_nSearchPhrases);
  }
  
  $("#demoDiv").css("display", "none");
}

function processBuffer() {
  // If the user hits stop, but then starts talking, time to start up again.
//  g_playing = true;

  // Tell routines downstream to show the first image.
  g_interruptSlideshow = true;

  // Check all the text received since last complete phrase.  This does not correspond to a pause by 
  // the user, and there may be another buffer right behind this one.
  var newText = g_finalTranscript.substr(g_submittedTranscript.length);

  findNamedEntities(newText, false);
}

function onResult(event) {
  if (g_speechTimer) {
    clearTimeout(g_speechTimer);
  }

  var interim_transcript = '';

  // Sanity check.
  if (typeof (event.results) == 'undefined') {
    g_recognition.onend = null;
    g_recognition.stop();
    upgrade();
    return;
  }

  // The final transcript has the words that we're sure about.
  // The interim transcript has a hypothesis the may change.
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      g_finalTranscript += event.results[i][0].transcript;
    } else {
      interim_transcript += event.results[i][0].transcript;
    }
  }

  final_span.innerHTML = linebreak(g_finalTranscript);
  interim_span.innerHTML = linebreak(interim_transcript);


  if (g_finalTranscript || interim_transcript) {
    // Look for entities in this chunk and if found, show immediately.
    processBuffer();
  }

  // When the user pauses for half a second, process the entire phrase.  
  g_speechTimer = setTimeout(processCompletePhrase, 500);
}


function upgrade() {
  showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;

function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

function startAudioButton(event) {
  if (!g_recognition) {
    upgrade();
	return;
  }
  
  if (g_recognizing) {
    g_recognition.stop();
	
    return false;
  }

  g_finalTranscript += ' '; // separate from next chunk.
  g_recognition.lang = select_dialect.value;
  g_recognition.start();//
//  g_ignoreOnend = false;

  micButtonImg.src = './talkshow/mic-slash.gif';

//  event.cancelBubble = true;   was this necessary to get clicks to the mic button? 
  return true;
}

function showInfo(s) {

  if (!s || s == '') return;
  
  $( "#" + s).dialog({
	height: 160,
	width: 400,
	modal: true
  });



}