/**
 * Created by TVzavr on 17.08.2017.
 */

var app, loadFrame;


loadFrame = function(data,cb){
    var frame, doc;
    if(!cb){
        frame = _byId(data.id);
        doc = frame.contentWindow;
        if(frame.src == data.url){
            return doc && doc.focus();
        }
        if(doc.readyState == 'complete'){
            //window.console = _LOGGER;
            console.log('app', '@app['+data.id+'] REFOCUS...');
            return frame.contentWindow.focus();
        }
        frame.src = data.url;
    }

    //window.console = _LOGGER;
    console.clear && console.clear();
    console.warn("...loading frame", data);
    window._logger = _LOGGER;
    data.target.style.display = 'block';
    frame = document.createElement('iframe');
    frame.id = data.id; frame.name = data.name || data.id;
    frame.classList.add(data.scale || 'scale');
    data.target.appendChild(frame);
    frame.onload = function (){
        var refocus = (data.focus && typeof data.focus == 'function');
        cb.call(data, refocus? data.focus : null);
    };
    frame.src = data.url;
};

_addImageItems = function(amount,target){
    amount = amount || 20;
    var path = '<img width="145" height="218" src="http://www.tvzavr.ru/common/tvzstatic/cache/145x218/#';
    var start = 23500;
    var items = new Array(amount + 1).join(path).split('#');
    items.pop();
    items.forEach(function(path,index){
        var data = {html: path + (start + index) + '.jpg" />', index: index};
        _buildNode('BUTTON',index,'poster',data,null,target);
    });
};

