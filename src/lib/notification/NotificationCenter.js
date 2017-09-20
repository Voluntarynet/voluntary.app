"use strict"

/*

    NotificationCenter
    
    A notification system that queues notifications and waits for the 
    app to return to the event loop (using setTimeout) to post them. 
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
        
            Observation.setTarget() and 
            Notification.setSender()
        
        you can pass a uniqueId string/number for the object. e.g. the ideal.js 
        assigns each instance a _uniqueId.
        
        This should work assuming:
            - notification receiver doesn't already have a reference to the sender
            - observer can remove it's observation appropriately
        

    Example use:
 
        // start watching for "changed" message from target object
        this._obs = NotificationCenter.shared().newObservation().setName("changed").setObserver(this).setTarget(target).watch()
    
        // stop watching this observation
        this._obs.stopWatching()
        
        // stop watching all
        NotificationCenter.shared().removeObserver(this)
        
        // post a notification
        var note = NotificationCenter.shared().newNotification().setSender(this).setName("hello").post()

        // repost same notification
        note.post()

*/

window.NotificationCenter = ideal.Proto.extend().setType("NotificationCenter").newSlots({
    observations: null,
    hasTimeout: null,
    notifications: null,
    shared: null,
    //usesTimeouts: true,
    isDebugging: false,
    currentNote: null,
}).setSlots({
    init: function() {
        this.setObservations([]);
        this.setNotifications([]);
    },

    shared: function() {
        if (!this._shared) {
            this._shared = NotificationCenter.clone();
        }
        return this._shared;
    },
    
    // --- observations ----
    
    hasObservation: function(obs) {
        return this.observations().detect(function (ob) { return ob.isEqual(obs) })
    },
    
    addObservation: function(obs) {
        if (!this.hasObservation(obs)) {
            this.observations().push(obs)
            //console.log("observations count = " + this.observations().length)
        }
        return this
    },

    newObservation: function() {
        return Observation.clone().setCenter(this);
    },
    
    removeObservation: function(anObservation) {  
        var filtered = this.observations().filter(function (obs) {
            return !obs.isEqual(anObservation)
        })
        this.setObservations(filtered)
        return this
    },
    
    removeObserver: function(anObserver) {        
        var filtered = this.observations().filter(function (obs) {
            return obs.observer() != anObserver
        })
        this.setObservations(filtered)
        return this;
    },

    // --- notifying ----
    
    hasNotification: function(note) {
        return this.notifications().detect(function (n) { 
            return n.isEqual(note) 
        })
    },
    
    addNotification: function(note) {
        if (!this.hasNotification(note)) {
            this.notifications().push(note)
            this.setTimeoutIfNeeded()
        }
        return this
    },

    newNotification: function() {
        return Notification.clone().setCenter(this)
    },
    
    // --- timeout & posting ---
    
    setTimeoutIfNeeded: function() {
        /*
        if (!this.usesTimeouts()) {
            this.processPostQueue() 
            return this
        }
        */
        
        if (!this._hasTimeout) {
            this._hasTimeout = true
            setTimeout( () => { 
                this._hasTimeout = false
                this.processPostQueue() 
            }, 0)
        }
        return this
    },
    
    processPostQueue: function() {
        // keep local ref of notifications and set 
        // notifications to empty array in case any are
        // added while we process them
        this._currentNote = null
        if (!this._isProcessing) {
            this._isProcessing = true
            //console.log("processPostQueue " + this.notifications().length)
        
            var notes = this.notifications()
            this.setNotifications([])
            notes.forEach( (note) => {
                this._currentNote = note;
                this.postNotificationNow(note)
            })
            this._isProcessing = false
        } else {
            ShowStack()
            console.warn("WARNING: attempt to call processPostQueue recursively while on note: ", this._currentNote)
        }
        
        return this
    },
    
    postNotificationNow: function(note) {
        // use a copy of the observations list in 
        // case any are added while we are posting 
        //
        // TODO: add an dictionary index to optimize? 
        

        this.setCurrentNote(note)
        
        if (this.isDebugging()) {
            console.log(this.type() + " sender " + note.sender() + " posting " + note.name())
            this.showObservers()
        }
        
        var observations = this.observations().copy()  
      
        observations.forEach( (obs) => {
            if (obs.matchesNotification(note)) {
                if (this.isDebugging()) {
                    console.log(this.type() + " " + note.name() + " matches obs ", obs)
                    console.log(this.type() + " sending ", note.name() + " to obs " + obs.type())
                }
            
                try {
                    obs.sendNotification(note)                
                } catch(error) {
                    //console.log("Error", typeof(error), "  ", error);
                    console.log("NOTIFICATION EXCEPTION:");
                    //console.log("NotificationCenter: while posting note: ", note, " got error: ", error.name)
                    console.log("  OBSERVER (" + obs.observer() + ") STACK: ", error.stack)
                    if (note.senderStack()) {
                        console.log("  SENDER (" + note.sender() + ") STACK: ", note.senderStack())
                    }
                }
            }
        })        
        
        this.setCurrentNote(null)
    },
    
    showObservers: function() {
        var observations = this.observations() 
        console.log("observations:\n" + observations.map((obs) => { 
            return "    " + obs.observer().type() + " listening to " + obs.target() + " " + obs.name()
        }).join("\n") )
    },
    
    showCurrentNoteStack: function() {
        if (this.currentNote() == null) {
            //console.log("NotificationCenter.showCurrentNoteStack() warning - no current post")
        } else {
            console.log("current post sender stack: ", this.currentNote().senderStack())
        }
    }
});
