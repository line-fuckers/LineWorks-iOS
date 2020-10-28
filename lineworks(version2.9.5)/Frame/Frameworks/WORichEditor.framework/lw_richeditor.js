var lw_richeditor = {};

lw_richeditor.editor;

lw_richeditor.ZERO_WIDTH_SPACE = unescape("%uFEFF");
lw_richeditor.commandState = "";
lw_richeditor.currentSelection;
lw_richeditor.focusRange = null;
lw_richeditor.isEditing = false;

lw_richeditor.timer;

lw_richeditor.mainDIV_class = "_edit_cover";
lw_richeditor.inlineImageClass = "_woInlineImage";
lw_richeditor.localImageId = "data-woimageid";
lw_richeditor.needUpload = "data-woneedupload";

$(document).ready(function() {
    lw_richeditor.bindEvent();
});

$(document).on('keydown', function(e) {
    lw_richeditor_nativecall.changeContents();
});


/**
    이벤트 리스너
*/
lw_richeditor.bindEvent = function() {
    var mainEditorArea = $("." + lw_richeditor.mainDIV_class);
    
    lw_richeditor.editor = mainEditorArea[0];
    
    $(document).bind('touchstart', function(e) {
        var event = e.originalEvent;
        
        this.startX = this.currentX = event.touches[0].clientX;
        this.startY = this.currentY = event.touches[0].clientY;
        this.startTime = new Date().getTime();
    });
    
    $(document).bind('touchmove', function(e) {
        var event = e.originalEvent;
        
        this.currentX = event.touches[0].clientX;
        this.currentY = event.touches[0].clientY;
    });
    
    $(document).bind('touchend', function(e) {
        var event = e.originalEvent;
        var that = this;
    
        if (this.tapTimer) {
            clearTimeout(this.tapTimer);
            this.tapTimer = setTimeout(function() {
                that.tapTimer = null;
            }, 300);
        } else {
            if (Math.abs(this.currentX - this.startX) < 4 && Math.abs(this.currentY - this.startY) < 4) {
                if (new Date().getTime() - this.startTime <= 500) {
                    this.tapTimer = setTimeout(function() {
                        that.tapTimer = null;
                        // This is a single tap
                        
                        /*
                            WKWebView는 사용자의 탭이 발생했을 경우에만 편집 모드(키보드 노출)이 된다.
                            그래서 이 시점에 setContentEditable을 true로 변경한다.
                        */
                        lw_richeditor.setContentEditable(true);
                        lw_richeditor.tapEventListener(event);
                    }, 300);
                }
            }
        }
    });
    
    $(document).bind('cut', function(e) {
        lw_richeditor_nativecall.changeContents();
    });
    
    $(document).bind('paste', function(e) {
        var event = e.originalEvent;
        
        var willPreventEvent = false;
        var clipboardData = event.clipboardData.getData('public.rtf');
        
        if (clipboardData == "") {
            // iOS 11.3 이상에서 리치컨텐츠가 복사되는 key가 "public.html"으로 변경됨.
            clipboardData = event.clipboardData.getData('public.html');
            if (clipboardData) {
                clipboardData = lw_richeditor_utils.applyXSSFilter(clipboardData);
                lw_richeditor.insertHTMLStringToCurrentRange(clipboardData);
                willPreventEvent = true;
            }
        }
        
        if (clipboardData == "") {
            clipboardData = event.clipboardData.getData('text/plain');
        }
        
        if (clipboardData != "") {
            var link = event.clipboardData.getData("text/uri-list");
            if (link != "") {
                var textNode = document.createTextNode(link);
                lw_richeditor.insertHTMLStringToCurrentRange(textNode);
                willPreventEvent = true;
            }
        }
        
        if (clipboardData == "") {
            // 이미지 복사
            lw_richeditor_nativecall.pasteImageEvent();
            willPreventEvent = true;
        }
        
        if (willPreventEvent == true) {
            e.preventDefault();
        }
        
        lw_richeditor_nativecall.changeContents();
    });
    
    $(document).bind('selectionchange', function(e) {
        if (lw_richeditor.isEditing == false) {
            return;
        }
    
        clearTimeout(lw_richeditor.timer);
        
        lw_richeditor.timer = setTimeout(function() {
            lw_richeditor_command.getcommandState();
            lw_richeditor_nativecall.changecaretPosition();
        }, 200);
    });
    
    $(document).bind('drop', function(e) {
        lw_richeditor.addDropImage(e);
    });
    
    mainEditorArea.blur(function() {
        lw_richeditor.setContentEditable(false);
    });
}

lw_richeditor.tapEventListener = function(event) {
    var target = $(event.target);
    
    var attributes = {};
    
    attributes["element_name"] = target[0].tagName;
    
    $(target[0].attributes).each(function() {
                                 console.log("tapEvent attrs: " + this.nodeName + " : " + this.nodeValue);
                                 attributes[this.nodeName] = this.nodeValue;
                                 });

    console.log("tapEventListener: " + attributes);
    
    if (target.closest("._edit_cover").is("._edit_cover") == true) {
        // 에디터 영역의 탭이벤트만 네이티브로 콜백해줌.
        lw_richeditor_nativecall.tapEvent(attributes);
    }
    
    if (target.is('a')) {
        return;
    }
    
    if (target.is('img')) {
        return;
    }
    
    // 에디터 영역이 아닌 브라우저의 빈 영역을 선택했을 경우 에디터에 포커스를 주는 코드.
    if (target.is(".wrap_app")) {
        var editCoverBottom = $("._edit_cover").position().top + $("._edit_cover").height();
        
        // edit_cover영역의 좌우 공백을 선택할 경우 wrap_app을 선택한 것으로 오동작하는 이슈가 있어서
        // edit_cover 아래쪽을 선택했을 때만 동작하도록 방어코드 추가.
        if (event.pageY <= editCoverBottom) {
            return;
        }
        
        lw_richeditor.placeCaretAtEnd();
    }
};

