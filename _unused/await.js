
// Coroutines with await --------------------------------------------------

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