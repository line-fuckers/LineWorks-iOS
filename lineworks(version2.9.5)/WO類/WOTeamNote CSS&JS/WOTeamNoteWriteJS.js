/*!
 * WOTeamNoteWriteJS.js
 */

var note_editor = {};

note_editor.insertInlineImage = function(imagePath, imageId, classJson, customAttrJson, imageWidth) {
    try {
        var image = wo_richeditor.createImage(imagePath, imageId, imageWidth);
        
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
        
        var html = "<br>" + image[0].outerHTML + "<br><br>";
        
        var result = document.execCommand('insertHTML', false, html);
        wo_richeditor_nativeCall.changeContents();
        
    } catch (e) {
        console.log("insertImage error: " + e);
    }
};
