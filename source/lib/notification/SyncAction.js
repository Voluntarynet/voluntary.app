"use strict"


/*

    SyncAction

    An action managed by the SyncScheduler.

*/

window.SyncAction = class SyncAction extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            target: null,
            method: null,
            order: 0,
            args: null,
        })
    }
	
    trySend () {
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
    }
	
    send () {
        //console.log("   sending " + this.description())
        this.target()[this.method()].apply(this.target(), this.args() ? this.args() : [])
    }
	
    actionsKey () {
        return SyncAction.ActionKeyForTargetAndMethod(this.target(), this.method())
    }
	
    equals (anAction) {
        return   anAction !== null && 
                (this.target() === anAction.target()) && 
                (this.method() === anAction.method())
    }
	
    description () {
        const t = this.target() ? this.target().typeId() : "null"
        return t + "." + this.method() + "() order:" + this.order()
    }
	
    static ActionKeyForTargetAndMethod (target, method) {
        return target.typeId() + "." + method
    }
}

window.SyncAction.registerThisClass()