app = {
    state: null,
    service: {
        red: function(){
            console.warn("ACTION COMMAND ON RED");
        },
        reload: function(context){
            (context || window).location.reload();
        },
        clear: function(context){
            if(context){
                context.console[context.console.reset? 'reset' : 'clear'](true);
            } else {
                _tvz.service && _tvz.service.console.reset(true);
            }
        },
        redirect: function(){}
    },
    config: { // state config
        appname: 'redirectApp',
        start: 'main', // name of state to return on init
        debug: true,
        navigation: __tvzENV.keys
    },
    frame: { // app frame config
        url: null,
        place: 'frame',
        css: 'frame_app fixed ',
        ready: false,
        loaded: false,
        connected: false,
        focus: null,
        scale: 'scale',
        id: 'new_app'
    },
    initGrid: function(name,loadingItems,initial){
        var state = this.state.current(name);
        if(loadingItems) _addImageItems(loadingItems,state.cont);
        var items = [].slice.call(state.cont.children);
        state.init(items,initial);
    },
    enter_: function(state){
        if(~this.redirect.modes.indexOf(state.id)){
            return this.redirect.enter(state);
        }
        // enter somewhere else
        if(state.id == '_app'){
            console.log("@APP ENTER ON "+state.id);
            var frame = _byId('new_app');
            var doc = frame.contentWindow;
            return doc && doc.focus();
        }
        console.log("@ROOT ENTER ON "+state.id);
        state.target && state.target.click && state.target.click();
    },
    /* @method: changeCategory
     *
     *  Shows selected list of params
     *  @param {String} - name. name of category
    */
    changeCategory: function(name){
        var parent = _byId('js-select');
        var cats = [].slice.call(parent.querySelectorAll('.select'));
        cats.forEach(function(cat){cat && cat.classList.remove('on');});
        parent.querySelector('.'+name).classList.add('on');
    },
    /* @method: select
     *
     *  Marks/unmarks category as selected
     *  @param {String} - name. name of category
    */
    select: function(state){
        var el = state.target;
        var cat = el.className.split(' ')[0];
        var index = this.cats.indexOf(state.id)? this.cats.indexOf(cat) : 0;
        cat = index? cat : this.cats[index];
        console.error("selected index", index, state.id, state.target);

        this.paths[index] = (function(last, context){
            var remove = ((last === el) && last.classList.contains('active'))? 'remove' : null;
            var id = el.id.slice(cat.length);
            last.classList.remove('active');
            el.classList[remove || 'add']('active');
            if(index <= 1){
                context.path[index] = remove? null : context.data[cat][id];
            } else {
                context.tasks[cat] = remove? null : app_data[cat][id];
            }
            return el;
        })(this.paths[index], this);

        console.table("selected index ["+index+"] after [paths,path]", this.paths, this.path);

        this.ui.panel.style.display = this.path[0]? 'block' : 'none';
    },
    /* @method: build
     *
     *  Parse initial params to build app
     *  @param {Object} - config. Object with params for redirect & actions
     *  @param {String} - prefix. String prefix to select main elements (list with paths/urls & params)
    */
    build: function(config, prefix){
        console.clear();
        this.data = config;
        this.prefix = prefix;
        this.cats = [];
        this.paths = [];
        this.path = [];
        this.tasks = {}; // params cats with some actions on app (user,iso e.t.c)
        
        /* help function to folow indexes (dev use) */
        var _index = function(arr){return arr.join('');};

        /* Create params*/
        var _buildParam = function(data, modes, optional){
            var html = '', mapped = '', _class = modes;
            Object.keys(data).forEach(function (name) {
                var param = data[name];
                Object.keys(optional).forEach(function(option){
                    _class += optional[option](param)? ' ' + option : '';
                });
                html += [name, ':<i class="',_class,'">', param, '</i>'].join('');
                mapped += ['&', name, '=', param].join('');
            });
            return {html: html, mapped: mapped, classList: _class.split(' ')};
        };

        /* temp array of lists with params */
        var _cats = ['params','user','iso','post'];

        Object.keys(config).forEach(function(name,parentIndex){
            var data = config[name];
            var node = _byId(prefix + name);
            var catIndex = _cats.indexOf(name);
            if(~catIndex){
                _buildNode('BUTTON','_',name,{html: name},null,_byId(prefix + 'cats'));
                this.cats.push(_cats.splice(catIndex,1)[0]);
            }

            // build elements & params for each node/path
            config[name] = data.map(function(line,index){
                var data = (typeof line === 'object')?
                    _buildParam(line,name,{edit: function(s){return /\d/.test(s)}}) :
                    {html: line, classList: [name]};

                data.index = _index([1,parentIndex,index]);
                _buildNode('BUTTON',index,name,data,null,node);
                if(!index && node){
                    this.paths.push(node.firstElementChild);
                }
                return (data.mapped)? data.mapped : line;
            }.bind(this));
        }.bind(this));

        this.changeCategory(this.cats[0]);

        // push paths as first category after build
        this.cats.unshift('paths');
        return this;
    },
    /* @method: load
     *
     *  Loads app to frame
     *  @param {String} - type. Sets view mode for opened app
    */
    _onWindowFocusChange: function(){
        this.console.log('root','@window BLUR listener...');
    },
    updateAppFrame: function(mode, reload){
        this.console.log("root","@load ["+mode+"] frame. PATH:" + this.path);
        this.frame.url = this.path.join('');
        var frame = _byId(this.frame.id);
        var doc = frame.contentWindow.document;
        if(doc.readyState == 'complete'){
            this.console.log('root', '@app['+frame.id+'] loaded...');
            this.ui.update('mode','loaded', true);
            //return frame.contentWindow.focus();
        }
        frame.src = this.frame.url;

    },
    _createAppFrame: function(){
        var data = this.frame, el;
        el = document.createElement('iframe');
        el.id = data.id; el.name = data.name || data.id;
        el.className = data.css + data.scale;
        this.ui[data.place].appendChild(el);
        data.ready = true;
        this.console.log("@app frame created at "+ data.place);
    },
    deleteAppFrame: function(){
        this.ui[this.frame.place].removeChild(_byId(this.frame.id));
    },
    /* @method: enter
     *
     *  Select action for click or enter key
     *  @param {Object} - state. Current state clicked
     *  @param {Element} - target. Clicked element
    */
    enter: function(state, target){
        //console.warn("APP ROUTER ON ENTER:", this.state.current().id, this);
        this.console.warn("router on enter ["+state.id+"] target: " + target.id || target.className);
        switch(state.id){
            case 'paths': case 'params':
                return this.select(state);
            break;
            case 'actions':
                var action = target.getAttribute('data-action');
                var type = target.name;
                if(!this.frame.ready){
                    this._createAppFrame();
                    window.addEventListener('blur',this._onWindowFocusChange.bind(this),false)
                }
                this.ui.update('mode','loading', true);
                this.updateAppFrame(type);
            break;
            case 'frame':
                this.console.log('root','...request to focus frame...');
                var frame = _byId('new_app');
                var doc = frame.contentWindow;
                return doc && doc.focus();
            break;
            default:
                this.console.log('root', 'unhandled ENTER on '+ state.id);
                state.target && state.target.click && state.target.click();
        }
    },
    /* @method: init
     *
     *  Initialize app
     *  @param {Object} - state. Initial state returned by state.js
     *  @param {String} - mode. Optional ui mode on start
    */
    init: function(state, mode){
        this.state = state;

        // handle ui dom manipulations
        this.ui = {
            page: function(){return _byId('viewport')},
            mode: _byId('js-mode'),
            path: _byId('js-path'),
            panel: _byId('js-panel'),
            frame: _byId('js-frame'),
            update: function(name,value,mode){
                var target = this[name]? this[name] : _byId(name) || document.querySelector(name);
                target.innerHTML = value;
                if(mode) this.page().className = value;
            }
        };

        this.state.initial = this.paths[0];
        var nav = this.config.navigation;
        var keys = _extend(nav.main,nav.service);
        var self = this;

        // click/enter handler
        var _commandOnAction = function(target, app, mouse){
            var action = target.getAttribute('dir') || target.getAttribute('data-action');
            var state = app.state.current();
            if(mouse && (state.target != target)){
                return (state.target && state.target.focus()) || state.go();
            }
            app.config.navigation.dirs[action]?
                state.go(action) :
                app.service[action]? app.service[action]() : app.enter.call(app,state,target);
        };

        // handle scroll on params switcher
        state.current('cats').cont.addEventListener('scroll', function(e){
            e.cancelBubble = true;
            var catName = document.activeElement.innerHTML;
            console.log("cats scroll cat name", catName);
            if(catName) {
                var cat = _byId(self.prefix + catName);
                var params = self.state.current('params');
                params.target = cat.firstElementChild;
                self.changeCategory(catName);
                params.cont = cat;
            }
        },false);

        // attach listeners
        document.addEventListener('click', function (e) {
            e.preventDefault();
            _commandOnAction(e.target, self, true);
        },false);

        document.addEventListener('keydown', function (e) {
            e.preventDefault();
            var key = e.keyCode;
            var state = self.active || self.state;
            var numbers = nav.numbers;
            var dirs = nav.dirs;
            switch(key){
                case keys.GREEN:
                    self.service.reload();
                break;
                case keys.BLUE:
                    self.service.clear();
                break;
                case keys.RED:
                    self.service.red();
                break;
                case keys.ENTER:
                    _commandOnAction(e.target,self);
                break;
                case keys.RETURN:
                    // return
                break;
                case dirs.UP: case dirs.DOWN: case dirs.RIGHT: case dirs.LEFT:
                    if(state.options.debug) state.history.check();
                    state.current().go(_swapKeys(dirs, key));
                break;
                default:
                    var number = numbers.indexOf(key);
                break;
            }
        });

        // set mode for ui (before something selected)
        this.ui.update('mode',mode || 'idle',true);

        // set initial element focus
        (this.state.initial || _byId('paths_FIRST')).focus();
    }
};