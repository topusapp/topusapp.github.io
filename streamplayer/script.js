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
        },
        getM3U8Resource: function() {
            var resources = performance.getEntriesByType('resource');
            for(var i=0;i<resources.length;i++){
                if(resources[i].initiatorType == 'xmlhttprequest' && resources[i].name.indexOf('.m3u8') > 0) {
                    return resources[i].name;
                }
            }
        },
        postPlayingStream: function(media) {
            var streamURL = media.currentSrc;
            if(streamURL.indexOf('blob:') == 0) {
                streamURL = libs.getM3U8Resource();
            };

            if(streamURL == undefined || streamURL.length == 0 || streamURL.indexOf('.gif') > 0) {
                return false;
            };
            
            libs.postMsg({
                status: 'playing',
                source: streamURL,
                contentType: libs.getContentType(streamURL),
                title: document.title,
                subtitle: document.domain,
                image: libs.getOGImage()
            });

            return true;
        },
        postWebEmbed: function(url) {
            libs.postMsg({
                status: 'playing',
                source: url,
                contentType: 'video/web',
                title: document.title,
                subtitle: document.domain,
                image: libs.getOGImage()
            });
        },
        getYTID: function(link){
            var match = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/.exec(link);
            if(match == null || match.length != 2){
                return "";
            };
            return match[1];
        },
        getDailyMotionId: function (url) {
            var m = url.match(/^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/);
            if (m !== null) {
                if(m[4] !== undefined) {
                    return m[4];
                }
                return m[2];
            }
            return "";
        },
        castWebEmbed: function(){
            var videoId = libs.getYTID(window.location.href);
            if(videoId.length > 0) {
                libs.postWebEmbed(`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&showinfo=0&rel=0&iv_load_policy=3`);
                return true;
            };
            // videoId = libs.getDailyMotionId(window.location.href);
            // if(videoId.length > 0) {
            //     libs.postWebEmbed(`https://geo.dailymotion.com/player.html?video=${videoId}`);
            //     return true;
            // };

            return false;
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

        if(libs.castWebEmbed()){
            return;
        };

        var haveStream = false;
        document.querySelectorAll("video").forEach((media, index) => {
            if(media.hasAttribute('NowbPAWBXD')) {
                return;
            }

            if(media.paused != undefined && !media.paused && !haveStream) {
                if(libs.postPlayingStream(media)) {
                    haveStream = true;
                }
            }

            media.setAttribute('NowbPAWBXD', '');

            media.addEventListener("playing", function() {
                libs.postPlayingStream(media);
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
