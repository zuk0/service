// navigation states v 1.3
// novikov.a@tvzavr.ru

var _STATE, _STATE_CONFIG, _STATE_INIT, _STATE_GRID;

_STATE_CONFIG = {
    selectors: {
        node: 'nav',
        items: '.',
        focus: 'button,div[tabIndex]',
        nav: '.nav-',
        locker: '.loader'
    },
    separators: {split:':', names:['dirs','navs','grid']},
    stateMethods: false, // if true methods will be attached to each state
    events: {
        capture: false, // last addEventListener argument
        bubbling: {on:true, out: true},
        names: {focus: 'focusin', blur: 'focusout', mouse: 'mouseover', scroll: 'scroll'}
    },
    sides: {UP:'DOWN',DOWN:'UP',LEFT:'RIGHT',RIGHT:'LEFT'},
    dirs:  {
        UP:   {increment:-1,idx:1,next:'previousElementSibling',first:'lastElementChild', col: true, id:'UP', oposite:'DOWN', back:'DOWN',x:'col'},
        DOWN: {increment:1,idx:0,next:'nextElementSibling',first:'firstElementChild', col: true, id:'DOWN', oposite: 'UP', back:'UP',x:'col'},
        LEFT: {increment:-1,idx:1,next:'previousElementSibling',first:'lastElementChild', row:true, id:'LEFT', oposite:'RIGHT', back:'RIGHT',y:'row'},
        RIGHT:{increment:1,idx:0,next:'nextElementSibling',first:'firstElementChild', row:true, id:'RIGHT', oposite: 'LEFT',back:'LEFT', y:'row'}
    }
};

// functional grid with scrolling
_STATE_GRID = {
    setup: function(sides,selector){
        this.side = this.scroll? +this.scroll : null;
        this.row = +sides[0];
        this.col = +sides[1] || +sides[0];
        this.cells = this.row * this.col;
        this.navs = _clone(this.navs);
        var grid = this;
        console.warn("@SCROLL["+this.id+"] setup...[side/row/col] - ",[this.side,this.row,this.col]);

        Object.keys(grid.navs).forEach(function(name){
            var dir = grid.navs[name];
            dir.control = grid.node.querySelector(selector + name);
            dir.control && dir.control.setAttribute('dir',name);
            dir.increment = grid.side? dir.increment : dir.col? dir.idx? -grid.col : grid.col : dir.increment;
            dir.directive = dir.next;
            /*
             * each direction as navigation method
             * @param context {Object} - state
             * @this {nav Object} - nav.LEFT...UP etc
             */
            dir.next = function(context){
                var index = context.items? context.items.indexOf(context.target) : -1;
                // element with index isnt an item (its a control arrow)
                if(!~index) return context.update(this);
                // element with index is state cont item
                var item, control, side;
                context.index = index;
                item = context.items[index + this.increment];
                control = (this.control && this.active)? this.control : null;
                side = context.side? context.side : context.col;
                if(!context.side && this.x) return (typeof item === 'number')? context.items[item] : item;
                item = this.idx? (index % side)? item : control : (index % side) == side - 1? control : item;
                return (item && (typeof item != 'number'))? item : null;
            };
        });
    },
    init: function(items, position, start){
        this.items = items;
        this.total = items.length;
        position = position || 0;
        if(!this.side){ // this is for static grid //this.cells != this.side
            this.total = items.length;
            this.gap = this.cells - this.total;
            while(this.gap--) this.items.push(this.total - 1);
        } else {
            this.toggle(position);
        }
        console.warn("@SCROLL["+this.id+"] init..pos:"+position+" items:"+this.total+" pages: "+ this.page+ "/" + this.pages +" gap:"+this.gap);
        if(start) return this.items[position].focus();
    },
    /*
     * @method toggle - updates controls and actualise grid state
     * @param index {Number} - index of item in grid
     *
     */
    toggle: function(index){
        this.page = Math.floor((index) / this.side) + 1;
        this.pages = Math.ceil(this.items.length / this.side);
        this.gap = (this.pages * this.side) - this.total;
        var grid = this, act = ['none','block'];
        // toggle controls
        Object.keys(grid.navs).forEach(function(dir){
            dir = grid.navs[dir]; // 1 left 0 right
            dir.active = dir.idx? dir.idx == grid.page? 0 : 1 : grid.page == grid.pages? 0 : 1;
            if(dir.control) dir.control.style.display = act[dir.active];
        });
    },
    /*
     * @method update - updates grid on scroll and set controls logic
     * @param dir {Object} - object (nav) with current directional key logic (left,right...)
     * @returns {DOM Element|Event focus}
     */
    update: function(dir){
        console.group("@UPDATE ON ["+this.id+"][last:"+this.index+"]DIR["+(dir? dir.id : 'AFTER SCROLL')+",last:"+this.dir+"]", ' TARGET:',this.target.id);
        var scroll, index;
        if(dir){ // before scroll
            scroll = (this.target == dir.control) && dir.active;
            index = (this.side * (this.page + dir.increment) - this.side) + (this.side - dir.idx) * dir.idx;
            index = this.center? dir.idx? index - Math.floor(this.side / 2) : index + Math.floor(this.side / 2) : index; // todo fix for vertical grid with center aligment...
            if(scroll){
                this.index = index;
                this.items[this.index] && this.items[this.index].focus();
                return dir.control;
            } else { // step inside
                return this.items[dir.idx? this.side + index : index - this.side];
            }
        } else { // after scroll
            dir = this.navs[this.dir];
            this.toggle(this.index);
            return dir.active? dir.control : this.navs[dir.back].control.focus();
        }
    }
};

