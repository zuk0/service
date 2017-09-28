// help functions

var _extend = function(target,source){if(source) for(var i in source) target[i] = source[i]; return target;};
var _defaults = function(o,d){for(var i in d){if (!o.hasOwnProperty(i)) {o[i] = d[i];}}return o;};
var _clone = function(copy){try{return JSON.parse(JSON.stringify(copy));} catch (e){}};
var _byId = function(id){return document.getElementById(id);};
var _rand = function(min,max){return Math.floor(Math.random() * (max - min + 1) + min)};
var _buildNode = function(tag,index,name,data,handlers,target){
    var el = document.createElement(tag || 'DIV');
    el.id = name? name + index : index; el.tabIndex = data.index; el.innerHTML = data.html;
    if(handlers) Object.keys(handlers).forEach(function(event){el[event] = handlers[event];});
    el.className = data.classList? data.classList.join(' ') : name;
    return target? target.appendChild(el) : el;
};
var _datasetToObject = function(elem,separators){
    var data = {}; var split = separators.split; var names = separators.names;
    [].forEach.call(elem.attributes, function(attr) {
        if (/^data-/.test(attr.name)) {
            var camelCaseName = attr.name.substr(5).replace(/-(.)/g, function ($0, $1) {return $1.toUpperCase();});
            var value = (~(attr.value.indexOf(split)) || ~(names.indexOf(camelCaseName)))? attr.value.split(split) : attr.value;
            data[camelCaseName] = value;
        }
    });
    return data;
};
var _swapKeys = function(obj,key){ // change event name keys to values or back
    var res = {};
    Object.keys(obj).forEach(function(key){res[obj[key]] = key;});
    return key? res[key] : res;
};