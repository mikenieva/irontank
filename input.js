(() => {
    let pressedKeys = {};
    const setKey = (event, status) => {
        let code = event.keyCode;
        let key;
        switch(code) {
        case 32:
            key = 'SPACE'; break;
        case 37:
            key = 'LEFT'; break;
        case 38:
            key = 'UP'; break;
        case 39:
            key = 'RIGHT'; break;
        case 40:
            key = 'DOWN'; break;
        default:
            // Asignación de códigos ASCII a letras
            key = String.fromCharCode(code);
        }
        pressedKeys[key] = status;
    }
    // Eventos al presionar botón
    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });
    // Eventos al soltar el botón
    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });
   
    // Capturo "input" al entorno global, agrego una función y recibe de parámetro el key (botón)
    window.input = {
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        }
    };
})();