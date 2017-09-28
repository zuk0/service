/**
 * Created by TVzavr on 25.08.2017.
 */

(function(context){
    var _START = (new Date().getTime()) / 1000 | 0;
    var _app_config = {
        path: 'appConf',
        vars: { name: 'appName', version: 'appVer', platform: 'platform'}
    };

    if(context.parent){
        var _APP;
        console.log("apl", "root index.js invoked in context: " + context.name);
        /*
        context.parent._tvz._APP = {
            config: context[_app_config.path] || {},
            info: (function() {
                return ['+appConf.appName+' | '+ appConf.appVer+' | '+appConf.platform+'];
            })(_app_config)
        };

        */

        context.parent._tvz._APP = (function(config){
            console.warn("APP FUNCTION");
            return {
                _START: _START,
                _STOP: null,
                _ERROR: null,
                config: context[config.path] || {},
                info: function(){
                    return '@app: ' + this.config[config.vars.name] + '|' + this.config[config.vars.version] + '|' + this.config[config.vars.platform];
                }
            };
        })(_app_config);

        context._tvz = context.parent._tvz;
        //context._tvz._START = (new Date().getTime()) / 1000 | 0;
        context._tvz.service.console.log('apl', context._tvz._APP.info() + ' init in context['+context.name+']...');

        // add error handler to app window
        context.addEventListener('error', function (e) {
            var stack = e.error.stack;
            var message = e.error.toString();
            message = stack? message += '\n' + stack : message;
            this._tvz._APP._STOP = (new Date().getTime()) / 1000 | 0;
            this._tvz._APP._ERROR = e;
            console.error(message);
            console.log('apl', {stop: this._tvz._APP._STOP, error: this._tvz._APP._ERROR});
        },false);

        context.addEventListener('load', function (e) {
            console.log(this._tvz._APP._START);
            var _ts = {
                start: this._tvz._APP._START,
                end: (new Date().getTime()) / 1000 | 0
            };
            console.log('apl', appConf.appName + ' app loaded in ' + (_ts.end - _ts.start) + 'ms', _ts);
        },false);


    }

})(window);