_STATE_INIT = function(node,state,options){
    state.path = state.path || node.className.split(' ')[0];
    state.node = node;
    state.id = options.appname;
    state.level = 0;
    state.initial = null;
    state.options = options;
    if(options.debug){
        state.limit = 50;
        state.step = 0;
        state.history = {count:0, max: 20, check: function(){
            if(this.count == this.max){
                console.clear && console.clear();
                this.count = 0;
            } else this.count++;
        }};
    }
    state.bubbling = options.events.bubbling;
    state.sides = options.sides;
    state.oposite = options.sides;
    state.dirs = options.dirs;
    state.debug = {};

    // methods to think about...
    state.disable = options.todo;
    state.enable = options.todo;
    return state;
};

_STATE = {
    options: {},
    top: window.parent? window.parent : false,
    path: null, paths: [],
    init: function(config, context){
        console.log("@STATE base init... get present nav nodes",config);
        context = context || config.context || window.document;
        config =  config? _defaults(_clone(_STATE_CONFIG), config) : _clone(_STATE_CONFIG);

        // get nav nodes from context
        var _nodes = [].slice.call(context.querySelectorAll(config.selectors.node));

        /* STATES CREATION PROCESS */
        var _STATES = {}; // object with all states here except _super
        var _super;       // top parent state
        var path = [];    // temp array to keep depth of states
        var depth = {};   // temp object to keep state siblings

        /* STATE METHODS [shared] */
        var _methods = {
            sidedir: function(dir,path){ // to think how to use...
                if(!dir) return this.dir? this.dir : (this.dir = 'initial');
                this.dir = dir;
                this.sides[this.oposite[dir]] = this.target;
                //console.warn("@side save dir...["+path+"] saved DIR:"+this.dir);
                return this;
            },
            current: function(id){
                return _STATES[id] || _STATES[this.transition.end[0]];
            },
            enter: function(data){
                data.cancelBubble = this.bubbling.on;
                this.target = data.target;
                this.transition.end = [this.id,data.target];
                var path = (this.transition.start[0] == this.id)? ' SAME PATH' : ' <- CHANGE PATH -> ['+this.transition.start[0]+']';
                //console.warn("OnEnter: [" + this.id +"]" + path);
                //console[console.table? 'table' : 'info'](this.transition);
                this.node.classList.add('hover');
            },
            leave: function(data){
                data.cancelBubble = this.bubbling.out;
                this.data = [this.id,data.target];
                this.transition.start = this.transit && this.transit({id:this.id,target:data.target}) || this.data;
                if(this.nosave) this.target = this.getFocus();
                //console.warn("OnLeave: [" + this.id + "] " + this.path.slice(0,3));
                this.node.classList.remove('hover');
            },
            getFocus: function(){
                var focus = this.cont.querySelector(config.selectors.focus);
                return focus? focus : {focus:function(){
                    console.error('cant find element to focus. activeElement:', document.activeElement);
                    return document.activeElement || this.initial;
                }};

            },
            next: function(dir){
                //console.warn('next('+(dir? dir : 'no dir?')+') on:'+this.id + ' loop:' + (this.loop? this.loop : 'NO'));
                var loop, next;
                loop = this.loop? this[this.loop][dir] : null;
                if(loop && this.cont[loop.first]){
                    this.target = this.cont[loop.first];
                    next = this;
                }
                next = next || this[dir] && this[dir](dir,this.id);
                next && next.go();
            },
            check: function(target, dir){
                if(target && !target.getAttribute('disabled') && target.offsetHeight) return target;
                //console.warn('check('+(dir? dir : 'no dir')+') on:'+this.id+ ' failed '+target.id);
                //console[console.table? 'table' : 'info'](this.transition);
                dir = dir? dir : (this.oposite[dir] || this.current(this.transition.end[0]).dir);
                this.target = target;
                this.go(dir);
            },
            stop: function(){
                console.warn("@STOP AT ["+this.id+"]...");
                console[console.table? 'table' : 'info'](this.transition);
            },
            go: function(dir){
                //console[console.group? 'group' : 'info']('go('+(dir? dir : "FOCUS")+') on:'+this.id);
                this.step++;
                if(this.step >= this.limit){
                    this.step = 0;
                    throw new Error('emergency stop on attemts...', this.id, dir);
                    return;
                }
                var target;
                if(!dir) { // no direction key => select target to focus
                    target = this.check(this.target || this.data[1] || this.getFocus());
                } else {
                    var path = this.navs? this.navs[dir] : null;
                    var next = (path)? this.target[path.next] || ((path && typeof path.next === 'function')? path.next(this) : null) : null;
                    target = next? (this.sidedir(dir,'in') && this.check(next,dir)) : this.sidedir(dir,'out').next(dir);
                }
                return target?  target.focus() : this.stop();
            }
        };

        var _prepareStates = function(nodes,parent,done){

            path = path.length? ([parent.id].concat(path)) : [parent.id];
            depth[parent.id] = [];

            nodes.reduce(function(memo, next, index, collection) {
                var state = {};
                state.id = next.className.split(' ')[0] || next.id;
                if(!_STATES[state.id]) {
                    _extend(state, _datasetToObject(next,config.separators));
                    state.parent = (parent? parent.id : memo? memo.id : state.parent);
                    state.level = parent.level + 1;
                    state.node = collection[index];
                    state.path = path.slice(path.length - state.level); // slice(0,state.level) if not reversed
                    var childs = [].slice.call(state.node.querySelectorAll(config.selectors.node));
                    if (childs.length) {
                        state.transit = true;
                        _prepareStates(childs, state);
                    }
                    return (function(state,siblings){
                        //console.log("NEW STATE ["+state.id+"] ["+state.parent+"] "+ state.level, "path:" + state.path,siblings);
                        siblings[state.parent].push(state.id);
                        state.siblings = siblings[state.parent];
                        state.transit && collection.shift(); // || index && _nodes.splice(_nodes.indexOf(memo? memo.node : parent.node), 1);
                        state.cont = state.node.querySelector(config.selectors.items + state.id) || state.node;
                        state.data = [];
                        state.sides = {};
                        state.bubbling = {on:true, out: state.level == 1};
                        // extend state with common methods or methods will be attached to super state
                        _STATES[state.id] = config.stateMethods? _extend(state,_methods) : state;
                    }(state,depth));
                }
            },parent);

            return done && done(_STATES);
        };

        var _initStates = function(states){
            console.info("Prepare complete callback...",states);

            // makes each state inherited from its parent state
            var _inherit = function(obj,proto,_super){
                obj.__proto__ = proto || _super;
            };

            // finalise states with siblings relations & inheritance
            var _iterator = function(id){
                var state = states[id];
                // navigation between siblings states
                state.siblings = state.siblings.filter(function(sib){return sib != state.id;});
                state.dirs.forEach(function(dir){ // !tothink
                    // ...?? 1 side DOWN = 0 UP = 1 | 2 side DOWN = 1 UP = 0
                    state[dir] = function(d){
                        var next = this.siblings.filter(function(sibling){
                            var path = this.current(sibling, 'filter');
                            var oposite = this.oposite[d];
                            return (typeof path[oposite] === 'function');
                        }.bind(this));
                        var index = config.dirs[d].idx;
                        var path = state.forced? state.forced : (next[index] || next[0]);
                        console.log("sibling "+(state.forced? "-> "+ state.forced : ' direct ')+" ["+this.id+"] with KEY: "+d +" to: "+path);
                        return this.current(path,'sibling');
                    }.bind(state);
                });

                // navigation inside state elements
                if(state.navs){
                    var temp = state.navs;
                    state.navs = {};
                    temp.map(function(dir){state.navs[dir] = config.dirs[dir];});
                }

                // transit - parent (wrappers)
                if(state.transit){
                    state.transit = function(data){
                        var currentId = data.id;
                        var savedTransitionId = this.transition.end[0];
                        this.data = [(this.id == currentId)? savedTransitionId : currentId,data.target];
                        return this.data;
                    }.bind(state);
                }

                // temp debug object for each state
                _super.debug[id] = [];

                // inherit each state with parent and _super on the end
                _inherit(state,states[state.parent],_super);

                // nav node event handlers
                var events = config.events.names;
                state.node.addEventListener(events.focus, _super.enter.bind(state), config.events.capture || false);
                state.node.addEventListener(events.blur,  _super.leave.bind(state), config.events.capture || false);
                // element containers handlers
                state.cont.addEventListener(events.mouse, function(e){
                    e.cancelBubble = true;
                    return e.target.focus && e.target.focus();
                },false);

                // scrollable grids &/or sliders
                if(state.grid){
                    state.cont.addEventListener(events.scroll, function(e){
                        e.cancelBubble = true;
                        console.warn("@SCROLL ON ["+state.id+"]", state.transition, state.dir, state.navs[state.dir]);
                        state.update();
                    },false);

                    _extend(state,_STATE_GRID);
                    state.setup(state.grid,config.selectors.nav);
                }
            };

            // iterate each state
            Object.keys(states).forEach(_iterator);
        };

        // initialise super state & init prepared states structure
        _super = _STATE_INIT(_nodes.shift(),{},config);
        _super.transition = {start: [config.start,null], end: []};
        _prepareStates(_nodes, config.stateMethods? _super : _extend(_super,_methods), _initStates);
        //console[console.table? 'table' : 'info'](_STATES);
        return _STATES[config.start];
    }
};