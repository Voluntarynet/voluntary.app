

// Proto

ideal.Proto.isKindOf = function (aProto) {
	if (this.__proto__) {
		if (this.__proto__  === aProto) {
			return true
		}
		
		if (this.__proto__.isKindOf) {
			return this.__proto__.isKindOf(aProto)
		}
	}
	return false
}


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
	

Array.prototype.after = function(v)
{
	var index = this.indexOf(v);
	
	if(index == -1)
	{
		return [];
	}

	return this.slice(index + 1);
}

Array.prototype.before = function(v)
{
	var index = this.indexOf(v);
	
	if(index == -1)
	{
		return this.slice();
	}

	return this.slice(0, index);
}

Array.prototype.replaceOccurancesOfWith = function(oldValue, newValue)
{
	for (var i = 0; i < this.length; i++) {
	    if (this[i] == oldValue) {
	        this[i] = newValue;
		}
	}
	return this
}

/// String

String.prototype.firstCharacter = function() {
	return this.slice(0);
}

String.prototype.lastCharacter = function() {
	return this.slice(-1);
}

String.prototype.capitalizeWords = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { 
        return a.toUpperCase(); 
    });
};

String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};


String.prototype.loremIpsum = function (minWordCount, maxWordCount) {
    if (!minWordCount) { minWordCount = 10; }
    if (!maxWordCount) { maxWordCount = 40; }
    
	var loremIpsumWordBank = new Array("lorem","ipsum","dolor","sit","amet,","consectetur","adipisicing","elit,","sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua.","enim","ad","minim","veniam,","quis","nostrud","exercitation","ullamco","laboris","nisi","ut","aliquip","ex","ea","commodo","consequat.","duis","aute","irure","dolor","in","reprehenderit","in","voluptate","velit","esse","cillum","dolore","eu","fugiat","nulla","pariatur.","excepteur","sint","occaecat","cupidatat","non","proident,","sunt","in","culpa","qui","officia","deserunt","mollit","anim","id","est","laborum.","sed","ut","perspiciatis,","unde","omnis","iste","natus","error","sit","voluptatem","accusantium","doloremque","laudantium,","totam","rem","aperiam","eaque","ipsa,","quae","ab","illo","inventore","veritatis","et","quasi","architecto","beatae","vitae","dicta","sunt,","explicabo.","nemo","enim","ipsam","voluptatem,","quia","voluptas","sit,","aspernatur","aut","odit","aut","fugit,","sed","quia","consequuntur","magni","dolores","eos,","qui","ratione","voluptatem","sequi","nesciunt,","neque","porro","quisquam","est,","qui","dolorem","ipsum,","quia","dolor","sit,","amet,","consectetur,","adipisci","velit,","sed","quia","non","numquam","eius","modi","tempora","incidunt,","ut","labore","et","dolore","magnam","aliquam","quaerat","voluptatem.","ut","enim","ad","minima","veniam,","quis","nostrum","exercitationem","ullam","corporis","suscipit","laboriosam,","nisi","ut","aliquid","ex","ea","commodi","consequatur?","quis","autem","vel","eum","iure","reprehenderit,","qui","in","ea","voluptate","velit","esse,","quam","nihil","molestiae","consequatur,","vel","illum,","qui","dolorem","eum","fugiat,","quo","voluptas","nulla","pariatur?","at","vero","eos","et","accusamus","et","iusto","odio","dignissimos","ducimus,","qui","blanditiis","praesentium","voluptatum","deleniti","atque","corrupti,","quos","dolores","et","quas","molestias","excepturi","sint,","obcaecati","cupiditate","non","provident,","similique","sunt","in","culpa,","qui","officia","deserunt","mollitia","animi,","id","est","laborum","et","dolorum","fuga.","harum","quidem","rerum","facilis","est","et","expedita","distinctio.","Nam","libero","tempore,","cum","soluta","nobis","est","eligendi","optio,","cumque","nihil","impedit,","quo","minus","id,","quod","maxime","placeat,","facere","possimus,","omnis","voluptas","assumenda","est,","omnis","dolor","repellendus.","temporibus","autem","quibusdam","aut","officiis","debitis","aut","rerum","necessitatibus","saepe","eveniet,","ut","et","voluptates","repudiandae","sint","molestiae","non","recusandae.","itaque","earum","rerum","hic","tenetur","a","sapiente","delectus,","aut","reiciendis","voluptatibus","maiores","alias","consequatur","aut","perferendis","doloribus","asperiores","repellat");

	var randy = Math.floor(Math.random()*(maxWordCount - minWordCount)) + minWordCount;
	var ret = "";
	for(i = 0; i < randy; i++) {
		var newTxt = loremIpsumWordBank[Math.floor(Math.random() * (loremIpsumWordBank.length - 1))];
		if (ret.substring(ret.length-1,ret.length) == "." || ret.substring(ret.length-1,ret.length) == "?") {
			newTxt = newTxt.substring(0,1).toUpperCase() + newTxt.substring(1, newTxt.length);
		}
		ret += " " + newTxt;
	}
	    
    return ret
},


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

if(Array.prototype.equals) {
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
		var a = this[i]
		var b = array[i]
        // Check if we have nested arrays
/*
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }     
*/
        if (a.equals) {
            if (!a.equals(b)) {
                return false; 
      		}
        }
      
        else if (a != b) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

/*
Array.prototype.includes = function (b) {
    for (var i = 0, l=this.length; i < l; i++) {
		var a = this[i]

        if (a.equals) {
            if (!a.equals(b)) {
                return false;  
     		}
        }
        else if (a != b) { 
            return false;   
        }           
    }    
    return false;
}
*/

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

/// Object

Object.prototype.ancestors = function() {
	var results = []
	var obj = this
	while (obj.__proto__ && obj.type) {
		results.push(obj)
		if (results.length > 100) {
			throw new Error("proto loop detected?")
		}
		obj = obj.__proto__
	}
	return results
}

Object.prototype.ancestorTypes = function() {
	return this.ancestors().map((obj) => { return obj.type() })
}


Object.prototype.firstAncestorWithMatchingPostfixClass = function(aPostfix) {
	// not a great name but this walks back the ancestors and tries to find an
	// existing class with the same name as the ancestor + the given postfix
	// useful for things like type + "View" or type + "RowView", etc
	//console.log(this.type() + " firstAncestorWithMatchingPostfixClass(" + aPostfix + ")")
	var match = this.ancestors().detect((obj) => {
		var name = obj.type() + aPostfix
		var proto = window[name]
		return proto
	})
	var result = match ? window[match.type() + aPostfix] : null
	/*
	if (result) { 
		console.log("FOUND " + result.type())
	}
	*/
	return result
},

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
          '"': "&quot;",
          "'": "&#39;",
          "/": "&#x2F;"
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


function assert(v) {
    if(v == false || v == null) {
        throw new Error("assert failed - false value")
    }
    return v
}

function assertDefined(v) {
    if(typeof(v) == 'undefined') {
        throw new Error("assert failed - undefined value")
    }
    return v
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