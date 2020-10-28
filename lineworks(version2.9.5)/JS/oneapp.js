// App-Web WebView 연동 인터페이스
// spec: https://wiki.navercorp.com/pages/viewpage.action?pageId=335476827
//       https://wiki.navercorp.com/pages/viewpage.action?pageId=367068380

var oneapp = {
    close: function() {
        webkit.messageHandlers.close.postMessage(true);
    },
    
    openBrowser: function(url) {
        webkit.messageHandlers.openBrowser.postMessage({"url": url});
    },
    
    logout: function() {
        webkit.messageHandlers.logout.postMessage(true);
    },
    
    withdraw: function() {
        webkit.messageHandlers.withdraw.postMessage(true);
    },
    
    showFontButton: function() {
        webkit.messageHandlers.showFontButton.postMessage(true);
    },
    
    hideFontButton: function() {
        webkit.messageHandlers.hideFontButton.postMessage(true);
    },
    
    useSwipeRefresh: function(enabled) {
        webkit.messageHandlers.useSwipeRefresh.postMessage({"enabled": enabled});
    },
    
    showTabbar: function(show) {
        webkit.messageHandlers.showTabbar.postMessage({"show": show});
    },
    
    showFab: function(show) {
        webkit.messageHandlers.showFab.postMessage({"show": show});
    },
    
    changeStatusBarColor: function(color) {
        webkit.messageHandlers.changeStatusBarColor.postMessage({"color": color});
    },
    
    toggleDisplayMode: function() {
        webkit.messageHandlers.toggleDisplayMode.postMessage(true);
    },
    
    setSelectMode: function(isSelectMode) {
        webkit.messageHandlers.setSelectMode.postMessage({"isSelectMode": isSelectMode});
    },
    
    setAllVisibleDisplayMode: function(isAllVisible) {
        webkit.messageHandlers.setAllVisibleDisplayMode.postMessage({"isAllVisible": isAllVisible});
    },
    
    setMasterDimmed: function(dimmed) {
        webkit.messageHandlers.setMasterDimmed.postMessage({"dimmed": dimmed});
    },
    
    uploadToDrive: function(serviceId, jsonString, callbackScript) {
        var params = {"serviceId": serviceId, "jsonString": jsonString, "callbackScript": callbackScript};
        webkit.messageHandlers.uploadToDrive.postMessage(params);
    },
    
    uploadToFolder: function(serviceId, jsonString, callbackScript) {
        var params = {"serviceId": serviceId, "jsonString": jsonString, "callbackScript": callbackScript};
        webkit.messageHandlers.uploadToFolder.postMessage(params);
    },
    
    getFileFromDrive: function(serviceId, maxCount, maxSize, fileOption, callbackScript) {
        var params = {"serviceId": serviceId, "maxCount": maxCount, "maxSize": maxSize, "fileOption": fileOption, "callbackScript": callbackScript};
        webkit.messageHandlers.getFileFromDrive.postMessage(params);
    },
    
    getFileFromFolder: function(serviceId, maxCount, maxSize, fileOption, callbackScript) {
        var params = {"serviceId": serviceId, "maxCount": maxCount, "maxSize": maxSize, "fileOption": fileOption, "callbackScript": callbackScript};
        webkit.messageHandlers.getFileFromFolder.postMessage(params);
    },
    
    showActionMenu: function(serviceId, jsonArray, callbackScript) {
        var params = {"serviceId": serviceId, "jsonArray": jsonArray, "callbackScript": callbackScript};
        webkit.messageHandlers.showActionMenu.postMessage(params);
    },
    
    openEditor: function(bbsNo, articleNo) {
        var params = {"bbsNo": bbsNo, "articleNo": articleNo};
        webkit.messageHandlers.openEditor.postMessage(params);
    },
    
    shareToHome: function(jsonString) {
        webkit.messageHandlers.shareToHome.postMessage({"jsonString": jsonString});
    },
    
    shareToNote: function(jsonString) {
        webkit.messageHandlers.shareToNote.postMessage({"jsonString": jsonString});
    },
    
    interceptOnToolbarClosePressed: function(intercept) {
        webkit.messageHandlers.interceptOnToolbarClosePressed.postMessage({"intercept": intercept});
    },
    
    requestFeatures: function(functions) {
        webkit.messageHandlers.requestFeatures.postMessage({"functions": functions});
    },
    
    showToast: function(message) {
        webkit.messageHandlers.showToast.postMessage(message);
    },
    
    saveLocalStorageItem: function(item) {
        webkit.messageHandlers.saveLocalStorageItem.postMessage(item);
    },
    
    removeLocalStorageItem: function(item) {
        webkit.messageHandlers.removeLocalStorageItem.postMessage(item);
    },
    
    isInAppBrowser: function(json) {
        webkit.messageHandlers.isInAppBrowser.postMessage(json);
    },
    
    checkCameraAccessAuth: function(json) {
        webkit.messageHandlers.checkCameraAccessAuth.postMessage(json);
    },
    
    openMediaViewer: function(json) {
        webkit.messageHandlers.openMediaViewer.postMessage(json);
    }
};
