var topusapp = {};
(function($) {
    var settings = {};
    var libs = {
        postMsg: function(json) {
            if(settings.platform === 'ios') {
                window.webkit.messageHandlers.callbackHandler.postMessage(json);
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
