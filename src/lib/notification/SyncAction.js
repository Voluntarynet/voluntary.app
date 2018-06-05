"use strict"

window.SyncAction = ideal.Proto.extend().newSlots({
    type: "SyncAction",	
    target: null,
    method: null,
    order: 0,
    args: null,
}).setSlots({
	
    trySend: function() {
        this.send()
        /*
        try {
            this.send()
        } catch(error) {
            console.warn(this.typeId() + ".trySend(" + this.description() + ") caught exception: ")
            StackTrace.shared().showError(error)
            return false
        }
        */
        return true
    },
	
    send: function() {
        //console.log("   sending " + this.description())
        this.target()[this.method()].apply(this.target(), this.args() ? this.args() : [])
    },
	
    actionsKey: function() {
        return this.ActionKeyForTargetAndMethod(this.target(), this.method())
    },
	
    equals: function(anAction) {
        return anAction != null && (this.target() === anAction.target()) && (this.method() == anAction.method())
    },
	
    description: function() {
        var t = this.target() ? this.target().typeId() : "null"
        return t+ "." + this.method() + "() order:" + this.order()
    },
	
    ActionKeyForTargetAndMethod: function(target, method) {
        return target.typeId() + "." + method
    },
})
