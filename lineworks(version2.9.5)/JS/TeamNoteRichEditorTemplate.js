var teamnote_richeditor_template = {};

teamnote_richeditor_template.changeTemplate = function(oldTemplateID, html) {
    if (oldTemplateID.length == 0 || html.length == 0) {
        return;
    }
    
    var oldTemplates = $("[data-workseditor^='WorksTemplate." + oldTemplateID + "']");
    oldTemplates.replaceWith(function(e) {
                             return html;
                             });
    
    lw_richeditor_nativecall.changeContents();
};