lw_richeditor.setContentEditable = function(editable) {
    if (lw_richeditor.isEditing == editable) {
        console.log("contentsEditable is aleary " + editable);
        return;
    }
    
    if (editable == true) {
        lw_richeditor.focusRange = null;
    }
	
	lw_richeditor.isEditing = editable;    
    lw_richeditor_nativecall.changeContentsEditable(editable);
};

lw_richeditor.getIsEditing = function(editable) {
    return lw_richeditor.isEditing;
};

lw_richeditor.backupRange = function() {
    var sel = window.getSelection();
    if (sel.rangeCount > 0) {
        lw_richeditor.focusRange = sel.getRangeAt(0);
    }
};

lw_richeditor.placeCaretAtEnd = function() {
    if (lw_richeditor.isEditing == false) {
        return;
    }
    
    var range = document.createRange();
    range.selectNodeContents($("." + lw_richeditor.mainDIV_class)[0]);
    range.collapse(false);
    
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
};

lw_richeditor.hideKeyboard = function() {
    console.log("lw_richeditor.hideKeyboard");
    lw_richeditor.backupRange();
    lw_richeditor.editor.blur();
};

lw_richeditor.getRichString = function() {
    console.log("getRichString: " + lw_richeditor.editor.innerHTML);
    return lw_richeditor.editor.innerHTML;
};

lw_richeditor.getPlainString = function() {
    return lw_richeditor.editor.innerText
};

lw_richeditor.createImage = function(imagePath, imageId, imageWidth) {
    var image = $('<img/>');
    image.attr('class', lw_richeditor.inlineImageClass);
    image.attr('src', imagePath);
    image.attr('width', imageWidth);
    image.attr(lw_richeditor.localImageId, imageId);
    image.attr(lw_richeditor.needUpload, "true");
    
    return image;
};

lw_richeditor.insertImage = function(imagePath, imageId, classJson, customAttrJson, imageWidth, insertNewLine) {
    try {
        var image = lw_richeditor.createImage(imagePath, imageId, imageWidth);
        
        if (classJson.length > 0) {
            var classList = JSON.parse(classJson);
            
            for (var i=0; i<classList.length; i++) {
                image[0].classList.add(classList[i]);
            }
        }
        
        if (customAttrJson.length > 0) {
            var customAttrDic = JSON.parse(customAttrJson);
            for (var key in customAttrDic) {
                image.attr(key, customAttrDic[key]);
            }
        }
        
        var htmlString = image[0].outerHTML;
        if (insertNewLine == true) {
            htmlString = "<br>" + htmlString + "<br><br>";
        }
        
        lw_richeditor.insertHTMLStringToCurrentRange(htmlString);
    } catch (e) {
        console.log("insertImage error: " + e);
    }
};

lw_richeditor.replaceImageSrc = function(imageId, replaceSrc) {
    var imageTag = $("[" + lw_richeditor.localImageId + "=" + imageId + "]");
    
    imageTag.attr('src', replaceSrc);
    imageTag.attr(lw_richeditor.needUpload, "false");
    lw_richeditor_nativecall.changeContents();
};

/*
    아이패드 멀티태스킹 대응
    사진앱이나 drag & drop 대응 앱으로부터 리치에디터로 이미지를 드랍할 경우에대한 처리 수행
 */
lw_richeditor.addDropImage = function(e) {
    var dataTransfer = e.originalEvent.dataTransfer;
    if (dataTransfer == null) {
        return;
    }
    
    var files = dataTransfer.files;
    if (files == null || files.length == 0) {
        return;
    }
    
    e.preventDefault();
    
    var loadedCount = 0;
    var fileCount = files.length;
    
    var resultList = new Array;
    
    for (var index = 0 ; index < fileCount ; index++) {
        var file = files[index];
        
        // 이미지인 경우만 필터링
        if (file.type.startsWith("image") == false) {
            loadedCount++;
            
            if (loadedCount == fileCount) {
                lw_richeditor_nativecall.dropImageEvent(resultList);
                return;
            } else {
                continue;
            }
        }
        
        // drop을 수행한 위치의 range로 변경
        lw_richeditor.focusRange = document.caretRangeFromPoint(e.clientX, e.clientY);
        
        let reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = function() {
            loadedCount++;
            resultList.push(reader.result);
            
            if (loadedCount == fileCount) {
                lw_richeditor_nativecall.dropImageEvent(resultList);
            }
        };
        
        reader.onerror = function (error) {
            loadedCount++;
            
            if (loadedCount == fileCount) {
                lw_richeditor_nativecall.dropImageEvent(resultList);
            }
        };
        
    }
}

/**
	현재 range에 HTML String을 node로 추가.
*/
lw_richeditor.insertHTMLStringToCurrentRange = function(htmlString) {
    var range = lw_richeditor.focusRange;
    var selection = window.getSelection();
    
    if (range == null) {
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
        } else {
            range = new Range();
            range.setStart(lw_richeditor.editor, 0);
        }
    }
    
    $(htmlString).each(function() {
        if (range == null) {
            return;            
        }
        
        if (range.collapsed == false) {
            // 범위 선택인 상태일때 선택된 부분의 컨텐츠를 제거해준다.
            range.deleteContents();
        }
        
        range.insertNode(this);
        range.setStartAfter(this);
    });
    
    range.collapse(true);
    
    if (lw_richeditor.isEditing == true) {
        // addRange 수행시 의도치 않게 focus가 활성화 되고 있어 편집모드일 경우에만 처리
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    lw_richeditor_nativecall.changeContents();
}
