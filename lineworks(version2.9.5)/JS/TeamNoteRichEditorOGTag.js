var teamonote_richeditor_ogtag = {};

$(document).on('keypress', function(e) {
               
               console.log("keypress event: " + e.keyCode);
                if(e.keyCode == '13' || e.keyCode == '32') {
                  var element = lw_richeditor_utils.getSelectedElement();

                      var range = window.getSelection().getRangeAt(0);

                      if (range.collapsed) {
                          var stringRange = range.startContainer.textContent.substring(0, range.startOffset);
                          var targetString = stringRange.split(" ").pop().replace(lw_richeditor.ZERO_WIDTH_SPACE, "");

                          teamonote_richeditor_ogtag.detectURL(targetString);
                      }
               }
               });

teamonote_richeditor_ogtag.insertOGTag = function(originalURL, ogURL, ogType, imageURL, title, description) {
    if (imageURL.length == 0 && title.length == 0 && description.length == 0) {
        teamonote_richeditor_ogtag.removeDummyOGTag(originalURL);
        return;
    }
    
    var ogTag = "<div class=\"url ogtag_wrap _ogtag\" contenteditable=\"false\"><a href=\"" + ogURL + "\">";
    
    if (imageURL.length > 0) {
        if (ogType != null && ogType.toLowerCase().indexOf("video") == 0) {
            ogTag += "<span class=\"thmb video\"><img src=\"" + imageURL + "\" alt=\"\"><span class=\"ico_play\"></span></span>";
        } else {
            ogTag += "<span class=\"thmb\"><img src=\"" + imageURL + "\" alt=\"\"></span>";
        }
    }
    
    ogTag += "<span class=\"dsc\"><em class=\"tit\">" + title + "</em><span class=\"txt\">" + description + "</span><span class=\"lk\">" + ogURL + "</span></span></a></div>";
    
    var dummyOgtag = $("[data-dummy-url='" + originalURL + "']");
    dummyOgtag.replaceWith(function(e) {
                           return "<br>" + ogTag + "<p>" + lw_richeditor.ZERO_WIDTH_SPACE + "</p>";
                           });
    
    lw_richeditor_nativecall.changeContents();
};

teamonote_richeditor_ogtag.requestOGTagInfo = function(url, urlString) {
    var dummyOGTag = "<div class=\"dummy_ogtag\" style=\"display:inline;\" data-dummy-url='" + urlString + "'></div>";
    wm_editor.insertOriginalHTML(dummyOGTag + lw_richeditor.ZERO_WIDTH_SPACE);
    teamonote_richeditor_ogtag.ogtagInfoRequest(urlString);
};

teamonote_richeditor_ogtag.removeDummyOGTag = function(urlString) {
    var dummyOgtag = $("[data-dummy-url='" + urlString + "']");
    dummyOgtag.remove()
    lw_richeditor_nativecall.changeContents();
};

teamonote_richeditor_ogtag.detectURL = function(str) {
    var urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gi;

    str.replace(urlRegex, function(url) {
                if (url != "er") {
                    var absoluteURL = url;
                    if (absoluteURL.toLowerCase().indexOf("http://") != 0 && absoluteURL.toLowerCase().indexOf("https://") != 0) {
                       absoluteURL = "http://" + absoluteURL;
                    }
                    teamonote_richeditor_ogtag.requestOGTagInfo(url, absoluteURL);
                }
             });
};

teamonote_richeditor_ogtag.ogtagInfoRequest = function(urlString) {
    window.webkit.messageHandlers.ogtagInfoRequest.postMessage(urlString);
};
