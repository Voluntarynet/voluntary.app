"use strict"

/* 

    NotificationCenter
    
    A notification system that queues notifications and waits for the 
    app to return to the event loop (using a timeout) to post them. 
    It filters out duplicate notifications (posted on the same event loop) 
    and duplicate observations (same object registering the same observation again).
        
    Warning about Weak links: 
    
        As Javascript doesn't support weak links, you'll need to be careful
        about having your observers tell the NotificationCenter when they 
        are done observing, otherwise, it will hold a reference to them that
        will prevent them from being garbage collected and they'll continue
        to receive matching notifications. 
    
    Weak links solution (for target/sender):
    
        Instead of passing an object reference for: 
        
            Observation.setTargetId() and 
            Notification.setSender()
        
        you can pass a typeId string/number for the object. e.g. the ideal.js 
        assigns each instance a unique typeId.
        
        This should work assuming:
            - notification receiver doesn't already have a reference to the sender
            - observer can remove it's observation appropriately
        

    Example use:
 
        // start watching for "changed" message from target object
        this._obs = NotificationCenter.shared().newObservation().setName("changed").setObserver(this).setTarget(target).watch()
    
        // start watching for "changedStoredSlot" message from any target object
        this._obs = NotificationCenter.shared().newObservation().setName("changedStoredSlot").setObserver(this).watch()

        // stop watching this observation
        this._obs.stopWatching()
        
        // stop watching all
        NotificationCenter.shared().removeObserver(this)
        
        // post a notification
        const note = NotificationCenter.shared().newNote().setSender(this).setName("hello").post()

        // repost same notification
        note.post()

    Broadcast notifications:

        For use cases where the overhead of creating post objects would be costly, 
        it's possible to send a direct message to all name listeners without waiting
        until the event loop to end. These will pass the target itself instead of a Notification object.

        // call's changedStoredSlot(target) on all listeners for "changedStoredSlot"
        NotificationCenter.shared().broadcastTargetAndName(this, "changedStoredSlot")

*/

