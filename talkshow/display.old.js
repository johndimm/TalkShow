// Globals.
//var g_playing = false;
var g_prevDashBold = '';
var g_lastSelectedQuery = '';
var g_lastHighlightQuery = '';
var g_currentImg = 0;
var g_textInput = '';
var g_submittedTextInput = '';

function getQueryDiv(countType, query) {
  var queryUnder = queryUnderscore(query);
  var countLoaded = "#" + queryUnder + "_" + countType;
  return countLoaded;
}

function incrementLoaded(idx) {
  var query = g_searchResults[idx].query;
  var barDiv = getQueryDiv("countLoaded", query);
  var id = queryUnderscore(query) + "_" + g_searchResults[idx].rank;
  var s = "<span id=\"" + id + "\"style='color:red'>-</span>";
  $(barDiv).html($(barDiv).html() + s);
}


function incrementDisplayed(idx) {
  var query = g_searchResults[idx].query;
  var dashDiv = getQueryDiv(g_searchResults[idx].rank, query);
  if ($(dashDiv).css("color") == "rgb(255, 0, 0)") {
    // create a new black one, in the right place.
    $(dashDiv).remove();

    var id = queryUnderscore(query) + "_" + g_searchResults[idx].rank;
    var s = "<span id=\"" + id + "\">-</span>";
    var barDiv = getQueryDiv("countDisplayed", query);
    $(barDiv).html($(barDiv).html() + s);
    dashDiv = getQueryDiv(g_searchResults[idx].rank, query);
  }

  $(dashDiv).css("color", "black");
  $(dashDiv).css("font-weight", "bold");
  if ($(g_prevDashBold)) {
    $(g_prevDashBold).css("font-weight", "normal");
  }
  g_prevDashBold = dashDiv;
}

function highlightText(div, g_query) {
  // Show the transcript text, highlighting the query.
  var newText = div.innerHTML;

  // Remove any current highlighting.
  var fontChange = "<font color=\"red\">";
  var re = new RegExp(fontChange, "g");
  newText = newText.replace(re, "");
  newText = newText.replace(/<\/font>/g, "");

  // Highlight this query.
  var bracketedQuery = g_query;
  re = new RegExp(bracketedQuery, "g");
  newText = newText.replace(re, fontChange + g_query + "</font>");

  div.innerHTML = newText;
  //	g_finalTranscript = newText;
}


function openListDiv(query) {
  var listSelectDiv = getQueryDiv("listSelected", query);
  var selectedDisplay = $(listSelectDiv).css("display");
  if (selectedDisplay == "block") {
    closeListDiv(query);
  } else {
    closeListDiv(g_lastSelectedQuery);
    $(listSelectDiv).css("display", "block");
	g_restrictToQuery = true;
	g_query = query;
	g_direction = 1;
	goGo();
    g_lastSelectedQuery = query;
  }
}

function closeListDiv(query) {
  var listSelectDiv = getQueryDiv("listSelected", query);
  if ($(listSelectDiv)) $(listSelectDiv).css("display", "none");
  g_restrictToQuery = false;
  g_direction = 0;
  goStop();
}

function highlightQuery(g_query) {
  highlightText(final_span, g_query);
  //  highlightText(listDiv, g_query);

  var oldDiv = getQueryDiv("listElement", g_lastHighlightQuery);
  if (oldDiv) {
    $(oldDiv).css("background-color", "#eee");
  }

  var oldName = getQueryDiv("listName", g_lastHighlightQuery);
  if (oldName) {
    $(oldName + " a").css("color", "black");
  }

  var listElementDiv = getQueryDiv("listElement", g_query);
  $(listElementDiv).css("background-color", "white");

  var nameDiv = getQueryDiv("listName", g_query);
  $(nameDiv + " a").css("color", "red");

  g_lastHighlightQuery = g_query;
}

function onImgLoad(thisImg, otherImg) {
//  if (g_playing) 
    startSlideShow();
  var thisImgEl = $("#" + thisImg);
  var otherImgEl = $("#" + otherImg);
  
  centerImage(thisImgEl);
	
  otherImgEl.css("opacity",0);
  thisImgEl.css("opacity", 1);
}

