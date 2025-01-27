var topusapp = {};
(function($) {
    var settings = {};
    var libs = {
        postMsg: function(json) {
            if(json.title.length == 0) {
                json.title = document.domain;
            };
            if(settings.platform === 'ios') {
                window.webkit.messageHandlers.callbackHandler.postMessage(JSON.stringify(json));
            } else if(settings.platform === 'android'){
                jsinterface.getSomeString(JSON.stringify(json));
            } else {
                console.log(json);
            };
        },
        getOGImage: function() {
            var metas = document.querySelectorAll('meta[property="og:image"]');
            if(metas.length > 0 && metas[0].hasAttribute('content')) {
                return metas[0].getAttribute('content')
            }

            return '';
        },
        getContentType: function(streamURL) {
            if(streamURL == null || streamURL.trim().length == 0) {
                return '';
            }

            if(streamURL.indexOf('.m3u8')>0){
                return 'application/x-mpegURL';
            } else if(streamURL.indexOf('.mov')>0){
                return 'video/mov';
            }

            return 'video/mp4';
        }
    };
    var listener = function() {
        if(typeof jsinterface != 'undefined') {
            settings.platform = 'android';
        } else if(typeof window != 'undefined' && typeof window.webkit != 'undefined' && window.webkit.messageHandlers != 'undefined') {
            settings.platform = 'ios';
        } else {
            settings.platform = 'none';
        };

        var haveStream = false;
        document.querySelectorAll("video").forEach((media, index) => {
            if(media.hasAttribute('NowbPAWBXD')) {
                return;
            }

            if(media.paused != undefined && !media.paused && !haveStream && media.currentSrc != undefined &&
                media.currentSrc.length > 0 && media.currentSrc.indexOf('blob://') != 0) {
                haveStream = true;
                libs.postMsg({
                    status: 'playing',
                    source: media.currentSrc,
                    contentType: libs.getContentType(media.currentSrc),
                    title: document.title,
                    subtitle: document.domain,
                    image: libs.getOGImage()
                });
            };

            media.setAttribute('NowbPAWBXD', '');

            media.addEventListener("playing", function() {
                if(media.currentSrc == undefined || media.currentSrc.length == 0 || media.currentSrc.indexOf('blob://') == 0) {
                    return;
                }
                libs.postMsg({
                    status: 'playing',
                    source: media.currentSrc,
                    contentType: libs.getContentType(media.currentSrc),
                    title: document.title,
                    subtitle: document.domain,
                    image: libs.getOGImage()
                });
            });
    
            media.addEventListener("pause", function() { 
            });
    
            media.addEventListener("seeking", function() { 
            });
    
            media.addEventListener("volumechange", function(e) { 
            });
        });
    };

    $.scanmedia = function() {
        listener();
    }

    document.addEventListener("readystatechange", () => {
        if (document.readyState === "complete") {
            setTimeout(() => {
                listener();
            }, 1000);
        }
    });
}(topusapp));

function windowfirefoxdownload(url) {
    function getLastPathComponent(url) {
        return url.split("/").pop();
    }

    function blobToBase64String(blob, callback) {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(this.result.split(",")[1]);
        };

        reader.readAsDataURL(blob);
    }

    if (url.startsWith("blob:")) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
            if (this.status !== 200) {
                return;
            }

            var blob = this.response;

            blobToBase64String(blob, function (base64String) {
                webkit.messageHandlers.downloadContentScript.postMessage({
                    url: url,
                    mimeType: blob.type,
                    size: blob.size,
                    base64String: base64String
                });
            });
        };

        xhr.send();
        return;
    }

    var link = document.createElement("a");
    link.href = url;
    link.dispatchEvent(new MouseEvent("click"));
};