window.NotificationCenter = class NotificationCenter extends ProtoClass {
    initPrototype () {
        this.newSlot("observations", null) // array 
        this.newSlot("notifications", null) // array 
        this.newSlot("debugNoteName", "appDidInit")
        this.newSlot("currentNote", null)
        this.newSlot("isProcessing", false)
        this.newSlot("nameIndex", null) // dict of dicts
    }

    init() {
        super.init()
        this.setObservations([]);
        this.setNotifications([]);
        this.setNameIndex({});
        //this.setIsDebugging(true)
    }

    // --- observations ----
    
    hasObservation (obs) {
        return this.observations().detect(ob => ob.isEqual(obs))
    }
    
    addObservation (obs) {
        if (!this.hasObservation(obs)) {
            this.observations().push(obs)
        }
        return this
    }

    newObservation () {
        return window.Observation.clone().setCenter(this);
    }

    hasObservationsForTargetId (targetId) {
        const obs = this.observations().detect(obs => obs.targetId() === targetId)
        return !Type.isNullOrUndefined(obs)
    }

    countOfObservationsForTargetId (targetId) {
        const matches = this.observations().filter(obs => obs.targetId() === targetId)
        return matches.length
    }
    
    removeObservation (anObservation) {
        if (true) {
            const filtered = this.observations().filter(obs => !obs.isEqual(anObservation))
            this.setObservations(filtered)
        } else {
            // If possible, we want to send onNoObservers listen targets when 
            // their last observer is removed, so track these

            const targetId = anObservation.targetId()
            let removedMatchingTargetId = false
            let stillHasMatchingTargetId = false

            const filtered = this.observations().filter((obs) => {
                if(obs.isEqual(anObservation)) {
                    if (obs.targetId() === targetId) {
                        removedMatchingTargetId = true
                    }
                    return false
                }
                if (obs.targetId() === targetId) {
                    stillHasMatchingTargetId = true
                }
                return true
            })
            this.setObservations(filtered)

            if (removedMatchingTargetId && !stillHasMatchingTargetId) {
                const target = this.targetForTargetId(targetId) // looks through obs listeners 
                if(target && target.onNoObservers) {
                    target.onNoObservers(this)
                }
            }
        }

        return this
    }

    targetForTargetId (targetId) {
        if (Type.isNullOrUndefined(targetId)) {
            return false
        }

        // this only works if there's an observation whose observer is the target
        // which works, for example, if the target is observing onNoObservers

        const matchObservation = this.observations().detect(obs => obs.observerId() === targetId)
        if (matchObservation) {
            const target = matchObservation.observer()
            return target
        }
        return null
    }
    
    removeObserver (anObserver) {        
        const filtered = this.observations().filter(obs => obs.observer() !== anObserver)
        this.setObservations(filtered)
        return this;
    }

    // --- helpers ---

    observersForName (name) {
        return this.nameToObservers()[name] // returns a set
    }

    // --- notifying ----
    
    hasNotification (note) {
        return this.notifications().detect(n => n.isEqual(note))
    }
    
    addNotification (note) {
        if (!this.hasNotification(note)) {
            this.notifications().push(note)
		     window.SyncScheduler.shared().scheduleTargetAndMethod(this, "processPostQueue") //, -1)
        }
        return this
    }

    newNote () {
        return window.Notification.clone().setCenter(this)
    }
    
    // --- timeout & posting ---
    
    processPostQueue () {
        // keep local ref of notifications and set 
        // notifications to empty array in case any are
        // added while we process them
        this.setCurrentNote(null)

        if (!this.isProcessing()) {
            this.setIsProcessing(true)
            //console.log("processPostQueue " + this.notifications().length)
        
            const notes = this.notifications()
            this.setNotifications([])
            notes.forEach( (note) => {
                //try { 
                this.postNotificationNow(note)
                //this.debugLog("   <- posting " + note.description() )

                //} catch (error) {
                //}
            })
            this.setIsProcessing(false)
        } else {
            Error.showCurrentStack()
            console.warn("WARNING: attempt to call processPostQueue recursively while on note: ", this._currentNote)
        }
        
        return this
    }
    
    postNotificationNow (note) {
        // use a copy of the observations list in 
        // case any are added while we are posting 
        //
        // TODO: add an dictionary index for efficiency

        this.setCurrentNote(note)
        
        const showDebug = this.isDebugging() === true && (this.debugNoteName() === null || this.debugNoteName() === note.name());

        if (showDebug) {
            this.debugLog(" senderId " + note.senderId() + " posting " + note.name())
            this.showObservers()
        }
        
        const observations = this.observations().shallowCopy()  
      
        observations.forEach( (obs) => {
            if (obs.matchesNotification(note)) {
                if (showDebug) {
                    this.debugLog(" " + note.name() + " matches obs ", obs)
                    this.debugLog(" sending ", note.name() + " to obs " + obs.type())
                }
            
                obs.sendNotification(note)       
                /*
                try {
                    obs.sendNotification(note)       
                } catch(error) {
                    console.log("NOTIFICATION EXCEPTION: '" + error.message + "'");
                    console.log("  OBSERVER (" + obs.observer() + ") STACK: ", error.stack)
                    if (note.senderStack()) {
                        console.log("  SENDER (" + note.senderId() + ") STACK: ", note.senderStack())
                    }

                    // how to we propogate the exception so we can inspect it in the debugger
                    // without causing an inconsistent state by not completing the other notifications?
                    throw error
                }
                */
            }
        })        
        
        this.setCurrentNote(null)
    }

    show () {
        this.debugLog(":")
        this.showObservers()
        this.showNotes()
    }

    showNotes () {
        console.log(this.notesDescription())
    }

    notesDescription() {
        const notes = this.notifications()
        return "NotificationCenter: \n" + notes.map(note => "    " + note.description()).join("\n")
    }

    observersDescription() {
        const observations = this.observations() 
        return "observations:\n" + observations.map((obs) => { 
            return "    " + obs.observer().type() + " listening to " + obs.targetId() + " " + obs.name()
        }).join("\n") 
    }
    
    showObservers () {
        console.log(this.observersDescription())
    }
    
    showCurrentNoteStack () {
        if (this.currentNote() === null) {
            //console.log("NotificationCenter.showCurrentNoteStack() warning - no current post")
        } else {
            console.log("current post sender stack: ", this.currentNote().senderStack())
        }
    }
}.initThisClass()