function onImgError(thisImg, otherImg) {
//  if (g_playing) 
    startSlideShow();
//  onImgLoad(thisImg, otherImg);	
}

function centerImage(img) {
  // It's already centered horizontally, but we need to center it vertically by hand.
  var top = (slideShowDiv.clientHeight - img.height()) / 2;
//  img.x = top;
  img.css("top", parseInt(top) + "px");
//  img.top = top + "px";
  //img.style.top = top + "px";
}

function onResize() {
  centerImage($("#theImage"));
  centerImage($("#theImage2"));
}


function displayImage(bestImageIdx) {

  //    if (g_direction == 0) 
  incrementDisplayed(bestImageIdx);

  theImage.title = g_query + ": " + g_searchResults[bestImageIdx].Title;

  highlightQuery(g_query);

  statusUrl.innerHTML = g_searchResults[bestImageIdx].DisplayUrl;
  statusTitle.innerHTML = g_searchResults[bestImageIdx].Title;
  statusQuery.innerHTML = g_searchResults[bestImageIdx].query;

  clickDisplayUrl.href = statusUrl.innerHTML;
//  theImageAnchor.href = statusUrl.innerHTML;
//  theImageAnchor2.href = theImageAnchor.href;

  theImage.title = statusQuery.innerHTML + ": " + statusTitle.innerHTML;
  theImage.alt = theImage.title;

//  $("#demoDiv").css ("display", "none");

  // This image is already loaded, rely on caching now.  Just set
  // the src of the image to the same string as the loaded one.

  // Swap images, to get transition effect.
  g_currentImg = (g_currentImg + 1) % 2;
  if (g_currentImg == 0) {
    // Set src to null, to make sure onload is called, even if we are 
    // resetting the src to the same image.
    theImage.src = '';
    theImage.src = g_searchResults[bestImageIdx].MediaUrl;
//	centerImage(theImage);
  } else {
    theImage2.src = '';
    theImage2.src = g_searchResults[bestImageIdx].MediaUrl;
//	centerImage(theImage2);
  }
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

function getURLParam(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return unescape(sParameterName[1]);
        }
    }
}

function onLoad() {

  for (var i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
  }
  select_language.selectedIndex = 6;
  updateCountry();
  select_dialect.selectedIndex = 6;

  // Show splash screen.
  theImage.style.opacity = 0;

  onResize();
  

  
  var searchPhrases = getURLParam("phrases");
  if (searchPhrases) {
    g_nSearchPhrases = parseInt(searchPhrases);
    chkBoxSearchPhrases.checked = (g_nSearchPhrases > 0);
  }
  
  var searchNames= getURLParam("names");
  if (searchNames) {
    g_nSearchNames = parseInt(searchNames);
    chkBoxSearchNames.checked = (g_nSearchNames > 0);
  }
  
  var txt = getURLParam("txt");
  if (txt) {
  	openTextInput();
    textInput.value = decodeURI(txt);
	useTextInput();
  } else {
    $("#demoDiv").css("display", "block");
  }
 
  
  $(function() {
    $( "#slider" ).slider({
      orientation: "horizontal",
	  min: 1,
      max: 60,
      value: 4,
      change: function(event, ui) { if (playing) startSlideShow() },
	  slide: function(event, ui) {
            $(".ui-slider-handle").text(ui.value + 's');
			g_slideShowDelay = ui.value * 1000;
      }
    });
	$(".ui-slider-handle").text("4s");
  });
  
  $(document).keydown(function(e){
    switch(e.which) {
        case $.ui.keyCode.LEFT:
        goBack();
        break;

        case $.ui.keyCode.UP:
        // your code here
        break;

        case $.ui.keyCode.RIGHT:
        goForward();
        break;

        case $.ui.keyCode.DOWN:
        // your code here
        break;

        default: return; // allow other keys to be handled
    }

    // prevent default action (eg. page moving up/down)
    // but consider accessibility (eg. user may want to use keys to choose a radio button)
//    e.preventDefault();
});
}

