var home_write_editor = {};

home_write_editor.replaceURLToOGTag = function(originalURL, ogTag) {
    var dummy = $("[data-dummy-url='" + originalURL + "']");
    var newTag = "<br>" + ogTag + "<p>" + lw_richeditor.ZERO_WIDTH_SPACE + "</p>";
    
    dummy.replaceWith(function(e) {
                      return newTag;
                      });
    
    lw_richeditor_nativeCall.changeContents();
};
