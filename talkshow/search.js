// Globals.
var g_searchResults = [];
var g_queries = new Object;
var g_imgUrls = new Object;
var g_nSearchPhrases = 6;
var g_nSearchNames = 18;

var g_blacklist = [
  "www.animalpictures.pro"
  , "www.thebrokenheeldiaries.com"
  , "www.allcalendar.org"
  , "s3d4.turboimagehost.com"
  , "quote22.com"
  , "www.sublime.ag"
  , "www.imusicdaily.com"
  , "imagelike4u.blogspot.com"
  , "www.tatchme.com"
  , "www.exoticpets.org.uk"
  , "allspicechronicles.com"
];  

function searchInternetAgain(query, nRequestedHits) {
  var fifth = parseInt(nRequestedHits/5);
  var rest = nRequestedHits - fifth;
  console.log ("nRequestedHits=" + nRequestedHits + "  fifth=" + fifth);
//  getBOSS(query, half); 
 getFlickr(query, fifth);
 return getBing(query, rest);
}

function searchInternet(query, nRequestedHits) {
  // Is this a new, and reasonalble, query?
  query = cleanQuery(query);
  if (!addQuery(query)) return false;

  searchInternetAgain(query, nRequestedHits);


  return true;
}

function cleanQuery(query) {
  query = query.trim()
    .replace(/\*/g, "")
    .replace(/\\/g, "")
	.replace(/\"/g, "")
	.replace(/[\(\)]/g, "");
  return query;
}

function queryUnderscore(query) {
  return query.replace(/\s+/g, "_").replace(/\W/g, "_");
}

function addQuery(query) {
  if (!alreadyQueried(query)) {
    g_queries[query] = true;

    // Add it to the list of queries.
	var queryEsc = query.replace(/'/g, "\\'");

    var element = queryUnderscore_listElement.outerHTML.replace(/queryUnderscore/g, queryUnderscore(query))
      .replace(/queryEsc/g, queryEsc)
	  .replace(/query/g, query);
    element = element.replace("hidden", "visible");
    listDiv.innerHTML = element + listDiv.innerHTML;

    return true;
  } else {
    return false;
  }
}

function alreadyQueried(query) {
  // Don't do one-letter queries, not interesting.
  if (query.length <= 1) return true;

  // Don't search for numbers.
  if (/^[0-9]*$/.test(query)) return true;

  // Skip I and variants.	
  if (query == "I" || query == "I'm" || query == "I'll" || query == "I've") return true;

  return g_queries.hasOwnProperty(query);
}

function addImgUrl(imgUrl) {
  if (!alreadyLoaded(imgUrl)) {
    g_imgUrls[imgUrl] = true;
    return true;
  } else {
    return false;
  }
}

function alreadyLoaded(imgUrl) {
  return g_imgUrls.hasOwnProperty(imgUrl);
}

function InBlacklist(url) {
  var j = 0;
  for (j=0; j<g_blacklist.length; j++) {
	if (url.indexOf(g_blacklist[j]) != -1) return true;
  }
  return false;		
}

function addSearchResult (source, query, url, webPageUrl, title) {
        if (!addImgUrl(url)) return;

        // Filter out known malware distributors.  YahooBOSS should get Chrome's list.
        if (InBlacklist(url) || InBlacklist(webPageUrl)) return;		

        // Create a new item in g_searchResults.		 
        var newSearchResults = new Object;
        newSearchResults.MediaUrl = url;
        newSearchResults.query = query;
        newSearchResults.source = source;
        newSearchResults.rank = i;	
        newSearchResults.nDisplayed = 0;
        newSearchResults.DisplayUrl = webPageUrl;
        newSearchResults.Title = title;
	    	newSearchResults.priority = 0;
        newSearchResults.loading = false;
        newSearchResults.loaded = false;
        newSearchResults.deleted = false;
        newSearchResults.IsValid = true; // assume it's valid until we try to load it.
        newSearchResults.img = 0;

        g_searchResults.push(newSearchResults);

        if (g_interruptSlideshow) {
          // Push through the first hit to the slideshow if this is a name.
          g_interruptSlideshow = false;
          var newIdx = g_searchResults.length - 1;

          // Preload the image, and when it loads, interrupt the slideShow. 
          preloadImage(newIdx, true);
        }
}

function getFlickr(query, nRequestedHits) {
  var priority = 0;
  
  var queryEncoded = encodeURIComponent(query).replace("'", "%20");
  var flickrApiKey = "8e178f18275aa59d60ee059fe7648775";
  
  requestStr = "https://secure.flickr.com/services/rest/?method=flickr.photos.search&extras=url_l%2C+url_m&api_key={api_key}&text={query}&format=json&per_page={nRequestedHits}&sort=relevance&content_type=1&jsoncallback=?";
  requestStr = requestStr
    .replace ("{query}", queryEncoded)
	.replace("{nRequestedHits}", nRequestedHits)
	.replace("{api_key}", flickrApiKey);
  console.log(requestStr);

  $.ajax({
    url: requestStr ,
    type: "GET",
    cache: true,
    dataType: 'jsonp',
    success: function(data) {
	
	  if (data.photos.photo.length <= 0) return;

      for (i = 0; i < data.photos.photo.length; i++) {
        // Is this a good, new image?
        var imageInfo = data.photos.photo[i];
		var url = imageInfo.url_l;
		if (!url) url = imageInfo.url_m;
		if (!url) continue;
		
		var webPageUrl = "http://www.flickr.com/photos/{user-id}/{photo-id}"; // - individual photo
		webPageUrl = webPageUrl.replace("{user-id}", imageInfo.owner)
		  .replace ("{photo-id}", imageInfo.id);

		addSearchResult("f", query, url, webPageUrl, imageInfo.title);  
      }
    }
});
  return true;
}  
  
  

function getBOSS(query, nRequestedHits) {
  // Forget about priority for now, just use lower nRequestedHits.
  var priority = 0;

  var quote = "%27";

  //Build up the URL for the request
  // replacing apostrophes with space.  Using &27 seems to terminate the query.
  var queryEncoded = encodeURIComponent(query).replace("'", "%20");

  var requestStr = "../YahooBOSS/YahooBOSS.php?q=" + queryEncoded + "&count=" + nRequestedHits + "&filter=" + (chkBoxSafe.checked ? "yes" : "no");
  console.log(requestStr);

  $.ajax({
    url: requestStr,
    beforeSend: setHeader,
    context: this,
    type: 'GET',
    success: function (data, status) {
      var results = JSON.parse(data);
      // Valid response?
      if (results.bossresponse.images.count <= 0) return;

      for (i = 0; i < results.bossresponse.images.results.length; i++) {
        var imageInfo = results.bossresponse.images.results[i];	
		addSearchResult("y", query, imageInfo.url, imageInfo.refererclickurl, imageInfo.title);  
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(textStatus);
    }
  });
  return true;
}

function getBing(query, nRequestedHits) {
  // Forget about priority for now, just use lower nRequestedHits.
  var priority = 0;

  var quote = "%27";

  //Build up the URL for the request
  var queryEncoded = encodeURIComponent(query);
  var requestStr = "https://api.datamarket.azure.com/Data.ashx/Bing/Search/v1/Image?Query=" + quote + queryEncoded + quote + "&$top=" + nRequestedHits + "&$format=json";
  console.log(requestStr);
  
  //Return the promise from making an XMLHttpRequest to the server
  $.ajax({
    url: requestStr,
    beforeSend: setHeader,
    context: this,
    type: 'GET',
    success: function (data, status) {
      var results = data;
      for (i = 0; i < data.d.results.length; i++) {
        // Create a new item in g_searchResults.		       
		    addSearchResult("b", query, data.d.results[i].MediaUrl, "http://" + data.d.results[i].DisplayUrl, data.d.results[i].Title);  
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(textStatus);
    }
  });
  return true;
}

function setHeader(xhr) {
  var accountKey = "v3igf7DbQg6+wxqG9dt5u9GMKY9MUmJKXDpDkcBPAKM=";
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