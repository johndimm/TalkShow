// allow cross-site access in IE.
$.support.cors = true;

// Globals.
var g_restrictToQuery = false;
var g_lastQuery = '';
var g_slideShowTimer = 0;
var g_query = '';
var g_imageIndexes = [];
var g_imageIdx = -1;
var g_direction = 0;
var g_slideShowDelay = 4000;
var g_stopped = false;


function startSlideShow() {
  stopSlideShow();
  g_slideShowTimer = setTimeout(slideShow, g_slideShowDelay);
//  g_playing = true;
}

function stopSlideShow() {
  if (g_slideShowTimer) clearTimeout(g_slideShowTimer);
}


function slideShow() {
  // Slideshow is restarted later, after the image loads.
  stopSlideShow();

  var bestImageIdx = nextImage(true);

  g_lastQuery = g_query;

  // Found a good image?
  if (g_searchResults[bestImageIdx]) {
    g_query = g_searchResults[bestImageIdx].query;

    displayImage(bestImageIdx);

    // Direction is zero when in normal slideshow mode, rather than prev/next browsing.
    if (g_direction == 0) {
      g_imageIndexes.push(bestImageIdx);
      g_imageIdx = g_imageIndexes.length - 1;
    }

    g_searchResults[bestImageIdx].nDisplayed++;
  } 
  
  var stillLoadingSomething = refreshLoadedImages();
  
  // Need to check for pending queries too.  Bad to stop now if 
  // there are outstanding queries, even if there are no more results yet.
  if (bestImageIdx == -1) { // && !stillLoadingSomething) {
//    g_direction = 1;
//	goStop();
    // There was no image to load, so no onImgLoad callback, so the slideshow is stopped.  
	// Try again in a few seconds.
	startSlideShow();
  }

//  setPlayButton();
}

function refreshLoadedImages() {
  // Forget trying to load only the next 10.  Load them all.
  var stillLoadingSomething = false;
  for (i = 0; i < g_searchResults.length; i++) {
    if (!g_searchResults[i].loaded && !g_searchResults[i].loading && g_searchResults[i].IsValid) 
	  preloadImage(i, false);
	stillLoadingSomething = stillLoadingSomething 
	  || g_searchResults[i].loading 
	  || (g_searchResults[i].nDisplayed == 0 & g_searchResults[i].isValid);  
  }
  return stillLoadingSomething;
}

function preloadImage(idx, showImmediately) {
  if (g_searchResults[idx].loaded || g_searchResults[idx].loading) return;

  g_searchResults[idx].img = new Image();
  g_searchResults[idx].loading = true;

  // If this image loads, set some flags, and maybe display it now.
  g_searchResults[idx].img.onload = function () {
    g_searchResults[idx].loaded = true;
    g_searchResults[idx].IsValid = true;
	g_searchResults[idx].loading = false;

    incrementLoaded(idx);

    if (showImmediately && !g_restrictToQuery) {
	  g_direction = 0; 
//	  g_playing = true;
      g_stopped = false;
	  slideShow();
	}
  };

  // Failed to load.
  g_searchResults[idx].img.onerror = function () {
    g_searchResults[idx].IsValid = false;
	g_searchResults[idx].loading = false;
  }

  // Attempt to load it.
  g_searchResults[idx].img.src = g_searchResults[idx].MediaUrl;
}

function getLastBestImage(bLoaded) {
  var minScore = 9999;
  var bestImageIdx = -1;
  var i = 0;
  for (i = 0; i < g_searchResults.length; i++) {
    // We're looking for one that hasn't been displayed before, and has highest rank.

    if (g_restrictToQuery && g_searchResults[i].query != g_query) continue;

    if (g_searchResults[i].nDisplayed > 0) continue;

    // We want only new ones to load.	
    if (!bLoaded && (g_searchResults[i].loaded || g_searchResults[i].loading || !g_searchResults[i].IsValid)) continue;

    // Looking for one that's already loaded.	  
    if (bLoaded && !g_searchResults[i].loaded) continue;

    if (g_searchResults[i].deleted) continue;

    // Take the one with minimal searh hitlist rank (rank 0 is the top hit)
    // Factor in a priority (not in use now).	
    var score = g_searchResults[i].rank + g_searchResults[i].priority * g_searchResults.length;

    if (score <= minScore) {
      // take the last best score.
      minScore = score;
      bestImageIdx = i;
    }
  }
  return bestImageIdx;
}

