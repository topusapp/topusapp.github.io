window.__firefox__.includeOnce("DownloadContentScript", function() {
  Object.defineProperty(window.__firefox__, "download", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(url, securityToken) {
      if (securityToken !== SECURITY_TOKEN) {
        return;
      }
      
      function getLastPathComponent(url) {
        return url.split("/").pop();
      }

      function blobToBase64String(blob, callback) {
        var reader = new FileReader();
        reader.onloadend = function() {
          callback(this.result.split(",")[1]);
        };

        reader.readAsDataURL(blob);
      }

      if (url.startsWith("blob:")) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onload = function() {
          if (this.status !== 200) {
            return;
          }

          var blob = this.response;

          blobToBase64String(blob, function(base64String) {
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
    }
  });
});
