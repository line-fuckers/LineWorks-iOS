// nativeCall functions
var nativeCall = {};

nativeCall.runTranslation = function(translatedHtml, translatedHiddenString) {
    
    var body = {};
    if (translatedHtml != undefined) {
        body["translatedHtml"] = translatedHtml;
    }
    
    if (translatedHiddenString != undefined) {
        body["translatedHiddenString"] = translatedHiddenString;
    }
    
    window.webkit.messageHandlers.runTranslation.postMessage(body);
};

nativeCall.selectContentHeight = function(height) {
    window.webkit.messageHandlers.selectContentHeight.postMessage(height);
}

nativeCall.selectImage = function(thumbURL) {
    var body = {};
    
    if (thumbURL != undefined) {
        body["thumbURL"] = thumbURL;
    }
    
    window.webkit.messageHandlers.selectImage.postMessage(body);
}

function selectContentHeight() {
    var height = document.getElementById("readContent").clientHeight;
    nativeCall.selectContentHeight(height)
}

var images = [];

function initReadView() {
    addImageClickEventListener();
    nativeCall.addVideoTouchEventListener();
}

function addImageClickEventListener() {
    var imgs = document.getElementsByTagName("img");
    
    for (var i=0, len = imgs.length; i < len; i++) {
        img = imgs[i];
        
        var thumbURL = img.getAttribute("src")
        var classValue = img.getAttribute("class")
        
        if (thumbURL && classValue) {
            if (classValue.toLowerCase().includes('_storage')) {
                img.addEventListener("click", nativeCall.selectImage.bind(null, thumbURL));
            }
        }
    }
}

nativeCall.selectVideo = function(event) {
    let element = event.target;
    var json = {};
    for (let key of element.getAttributeNames()) {
        json[key] = element.getAttribute(key);
    }
    
    window.webkit.messageHandlers.selectVideo.postMessage(json);
}

nativeCall.addVideoTouchEventListener = function() {
    
    let touchStart = function(e) {
        this.startX = this.currentX = e.touches[0].clientX;
        this.startY = this.currentY = e.touches[0].clientY;
        this.startTime = new Date().getTime();
    };

    let touchMove = function(e) {
        this.currentX = e.touches[0].clientX;
        this.currentY = e.touches[0].clientY;
    };

    let touchEnd = function(e) {
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
                        nativeCall.selectVideo(e);
                    }, 300);
                }
            }
        }
    };

    const elements = document.querySelectorAll("video");
    elements.forEach(function(element) {
        element.addEventListener('touchstart', touchStart);
        element.addEventListener('touchmove', touchMove);
        element.addEventListener('touchend', touchEnd);
    });
}

function isTranslationScriptLoaded() {
    if (typeof mrTranslate == "object" && typeof mrTranslate.translate == "function") {
        return true;
    }
    return false;
}

var translateOptions = {
    className : "contentBody",       // 클래스 명 (ex. class="readBody" 인경우 "readBody" 기입), 복수의 클래스 가능
    source : "",          // 소스 언어 코드 (ko / en / ja / zh_CN / zh_TW)
    target : "",          // 타겟 언어 코드 (ko / en / ja / zh_CN / zh_TW)
    callback : ""         // 콜백 함수명
};

function initTransCallback(e) {
    translateOptions["callback"] = "transCallback";
    mrTranslate.translate(translateOptions);
}

function runTranslation(from, to) {
    translateOptions["source"] = from;
    translateOptions["target"] = to;
    
    if (isTranslationScriptLoaded()) {
        initTransCallback()
        return
    }
    
    translateOptions["callback"] = "initTransCallback";
    
    var n = document.createElement('script');
    n.id = 'noteTranslator';
    n.charset='utf-8';
    n.setAttribute('src', '(script_url_4e@r!dzw)'
                   + '?className=' + translateOptions['className']
                   + '&source=' + translateOptions['source']
                   + '&target=' + translateOptions['target']
                   + '&callback=' + translateOptions['callback']
                   + '&'+ Date.parse(new Date));
    document.body.appendChild(n);
}

function recoverTranslation() {
    if (isTranslationScriptLoaded()) {
        mrTranslate.recoverTranslation()
        selectContentHeight()
    }
}

// 번역 완료 후 콜백
function transCallback(e) {
    
    nativeCall.runTranslation(document.getElementById('readContent').innerHTML, document.getElementById('hiddenStringDiv').textContent);
}

