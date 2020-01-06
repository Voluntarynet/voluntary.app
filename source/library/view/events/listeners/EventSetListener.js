"use strict"

/*
    EventSetListener

    Manages registering a DOM element for a set of events which will be sent to a delegate
    using a (potentially different) method name. Subclasses override init to define the
    event set by calling this.addEventNameAndMethodName(...) for each event.

    Example use:

    const mouseListener = MouseListener.clone().setListenTarget(element).setDelegate(anObject)

    will send onMouseDown(event), onMouseOver(event) etc to anObject when those events occur on the element.
    
*/

window.EventSetListener = class EventSetListener extends ProtoClass {
    
    initPrototype () {
        this.newSlot("listenTarget", null)
        this.newSlot("delegate", null)
        this.newSlot("isListening", false)
        this.newSlot("eventsDict", null).setComment("should only write from within class & subclasses")
        this.newSlot("useCapture", false).setComment("whether event will be dispatched to listener before EventTarget beneath it in DOM tree")
        this.newSlot("methodSuffix", "")
    }

    init () {
        super.init()
        this.setEventsDict({})
        this.setupEventsDict()
        return this
    }

    setupEventsDict () {
        // subclasses override to call addEventNameAndMethodName() for their events
        return this
    }

    /*
    view () {
        return this.element()._domView
    }
    */

    setListenTarget (t) {
        assert(t)
        this._listenTarget = t
        return this
    }

    listenTargetDescription () {
        return DomElement_description(this.listenTarget())

        /*        
        const type = typeof(this.listenTarget())
        
        if (type === "Element") { // right type?
            return DomElement_description(this.listenTarget())
        }
        
        return type
        */
    }

    // --------------

    setUseCapture (v) {
        this._useCapture = v ? true : false;
        //this.setupEventsDict()

        if (this.isListening()) {
            this.stop()
            this.start()
        }

        return this
    }

    // ---

    fullMethodNameFor (methodName) {
        let suffix = ""

        if (this.useCapture()) {
            suffix = "Capture"
        }

        suffix += this.methodSuffix()
        return methodName + suffix
    }

    addEventNameAndMethodName (eventName, methodName) {
        this.eventsDict().atPut(eventName, { 
            methodName: methodName, 
            handlerFunc: null,
            useCapture: this.useCapture(),
        })
        return this
    }

    // ---

    setIsListening (aBool) {
        if (aBool) {
            this.start()
        } else {
            this.stop()
        }
        return this
    }

    forEachEventDict (func) {
        const eventsDict = this.eventsDict()
        this.eventsDict().ownForEachKV((eventName, eventDict) => {
            func(eventName, eventDict);
        })
        return this
    }

    assertHasListenTarget () {
        const t = this.listenTarget()
        assert(t !== null)
        assert(t !== undefined)
        return this
    }

    start () {
        if (this.isListening()) {
            return this
        }
        this._isListening = true;

        this.assertHasListenTarget()

        this.eventsDict().ownForEachKV((eventName, dict) => {
            const fullMethodName = this.fullMethodNameFor(dict.methodName)
            dict.handlerFunc = (event) => { 

                
                if (!event._id) {
                    event._id = Math.floor(Math.random()*100000) // TODO: remove when not debugging
                }
                

                const delegate = this.delegate()
                const method = delegate[fullMethodName]

                this.onBeforeEvent(fullMethodName, event)

                //try {
                let result = true
                if (method) {
                    result = method.apply(delegate, [event]); 

                    if (this.isDebugging()) {
                        console.log("sent: " + delegate.type() + "." + fullMethodName, "(" + event.type + ") and returned " + result)
                    }

                    if (result === false) {
                        event.stopPropagation()
                    }
                } else {
                    if (this.isDebugging()) {
                        console.log(this.listenTargetDescription() + " MISSING method: " + delegate.type() + "." + fullMethodName, "(" + event.type + ")" )
                    }
                }

                // } catch (e) {

                //}

                this.onAfterEvent(fullMethodName, event)

                return result
            }
            dict.useCapture = this.useCapture()

            if (this.isDebugging()) {
                console.log("'" + this.listenTargetDescription() + ".addEventListener('" + eventName + "', handler, " + dict.useCapture + ") " + fullMethodName) 
            }

            this.listenTarget().addEventListener(eventName, dict.handlerFunc, dict.useCapture);
        })

        return this
    }

    onBeforeEvent (methodName, event) {
        /*
        const a = methodName.contains("Capture") ||  methodName.contains("Focus") || methodName.contains("Move") || methodName.contains("Leave") || methodName.contains("Enter") || methodName.contains("Over")
        if (!a) {
            this.debugLog(" onBeforeEvent " + methodName)
        }
        */
        return this
    }

    onAfterEvent (methodName, event) {
        if (window.SyncScheduler) {
            /*
                run scheduled events here to ensure that a UI event won't occur
                before sync as that could leave the node and view out of sync
                e.g. 
                - edit view #1
                - sync to node
                - node posts didUpdateNode
                - edit view #2
                - view get didUpdateNode and does syncFromNode which overwrites view state #2
            */

            /*
            if ( window.SyncScheduler.shared().actionCount()) {
                this.debugLog(" onAfterEvent " + methodName)
            }
            */
            window.SyncScheduler.shared().fullSyncNow()
        }
        return this
    }

    stop () {
        if (!this.isListening()) {
            return this
        }

        this._isListening = false;

        this.assertHasListenTarget()

        const t = this.listenTarget()
        this.eventsDict().ownForEachKV((eventName, dict) => {
            this.debugLog(() => this.delegate().typeId() + " will stop listening for " + dict.methodName)
            t.removeEventListener(eventName, dict.handlerFunc, dict.useCapture);
        })

        return this
    }   

}.initThisClass()

/*
    // globally track whether we are inside an event 

    setIsHandlingEvent () {
        DomView._isHandlingEvent = true
        return this
    }
	
    isHandlingEvent () {
        return DomView._isHandlingEvent
    }

    handleEventFunction (event, eventFunc) {
        //  a try gaurd to make sure isHandlingEvent has correct value
        //  isHandlingEvent is used to determine if view should inform node of changes
        //  - it should only while handling an event
		
        let error = null
		
        this.setIsHandlingEvent(true)
		
        try {
            eventFunc(event)
        } catch (e) {
            //console.log(e)
            e.show()
            //error = e
        }
		
        this.setIsHandlingEvent(false)
		
        if (error) {
            throw error
        }
    }
*/