var lw_richeditor_nativecall = {};

lw_richeditor_nativecall.changeCommandState = function(commandState) {
    var jsonResult = lw_richeditor_utils.dictionary2json(commandState);
    
    if (lw_richeditor.commandState != jsonResult) {
        lw_richeditor.commandState = jsonResult;
        window.webkit.messageHandlers.commandState.postMessage(jsonResult);
    }
};

lw_richeditor_nativecall.tapEvent = function(attributes) {
    window.webkit.messageHandlers.tapEvent.postMessage(attributes);
};

lw_richeditor_nativecall.changeContentsEditable = function(editable) {
    window.webkit.messageHandlers.contentEditableChanged.postMessage(editable);
};

lw_richeditor_nativecall.changecaretPosition = function() {
    var position = lw_richeditor_utils.getcaretPosition();
    window.webkit.messageHandlers.carotPositionChaged.postMessage(position);
};

lw_richeditor_nativecall.changeContents = function() {
    window.webkit.messageHandlers.contentsChanged.postMessage(null);
};

lw_richeditor_nativecall.pasteImageEvent = function() {
    window.webkit.messageHandlers.pasteImageEvent.postMessage(null);
};

lw_richeditor_nativecall.dropImageEvent = function(base64StringList) {
    window.webkit.messageHandlers.dropImageEvent.postMessage(base64StringList);
};
