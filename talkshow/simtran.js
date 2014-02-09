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
function updateTargetCountry() {
  for (var i = select_target_dialect.options.length - 1; i >= 0; i--) {
    select_target_dialect.remove(i);
  }
  var list = langs[select_target_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_target_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  if (list[1].length == 1) {
    select_target_dialect.style.visibility = 'hidden';
  } else {
    select_target_dialect.style.visibility = 'visible';
  }
}

function searchInternet (query, nHits) {
}

function onSpeechEnd() {
}

function onEnded() {
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
 
function onError(event) {
  var dummy = 0;
}

  var play_html5_audio = false;
  if(html5_audio()) play_html5_audio = true;
 
function play_sound(url){

  if(play_html5_audio){
        var snd = new Audio(url);
        console.log(url);
        snd.load();
        snd.play();
	    snd.addEventListener("ended", onEnded);
		snd.addEventListener("error", onError);
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

function sourceLanguage() {
   return select_dialect.value.replace(/-.*/,'').replace("cmn","zh");
}

function targetLanguage() {
   return select_target_dialect.value.replace(/-.*/,'').replace("cmn","zh");
}

function translate(txt) {
   if (sourceLanguage() == targetLanguage()) {
     translation_div.innerHTML += ' ' + txt;
     speak();
     return;
   }

//   translateBing (txt, sourceLanguage(), targetLanguage());
//   return;
   
   var engine = $('input:radio[name=engine]:checked').val();
	
    var transURL = "http://dictfactory.systran.local/frontend_dev.php/xtrans?txt=" + encodeURIComponent(txt) 
    + "&lp=" + sourceLanguage() + targetLanguage()
	+ "&engines=" + engine 
	+ "&callback=?";
	
    $.getJSON(transURL, function(data) {
       var transText = data[0].txt;
       var engine = data[0].system;
          translation_div.innerHTML += ' ' + transText;
          speak();
	});
}

function textToSpeech(txt) {
  var fromLang = select_dialect.value.replace(/-.*/,'').replace("cmn","zh");
  var toLang = (fromLang == 'en') ? 'fr' : 'en';

  onEnded();

  play_sound("http://translate.google.com/translate_tts?ie=UTF-8&q="
    + encodeURIComponent(txt)
    +"&tl=" 
    + targetLanguage()
    + "&total=1&idx=0prev=input");  
}

var g_speech = '';
function speak() {
  var txt = translation_div.innerHTML;
  txt = txt.replace(g_speech, '');
  g_speech = translation_div.innerHTML;
  textToSpeech(txt);
}

function findNamedEntities (txt, completePhrase) {
  if (!completePhrase) return;
  txt = txt.trim();
  if (txt == '') return;

  translate(txt);
}

function translateBing(text, sourceLang, targetLang) {
  var quote = "%27";

  //Build up the URL for the request
  var textEncoded = encodeURIComponent(text);
//  var bingUrl = "http://api.microsofttranslator.com/V2/Ajax.svc";
  var bingUrl = "https://api.datamarket.azure.com/Data.ashx/Bing/MicrosoftTranslator/v1/Translate";
  var requestStr = bingUrl 
    + "?text=" 
	+ quote + textEncoded + quote 
	+ "&from=" + sourceLang 
	+ "&to=" + targetLang 
	+ "&contentType=text/html"
	+ "&$format=jsonp"
	+ "&jsoncallback=?";

  console.log(requestStr);

  //Return the promise from making an XMLHttpRequest to the server
  $.ajax({
    url: requestStr,
    beforeSend: setBingHeader,
    context: this,
    type: 'GET',
    success: function (data, status) {
      var results = data;

    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(textStatus);
    }
  });
  return true;
}


function setBingHeader(xhr) {
  var accountKey = "v3igf7DbQg6+wxqG9dt5u9GMKY9MUmJKXDpDkcBPAKM=";
  accountKey = "pmvCeZZRS4kumaaUCh/8eWpL5WYOGGqNfRo+o4264A0=";
  var accountKeyEncoded = base64_encode(":" + accountKey);

  xhr.setRequestHeader('Authorization', "Basic " + accountKeyEncoded);
  //'Basic <Your Azure Marketplace Key(Remember add colon character at before the key, then use Base 64 encode it');
}


function base64_encode(data) {
  // http://kevin.vanzonneveld.net
  // +   original by: Tyler Akins (http://rumkin.com)
  // +   improved by: Bayron Guevara
  // +   improved by: Thunder.m
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Pellentesque Malesuada
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Rafal Kukawski (http://kukawski.pl)
  // *     example 1: base64_encode('Kevin van Zonneveld');
  // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
  // mozilla has this native
  // - but breaks in 2.0.0.12!
  //if (typeof this.window['btoa'] == 'function') {
  //    return btoa(data);
  //}
  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = "",
    tmp_arr = [];

  if (!data) {
    return data;
  }

  do { // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = o1 << 16 | o2 << 8 | o3;

    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;

    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join('');

  var r = data.length % 3;

  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

}