function nextImage(bLoaded) {
  if (g_stopped) 
    return -1;

  if (g_direction == 0) {
    // Any loaded images left to show?
    var candidate = getLastBestImage(bLoaded);
	if (candidate != -1) 
	  return candidate;
	// No new images left, start going forward through the old ones by dropping through, 
	// unless we have shown no images yet, if we are restricting to the query.  Whew!
	if (g_restrictToQuery && g_imageIdx != -1) {
	  g_direction = 1;  
	} else {
	  // Send back error code.  Nothing new to show.
	  return candidate;
	}
  }

  // If in next/prev mode, scan for next valid image.
  var tmpIdx = g_imageIdx;
  while (tmpIdx >= 0 && tmpIdx < g_imageIndexes.length) {
    tmpIdx += g_direction;

    if (tmpIdx < 0) {
	  // Going backwards, and just hit the beginning.  Wrap.
	  tmpIdx = g_imageIndexes.length - 1;
    }
	
	if (tmpIdx >= g_imageIndexes.length) {
	  // Going forwards and just hit the end.  
	  
      // Switch to "new image" mode (normal) if at the end and there's more.
      g_direction = 0;
      var nextIdx = getLastBestImage(bLoaded);
      if (nextIdx != -1) return nextIdx;

      // Wrap around if there are no more new images to show.
      g_direction = 1;
	  tmpIdx = 0;
    }

    if (g_searchResults[g_imageIndexes[tmpIdx]].deleted) continue;

    if (!g_restrictToQuery) break;

    // Keep going until you find the next image for this query.  
//    if (tmpIdx != g_imageIdx && g_searchResults[g_imageIndexes[tmpIdx]].query == g_query) break;
    if (g_searchResults[g_imageIndexes[tmpIdx]].query == g_query) break;
  }

  // tmpIdx is good, or we would have returned from that while loop.
  g_imageIdx = tmpIdx;
  return g_imageIndexes[tmpIdx];
}


function deleteQuery(query) {
  if (query.length == 0) return;

  g_restrictToQuery = false;

  for (i = 0; i < g_searchResults.length; i++) {
    if (g_searchResults[i].query == query) {
      g_searchResults[i].deleted = true;
      // Better:  remove it from the array?
    }
  }

  // Remove it from g_queries, so you can say it again if you want.
  delete g_queries[query];
  
  var queryDiv = getQueryDiv("listElement", query);
  $(queryDiv).remove();

  // Drop it from the text display.
  // Or not.  If we drop it, then any query containing it will fail to highlight.
  // g_finalTranscript = g_finalTranscript.replace(g_query, '');
  // final_span.innerHTML = g_finalTranscript;

  // should toggle. 
  if (g_stopped)
    goGo();
}

function moreQuery(query) {
  if (query.length == 0) return;
  
  // Can only be clicked once.
  var moreQueryDiv = getQueryDiv("moreQuery", query); 
  var color = $(moreQueryDiv).css("color");
  if (color == "rgb(255, 0, 0)") {
    return;
  } else {
    $(moreQueryDiv).css("color", "red");
  }

  g_restrictToQuery = true;
  g_query = query;
  
  // Query is already clean.
  searchInternetAgain(query, 34);

  g_direction = 1;
  goGo();
}

function setOpacitySpeed(opacity) {
  $("#theImage").css ("-webkit-transition", "opacity " + opacity + "s");
  $("#theImage2").css ("-webkit-transition", "opacity " + opacity + "s");
}

function goBack() {
  g_direction = -1;
  g_stopped = false;
  slideShow();
  goStop();
}

function goForward() {	
  g_direction = 1;
  g_stopped = false;
  slideShow();
  goStop();
}

function goGo() {
  setOpacitySpeed(0.5);
//  g_playing = true;
  g_stopped = false;

  // Allow slideshow in reverse.  
  if (g_direction == 0) 
    g_direction = 1;
	
  setPlayButton(true);
  slideShow();
}

function setPlayButton(playing) {
  btnGoPlay.style.color = playing ? "red" : "black";
  btnGoPlay.innerHTML = playing ? "stop" : "play";
}

function goStop() {
//  g_playing = false;
  g_stopped = true;
  setOpacitySpeed(0);
  setPlayButton(false);
  stopSlideShow();
}

function goPlay() {
  if (btnGoPlay.innerHTML == 'stop') {
    goStop();
  } else {
    goGo();
  }
}

function clear() {
  g_inputTextChunk = new Object;
  g_submittedTextInput = '';
  g_searchResults = [];
  g_imgUrls = {};
  g_queries = {};
  g_imageIndexes = [];
  g_imageIdx = -1;
  g_query = '';
  g_direction = 0;
  final_span.innerHTML = '';
  listDiv.innerHTML = '';
  g_finalTranscript = '';
  g_restrictToQuery = false;
}