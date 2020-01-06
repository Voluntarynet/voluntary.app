"use strict"


/*

    SyncAction

    An action managed by the SyncScheduler.

*/

window.SyncAction = class SyncAction extends ProtoClass {

    initPrototype () {
        this.newSlot("target", null)
        this.newSlot("method", null)
        this.newSlot("order", 0)
        this.newSlot("args", null)
    }

    init() {
        super.init()
        this.setIsDebugging(false)
    }
	
    trySend () {
        this.send()
        /*
        try {
            this.send()
        } catch(error) {
            console.warn(this.typeId() + ".trySend(" + this.description() + ") caught exception: ")
            error.show()
            return false
        }
        */
        return true
    }
	
    send () {
        //this.debugLog("   <- sending " + this.description())
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
        const o = this.order() === 0 ? "" : " order:" + this.order()
        return t + " " + this.method() + "" + o
    }
	
    static ActionKeyForTargetAndMethod (target, method) {
        return target.typeId() + "." + method
    }
}.initThisClass()

