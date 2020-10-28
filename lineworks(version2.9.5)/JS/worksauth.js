// Login Javascript Inteface
// 참고: https://wiki.navercorp.com/pages/viewpage.action?pageId=388145419

var worksAuth = {
    login: function(snsCode) {
        webkit.messageHandlers.login.postMessage({"snsCode": snsCode});
    },
    
    join: function(snsCode, redirectUrl) {
        var params = {"snsCode": snsCode, "redirectUrl": redirectUrl};
        webkit.messageHandlers.join.postMessage(params);
    },
    
    joinComplete: function(groupName) {
        var params = {"groupName": groupName};
        webkit.messageHandlers.joinComplete.postMessage(params);
    },
    
    close: function() {
        webkit.messageHandlers.close.postMessage(true);
    },
    
    openBrowser: function(url) {
        webkit.messageHandlers.openBrowser.postMessage({"url": url});
    },
    
    wait: function(uuid, inviteCode, email, organization) {
        var params = {"uuid": uuid, "inviteCode": inviteCode,
            "email": email, "organization": organization};
        webkit.messageHandlers.wait.postMessage(params);
    },

    linkOtherLogin: function(otherLoginType, result, message) {
        var params = {"otherLoginType": otherLoginType, "result": result, "message": message};
        webkit.messageHandlers.linkOtherLogin.postMessage(params);
    },

    loginOtherMethod: function() {
        webkit.messageHandlers.loginOtherMethod.postMessage(true);
    },
    
    deleteQuickLoginToken: function(uuid) {
        var params = {"uuid": uuid};
        webkit.messageHandlers.deleteQuickLoginToken.postMessage(params);
    }
};

