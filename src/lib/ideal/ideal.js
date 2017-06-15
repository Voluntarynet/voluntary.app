(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Object.shallowCopyTo({
	//read
	isEmpty: function()
	{
		return this.length == 0;
	},

	isEqual: function(otherArray)
	{
		if(this.length != otherArray.length) { return false; }

		for (var i = 0; i < this.length; i ++)
		{
			if(this[i] != otherArray[i]) return false;
		}

		return true;
	},

	size: function()
	{
		return this.length;
	},

	at: function(index)
	{
		if(index > -1)
		{
			return this[index];
		}
		else
		{
			return this[this.length + index];
		}
	},

	first: function()
	{
		return this[0];
	},

	rest: function()
	{
		return this.slice(1);
	},

	last: function()
	{
		return this[this.length - 1];
	},

	contains: function(element)
	{
		return this.indexOf(element) > -1;
	},

	hasPrefix: function(otherArray)
	{
		if(this.length < otherArray.length) { return false; }

		for (var i = 0; i < this.length; i ++)
		{
			if(this[i] != otherArray[i]) return false;
		}

		return true;
	},

	itemAfter: function(v)
	{
		var i = this.indexOf(v);
		if(i == -1) return null;
		i = i + 1;
		if(i > this.length - 1) return null;
		if(this[i] != undefined) { return this[i]; }
		return null;
	},

	itemBefore: function(v)
	{
		var i = this.indexOf(v);
		if(i == -1) return null;
		i = i - 1;
		if(i < 0) return null;
		if(this[i]) { return this[i]; }
		return null;
	},

	copy: function()
	{
		return this.slice();
	},

	split: function(subArrayCount)
	{
		var subArrays = [];

		var subArraySize = Math.ceil(this.length / subArrayCount);
		for (var i = 0; i < this.length; i += subArraySize)
		{
			var subArray = this.slice(i, i + subArraySize);
			if(subArray.length < subArraySize)
			{
				var lastSubArray = subArrays.pop();
				if(lastSubArray)
				{
					subArray = lastSubArray.concat(subArray);
				}
			}
			subArrays.push(subArray);
		}

		return subArrays;
	},

	chunk: function(chunkSize) {
		return this.split(Math.ceil(this.length/chunkSize));
	},

	//write

	atInsert: function(i, e)
	{
		this.splice(i, 0, e);
	},

	append: function()
	{
		this.appendItems.call(this, arguments);
		return this;
	},

	appendItems: function(elements)
	{
		this.push.apply(this, elements);
		return this;
	},

	appendItemsIfAbsent: function(elements)
	{
		this.appendIfAbsent.apply(this, elements);
		return this;
	},

	prepend: function(e)
	{
		this.unshift(e);
		return this;
	},

	appendIfAbsent: function()
	{
		var self = this;
		this.slice.call(arguments).forEach(function(value)
		{
			if(self.indexOf(value) == -1)
			{
				self.push(value);
				return true;
			}
		})

		return false;
	},

	removeAt: function(i)
	{
		this.splice(i, 1);
		return this;
	},

	remove: function(e)
	{
		var i = this.indexOf(e);
		if(i > -1)
		{
			this.removeAt(i);
		}
		return this;
	},

	emptiesRemoved: function() {
	  return this.filter(function(e){
	    return e;
	  });
	},

	removeFirst: function ()
	{
		return this.shift();
	},

	removeLast: function()
	{
		return this.pop();
	},

	removeItems: function(elements)
	{
		elements.forEach(function(e){ this.remove(e) }, this);
		return this;
	},

	empty: function()
	{
		this.splice(0, this.length);
		return this;
	},

	replace: function(obj, withObj)
	{
		var i = this.indexOf(obj);
		if (i > -1)
		{
			this.removeAt(i);
			this.atInsert(i, withObj);
		}
		return this;
	},

	swap: function(e1, e2)
	{
		var i1 = this.indexOf(e1);
		var i2 = this.indexOf(e2);

		this[i1] = e2;
		this[i2] = e1;

		return this;
	},

	shuffle: function()
	{
		var i = this.length;
		if(i == 0) return false;
		while (-- i)
		{
			var j = Math.floor(Math.random() * ( i + 1 ));
			var tempi = this[i];
			var tempj = this[j];
			this[i] = tempj;
			this[j] = tempi;
		}

		return this;
	},

	atRandom: function()
	{
		return this[Math.floor(Math.random() * this.length)];
	},

	//iterate
	forEachCall: function(functionName)
	{
		var args = this.slice.call(arguments).slice(1);
		args.push(0);
		this.forEach(function(e, i)
		{
			args[args.length - 1] = i;
			if (e)
			{
				var fn = e[functionName];
				if (fn) {
					fn.apply(e, args);
				}
				else {
					console.warn("Array.forEachCall: No method " + functionName);
				}
			}
		});
		return this;
	},

	forEachPerform: function()
	{
		return this.forEachCall.apply(this, arguments);
	},

	sortPerform: function(functionName)
	{
		var args = this.slice.call(arguments).slice(1);
		return this.sort(function(x, y)
		{
			var xRes = x[functionName].apply(x, args);
			var yRes = y[functionName].apply(y, args);
			if(xRes < yRes)
			{
				return -1;
			}
			else if(yRes < xRes)
			{
				return 1;
			}
			else
			{
				return 0;
			}
		});
	},

	parallelPerform: function() {
	  var args = this.slice.call(arguments).slice();
	  var fn = args.pop();

	  if (this.length == 0) {
	    fn(null);
	    return;
	  }

	  var remaining = this.length;
	  var err = null;
	  var self = this;
	  args.push(function(error){
	    err = error;
	    remaining --;
	    if (remaining == 0) {
	      fn(err, ops);
	    }
	  });

	  var ops = this.mapPerform.apply(this, args);
	  return this;
	},

	serialPerform: function(functionName) {
	  var args = this.slice.call(arguments).slice(1);
	  var fn = args.pop();

	  if (this.length == 0) {
	    fn(null);
	    return;
	  }

	  var i = 0;
	  var self = this;
	  function next() {
	    if (i < self.length) {
	      var e = self[i];
	      i ++;
	      e[functionName].apply(e, args);
	    } else {
	      fn();
	    }
	  };

	  args.push(function(e){
	    if (e) {
	      fn(e);
	    } else {
	      next();
	    }
	  });

	  next();

	  return this;
	},

	mapPerform: function()
	{
		var args = Array.prototype.slice.call(arguments);
		args.unshift(null);
		args.push(-1);

		return this.map(function(obj, i) {
			args[0] = obj;
			args[args.length - 1] = i; //TODO: should we append i?  Receiver might not expect this ...
			return Object.perform.apply(Object, args);
		});
	},

	mapProperty: function(propertyName)
	{
		return this.map(function(e){
		  return e[propertyName];
		});
	},

	detect: function(callback)
	{
		for (var i = 0; i < this.length; i++)
		{
			if(callback(this[i]))
			{
				return this[i];
			}
		}

		return null;
	},

	detectPerform: function(functionName)
	{
		var args = this.slice.call(arguments).slice(1);
		return this.detect(function(e, i)
		{
			return e[functionName].apply(e, args);
		});
	},

	detectSlot: function(slotName, slotValue)
	{
		for (var i = 0; i < this.length; i++)
		{
			if (this[i].perform(slotName) == slotValue)
			{
				return this[i];
			}
		}

		return null;
	},

	detectProperty: function(slotName, slotValue)
	{
		for (var i = 0; i < this.length; i++)
		{
			if (this[i][slotName] == slotValue)
			{
				return this[i];
			}
		}

		return null;
	},

	detectIndex: function(callback)
	{
		for (var i = 0; i < this.length; i++)
		{
			if(callback(this[i]))
			{
				return i;
			}
		}

		return null;
	},

	everySlot: function(slotName, expectedValue) {
		return this.every(function(obj){
            return obj.perform(slotName) == expectedValue;
        });
	},

	everyProperty: function(slotName, expectedValue) {
		var args = arguments;
		return this.every(function(obj){
			if (args.length == 2) {
				return obj[slotName] == expectedValue;
			} else {
				return obj[slotName];
			}
        });
	},

	everyPerform: function() {
		var args = arguments;
		return this.every(function(obj){
            return obj.perform.apply(obj, args);
        });
	},

	filterPerform: function()
	{
		var args = Array.prototype.slice.call(arguments);
		args.unshift(null);
		args.push(0);
		return this.filter(function(e, i)
		{
			args[0] = e;
			args[args.length - 1] = i;
			return Object.perform.apply(Object, args);
		});
	},

    filterSlot: function(slotName, expectedValue) {
        return this.filter(function(obj){
            return obj && (obj.perform(slotName) == expectedValue);
        });
    },

    filterProperty: function(slotName, expectedValue) {
    	var args = arguments;
        return this.filter(function(obj){
            if (args.length == 2) {
				return obj[slotName] == expectedValue;
			} else {
				return obj[slotName];
			}
        });
    },

	rejectPerform: function()
	{
		var args = this.slice.call(arguments);
		args.shift(null);
		args.push(0);
		return this.filter(function(e, i){
			args[0] = e;
			args[args.length - 1] = i; //TODO: should we append i?  Receiver might not expect this ...
			return e && !Object.perform.apply(Object, args);
		});
	},

	rejectSlot: function(slotName, expectedValue) {
        return this.filter(function(obj){
            return obj.perform(slotName) != expectedValue;
        });
    },

	minValue: function(callback, theDefault)
	{
		var obj = this.min(callback);
		if(obj == undefined)
		{
			return theDefault;
		}
		return callback(obj);
	},

	maxValue: function(callback, theDefault)
	{
		var obj = this.max(callback);
		if(obj == undefined)
		{
			return theDefault;
		}
		return callback(obj);
	},

	max: function(callback)
	{
		var m = undefined;
		var mObject = undefined;
		var length = this.length;

		for (var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v > m)
			{
				m = v;
				mObject = this[i];
			}
		}

		return mObject;
	},

	maxIndex: function(callback)
	{
		var m = undefined;
		var index = 0;
		var length = this.length;

		for (var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v > m)
			{
				m = v;
				index = i;
			}
		}

		return index;
	},

	min: function(callback)
	{
		var m = undefined;
		var mObject = undefined;
		var length = this.length;

		for (var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v < m)
			{
				m = v;
				mObject = this[i];
			}
		}

		return mObject;
	},

	minIndex: function(callback)
	{
		var m = undefined;
		var index = 0;
		var length = this.length;

		for (var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v < m)
			{
				m = v;
				index = i;
			}
		}

		return index;
	},

	sum: function(callback)
	{
		var m = undefined;
		var sum = 0;
		var length = this.length;

		for (var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			sum = sum + v;
		}

		return sum;
	},

	average: function()
	{
		return this.sum() / this.length;
	},

	atMidpoint: function()
	{
		return this.at(Math.floor((this.length - 1)/2));
	},

	flatten: function()
	{
		var flattened = [];
		this.forEach(function(array){
			flattened.appendItems(array);
		});
		return flattened;
	},

	clone: function()
	{
		return this.copy();
	},

	unique: function()
	{
		var a = [];
		this.forEach(function(e){
			a.appendIfAbsent(e);
		});
		return a;
	},

	reversed: function()
	{
		return this.copy().reverse();
	},

	asPath: function()
	{
		if (this.length == 1 && this.first() == "")
		{
			return "/";
		}
		else
		{
			return this.join("/");
		}
	},

	isAbsolutePath: function()
	{
		return this.first() == "";
	},

	isRelativePath: function()
	{
		return this.first() != "";
	},

	isArray: true
}, Array.prototype);

