/*!
 * richeditor.js
 */

var wm_editor = {};

wm_editor.needToBlockCopy = false;
wm_editor.contentAreaId = "rich_editor_content_area"
wm_editor.bodyId = "bodycontent"

wm_editor.scheme = "callback://";
wm_editor.callbackWebView = function(command, query) {
    window.location = wm_editor.scheme + command + "?" + query;
};

document.addEventListener("DOMContentLoaded", function(event) {
    wm_editor.callbackWebView("DOMContentLoaded", "")
});

wm_editor.init = function() {
    
    if (wm_editor.needToBlockCopy) {
        wm_editor.blockCopy();
    }
};

wm_editor.blockCopy = function() {
    
    document.addEventListener("copy", function(e){
        e.preventDefault();
    });

    document.addEventListener("cut", function(e){
        e.preventDefault();
    });
};

// 입력 포커스 있는지 여부
wm_editor.hasFocus = function() {
    if (document.activeElement.id == wm_editor.contentAreaId) {
        return 'yes';
    }
    
    return 'no';
};

// 입력 포커스 숨기기
wm_editor.hideKeyboard = function() {
    var element = document.getElementById(wm_editor.contentAreaId);
    element.blur();
};


// 스티커 이미지 진짜 url로 변경해 줌. insertImageWithSize.onload에서 바뀌지 못한 항목들
wm_editor.replaceCacheImageHtml = function() {
    $(".stampImg").map(function() {
        $(this).attr('src', $(this).attr("originsrc"));
        this.removeAttribute("originsrc");
    });
};

// -----------------------------------------------------
// 리치 에디터
// -----------------------------------------------------

// font 설정 변경
//  - fontsize=7 -> fontsize=18pt
//  - value를 pt로 던져도 내부에서 parseInt 해버린다
wm_editor.convertFontSize = function() {

    $('font').map(function() {
        if ($(this).attr('size') == "2") {
            $(this).css('font-size', "10pt");
        } else if ($(this).attr('size') == "3") {
            $(this).css('font-size', "12pt");
        }
    });
};

wm_editor.insertTranslation = function(string, toTop) {
    var transResultDiv = document.createElement("div");
    transResultDiv.innerText = string;

    var emptyLine = document.createElement("p");
    emptyLine.appendChild(document.createElement("br"));
    
    var parentTarget = document.getElementById(wm_editor.contentAreaId);
    if (toTop) {
        parentTarget.insertBefore(emptyLine, parentTarget.childNodes[0]);
        parentTarget.insertBefore(transResultDiv, parentTarget.childNodes[0]);
    } else {

        var originalArea = document.getElementById("wo_mail_origin_area");
        if (originalArea !== null) {
            // 원문 영역이 존재하면 원문 앞에 붙이기
            originalArea.parentNode.insertBefore(transResultDiv, originalArea);
        } else {
            parentTarget.appendChild(emptyLine);
            parentTarget.appendChild(transResultDiv);
        }
    }

    wm_editor.selectElement(transResultDiv);
};

wm_editor.selectElement = function(target) {

    if (target === null) {
        return;
    }

    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(target);
    selection.removeAllRanges();
    selection.addRange(range);
};

wm_editor.getContentForTranslate = function() {

    var bodyResult;

    // cloneNode를 할 경우 line-break이 무시되는 경우가 있어서 서명을 떼었다가 다시 붙인다
    var mailBody = document.getElementById(wm_editor.contentAreaId);
    var origin = mailBody.querySelector("#wo_mail_origin_area");
    var originParent;
    if (origin !== null) {
        originParent = origin.parentNode;
        originParent.removeChild(origin);
    }

    bodyResult = mailBody.innerText;

    if (origin !== null) {
        originParent.appendChild(origin);
    }

    return bodyResult;
};

wm_editor.setNeedToBlockCopy = function(needToBlockCopy) {
    wm_editor.needToBlockCopy = needToBlockCopy;
    if (wm_editor.needToBlockCopy) {
        wm_editor.blockCopy();
    }
};

wm_editor.getRichString = function() {
    wm_editor.replaceCacheImageHtml();
    wm_editor.convertFontSize();

    return lw_richeditor.getRichString();
}

// ready 시점에 body 컨텐츠를 xss 필터링 수행 후 다시 넣어준다.
wm_editor.xssFilterBodyContent = function() {
    $(document).ready(function(){
        var content = $("#" + wm_editor.contentAreaId).html()
        var result = lw_richeditor.applyXSSFilter(content)
        $("#" + wm_editor.contentAreaId).html(result)
    });
}

wm_editor.insertOriginalHTML = function(html) {
    var sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        var range = sel.getRangeAt(0);
        range.deleteContents();
        
        var el = document.createElement("div");
        el.innerHTML = html;
        var frag = document.createDocumentFragment(), node, lastNode;
        while ( (node = el.firstChild) ) {
            lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        
        if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
};

wm_editor.setContentPaddingTop = function(paddingTop) {
    var bodyStyle = document.getElementById(wm_editor.bodyId).style;
    
    if (bodyStyle.paddingTop == paddingTop) {
        return;
    }
    
    bodyStyle.paddingTop = paddingTop;
};

wm_editor.setContentPaddingBottom = function(paddingBottom) {
    var bodyStyle = document.getElementById(wm_editor.bodyId).style;
    
    if (bodyStyle.paddingBottom == paddingBottom) {
        return;
    }
    
    bodyStyle.paddingBottom = paddingBottom;
};
