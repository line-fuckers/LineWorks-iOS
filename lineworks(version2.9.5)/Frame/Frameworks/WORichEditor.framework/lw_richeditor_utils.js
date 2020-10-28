var lw_richeditor_utils = {};

// dictionary를 json으로 변경
lw_richeditor_utils.dictionary2json = function(object) {
    var results = [];
    for (var property in object) {
        var value = object[property];
        if (value) {
            results.push('\"' + property.toString() + '\"' + ': ' + '\"' + value + '\"');
        }
    }
    
    return '{' + results.join(', ') + '}';
};


// rgb color를 hex color로 변경
lw_richeditor_utils.rgb2hexColor = function(rgb) {
    if (rgb.indexOf("rgba") === 0) {
        rgb = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(.+)\)$/);
        var alpha = rgb[4] * 255;
        var roundedNumber = Math.round(alpha * 10) / 10;
        return "#" + lw_richeditor_utils.decimal2hex (roundedNumber) + lw_richeditor_utils.decimal2hex (rgb[1]) + lw_richeditor_utils.decimal2hex (rgb[2]) + lw_richeditor_utils.decimal2hex (rgb[3]);
    } else if (rgb.indexOf("rgb") === 0) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return "#" + lw_richeditor_utils.decimal2hex (rgb[1]) + lw_richeditor_utils.decimal2hex (rgb[2]) + lw_richeditor_utils.decimal2hex (rgb[3]);
    } else {
        return lw_richeditor_utils.colorName2hexColor(rgb);
    }
};



// 컬러명을 hex color로 변경
lw_richeditor_utils.colorName2hexColor = function(color) {
    var cvs, ctx;
    cvs = document.createElement('canvas');
    cvs.height = 1;
    cvs.width = 1;
    ctx = cvs.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    
    var rgba = ctx.getImageData(0, 0, 1, 1).data;
    var hex = [0,1,2].map(
                          function(idx) {
                          return ('0'+rgba[idx].toString(16)).slice(-2);
                          }
                          ).join('');
    return "#"+hex;
};


// 10진수를 16진수로 변환
lw_richeditor_utils.decimal2hex = function(x) {
    var hexDigits = new Array
    ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
    
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
};


// comapreStr로 시작하는 str인지 체크. String.prototype.startsWith가 동작안하는 iOS 버전이 있음.
lw_richeditor_utils.startsWith = function(str, compareStr) {
    if (compareStr.length > str.length) {
        return false;
    }
    
    for (var i = 0; i < compareStr.length; i++) {
        if (str[i] != compareStr[i]) {
            return false;
        }
    }
    
    return true;
}


// 현재 커서가 위치하고 있는 node를 찾아서 반환
lw_richeditor_utils.getSelectedNode = function() {
    var node,selection;
    if (window.getSelection) {
        selection = window.getSelection();
        node = selection.anchorNode;
    }
    if (!node && document.selection) {
        selection = document.selection;
        var range = selection.getRangeAt ? selection.getRangeAt(0) : selection.createRange();
        node = range.commonAncestorContainer ? range.commonAncestorContainer :
        range.parentElement ? range.parentElement() : range.item(0);
    }
    
    return node;
};


// 현재 커서가 위치하고 있는 element를 찾아서 반환
lw_richeditor_utils.getSelectedElement = function() {
    var node = lw_richeditor_utils.getSelectedNode();
    if (node) {
        return (node instanceof Element ? node : node.parentElement);
    }
};


// 현재 커서의 위치를 반환
lw_richeditor_utils.getcaretPosition = function() {
    var sel = window.getSelection();
    if (sel.rangeCount > 0) {
        var range = sel.getRangeAt(0);
        var span = document.createElement('span');
        range.collapse(false);
        range.insertNode(span);
        span.style.position = 'absolute';
        var topPosition = span.offsetTop;
        span.parentNode.removeChild(span);
        
        return topPosition;
    }
    
    return 0;
};


// XSS 필터 적용
lw_richeditor_utils.applyXSSFilter = function(richString) {
    
    // 로컬 이미지의 src가 포함된 태그를 복사, 붙여넣기할 경우 로컬 src를 DOMPurify가 제거해주는 문제가 있어 전, 후 처리 작업을 추가.
    DOMPurify.addHook('beforeSanitizeAttributes', lw_richeditor_utils.removeFileProtocol);
    DOMPurify.addHook('afterSanitizeAttributes', lw_richeditor_utils.addFileProtocol);

    var result = DOMPurify.sanitize(richString);
    DOMPurify.removeAllHooks();
    
    return result;
};

lw_richeditor_utils.removeFileProtocol = function (node) {
    if (!node.hasAttribute || !node.hasAttribute("src")) {
        return;
    }
    
    var src = node.getAttribute("src");
    
    if (lw_richeditor_utils.startsWith(src, "file://")) {
        node.setAttribute("src", src.replace("file://", "_file_temp_"));
    }
    
    if (lw_richeditor_utils.startsWith(src, "content://")) {
        node.setAttribute("src", src.replace("content://", "_content_temp_"));
    }
}

lw_richeditor_utils.addFileProtocol = function (node) {
    if (!node.hasAttribute || !node.hasAttribute("src")) {
        return;
    }
    
    var src = node.getAttribute("src");
    
    if (lw_richeditor_utils.startsWith(src, "_file_temp_")) {
        node.setAttribute("src", src.replace("_file_temp_", "file://"));
    }
    
    if (lw_richeditor_utils.startsWith(src, "_content_temp_")) {
        node.setAttribute("src", src.replace("_content_temp_", "content://"));
    }
}