Array.wrap = function(obj)
{
	if (obj === null || obj === undefined)
	{
		return [];
	}
	else if (obj.isArray)
	{
		return obj;
	}
	else
	{
		return [obj];
	}
}
},{}],2:[function(require,module,exports){
var Proto = require("./Proto");
Proto.setSlots({
	toSlotDelegateMessages: function(slotName, messageMapping)
	{
		var self = this;
		Object.eachSlot(messageMapping, function(name, value){
			self[name] = function()
			{
				var delegate = this.perform(slotName);
				return delegate.performWithArgList(value, arguments);
			}
		});
		return this;
	},

	toSlotDelegateSlots: function(slotName, delegatedSlotNames)
	{
		this.toSlotDelegateMessages(slotName, delegatedSlotNames.reduce(function(messageMapping, delegatedSlotName){
			messageMapping[delegatedSlotName] = delegatedSlotName;
			messageMapping["set" + delegatedSlotName.capitalized()] = "set" + delegatedSlotName.capitalized();
			return messageMapping;
		}, {}));
		return this;
	},

	toSlotsDelegateSlots: function(mapping)
	{
		var self = this;
		Object.eachSlot(mapping, function(slotName, delegatedSlotNames){
			self.toSlotDelegateSlots(slotName, delegatedSlotNames);
		});
		return this;
	}
});
},{"./Proto":11}],3:[function(require,module,exports){
var Proto = require("./Proto");
var Deserialization = Proto.clone().newSlots({
	type: "ideal.Deserialization",
	serializedString: null,
	serializedMap: null,
	deserializedMap: null
}).setSlots({
	rootObject: function()
	{
		this.setSerializedMap(JSON.parse(this.serializedString()));

		var deserializedMap = {};
		this.setDeserializedMap(deserializedMap);

		this.deserialize(0);
		return deserializedMap[0];
	},

	deserialize: function(key)
	{
		var deserializedMap = this.deserializedMap();
		var object = deserializedMap[key];
		if (object === undefined)
		{
			var objectMap = this.serializedMap()[key];
			var deserializer = Object.lookupPath(window, objectMap.deserializer);
			deserializer.deserializeMapUsing(objectMap, this);
			return this.deserialize(key);
		}
		else
		{
			return object;
		}
	},

	atPutObject: function(key, obj)
	{
		this.deserializedMap()[key] = obj;
		return this;
	},

	deserializeMapUsing: function(objectMap, deserialization)
	{
		var obj = objectMap.data;
		deserialization.atPutObject(objectMap.key, obj);
		Object.eachSlot(objectMap.slots, function(slotName, objectKey){
			obj[slotName] = deserialization.deserialize(objectKey);
		});
	}
});

Proto.setSlots({
	deserializeMapUsing: function(objectMap, deserialization)
	{
		var obj = this.clone();
		deserialization.atPutObject(objectMap.key, obj);

		Object.eachSlot(objectMap.slots, function(slotName, objectKey){
			var setter = "set" + slotName.capitalized();
			if (obj.canPerform(setter))
			{
				obj.perform(setter, deserialization.deserialize(objectKey));
			}
			else
			{
				obj.newSlot(slotName, deserialization.deserialize(objectKey)); //in case the proto didn't have a type.  bad idea?
			}
		});

		obj.perform("didDeserialize");
	}
});

String.prototype.asDeserialized = function()
{
	return Deserialization.setSerializedString(this).rootObject();
}

Array.deserializeMapUsing = function(objectMap, deserialization)
{
	var obj = [];
	deserialization.atPutObject(objectMap.key, obj);
	objectMap.data.forEach(function(key){
		obj.push(deserialization.deserialize(key));
	});
}

Date.deserializeMapUsing = function(objectMap, deserialization)
{
	deserialization.atPutObject(objectMap.key, new Date(objectMap.data));
}

Number.deserializeMapUsing = function(objectMap, deserialization)
{
	deserialization.atPutObject(objectMap.key, objectMap.data);
}

String.deserializeMapUsing = function(objectMap, deserialization)
{
	deserialization.atPutObject(objectMap.key, objectMap.data);
}

module.exports = Deserialization;
},{"./Proto":11}],4:[function(require,module,exports){
Function.prototype.forwardErrors = function(fn) {
  var self = this;
  return function() {
    var e = arguments[0];
    if (e) {
      self(e);
    } else {
      fn.apply(null, Array.prototype.slice.call(arguments, 1));
    }
  }
}
},{}],5:[function(require,module,exports){
var Proto = require("./Proto");
var Map = Proto.clone().newSlots({
	type: "ideal.Map",
	jsMap: null
}).setSlots({
	init: function()
	{
		this.setJsMap({});
	},

	withJsMap: function(jsMap)
	{
		return this.clone().setJsMap(jsMap)
	},

	keys: function()
	{
		return Object.keys(this.jsMap());
	},

	values: function()
	{
		var self = this;
		return this.keys().map(function(k){
			return self.jsMap()[k];
		});
	},

	at: function(k)
	{
		return this.jsMap()[k];
	},

	mapAt: function(k)
	{
		var v = this.at(k);
		if (typeof(v) !== "object"  || (Object.getPrototypeOf(v) != Object.prototype))
		{
			return v;
		}
		else
		{
			return map(v);
		}
	},

	atPut: function(k, v)
	{
		this.jsMap()[k] = v;
		return this;
	},

	atIfAbsentPut: function(k, v)
	{
		if (!this.hasKey(k))
		{
			this.atPut(k, v);
		}
		return this;
	},

	valuesSortedByKeys: function()
	{
		var self = this;
		return this.keys().sort().map(function(k){
			return self.at(k);
		});
	},

	forEach: function(fn)
	{
		var self = this;
		this.keys().forEach(function(k){
			fn(k, self._jsMap[k]);
		});

		return this;
	},

	map: function(fn)
	{
		var jsMap = this.jsMap();
		return this.keys().map(function(k){
			return fn(k, jsMap[k]);
		});
	},

	filtered: function(fn)
	{
		var map = Map.clone();
		var jsMap = this.jsMap();
		this.keys().forEach(function(k){
			var v = jsMap[k];
			if (fn(k, v))
			{
				map.atPut(k, v);
			}
		});
		return map;
	},

	toJSON: function()
	{
		return JSON.stringify(this.jsMap());
	},

	isEmpty: function()
	{
		return Object.keys(this.jsMap()).length == 0;
	},

	lowerCased: function()
	{
		var map = Map.clone();
		this.forEach(function(k, v){
			map.atPut(k.toLowerCase(), v);
		});
		return map;
	},

	atDeepKey: function(k)
	{
		return Object_atDeepKey(this.jsMap(), k);
	},

	allAtDeepKey: function(k)
	{
		return Object_allAtDeepKey(this.jsMap(), k);
	},

	atPath: function(pathList)
	{
		return Object_atPath(this.jsMap(), pathList);
	},

	merged: function(aMap)
	{
		return this.copy().merge(aMap);
	},

	copy: function()
	{
		return map(Object.shallowCopyTo(this.jsMap(), {}));
	},

	merge: function(aMap)
	{
		var jsMap = this.jsMap();
		aMap.forEach(function(k, v){
			jsMap[k] = v;
		});
		return this;
	},

	size: function()
	{
		return this.keys().size();
	},

	hasKey: function(k)
	{
		return this.jsMap().hasOwnProperty(k);
	},

	atRemove: function(k)
	{
		var m = this.jsMap();
		delete m[k];
		return this;
	},

	percentDecode: function()
	{
		var self = this;
		this.forEach(function(k, v){
			self.atPut(k, decodeURIComponent(v));
		});
		return self;
	},

	queryString: function()
	{
		return "?" + this.map(function(k, v){
			if (v)
			{
				return k + "=" + encodeURIComponent(v);
			}
			else
			{
				return k;
			}
		}).join("&");
	}
});

function Object_atDeepKey(obj, key)
{
	if (typeof(obj) !== "object"  || (Object.getPrototypeOf(obj) != Object.prototype))
	{
		return null;
	}

	for (var k in obj)
	{
		if (obj.hasOwnProperty(k))
		{
			if (k == key)
			{
				return obj[k];
			}
			else
			{
				var v = Object_atDeepKey(obj[k], key);
				if (v !== null)
				{
					return v;
				}
			}
		}
	}

	return null;
}

function Object_allAtDeepKey(obj, key)
{
	if (typeof(obj) !== "object"  || (Object.getPrototypeOf(obj) != Object.prototype))
	{
		return [];
	}

	var objs = [];

	for (var k in obj)
	{
		if (obj.hasOwnProperty(k))
		{
			if (k == key)
			{
				objs.append(obj[k]);
			}
			else
			{
				objs.appendItems(Object_allAtDeepKey(obj[k], key));
			}
		}
	}

	return objs;
}

function Object_atPath(obj, pathList)
{
	if (typeof(pathList) == "string")
	{
		pathList = pathList.split("/");
	}

	if (typeof(obj) !== "object"  || (Object.getPrototypeOf(obj) != Object.prototype) || !pathList.length)
	{
		return null;
	}

	var k = pathList.first();
	var pathList = pathList.rest();

	if (pathList.length)
	{
		return Object_atPath(obj[k], pathList);
	}
	else if (k == '')
	{
		return obj;
	}
	else
	{
		return Array.wrap(obj[k]).first();
	}
}

function map(obj)
{
	return Map.withJsMap(obj || {});
}

Map.__map = map;

module.exports = Map;
},{"./Proto":11}],6:[function(require,module,exports){
var Proto = require("./Proto");
var Notification = Proto.clone().newSlots({
	type: "ideal.Notification",
	name: null,
	sender: null,
	data: null,
	observation: null
}).setSlots({
	send: function()
	{
		var name = this.name();
		var self = this;
		this.sender().observations().copy().forEach(function(observation){
			var messageName = observation.prefix() ? observation.prefix() + name.capitalized() : name;
			observation.observer().perform(messageName, self.clone().setObservation(observation));
		});
		return this;
	}
})

module.exports = Notification;
},{"./Proto":11}],7:[function(require,module,exports){
Object.shallowCopyTo({
	milliseconds: function()
	{
		return this;
	},

	seconds: function()
	{
		return Number(this) * 1000;
	},

	minutes: function()
	{
		return this.seconds() * 60;
	},

	hours: function()
	{
		return this.minutes() * 60;
	},

	days: function()
	{
		return this.hours() * 24;
	},

	years: function()
	{
		return this.days() * 365;
	},

	repeat: function(callback)
	{
		for (var i = 0; i < this; i++)
		{
			if (callback(i) === false)
			{
				return this;
			}
		}
		return this;
	},

	map: function()
	{
		var a = [];
		for (var i = 0; i < this; i ++)
		{
			a.push(i);
		}
		return Array.prototype.map.apply(a, arguments);
	},

	isEven: function()
	{
		return this % 2 == 0;
	}
}, Number.prototype);
},{}],8:[function(require,module,exports){
var Proto_constructor = new Function;

Object.clone = function(obj)
{
	Proto_constructor.prototype = obj;
	return new Proto_constructor;
},

Object.shallowCopy = function(obj)
{
	return Object.shallowCopyTo(obj, {});
},

Object.shallowCopyTo = function(fromObj, toObj)
{
	Object.eachSlot(fromObj, function(name){
		toObj[name] = fromObj[name];
	});

	return toObj;
},

Object.eachSlot = function(obj, fn)
{
	Object.getOwnPropertyNames(obj).forEach(function(name){
		fn(name, obj[name]);
	});
},

Object.lookupPath = function(obj, path)
{
	path = path.split(".");
	var pc;
	while (obj && (pc = path.shift()))
	{
		obj = obj[pc];
	}
	return obj;
},

Object.perform = function(obj, name)
{
	if (obj !== undefined && obj !== null && obj[name] && typeof(obj[name]) == 'function')
	{
		var args = Array.prototype.slice.call(arguments).slice(2);
		return obj[name].apply(obj, args);
	}
	else
	{
		return obj;
	}
}

Object.values = function(obj) {
  var values = [];
  for (var name in obj) {
    if (obj.hasOwnProperty(name)) {
      values.push(obj[name]);
    }
  }
  return values;
}

Object.pop = function(obj) {
    var k = Object.keys().last();
    var v = obj[k];
    delete obj[k];
    return v;
}

//backwards compatibility
module.exports = {
  Object_clone: Object.clone,
  Object_shallowCopy: Object.shallowCopy,
  Object_shallowCopyTo: Object.shallowCopyTo,
  Object_eachSlot: Object.eachSlot,
  Object_lookupPath: Object.lookupPath,
  Object_perform: Object.perform
}
},{}],9:[function(require,module,exports){
var Proto = require("./Proto");
var Observation = require("./Observation");
var Notification = require("./Notification");

var Observable = Proto.clone().newSlots({
	type: "ideal.Observable",
	observations: [],
	observedSlots: []
}).setSlots({
	init: function()
	{
		this.setObservations([]);
		//this.initObservedSlots();
	},

	initObservedSlots: function()
	{
		var self = this;
		this.observedSlots().forEach(function(slotName){
			self.initObservedSlot(slotName);
		});
	},

	initObservedSlot: function(slotName)
	{
		var self = this;
		var v = self.perform(slotName);
		this.perform("set" + slotName.capitalized(), Object.perform(v, "clone"));
		this.mySlotChanged(slotName, v, v);
	},

	observedSlots: function()
	{
		if (!this.ownsSlot("_observedSlots"))
		{
			this.setObservedSlots(this._observedSlots.copy());
		}
		return this._observedSlots;
	},

	mySlotChanged: function(slotName, oldValue, newValue)
	{
		Proto.mySlotChanged.apply(this, arguments);

		if (this.observedSlots().contains(slotName))
		{
			this.sendNotification("slotChanged", Proto.clone().newSlots({
				slotName: slotName,
				oldValue: oldValue,
				newValue: newValue
			}));

			var prefix = "child";
			Object.perform(oldValue, "removeObserverWithPrefix", this, prefix);

			var observation = Object.perform(newValue, "addObserver", this);
			Object.perform(observation, "newSlot", "parentSlotName", slotName);
			Object.perform(observation, "setPrefix", prefix);
		}
	},

	childSlotChanged: function(msg)
	{
		var slotName = msg.observation().parentSlotName();
		var value = this.perform(slotName);

		this.mySlotChanged(slotName, value, value);
	},

	addObserver: function(observer) //returns an observation not self
	{
		var observation = Observation.clone().setObserved(this).setObserver(observer).setPrefix(this.type().split(".").last().uncapitalized());
		this.observations().append(observation);
		return observation;
	},

	removeObserver: function(observer)
	{
		this.setObservations(this.observations().filter(function(observation){
			return observation.observer() != observer;
		}));
		return this;
	},

	removeObserverWithPrefix: function(observer, prefix)
	{
		this.setObservations(this.observations().filter(function(observation){
			return((observation.observer() != observer) || (observation.prefix() != prefix));
		}));
		return this;
	},

	removeAllObservers: function()
	{
		this.observations().empty();
		return this;
	},

	newNotification: function(name)
	{
		return Notification.clone().setName(name).setSender(this);
	},

	sendNotification: function(name, data)
	{

		this.newNotification(name).setData(data || null).send();
		return this;
	},

	on: function(notificationName, callback)
	{
		this.addObserver(Proto.clone().setSlot(notificationName, function(msg){
			msg.sender().removeObserver(this);
			callback(msg);
		})).setPrefix(null);

		return this;
	},

	cancel: function()
	{
		this.removeAllObservers();
		return this;
	}
});

module.exports = Observable;
},{"./Notification":6,"./Observation":10,"./Proto":11}],10:[function(require,module,exports){
var Proto = require("./Proto");
var Observation = Proto.clone().newSlots({
	type: "ideal.Observation",
	observed: null,
	observer: null,
	prefix: null
}).setSlots({
	setNotificationName: function(notificationName)
	{
		this.setLastNotificationName(this._notificationName);
		this._notificationName = notificationName;

		this.observed().observationChanged(this);

		return this;
	}
});

module.exports = Observation;
},{"./Proto":11}],11:[function(require,module,exports){
String.prototype.capitalized = function()
{
	return this.replace(/\b[a-z]/g, function(match){
		return match.toUpperCase();
	});
};

var Proto = new Object;

Proto.setSlot = function(name, value)
{
	this[name] = value;

	return this;
};

Proto.setSlots = function(slots)
{
	var self = this;
	Object.eachSlot(slots, function(name, initialValue){
		self.setSlot(name, initialValue);
	});
	return this;
}

var uniqueIdCounter = 0;

var Object_hasProto = (Object.prototype.__proto__ !== undefined);
var Object_clone = Object.clone;

Proto.setSlots({
    extend: function() {
        var obj = Object_clone(this);
        if (!Object_hasProto) {
            obj.__proto__ = this;
        }
        obj._uniqueId = ++ uniqueIdCounter;
        return obj;
    },

    subclass: function() {
        console.warn("subclass is deprecated in favor of extend");
        return this.extend.call(this);
    },

	clone: function()
	{
		var obj = this.extend();
		obj.init();

		return obj;
	},

	withSets: function(sets)
	{
		return this.clone().performSets(sets);
	},

	withSlots: function(slots)
	{
		return this.clone().setSlots(slots);
	},

	init: function(){},

	uniqueId: function()
	{
		return this._uniqueId;
	},

	toString: function()
	{
		return this._type;
	},

	setSlotsIfAbsent: function(slots)
	{
		var self = this;
		Object.eachSlot(slots, function(name, value){
			if (!self[name])
			{
				self.setSlot(name, value);
			}
		});
		return this;
	},

	newSlot: function(slotName, initialValue)
	{
		if(typeof(slotName) != "string") throw "name must be a string";

		if(initialValue === undefined) { initialValue = null };

		var privateName = "_" + slotName;
		this[privateName] = initialValue;
		
		if (!this[slotName]) {
			this[slotName] = function()
			{
				return this[privateName];
			}
		}
		
		var setterName = "set" + slotName.capitalized()

		if (!this[setterName]) {
			this[setterName] = function(newValue)
			{
				//this[privateName] = newValue;
				this.updateSlot(slotName, privateName, newValue);
				return this;
			}
		}

		/*
		this["addTo" + slotName.capitalized()] = function(amount)
		{
			this[privateName] = (this[privateName] || 0) + amount;
			return this;
		}
		*/

		return this;
	},

	updateSlot: function(slotName, privateName, newValue)
	{
		var oldValue = this[privateName];
		if (oldValue != newValue)
		{
			this[privateName] = newValue;
			this.didUpdateSlot(slotName, oldValue, newValue)
			//this.mySlotChanged(name, oldValue, newValue);
		}

		return this;
	},
	
	didUpdateSlot: function(slotName, oldValue, newValue) {
		// persistence system can hook this
	},

	mySlotChanged: function(slotName, oldValue, newValue)
	{
		this.perform(slotName + "SlotChanged", oldValue, newValue);
	},

	ownsSlot: function(name)
	{
		return this.hasOwnProperty(name);
	},

	aliasSlot: function(slotName, aliasName)
	{
		this[aliasName] = this[slotName];
		this["set" + aliasName.capitalized()] = this["set" + slotName.capitalized()];
		return this;
	},

	argsAsArray: function(args)
	{
		return Array.prototype.slice.call(args);
	},

	newSlots: function(slots)
	{
		var self = this;
		Object.eachSlot(slots, function(slotName, initialValue){
			self.newSlot(slotName, initialValue);
		});

		return this;
	},

	canPerform: function(message)
	{
		return this[message] && typeof(this[message]) == "function";
	},

	performWithArgList: function(message, argList)
	{
		return this[message].apply(this, argList);
	},

	perform: function(message)
	{
		if (this[message] && this[message].apply)
		{
			return this[message].apply(this, this.argsAsArray(arguments).slice(1));
		}
		else
		{
			return this;
		}
	},

	setterNameForSlot: function(name)
	{
		return "set" + name.capitalized();
	},

	performSet: function(name, value)
	{
		return this.perform("set" + name.capitalized(), value);
	},

	performSets: function(slots)
	{
		var self = this;
		Object.eachSlot(slots, function(name, value){
			self.perform("set" + name.capitalized(), value);
		});

		return this;
	},

	performGets: function(slots)
	{
		var self = this;
		var object = {};
		slots.forEach(function(slot) {
			object[slot] = self.perform(slot);
		});

		return object;
	}
});

Proto.toString = function()
{
	return this.type() + "." + this.uniqueId();
}

Proto.newSlot("type", "ideal.Proto");

module.exports = Proto;

},{}],12:[function(require,module,exports){
var Proto = require("./Proto");
var Serialization = Proto.clone().newSlots({
	type: "ideal.Serialization",
	rootObject: null,
	objects: [],
	map: {}
}).setSlots({
	keyForObject: function(object)
	{
		var objects = this.objects();
		var map = this.map();
		var key = objects.indexOf(object);
		if (key == -1)
		{
			objects.append(object);
			key = objects.size() - 1;

			if ((object !== null) && (object !== undefined) && object.asSerializedMap)
			{
				var serializedMap = object.asSerializedMap(this);
			}
			else
			{
				var serializedMap = this.objectAsSerializedMap(object);
			}

			serializedMap.key = key;
			map[key] = serializedMap;

			return key;
		}
		else
		{
			return key;
		}
	},

	objectAsSerializedMap: function(object)
	{
		var map = {
			deserializer: "ideal.Deserialization",
			data: {},
			slots: {}
		};

		if (object === null)
		{
			map.data = null;
		}
		else if (object === undefined)
		{
			console.warn("serializing undefined as null");
			map.data = null;
		}
		else if (object === true)
		{
			map.data = true;
		}
		else if (object === false)
		{
			map.data = false;
		}
		else
		{
			var slots = map.slots;
			var self = this;
			Object.eachSlot(object, function(name, obj){
				var k = self.keyForObject(obj);
				if (k !== null)
				{
					slots[name] = k;
				}

			});
		}
		return map;
	},

	setRootObject: function(rootObject)
	{
		this._rootObject = rootObject;
		this.setObjects([]);
		this.setMap({});
		this.keyForObject(rootObject);
		return this;
	},

	toJson: function()
	{
		return JSON.stringify(this.map());
	}
});

	Proto.newSlots({
	serializedSlots: []
}).setSlots({
	serializedSlots: function() //instead of patching init
	{
		if (!this.ownsSlot("_serializedSlots"))
		{
			this._serializedSlots = this._serializedSlots.copy(); //avoid mySlotChanged message
		}

		return this._serializedSlots;
	},

	addSerializedSlots: function(slotNames)
	{
		this.serializedSlots().appendItems(slotNames);
		return this;
	},

	asSerialized: function()
	{
		return Serialization.setRootObject(this).toJson();
	},

	willSerialize: function(){},
	didSerialize: function(){},

	asSerializedMap: function(serialization)
	{
		var slots = {};
		var self = this;

		this.willSerialize();
		this.serializedSlots().forEach(function(slotName){
			var obj = self.perform(slotName);
			var k = serialization.keyForObject(obj);
			if (k)
			{
				slots[slotName] = k;
			}
		});
		this.didSerialize();

		return {
			deserializer: this.type(),
			data: null,
			slots: slots
		};
	}
});

Array.prototype.asSerializedMap = function(serialization)
{
	return {
		deserializer: "Array",
		data: this.map(function(item){
			var k = serialization.keyForObject(item);
			if (k)
			{
				return k;
			}
			else
			{
				return null;
			}
		}).filter(function(v){ return v !== null }),
		slots: {}
	};
};

Date.prototype.asSerializedMap = function(serialization)
{
	return {
		deserializer: "Date",
		data: this.getTime(),
		slots: {}
	};
}

Number.prototype.asSerializedMap = function(serialization)
{
	return {
		deserializer: "Number",
		data: this,
		slots: {}
	};
}

String.prototype.asSerializedMap = function(serialization)
{
	return {
		deserializer: "String",
		data: this,
		slots: {}
	};
}

module.exports = Serialization;
},{"./Proto":11}],13:[function(require,module,exports){
(function (Buffer){
Object.shallowCopyTo({
	isEmpty: function()
	{
		return this.length == 0;
	},

	beginsWith: function(prefix)
	{
		if(!prefix) return false;
		return this.indexOf(prefix) == 0;
	},

	endsWith: function(suffix)
	{
		var index = this.lastIndexOf(suffix);
		return (index > -1) && (this.lastIndexOf(suffix) == this.length - suffix.length);
	},

	contains: function(aString)
	{
		return this.indexOf(aString) > -1;
	},

	before: function(aString)
	{
		var index = this.indexOf(aString);
		if(index == -1)
		{
			return null;
		}
		else
		{
			return this.slice(0, index);
		}
	},

	after: function(aString)
	{
		var index = this.indexOf(aString);
		if(index == -1)
		{
			return null;
		}
		else
		{
			return this.slice(index + aString.length);
		}
	},

	between: function(prefix, suffix)
	{
		var after = this.after(prefix);
		if (after != null)
		{
			var before = after.before(suffix);
			if (before != null)
			{
				return before;
			}
			else
			{
				return null;
			}
		}
		else
		{
			return null;
		}
	},

	at: function(i)
	{
		return this.slice(i, i + 1);
	},

	first: function()
	{
		return this.slice(0, 1);
	},

	rest: function()
	{
		return this.slice(1);
	},

	repeated: function(times)
	{
		var result = "";
		var aString = this;
		times.repeat(function(){ result += aString });
		return result
	},

	prefixRemoved: function(prefix)
	{
		return this.substring(this.beginsWith(prefix) ? prefix.length : 0);
	},

	suffixRemoved: function(suffix)
	{
		if(this.endsWith(suffix))
		{
			return this.substr(0, this.length - suffix.length);
		}
		else
		{
			return this;
		}
	},

	stripped: function()
	{
		return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},

	uncapitalized: function()
	{
		return this.replace(/\b[A-Z]/g, function(match) {
			return match.toLowerCase();
		});
	},

	asNumber: function()
	{
		return Number(this);
	},

	//move to libraries?
	humanized: function() //someMethodName -> Some Method Name
	{
		var words = [];
		var start = -1;
		var capitalized = this.capitalized();
		for (var i = 0; i < capitalized.length; i ++)
		{
			if (capitalized.slice(i, i + 1).match(/[A-Z]/))
			{
				var word = capitalized.slice(start, i);
				if (word)
				{
					words.append(word);
				}
				start = i;
			}
		}
		words.append(capitalized.slice(start, i));
		return words.join(" ");
	},

	titleized: function()
	{
		return this.split(/\s+/).map(function (s) { return s.capitalized() }).join(" ");
	},

	base64Encoded: function()
	{
		//btoa(this);
		return new Buffer(String(this), "utf8").toString("base64");
	},

	base64UrlEncoded: function()
	{
		return this.base64Encoded().replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ',');
	},

	base64Decoded: function()
	{
		return new Buffer(String(this), "base64").toString("utf8");
		//return atob(this);
	},

	base64UrlDecoded: function()
	{
		return this.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '=').base64Decoded();
	},

	stringCount: function(str)
	{
		return this.split(str).length - 1;
	},

	lineCount: function()
	{
		return this.stringCount("\n");
	},

	pathComponents: function()
	{
		if (this == "/")
		{
			return [""];
		}
		else if (this == "")
		{
			return [];
		}
		else
		{
			return this.split("/");
		}
	},

	sansLastPathComponent: function()
	{
		var c = this.pathComponents()
		c.removeLast();
		return c.join("/");
	},

	lastPathComponent: function()
	{
		return this.pathComponents().last();
	},

	fileNameSuffix: function()
	{
		var suffix = this.split(".").last();
		return suffix;
	},

	padLeft: function(length, padding)
	{
		var str = this;
	    while (str.length < length)
		{
			str = padString + str;
		}

	    return str.substring(0, length);
	},

	padRight: function(length, padding)
	{
		var str = this;
	    while (str.length < length)
		{
			str = str + padding;
		}

	    return str.substring(0, length);
	},

	strip: function()
	{
		return String(this).replace(/^\s+|\s+$/g, '');
	},

	asObject: function()
	{
		return JSON.parse(this);
	}
}, String.prototype);
}).call(this,require("buffer").Buffer)
},{"buffer":15}],14:[function(require,module,exports){
//backwards compatibility
var o = require("./Object");
Object.shallowCopyTo(module.exports, o);
var Proto = require("./Proto");
require("./Array");
require("./Number");
require("./String");
var Map = require("./Map");
require("./Function");
require("./Delegation");
var Notification = require("./Notification");
var Observable = require("./Observable");
var Observation = require("./Observation");
var Serialization = require("./Serialization");
var Deserialization = require("./Deserialization");

module.exports = {
  Proto: Proto,
  Map: Map,
  map: Map.__map,
  Notification: Notification,
  Observable: Observable,
  Observation: Observation,
  Serialization: Serialization,
  Deserialization: Deserialization
}
ideal = module.exports; //TODO figure out how to do this properly with browserify
},{"./Array":1,"./Delegation":2,"./Deserialization":3,"./Function":4,"./Map":5,"./Notification":6,"./Number":7,"./Object":8,"./Observable":9,"./Observation":10,"./Proto":11,"./Serialization":12,"./String":13}],15:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  function Foo () {}
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    arr.constructor = Foo
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Foo && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined' && object.buffer instanceof ArrayBuffer) {
    return fromTypedArray(that, object)
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":16,"ieee754":17,"is-array":18}],16:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],17:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],18:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}] },{},[14]);
