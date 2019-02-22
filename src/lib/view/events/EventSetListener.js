"use strict"

/*
    EventSetListener

    Manages registering a DOM element for a set of events which will be sent to a delegate
    using a (potentially different) method name. Subclasses override init to define the
    event set by calling this.addEventNameAndMethodName(...) for each event.

*/

window.EventSetListener = ideal.Proto.extend().newSlots({
    type: "EventSetListener",
    view: null,
    delegate: null,
    isListening: null,
    eventsDict: null, // should only write from within class & subclasses
    options: null,
}).setSlots({
    init: function () {
        ideal.Proto.init.apply(this)
        this.setEventsDict({})
        return this
    },

    // ---

    addEventNameAndMethodName: function(eventName, methodName) {
        this.eventsDict()[eventName] = { 
            methodName: methodName, 
            handlerFunc: null,
            options: null,
        }
        return this
    },

    // ---

    setIsListening: function(aBool) {
        if (aBool) {
            this.start()
        } else {
            this.stop()
        }

        return this
    },

    forEachEventDict: function(func) {
        let eventsDict = this.eventsDict()
        for (let k in eventsDict) {
            if (eventsDict.hasOwnProperty(k)) {
                let eventName = k;
                let eventDict = eventsDict[eventName]
                func(eventName, eventDict);
            }
        }
        return this
    },

    start: function() {
        if (this.isListening()) {
            return this
        }

        assert(this.view())
        let element = this.view().element()
        assert(element)


        this.forEachEventDict((eventName, dict) => {
            dict.handlerFunc = (event) => { 
                let method = this.delegate()[dict.methodName]
                if (method) {
                    //console.log("sending event: " + this.delegate().type() + "." + dict.methodName, "(" + event.type + ")" )
                    return method.apply(this.view(), [event]); 
                }
                return true
            }
            dict.options = this.options()
            //console.log(this.type() + " listening to ", eventName, " on element ", element)
            element.addEventListener(eventName, dict.handlerFunc, dict.options);
        })

        return this
    },

    stop: function() {
        if (!this.isListening()) {
            return this
        }

        assert(this.view())
        let element = this.view().element()
        assert(element)

        this.forEachEventDict((eventName, dict) => {
            element.removeEventListener(eventName, dict.handlerFunc, dict.options);
        })

        return this
    },   

})
