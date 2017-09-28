
/** from tvzavr3.12.7 production/appConf
 * Функция получения платформы
 * @constructor
 *
 */

var __tvzENV, _PLATFORM;


_PLATFORM = function(identify, base){

    var BASE_KEY_MAP = {
        dirs: {UP:38, DOWN:40, LEFT:37, RIGHT:39},
        main: {ENTER:13, RETURN: 461, HOME: 0, EXIT: 0},
        service: {RED:403, GREEN:404, YELLOW:405, BLUE:406},
        numbers: [48,49,50,51,52,53,54,55,56,57]
    };

    var _extend = function(target,source){if(source) for(var i in source) target[i] = source[i]; return target;};
    var _defaults = function(o,d){for(var i in d){if (!o.hasOwnProperty(i)) {o[i] = d[i];}}return o;};

    var Platforms = {
        desktop: {
            keys: (function(own, base){
                return _defaults(own, base);
            })({
                main: {ENTER:13, RETURN: 8, EXIT: 27},
                service: {RED: 82, GREEN: 71, BLUE: 66, YELLOW: 89}
            }, BASE_KEY_MAP)
        },
        lg: { keys: BASE_KEY_MAP},
        sony: { keys: BASE_KEY_MAP},
        tizen: { keys: BASE_KEY_MAP},
        samsung: {
            keys: {
                dirs: {UP:29460, DOWN:29461, LEFT:4, RIGHT:5},
                main: {ENTER:29443, RETURN: 88, HOME: 0, EXIT: 45},
                service: {RED:108, GREEN:109},
                numbers: [17,101,98,6,8,9,10,12,13,14]
            }
        }
    };

    return _extend(identify, Platforms[identify.id] || Platforms[base]);
};

__tvzENV = (function (Platform) {
    
    var uAgent = window.navigator.userAgent;

    var identifyObj = {
        SmartHub:      {code: "smp", plf:'samsung',     device: 'samsung' , id: 'samsung' }, // Samsung на нативной платформе
        Tizen:         {code: "smp", plf:'tizen',       device: 'tizen'   , id: 'tizen' }, // Samsung с опереационной системой Tizen
        SimpleSmart:   {code: "lgn", plf:'simpleSmart', device: 'lg'      , id: 'lg' }, // LG платформа под управлением смартфона
        NetCast:       {code: "lgn", plf:'netCast',     device: 'lg'      , id: 'lg' }, // LG на платформе netCast
        'Web[0O]S':    {code: "lgn", plf:'webOS',       device: 'lg'      }, // LG на платформе WebOS
        LGSmartTV:     {code: "lgn", plf:'lg',          device: 'lg'      }, // LG на нативной платформе
        NETTV:         {code: "phn",                    device: 'desktop' }, // Philips
        Toshiba:       {code: "tsh",                    device: 'desktop' }, // Toshiba
        Espial:        {code: "tsh",                    device: 'desktop' }, // Toshiba
        'Opera TV':    {code: "opera",                  device: 'desktop' }, // Телевизор на платформе операТВ, обычно Sony
        'Sony|Bravia': {code: "sce",                    device: 'sony'    }, // Sony
        Viera:         {code: "pnc",                    device: 'desktop' }, // Panasonic
        hisense:       {code: "hcs",                    device: 'desktop' }, // Телевизор компании hisense
        spiderMan:     {code: 'tzf',                    device: 'desktop' }, // FlashPlayer
        infomir:       {code: 'mag',                    device: 'desktop' }, // Приставка mag250
        fxm:           {code: 'fxm',                    device: 'desktop' }, // SmartTV от платформы FXM
        netrange:      {code: 'ntr',                    device: 'desktop' }, // SmartTV от платформы netrange
        PCBrowser:     {code: 'std',                    device: 'desktop' , id: 'desktop'}  // Браузер на компьютере

    };

    /**
     * Определение платформы из userAgent
     * @param str userAgent
     * @return {string} Ключ от объекта с платформами
     */
    var indexOf = function (str) {
        var temp = 'PCBrowser';

        Object.keys(identifyObj).forEach(function (key, i, keys) {
            ~str.search(new RegExp(key,'i')) && (temp = key) && (keys.length = 0);
        });

        return temp;
    };
    
    /**
     * Формирование платформы
     * @return {*|{code: string, plf: string}}
     */
    
    return Platform(identifyObj[indexOf(uAgent)]);
    
})(_PLATFORM);