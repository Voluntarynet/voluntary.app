
/// Array 

Array.prototype.select = function(callback) {
    var results = []
    
	for (var i = 0; i < this.length; i++)
	{
	    var v = this[i];
	    
		if(callback(v))
		{
			results.push(v)
		}
	}

	return results;
}
	
	
/// String

String.prototype.capitalizeWords = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { 
        return a.toUpperCase(); 
    });
};

String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

/// Array

Array.prototype.itemsBefore = function(item) {
    var index = this.indexOf(item);
    if (index != -1) {
        return this.slice(0, index);
    }  
    return this
};

Array.prototype.union = function(a) 
{
    var r = this.slice(0);
    a.forEach(function(i) { if (r.indexOf(i) < 0) r.push(i); });
    return r;
};

Array.prototype.diff = function(a)
{
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

/// Object

Object.prototype.slotNames = function() {
  var keys = [];
  for (var k in this) {
    if (this.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  return keys;
}

Object.prototype.slotValues = function() {
  var values = [];
  for (var k in this) {
    if (this.hasOwnProperty(k)) {
      values.push(this[k]);
    }
  }
  return values;
}


// Objective-C like associations

Object.prototype._globalAssocationWeakMap = new WeakMap()

Object.prototype.associationDict = function() {
    var map = Object.prototype._globalAssocationWeakMap
    
    if (!map.has(this)) {
        map.set(this, {})
    }
    
    return map.get(this)
}


/// Proto

ideal.Proto.uniqueId = function () {
    return this._uniqueId
}

// Extra

function ShowStack() {
    var e = new Error()
    e.name = "STACK TRACE"
    e.message = ""
    console.log( e.stack );
}


function escapeHtml() {
    return this.replace(/[&<>"'\/]/g, function (s) {
      var entityMap = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': '&quot;',
          "'": '&#39;',
          "/": '&#x2F;'
        };

      return entityMap[s];
    });
}

if (typeof(String.prototype.escapeHtml) !== 'function') {
    String.prototype.escapeHtml = escapeHtml;
}

function GUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// Coroutines --------------------------------------------------

/*
Scheduler = ideal.Proto.extend().newSlots({
    type: "Scheduler",
    
    coroutines: [],
}).setSlots({
    newCoro: function() {
        
    },
})    
    
        
Coroutine = ideal.Proto.extend().newSlots({
    type: "Coroutine",
    
    name: null,
    coro: null,
    func: null,

}).setSlots({
    
    run: function() {
        this._coro = this.start()
        return this
    },
    
    start: function*() {
        console.log('start!');
       // while(this._isRunning) {
            this._func(this)
        //}
        console.log('start 2!');
    },
    
    resume: function() {
        console.log("resume")
        this._coro.next()
        return this
    },
    
    yield: function() {
        
    },
})

function clock(coro) {
    console.log('clock!');
    while (true) {
        yield;
        console.log('Tick!');
        yield;
        console.log('Tock!');
    }
}

var coro = Coroutine.clone().setFunc(clock).run()
coro.resume()
coro.resume()
coro.resume()
coro.resume()


*/
 
/*
function A3() {
  return new Promise(function(resolve, reject) {
      setTimeout(function () {
          resolve("hello world (numbers above should be in order)");
        }, 1)
  });
}

async function A2() {
    console.log("2");
    await A3()
    console.log("3");
}
 
async function A1() {
    console.log("1");
    await A2();
    console.log("4");
}

console.log(A1())
*/

/*
 calling TestCoro
 calling await
 returned from TestCoro
 returned from await
*/
/*
function* foo() {
    var done = false;
      setTimeout(function() { console.log("done"); done = true; }, 100)
    while (done == false) {
      yield
    }
}

var iterator = foo();
console.log("iterator = ", iterator.next()); 
console.log("iterator = ", iterator.next()); 

*/