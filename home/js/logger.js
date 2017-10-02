/**
 * Created by TVzavr on 15.11.2016.
 */

var _LOGGER;

JSON.stringifyOnce = function(obj, replacer, indent){
    var printedObjects = [];
    var printedObjectKeys = [];

    function printOnceReplacer(key, value){
        if ( printedObjects.length > 2000){ // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
            return 'object too long';
        }
        var printedObjIndex = false;
        printedObjects.forEach(function(obj, index){
            if(obj===value){
                printedObjIndex = index;
            }
        });

        if ( key == ''){ //root element
            printedObjects.push(obj);
            printedObjectKeys.push("root");
            return value;
        }

        else if(printedObjIndex+"" != "false" && typeof(value)=="object"){
            if ( printedObjectKeys[printedObjIndex] == "root"){
                return "(pointer to root)";
            }else{
                return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase()  : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
            }
        }else{

            var qualifiedKey = key || "(empty key)";
            printedObjects.push(value);
            printedObjectKeys.push(qualifiedKey);
            if(replacer){
                return replacer(key, value);
            }else{
                return value;
            }
        }
    }
    return JSON.stringify(obj, printOnceReplacer, indent);
};


_LOGGER = (function(){

    var _config, _defaults, _initial, wrapper, cont, el, info, controls, legends, types, filters, fcont, controller, pages, pager, prefix, states,_block;

    _config = {
        name: '_logger',
        prefix: {
            js: '_tvz',
            dom: 'tvz'
        },
        limits: {
            lines: 999
        }
    };

    var _tmpl = function(prefix, target){
        var tmpl = '';
        tmpl += '<div id="'+prefix+'-wrapper">';
        tmpl += '<div id="'+prefix+'-info"><div class="title">app info:</div></div>';
        tmpl += '<div id="'+prefix+'-log">';
        tmpl += '<div id="'+prefix+'-log-content"></div>';
        tmpl += '<div id="'+prefix+'-log-panel" class="'+prefix+'-log-panel">';
        tmpl += '<div id="'+prefix+'-log-filters" class="'+prefix+'-log-filters"></div>';
        tmpl += '<button id="'+prefix+'-log-controller" class="'+prefix+'-log-controller nav-itm">@</button>';
        tmpl += '<div id="'+prefix+'-log-pager">';
        tmpl += '<span class="nav-itm" name="-1" id="page-1" onclick="javascript: _'+prefix+'.updatePage(-1)">&lt;</span>';
        tmpl += '<span class="nav-itm" name="1" id="page1" onclick="javascript: _'+prefix+'.updatePage(1)">&gt;</span>';
        tmpl += '</div></div></div></div>';
        target.innerHTML += tmpl;
    };

    this.reset = function(forsed){
        this.counter = 0;
        this.queue = 0;
        this.page = 0;
        this.pages = [];
        this.src = null;
        if(el) el.innerHTML = '';
        if(forsed) this.log('@log reset by command...');
    };

    this.create = function(options, target){
        console.warn("logger create...", options, target);
        _extend(_config, options);
        if(target){
            _tmpl(_config.prefix.dom, target || document.body);
        }
        this.reset();
        this.init(_config.prefix.dom);
    };

    this.init = function(prefix){
        /* dom */
        wrapper = _byId(prefix + '-wrapper');
        cont = _byId(prefix + '-log');
        info = _byId(prefix + '-info');
        el = _byId(prefix + '-log-content');
        pager = [_byId('page-1'), _byId('page1')];
        controls = _byId(prefix + '-log-panel');
        fcont = _byId(prefix + '-log-filters');

        //make navigatable
        //fcont.classList.add('_logger');

        controller = _byId(prefix +'-log-controller');
        // ;)
        //controller.classList.add('_logger');
        /* staff */
        legends = {
            root: {
                name: 'root',
                css: 'root',
                tmpl: '@root',
                on: true
            },
            apl: {
                name: 'apl',
                css: 'apl',
                tmpl: '@app',
                on: true
            },
            error: {
                name: 'error',
                on: true
            },
            warn: {
                name: 'warn',
                on: true
            },
            info: {
                name: 'info',
                on: true
            }
            /*
            event: {
                name: 'event',
                css: 'event',
                tmpl: 'event',
                on: false
            }

            api: {
                name: 'api',
                tmpl: 'api &uarr;',
                on: false
            },
            resp: {
                name: 'resp',
                tmpl: 'api &darr;',
                on: false
            },
            player: {
                name: 'player',
                tmpl: 'player',
                css: 'pla',
                on: false
            }
            */
            /*
            key: {
                name: 'key',
                //tmpl: 'keys',
                on: false
            },
            error: {
                name: 'error',
                on: true
            },
            */
            // test runtime legends
            /*
            test: {
                name: 'test-start',
                tmpl: '@START',
                root: true,
                on: true
            },
            */
            /*
            page: {
                name: 'page',
                tmpl: 'page',
                on: true,
                root: 'test'
            }
            */
            /*,
            focus: {
                name: 'focus',
                tmpl: 'focus',
                on: true,
                root: 'test'
            }

            done: {
                root: 'test',
                on: true,
                tmpl: '@END',
                fn: function(result){
                    this.log(result);
                    this.root = null;
                }
            }
            */

        };

        filters = _config.filters || ['root','apl']; // additional filters for strings with this legends
        types = _config.types || ['array','object'];
        states = ['red','green','yellow','blue'];
        for(var legend in legends){
            var data = legends[legend];
            if(data && data.tmpl || (data.root && typeof data.root == 'boolean')){
                var l = document.createElement('BUTTON');
                l.innerHTML = data.name;
                l.name = data.name;
                l.className = 'nav-itm legend ' + (data.css || data.name) + (data.on ? '' : ' off');
                l.onclick = function (e) {
                    e.stopPropagation();
                    var selector = legends[e.target.name].css || e.target.name;
                    e.target.classList.toggle('off');
                    legends[e.target.name].on = !e.target.classList.contains('off');
                    var labels = el.querySelectorAll('.' + selector);
                    if (labels) {
                        for (var i = 0; i < labels.length; i++) {
                            var parent = labels[i].parentElement.style;
                            parent.display = parent.display == 'none' ? 'block' : 'none';
                        }
                    }
                };
                fcont.appendChild(l);
            }
        }

        // attach global
        //console.warn("path", path);
        //window[config.override || path] = this;
        _initial = _config.name + ' initialized at PATH: ';
        this.log(_initial + (_config.path || 'window.'+ _config.name));
        _block = _config.block || false;
        controller.onclick = function(e){
            _block = _block? false : true;
        };

    };
    /*
    * @method: attach
    * attach logger to specified object
    * @param: {Object|null} - source. Optional. Object to set logger or null (will override window.console)
    * @param: {String}  - name. Name for source to serv as logger
    * @param: {Object}   - options. Logger config
    * @param: {Function} - onattach. Optional callback
    */
    this.attach = function(source, name, options, onattach){
        options = options || {};
        if(!source && name == 'console'){
            source = window;
            source['_console'] = source[name];
        }
        source[name] = this;
        _defaults = _clone(_config);
        options && _extend(_config, options);
        _config.name = options.name || name;
        onattach? onattach() : this.reset();
        this.log(_initial + (_config.path || 'window') + '.' + name + (window._console? ' | default console ref: _console' : ''));
        if(options.test){ // test legends
            var self = this;
            window.console.log('legends', legends);
            Object.keys(legends).forEach(function(name){
                //var legend = legends[name];
                console.log('legend:', options.test + '[' + name + ']');
                //var method = (self[name] && typeof self[name] === 'function')? name : 'log';
                //self[method](name, options.test + '[' + name + ']');
                //self[method](name, options.test + '[' + name + ']');
                if(self[name] && typeof self[name] === 'function'){
                    self[name](options.test + '[' + name + ']')
                } else {
                    self.log(name, options.test + '[' + name + ']');
                }
            })
        }
    };

    this.detach = function(source){
        source = source || window;
        source[_config.name] = source._console || {};
        this.log('@'+ _defaults.name + ' detached as '+_config.name + '...');
        source[_config.name].log && source[_config.name].log(_defaults.name + ' reset to defaults:', _defaults);
        _config = _defaults;
    };

    /*
     LOGGING METHODS
     */

    // application specific config
    this.app = {
        checklist: {
            player: {
                'onPageChange': function(args){
                    var playerContext = args[1];
                    this.updateWatchers('player', playerContext);
                    console.warn("activate player watcher", playerContext, "watcher:", this.watcher);
                    return [args[0]];
                },
                'onTimeupdate': function(time){
                    //console.log("onTimeupdate", time, this.watcher);
                    if(this.watcher && this.watcher['onTimeupdate']){
                        this.watcher['onTimeupdate'].innerHTML = time[0];
                    }
                    return null;
                },
                'state': function(state){
                    if(this.watcher && this.watcher['state']){
                        this.watcher['state'].innerHTML = state[0];
                    }
                    return null;
                },
                'playMode': function(mode){
                    if(this.watcher && this.watcher['playMode']){
                        console.log("playMode", this.watcher);
                        this.watcher['playMode'].innerHTML = mode[0];
                    }
                    return null;
                },
                'adEvent': function(type){
                    if(this.watcher && this.watcher['adEvent']){
                        this.watcher['adEvent'].innerHTML = type[0];
                    }
                    return null;
                },
                'server': function(type){
                    if(this.watcher && this.watcher['server']) {
                        this.watcher['server'].innerHTML = type[0];
                    }
                    return null;
                },
                'bitrate': function(type){
                    if(this.watcher && this.watcher['bitrate']) {
                        this.watcher['bitrate'].innerHTML = type[0];
                    }
                    return null;
                }
            }
        },
        error: function(args){
            return {
                args: args,
                data: '<label class="error">ERROR</label>'
            };
        },
        warn: function(args){
            return {
                args: args,
                data: '<label class="warn">warn</label>'
            };
        },
        info: function(args){
            return {
                args: args,
                data: '<label class="info">info</label>'
            };
        },
        player: function(args){
            //console.warn("PLAYER LEGEND ARGS", args, this);
            var result = {};
            result.data = '<label class="pla">player</label>';
            result.args = args;
            if(args.length > 1){
                var checkpath = this.app.checklist[args[0]][args[1]];
                if(checkpath){
                    result.args = checkpath.call(this, args.slice(2));
                }
            }
            return result;
        }
    };

    // get info about position
    this.scroll = function(){
        var oH = el.offsetHeight;
        var sH = el.scrollHeight;
        var scroll = el.scrollHeight - el.offsetHeight;
        return {o:oH,s:sH,scroll: scroll, page: Math.floor(scroll / oH)};
    };

    // filter data formating by types (obj,array etc...)
    this.filter = function(data, type){
        if(type == 'number' || type == 'boolean') return data;
        if(type && type == 'object') return data.replace(/"/g,' ');
        filters.forEach(function(filter){
            var re = new RegExp(filter,'g');
            //console.warn("filters", type, typeof data);
            data = data.replace(re, '<b class="'+ filter +'">' + ((prefix? prefix : '@') + filter) + '</b>');
        });
        return data;
    };

    // return just default label or something specified in app object
    this.legend = function(legend, args){
        //var label = '<label class="'+(legend.css || legend.name)+'">' + legend.tmpl + '</label>';
        var result = {};
        if(this.app[legend.name]){
            result = this.app[legend.name].call(this,args)
        } else {
            result.args = args;
            result.data = '<label class="'+(legend.css || legend.name)+'">' + legend.tmpl + '</label>';
        }
        return result;
    };

    // creates a new line element
    this.entry = function(id,type,counter,data){
        var e = document.createElement('DIV');
        if(id){
            e.id = id + this.counter;
            e.innerHTML = '<i>'+ (this.counter++) +'</i>';
            e.className = type? id + ' ' +id+'-'+type : id;
        } else {
            e.className = type || '';
        }
        e.innerHTML += data? data : '';
        return e;
    };

    // update logger positions after new element
    this.update = function(){
        var pos = this.scroll();
        if(pos.scroll){
            if(this.pages.length - 1 < pos.page){
                this.updatePage(null,this.line);
            }
            this.updatePage(1,null);
        }
    };

    // pager controller
    this.updatePage = function(dir,newpage){
        if(newpage){
            this.pages.push(newpage);
            this.page = this.pages.indexOf(newpage);
            //console.log("pages", this.pages.length, pager);
            if(this.pages.length > 1){
                pager[0].style.visibility = "visible";
                pager[1].style.visibility = 'visible';
            }
        }
        if(dir){
            var page = this.pages[this.page + dir];
            //console.log("pager: " + dir, " cur:", this.page, " to:", page, "line:", this.line);
            if(page){
                this.page = this.pages.indexOf(page);
                //console.log("scroll to index", this.page, 'el.prev:', page.previousSibling);
                pager[0].style.visibility = this.page? 'visible' : "hidden";
                pager[1].style.visibility = 'visible'
                page.previousSibling.scrollIntoView(false);
            } else {
                pager[1].style.visibility = "hidden";
                this.line.scrollIntoView(false);
            }
        }

    };

    // write data to new line or src from legend
    this.write = function(data,type,pos){
        var line, last;
        last = (pos + 1 == this.queue);
        if(this.src){
            if(last && this.queue == 1){ // one line only
                this.src.innerHTML += data;
                this.src.classList.add(type);
            } else {
                this.src.appendChild(this.entry(null,type,pos,data));
            }
        } else {
            this.temp.push(this.entry('line',type,this.counter,data));
        }
        if(last){
            if(this.src) this.temp.push(this.src);
            for(var i = 0; i < this.temp.length; i++){
                this.line = this.temp[i];
                el.appendChild(this.line);
                this.update();
            }
        }
    };

    // check for limits or actions before logging
    this.check = function(){
        if(_config.limits.lines == this.counter){
            this.reset(true);
        }
    };

    // console common methods

    this.clear = function(){
        this.reset(true);
    };

    this.error = function(){
        [].unshift.call(arguments, 'error');
        this.log.apply(this,arguments);
    };

    this.warn = function(){
        [].unshift.call(arguments, 'warn');
        this.log.apply(this,arguments);
    };

    this.info = function(){
        [].unshift.call(arguments, 'info');
        this.log.apply(this,arguments);
    };

    this.group = function(){
        return;
        [].unshift.call(arguments, 'group');
        this.log.apply(this,arguments);
    };

    this.block = function(state){
        _block = state || false;
    };

    this.record = function(start, message, options){
        start && this.reset();
        this.log((message || (start? '...start ' : '...stop ') + 'record'));
        
    };

    // take arguments and do logging
    this.log = function(){
        if(_block) return;
        this.check();
        this.temp = []; // hold new lines before adding them to dom
        var data, legend, args;
        args = [].slice.call(arguments);
        this.src = null;

        if(typeof args[0] == 'string'){ // take first arg to check legend
            legend = legends[args[0]];
            if(legend){
                if(legend.root){
                    if(typeof legend.root == 'boolean'){
                        this.root = args[0];
                    } else {
                        legend.on = (this.root == legend.root);
                    }
                }
                if(!legend.on || args.length == 1) return;
                this.data = this.legend(legend, args);
                if(this.data.args){
                    this.src = this.entry('line',args.shift(),this.counter,this.data.data);
                }
                args = this.data.args;
            }
        }
        if(!args) return;
        this.queue = args.length;
        args.forEach(function(arg,pos){
            var type = typeof arg;
            type = (type == 'object' && arg.length)? 'array' : type;
            switch (typeof arg){
                case 'string':
                    data = arg;
                    break;
                case 'object':
                case 'array':
                    data = JSON.stringifyOnce(arg);
                    break;
                default:
                    data = +arg;
            }
            if(data) this.write(this.filter(data,type),type,pos);

        }.bind(this));
    };

    return (this);

}.call({}));
