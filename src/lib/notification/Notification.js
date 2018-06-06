"use strict"

window.Notification = class Notification extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            name: null,
            sender: null,
            info: null,
            center: null,
            senderStack: null,
        })
    }
    
    isEqual (obs) {
        if (this == obs) { 
            return true 
        }
        
        var sameName = this.name() == obs.name() 
        var sameSender = this.sender() == obs.sender() 
        // TODO: testing equivalence of info?
        
        return sameName && sameSender
    }
    
    post () {
        if (this.center().isDebugging()) {
            //console.log(typeof(this.sender()) + "." + this.sender() + " posting note " + this.name() + " and recording stack for debug")
            var e = new Error()
            e.name = "" //"Notification Post Stack"
            e.message = this.sender() + " posting note '" + this.name() + "'" 
            this.setSenderStack(e.stack);
        }
        
       
        this.center().addNotification(this)
        return this
    }
    
    schedulePost () {
	     window.SyncScheduler.shared().scheduleTargetAndMethod(this, "post")
    }
}

window.Notification.registerThisClass()
