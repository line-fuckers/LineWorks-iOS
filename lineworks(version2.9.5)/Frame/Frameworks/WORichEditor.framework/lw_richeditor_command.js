var lw_richeditor_command = {};

lw_richeditor_command.fontSize = "10pt";
lw_richeditor_command.TransparentHiliteColor = "rgba(0, 0, 0, 0)";

lw_richeditor_command.execCommand = function(command, value) {
    console.log("execCommand command: " + command + " value: " + value);
    
    var needCSS = (command === 'backColor') || (command === 'fontSize') ||
    (command === 'foreColor') || (command === 'bold') ||
    (command === 'underline') || (command === 'strikeThrough');
    var hasNotRange = (lw_richeditor_command.hasRangeLength() === false);
    
    if (hasNotRange) {
        lw_richeditor_command.removeBlankIfExist();
        lw_richeditor_command.addBlankSelect();
    }
    
    if (command === 'backColor') {
        lw_richeditor_command.execCommandForHiliteColor(hasNotRange, value);
    } else if (command === 'fontSize') {
        lw_richeditor_command.execCommandForFontSize(hasNotRange, value);
    } else {
        document.execCommand('styleWithCSS', false, needCSS);
        document.execCommand(command, false, value);
    }
    
    if (hasNotRange) {
        lw_richeditor_command.moveToEndcaret();
    }
    
    lw_richeditor_command.correctTextDocoration(command, hasNotRange);
    lw_richeditor_nativecall.changeContents();
};

lw_richeditor_command.getcommandState = function() {
    if (lw_richeditor.isEditing == false) {
        console.log("lw_richeditor_command.getcommandState:: not editMode");
        return;
    }
    
    var element = lw_richeditor_utils.getSelectedElement();
    
    var result = {};
    var command = "";
    
    command = 'bold';
    result[command] = document.queryCommandState(command);
    
    command = 'italic';
    result[command] = document.queryCommandState(command);
    
    command = 'underline';
    result[command] = document.queryCommandState(command);
    
    command = 'strikeThrough';
    result[command] = document.queryCommandState(command);
    
    command = 'subscript';
    result[command] = document.queryCommandState(command);
    
    command = 'superscript';
    result[command] = document.queryCommandState(command);
    
    command = 'justifyLeft';
    result[command] = document.queryCommandState(command);
    
    command = 'justifyRight';
    result[command] = document.queryCommandState(command);
    
    command = 'justifyCenter';
    result[command] = document.queryCommandState(command);
    
    command = 'justifyFull';
    result[command] = document.queryCommandState(command);
    
    command = 'insertunorderedlist';
    result[command] = document.queryCommandState(command);
    
    command = 'undo';
    result[command] = document.queryCommandEnabled('undo');
    
    command = 'redo';
    result[command] = document.queryCommandEnabled('redo');
    
    command = 'fontSize';
    var originValue = document.queryCommandValue(command);
    
    if (originValue === '1') {
        result[command] = lw_richeditor_command.fontSize;
    } else {
        result[command] = lw_richeditor_command.getFonstSizeState(element);
    }
    
    command = 'backColor';
    result[command] = lw_richeditor_command.getHiliteColorState(element);
    
    if (result[command].length > 0) {
        result[command] = lw_richeditor_utils.rgb2hexColor(result[command]);
    }
    
    command = 'foreColor';
    result[command] = document.queryCommandValue(command);
    if (result[command].length > 0) {
        result[command] = lw_richeditor_utils.rgb2hexColor(result[command]);
    }
    
    console.log("lw_richeditor_command.getcommandState: " + result);
    lw_richeditor_nativecall.changeCommandState(result);
};


lw_richeditor_command.getHiliteColorState = function(element) {
    if (element == null) {
        return "";
    }
    
    var node = element;
    var color = $(node).css('background-color');
    
    do {
        if (color != null && color != lw_richeditor_command.TransparentHiliteColor) {
            return color;
        }
        
        node = node.parentElement;
        color = $(node).css('background-color');
    } while(node.nodeName != 'BODY');
    
    return "";
};


