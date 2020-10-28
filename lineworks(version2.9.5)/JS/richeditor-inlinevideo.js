/**
 홈/노트 에서 사용하는 인라인 비디오 컴포넌트를 생성 처리하는 스크립트
 */

var wm_editor_video = {};

$(document).ready(function () {
    $(document).bind('copy', function (e) {
        wm_editor_video.preventCopyVideo(e);
    });

    $(document).bind('cut', function (e) {
        if (wm_editor_video.preventCopyVideo(e) == true) {
            $(e.originalEvent.target).html("<div></div>");
            document.getSelection().removeAllRanges();
        }

        lw_richeditor_nativecall.changeContents();
    });
});

wm_editor_video.createVideoContainer = function () {
    var element = document.createElement('div');
    element.setAttribute('contenteditable', 'false');
    element.classList.add('video_internal');
    element.classList.add('edit_mode');
    element.classList.add('_w_video_div');
    element.classList.add('_w_video_el');
    return element;
};

wm_editor_video.createVideoCaption = function (attrs) {
    var div = document.createElement('div');
    div.setAttribute('contenteditable', 'false');
    div.classList.add('caption');
    div.classList.add('_w_video_el');

    var videoTitle = document.createElement('span');
    videoTitle.setAttribute('contenteditable', 'false');
    videoTitle.classList.add('video_title');
    videoTitle.classList.add('_w_video_title');
    videoTitle.classList.add('_w_video_el');
    videoTitle.innerHTML = attrs['video_title'];

    var videoVolume = document.createElement('span');
    videoVolume.setAttribute('contenteditable', 'false');
    videoVolume.classList.add('video_volume');
    videoVolume.classList.add('_w_video_el');
    videoVolume.innerHTML = attrs['video_volume'];

    div.appendChild(videoTitle);
    div.appendChild(videoVolume);

    return div;
};

wm_editor_video.createVideo = function (attrs) {
    var element = document.createElement('video');

    element.setAttribute('contenteditable', 'false');
    element.classList.add('_w_video');
    element.classList.add('_w_video_el');
    element.setAttribute('width', '700px');

    for (var key in attrs) {
        element.setAttribute(key, attrs[key]);
    }

    return element;
};

wm_editor_video.insertVideo = function (videoAttrs, captionAttrs, insertNewLine) {
    try {
        var container = wm_editor_video.createVideoContainer();
        var video = wm_editor_video.createVideo(videoAttrs);
        var caption = wm_editor_video.createVideoCaption(captionAttrs);

        container.appendChild(video);
        container.appendChild(caption);

        var tagString = container.outerHTML;

        if (insertNewLine == true) {
            // <br><br> 로 줄바꿈시 웹,iOS 에서 삭제 불가능한 이슈 가 있어, 웹,안드로이드,iOS 협의하에 <div>zero width space</div> 로 처리
            tagString = "<br>" + tagString + "<div>\u200B</div>";
        }

        lw_richeditor.insertHTMLStringToCurrentRange(tagString);

    } catch (e) {
        console.log("insert video error: " + e);
    }
};

wm_editor_video.removeVideo = function (attrs) {
    let data = attrs['data'];
    let video = findVideoElement(data);
    video.parentElement.remove();
};

wm_editor_video.editVideoName = function (attrs, newName) {
    let data = attrs['data'];
    let video = findVideoElement(data);
    let extension = video.getAttribute('data-extension');

    // 유효성 확인 (웹에서 사용하는 로직과 동일)
    let validName = validVideoName(newName);

    if (validName === '') {
        return;
    }

    // 새로운 이름 적용 (이름 + 확장자)
    video.setAttribute('data-filename', validName + '.' + extension);

    // 본문 화면에 나타나는 영역 이름 변경 (확장자 없이 이름만 나타남)
    let caption = video.parentElement.querySelector('.video_title');
    caption.innerHTML = validName;
}

function validVideoName(name) {
    return name.trim().replace(/[\\/:*?"<>|]/gi, '').replace(/\s/gi, '_');
}

function findVideoElement(fileId) {
    return document.querySelector("video[data='" + fileId + "']");
}

wm_editor_video.preventCopyVideo = function (e) {

    let fragment = window.getSelection().getRangeAt(0).cloneContents();
    let elements = fragment.querySelectorAll('[class*="_w_video_div"]');

    if (elements.length == 0) {
        return false;
    }

    elements.forEach(element => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    // container 에 수정된 DocumentFragment 를 추가한 후 innerHTML 로 container 내부 노드의 HTML String 을 가져오기 위한 처리
    let container = document.createElement('div');
    // fragment.cloneNode(true) 에서 태그에 싸여있지 않는 텍스트가 있을 가능성이 있어 div 태그로 한번 감싸주도록 한다.
    let div = document.createElement('div');
    div.appendChild(fragment.cloneNode(true));

    container.appendChild(div);

    e.originalEvent.clipboardData.setData('public.html', container.innerHTML);
    e.preventDefault();

    return true;
};

wm_editor_video.focusToEditor = function() {
    var range = lw_richeditor.focusRange;

	let selection = window.getSelection();
    selection.removeAllRanges();

    if (range == null) {
        range = new Range();
        range.setStart(lw_richeditor.editor, 0);
    }

    selection.addRange(range);

    lw_richeditor.setContentEditable(true);
};