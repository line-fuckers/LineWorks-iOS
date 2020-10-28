// Works 내부에서 자바스크립트 메소드를 사용하여 로직을 체크하기 위한 object
var workschecker = {
    appleStatusBarStyle: function () {
        var element = document.getElementsByName('apple-mobile-web-app-status-bar-style')[0];
        
        if (element == null) {
            return null;
        }
        
        if (!!element.getAttribute == false) {
            return null;
        }
        
        return element.getAttribute('content');
    }
}