lw_richeditor_command.getFonstSizeState = function(element) {
    if (element == null) {
        return "";
    }
    
    var node = element;
    
    do {
        var fontSize = lw_richeditor_command.getFontSizeStyle(node);
        
        if (fontSize != null && fontSize.length > 0) {
            return fontSize;
        }
        
        node = node.parentElement;
        
    } while(node.nodeName != 'BODY');
    
    return lw_richeditor_command.getFontSizeStyle(lw_richeditor.editor);
};

lw_richeditor_command.convertFontSize = function(size) {
    var elements = document.querySelectorAll("*[style]");
    
    Array.prototype.forEach.call(elements, function(element) {
        var fontSize = lw_richeditor_command.getFontSizeStyle(element) || "";
        if (fontSize == 'x-small' || fontSize == '1') {
            $(element).css({'font-size': size});
        }
    
    });
}

// element의 fontSize style값을 반환.
// document.queryCommandValue로 얻어올 경우 px단위로만 얻어오므로 다른 단위로 얻어오려면 해당 함수 사용.
lw_richeditor_command.getFontSizeStyle = function(element) {
    return element.style.fontSize;
}

lw_richeditor_command.execCommandForFontSize = function(hasNotRange, fontSize) {
    lw_richeditor_command.fontSize = fontSize;
    
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('fontSize', false, 1);
    
    if (hasNotRange) {
        var element = lw_richeditor_utils.getSelectedElement();
        $(element).css({'font-size': fontSize});
    } else {
        lw_richeditor_command.convertFontSize(lw_richeditor_command.fontSize);
    }
};

lw_richeditor_command.execCommandForHiliteColor = function(hasNotRange, color) {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('backColor', false, color);
};

lw_richeditor_command.removeBlankIfExist = function() {
    var rangeAncestor = lw_richeditor_command.rangeAncestor();
    if (rangeAncestor == null) {
        return;
    }
    
    var textContent = rangeAncestor.textContent;
    if (textContent === lw_richeditor_command.ZERO_WIDTH_SPACE) {
        rangeAncestor.remove();
    }
};

lw_richeditor_command.rangeAncestor = function() {
    if (window.getSelection) {
        sel = window.getSelection();
        
        if (sel.rangeCount > 0) {
            return sel.getRangeAt(0).commonAncestorContainer;
        }
    }
    
    return null;
};

lw_richeditor_command.hasRangeLength = function() {
    var selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        return (range.startOffset != range.endOffset) || (range.startContainer != range.endContainer);
    }
    
    return false;
};

lw_richeditor_command.addBlankSelect = function() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var elTmp = document.createTextNode(lw_richeditor.ZERO_WIDTH_SPACE);
    range.insertNode(elTmp);
    
    var newRange = document.createRange();
    newRange.selectNodeContents(elTmp);
    sel.removeAllRanges();
    sel.addRange(newRange);
};

lw_richeditor_command.moveToEndcaret = function() {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var container = range.endContainer;
    var offset = range.endOffset;
    
    var newRange = document.createRange();
    newRange.setStart(container, offset);
    newRange.setEnd(container, offset);
    
    sel.removeAllRanges();
    sel.addRange(newRange);
};

lw_richeditor_command.correctTextDocoration = function(command, hasNotRange) {
    if (hasNotRange && (command == 'backColor' || command == 'foreColor')) {
        lw_richeditor_command.execCommand('underline', null);
        lw_richeditor_command.execCommand('underline', null);
        lw_richeditor_command.execCommand('strikeThrough', null);
        lw_richeditor_command.execCommand('strikeThrough', null);
    } else if (hasNotRange == false && (command == 'backColor' || command == 'foreColor' || (command === 'underline') || (command === 'strikeThrough'))) {
        var elements = document.querySelectorAll("*[style]");
        
        Array.prototype.forEach.call(elements, function(element) {
            
            if ($(element).css('color')) {
                var parentDecoration = $(element.parentElement).css('text-decoration');
                var decoration = $(element).css('text-decoration');
                    if (parentDecoration != "none" && decoration == "none") {
                        $(element).css('text-decoration', parentDecoration);
                    }
                }
        });
    }
};
