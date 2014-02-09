var g_inputTextChunk = new Object;


function addTextChunk (inputText){
  if (!g_inputTextChunk.hasOwnProperty(inputText)) {
    g_inputTextChunk[inputText] = true;
	return true;
  } else {
    return false;
  }
}  
function checkPhraseShape(re, phraseShape, words) {
  // Use phrase shape and a regex to look for a pattern
  // and extract the corresponding words.
  var nFound = 0;
  var match;

  while (match = re.exec(phraseShape)) {
    if (match.length < 2) continue;

    var name = '';

    // Example:  phraseShape is xxXXxx  looking for /x(XX)/
    var fromIdx = 0;
    var startWholeMatch = match.index;
    // this should be 1, the start of the whole match.

    var wholeMatch = match[0];
    // this is now xXX

    // Do the regex again, of the stuff in parens.
    var insideParens = '';
    var reParens = /(\([^\)]*\))/;
    var matchInside;
    if (matchInside = reParens.exec(re)) {
      insideParens = matchInside[1];
    }
    // this is now XX
    if (insideParens.length == 0) continue;

    // Where is the subgroup in the match?
    // looking for XX in xXX
    var reSubgroup = new RegExp(insideParens);
    if (matchSubgroup = reSubgroup.exec(wholeMatch)) {
      // index of the match should be 1
      fromIdx = startWholeMatch + matchSubgroup.index;
    }

    var toIdx = fromIdx + match[1].length;

    for (i = fromIdx; i < toIdx; i++) {
      if (name.length != 0) name += ' ';
      name += words[i];
    }

    name = cleanQuery(name);
    if (!alreadyQueried(name)) {
      console.log(re + ' ' + phraseShape + ' ' + name);
      searchInternet(name, g_nSearchNames);
      //	  underlineName (name);
      nFound++;
    }
  }
  return nFound;
}

function findNamedEntities(inputText, bFinishedPhrase) {
  if (!inputText) return 0;

  inputText = inputText.trim();
  if (inputText.length == 0) return 0;
  if (inputText == ". . .") return 0;
  if (!addTextChunk(inputText)) return 0;

  var words = inputText.split(/\s+/);
  var phraseShape = '';
  for (i = 0; i < words.length; i++) {
    var firstChar = words[i].charAt(0);
    if (firstChar == firstChar.toUpperCase()) {
      phraseShape += 'X';
    } else {
      phraseShape += 'x';
    }
  }

  var nFound = 0;
  if (bFinishedPhrase) {

    alchemyEntities(inputText, phraseShape, words);
  } else {
    /*
     - xX+x -- must be a name
	 - xX$ -- do nothing, the next word might come in the next buffer
	 - XX+ -- good, at least two, anywhere in the chunk.  take the longest string of caps.
	 - Xxx -- might be a name.  Don't interrupt, we will catch it on the next timeout
     */
    nFound += checkPhraseShape(/x(X+)x/g, phraseShape, words);
    nFound += checkPhraseShape(/(XX+)/g, phraseShape, words);
  }

  return nFound;
}

function alchemyEntities(inputText, phraseShape, words) {
  var requestStr = "../alchemy/example/entities.php?txt=" + encodeURIComponent(inputText);

  console.log(requestStr);

  $.ajax({
    url: requestStr,
    context: this,
    type: 'GET',
    success: function (data, status) {
	  var results;
	  if (data.search(/Fatal error/) == -1)
        results = JSON.parse(data);
		
      if (!results || results.entities.length == 0) {
        // Fall back to phrase shape.

        //   - xX+ -- must be a name, even at end of string
        //	 - X+$ -- likely name, or sentence start
        //   - Xxx -- and no other caps -- could be the beginning of a sentence, so it may or may not be a name.
        //	 - xXxXx -- World of Warcraft -- Happens a lot, but don't try, too many false positives.

        checkPhraseShape(/x(X+)/gm, phraseShape, words);
        checkPhraseShape(/(X+)$/g, phraseShape, words); // lower likelihood it's a name.
		return;
      }
      for (i = 0; i < results.entities.length; i++) {
        var name = cleanQuery(results.entities[i].text);
        if (!alreadyQueried(name)) {
          console.log("found by Alchemy: " + name);
          searchInternet(name, g_nSearchNames);
        }
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(textStatus);
    }
  });
}

// Handle typed text input from a textarea.  Not in use now.
function keyUpHandler() {
  var results = document.getElementById("results");
  var inputText = results.final_span.value + results.interim_span.value;
  var lastChar = inputText.charAt(inputText.length - 1);

  if (!/^[a-zA-Z0-9]+$/.test(lastChar)) {
    var query = findNamedEntities(inputText);
    if (query.length > 0) GetBing(query);
  }
}