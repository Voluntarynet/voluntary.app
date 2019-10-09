"use strict"

/*

    SyncScheduler

    Many state changes can cause the need to synchronize a given object 
    with others within a given event loop, but we only want synchronization to 
    happen at the end of an event loop, so a shared SyncScheduler instance is used to
    track which sync actions should be sent at the end of the event loop and only sends each one once. 

    SyncScheduler should be used to replace most cases where setTimeout() would otherwise be used.

       example use:
    
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "syncToView")

    Automatic sync loop detection

    It will throw an error if a sync action is scheduled while another is being performed,
    which ensures sync loops are avoided.

    Ordering

    Scheduled actions can also be given a priority via an optional 3rd argument:

        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "syncToView", 1)

    Higher orders will be performed *later* than lower ones. 

    Some typical sync methods:

        // node
    	syncToStore
    	syncToView

        // view
    	syncToNode	
    	syncFromNode
    	
*/

window.SyncScheduler = class SyncScheduler extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            actions: ideal.Map.clone(),
            syncSets: ideal.Map.clone(),
            hasTimeout: false,
            isProcessing: false,	
            isDebugging: false,
            currentAction: null,
        })
    }
	
    syncSet (syncMethod) {
        const sets = this.syncSets()

        if (!sets.at(syncMethod)) {
            sets.atPut(syncMethod, ideal.Map.clone())
        }
        
        return sets.at(syncMethod)
    }

    newActionForTargetAndMethod (target, syncMethod, order) {
        return SyncAction.clone().setTarget(target).setMethod(syncMethod).setOrder(order ? order : 0)
    }
	
    scheduleTargetAndMethod (target, syncMethod, optionalOrder) { // higher order performed last
        if (!this.hasScheduledTargetAndMethod(target, syncMethod)) {
            const newAction = this.newActionForTargetAndMethod(target, syncMethod, optionalOrder)

            if (syncMethod !== "processPostQueue") {
                if (this.currentAction() && this.currentAction().equals(newAction)) {
                    let error = this.typeId()
                    error += "  scheduleTargetAndMethod: \n" + newAction.description() 
                    error += "  while processing: " + this.currentAction().description()
                    throw new Error(error)
                }
            }

            this.actions().atIfAbsentPut(newAction.actionsKey(), newAction)
	    	this.setTimeoutIfNeeded()
            return true
        }
		
        return false
    }

    hasScheduledTargetAndMethod (target, syncMethod) {
        const actionKey = window.SyncAction.ActionKeyForTargetAndMethod(target, syncMethod)
    	return this.actions().hasKey(actionKey)
    }

    isSyncingTargetAndMethod (target, syncMethod) {
        const ca = this.currentAction()
        if (ca) {
            const action = this.newActionForTargetAndMethod(target, syncMethod)
    		return ca.equals(action)
        }
        return false
    }
    
    unscheduleTargetAndMethod (target, syncMethod) {
        this.actions().removeKey(this.newActionForTargetAndMethod(target, syncMethod).actionsKey())
    }
	
    setTimeoutIfNeeded () {
	    if (!this.hasTimeout()) {
            this.setHasTimeout(true)
	        setTimeout(() => { 
	            this.setHasTimeout(false)
	            this.processSets() 
	        }, 0)
	    }
	    return this
    }
	
    clearActions () {
	    this.setActions(ideal.Map.clone())
	    return this
    }
	
    orderedActions () {
        const sorter = function (a1, a2) { return a1.order() - a2.order() }
        return this.actions().values().sort(sorter)
    }
	
    processSets () {
        assert(!this.isProcessing())
        this.setIsProcessing(true)
        const useTry = false
        let error = null

        if (useTry) {
            try {
                this.justProcessSetsPRIVATE()
            } catch (e) {
                error = e
            } 
        } else {
            this.justProcessSetsPRIVATE()
        }
        
        this.setCurrentAction(null)
        this.setIsProcessing(false)
        
        if (error) {
            throw error
        }
        
        return this
    }

    justProcessSetsPRIVATE() {
        //console.log(this.description())
        if (this.isDebugging()) { 
            console.log("Sync")
        }
        
        const actions = this.orderedActions()
        this.clearActions()
        
        //console.log("actions = ", actions.map(a => a.method()).join(","))
        //console.log("--- sending ----")
        actions.forEach((action) => {
            this.setCurrentAction(action)
            //action.trySend()
            action.send()
        })
        //console.log("--- done sending ----")
    }

    description () {
        const parts = []
        const actions = this.orderedActions()
        
        actions.forEach((action) => {
		    parts.push("    " + action.description())
        })
		
        return this.type() + ":\n" + parts.join("\n")
    }
}

window.SyncScheduler.registerThisClass()

ideal.Proto.scheduleMethod = function(methodName) {
    window.SyncScheduler.shared().scheduleTargetAndMethod(this, methodName)
    return this
}