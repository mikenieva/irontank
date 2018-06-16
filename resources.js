// Librería que recaba todos los recursos en imágenes, 
// ejecuta onload a cada uno de ellos y los regresa
// en funciones asignadas al entorno global (window.resources)

(() => {
    let resourceCache = {};
    let loading = [];
    let readyCallbacks = [];

    // Carga una imagen o un arreglo de imágenes
    const load = (urlOrArr) => {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach((url) => {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    }

    const _load = (url) => {
        if(resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            let img = new Image();
            img.onload = function() {
                resourceCache[url] = img;
                
                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    window.resources = { 
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();