function openTextInput() {
 // textInput.value = final_span.innerText;
  
    $("#resultsText").css("display", "block");
	$("#results").css("display", "none");
	
	$("#textAudio").text("talk");
	$("#textAudio").attr("title", "click to use speech recognition");
	$("#butt").attr("title", "type or copy text, then click");
	
	$("#micButtonImg").css("display", "none");
	$("#goButtonSpan").css("display", "block");
	
	$("#div_language").css("display", "none");
	
	$("#textInput").focus();
	
	textInput.value = $("#final_span").text();
	
  /*
  $("#textInputDiv").css("display", "block");
  $("#textInput").css("width", $("#results").css("width"));
  $("#textInputDiv").css("left", $("#results").css("left"));
  */
}

function closeTextInput() {
//  $("#textInputDiv").css("display", "none");

    $("#resultsText").css("display", "none");
	$("#results").css("display", "block");
	
	$("#textAudio").text("text");
	$("#textAudio").attr("title", "click to use text input");
	$("#butt").attr("title", "click and start talking");
	
	$("#micButtonImg").css("display", "block");
	$("#goButtonSpan").css("display", "none");
	
	$("#div_language").css("display", "block");
	
    $("#final_span").text(textInput.value);
	
}



function useTextInput() {
//  final_span.innerHTML = textInput.value;
//  closeTextInput();
 // g_finalTranscript = final_span.innerHTML;
  //processInputText(final_span.innerHTML);
  g_textInput = textInput.value.replace(g_submittedTextInput, '');
  
  linkUrl.href = "https://dprhcp108.doteasy.com/~johndimm/talkshow/index.html?txt=" 
    + escape(encodeURI(textInput.value)) 
	+ "&phrases=" 
	+ g_nSearchPhrases 
	+ "&names=" 
	+ g_nSearchNames;
  
  processInputText();
    // Save current chunk.
  g_submittedTextInput = textInput.value;
  
  $("#demoDiv").css("display", "none");
  
  $("#textInput").focus();
}

function readyToShow() {
  var nReady = 0;
  for (i=0; i<g_searchResults.length; i++) {
    if (g_searchResults[i].loaded && g_searchResults[i].nDisplayed == 0) 
	   nReady += 1;
  }
  return nReady;
}

function processInputText() {
  // Recursive, to work through the input in chunks.
  var firstPunct = g_textInput.search(/[,.\n;:]/);
  var chunk = '';
  if (firstPunct == -1) {
    // Last chunk.
    chunk = g_textInput;
	g_textInput = '';
  } else {
    // Found a separator.
    chunk = g_textInput.substr(0, firstPunct);
    g_textInput = g_textInput.substr(firstPunct + 1);
	g_textInput = g_textInput.trim();
  }
   
   g_interruptSlideshow = (g_textInput.length == 0);
   
   if (chkBoxSearchNames.checked)
     findNamedEntities(chunk, true);
   
   // Look for the whole phrase, or clause, or speech. 
   // Only if there are no capital letters.
//   if (readyToShow() < 5 && chunk.substring(1).search(/[A-Z]/) == -1)
    if (chkBoxSearchPhrases.checked) 
     searchInternet(chunk, g_nSearchPhrases);
   
   if (g_textInput.length > 0) {
     setTimeout (processInputText, 400);
   } 
}




function switchTextAudio() {
  var textDisplay = $("#resultsText").css("display");
  if (textDisplay == 'block') {
    closeTextInput();
  } else {
    openTextInput();
  }
}

function startButton(event) {
  var textDisplay = $("#resultsText").css("display");
  if (textDisplay == 'block') {
    useTextInput();
  } else {
    startAudioButton(event);
  }
}

function toggleDemo() {
  var display = $('#demoDiv').css('display');
  if (display == 'block') { 
     $('#demoDiv').css('display', 'none');
  } else {
     $('#demoDiv').css('display', 'block');
  }
}

function onMouseUp(event, theImage) {
   if (event.offsetX < theImage.clientWidth / 2) {
     goBack();
   } else {
     goForward();
   }   
}