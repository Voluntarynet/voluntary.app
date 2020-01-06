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
        
    When to run

        When a UI event is handled, SyncSchedule.fullSyncNow should be called just before
        control is returned to the browser to ensure that another UI event won't occur
        before syncing as that could leave the node and view out of sync.
            For example:
                - edit view #1
                - sync to node
                - node posts didUpdateNode
                - edit view #2
                - view get didUpdateNode and does syncFromNode which overwrites view state #2

    	
*/

window.SyncScheduler = class SyncScheduler extends ProtoClass {
    initPrototype () {
        this.newSlot("actions", ideal.Dictionary.clone())
        this.newSlot("syncSets", ideal.Dictionary.clone())
        this.newSlot("hasTimeout", false)
        this.newSlot("isProcessing", false)
        this.newSlot("currentAction", null)
    }

    init () {
        super.init()
    }
	
    syncSet (syncMethod) {
        const sets = this.syncSets()

        if (!sets.at(syncMethod)) {
            sets.atPut(syncMethod, ideal.Dictionary.clone())
        }
        
        return sets.at(syncMethod)
    }

    newActionForTargetAndMethod (target, syncMethod, order) {
        return SyncAction.clone().setTarget(target).setMethod(syncMethod).setOrder(order ? order : 0)
    }
	
    scheduleTargetAndMethod (target, syncMethod, optionalOrder) { // higher order performed last
        if (!this.hasScheduledTargetAndMethod(target, syncMethod)) {
            const newAction = this.newActionForTargetAndMethod(target, syncMethod, optionalOrder)

            this.debugLog(() => "    -> scheduling " + newAction.description())

            /*
            if (this.isProcessing() && this.currentAction().method() !== "processPostQueue") {
                this.debugLog(() => "    - isProcessing " + this.currentAction().description() +  " while scheduling " + newAction.description())
            }
            */
            
            if (syncMethod !== "processPostQueue") {
                if (this.currentAction() && this.currentAction().equals(newAction)) {
                    const error = [
                        this.typeId(), "LOOP DETECTED: ",
                        "  scheduleTargetAndMethod: \n", newAction.description(),
                        "  while processing: ", this.currentAction().description()
                    ]
                    console.log(error.join())
                    throw new Error(error.join())
                }
            }

            this.actions().atIfAbsentPut(newAction.actionsKey(), newAction)
	    	this.setTimeoutIfNeeded()
            return true
        }
		
        return false
    }

    isSyncingOrScheduledTargetAndMethod(target, syncMethod) {
        const sc = this.hasScheduledTargetAndMethod(target, syncMethod) 
        const sy = this.isSyncingTargetAndMethod(target, syncMethod) 
        return sc || sy;
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
        return this
    }
	
    setTimeoutIfNeeded () {
	    if (!this.hasTimeout()) {
            this.setHasTimeout(true)
	        setTimeout(() => { 
	            this.setHasTimeout(false)
	            this.processSets() 
	        }, 1)
	    }
	    return this
    }
	
    clearActions () {
	    this.setActions(ideal.Dictionary.clone())
	    return this
    }
	
    orderedActions () {
        const sorter = function (a1, a2) { return a1.order() - a2.order() }
        return this.actions().values().sort(sorter)
    }
	
    processSets () {
        if (this.isProcessing()) {
            console.warn("WARNING: SynScheduler attempt to processSets before last set is completed")
            return this
        }
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
        //this.debugLog(this.description())
        this.debugLog("Sync")
        
        const actions = this.orderedActions()
        this.clearActions()
        /*
        if (actions.length) {
            console.log("syncing " + actions.length + " actions")
        }
        */
        //this.debugLog(() => "actions = ", actions.map(a => a.method()).join(","))
        //this.debugLog("--- sending ----")
        actions.forEach((action) => {
            this.setCurrentAction(action)
            //action.trySend()
            action.send()
            this.setCurrentAction(null)
        })
        //this.debugLog("--- done sending ----")
    }

    description () {
        const actionsString = this.orderedActions().map(action => "    " + action.description() ).join("\n")
        return this.type() + ":\n" + actionsString
    }

    actionCount () {
        return this.actions().keys().length
    }

    fullSyncNow () {
        if (this.isProcessing()) {
            this.debugLog(() => "fullSyncNow called while isProcessing so SKIPPING")
            return this
        }

        if (this.actionCount()) {
            this.debugLog(" --- fullSyncNow start --- ")
            let count = 0
            const maxCount = 10

            while (this.actionCount()) {
                /*
                this.(() => " --- processSets # " + count + " --- ")
                this.debugLog(() => this.description())
                this.debugLog(() => window.NotificationCenter.shared().notesDescription())
                this.debugLog(" --- ")
                */
                this.processSets()
                count ++
                if (count > 6) {
                    this.debugLog("loop?")
                }
                assert (count < maxCount)
            }

            this.debugLog(" --- fullSyncNow end --- ")
        }

        return this
    }
}.initThisClass()

Object.defineSlots(ProtoClass.prototype, {

    scheduleMethod: function(methodName, priority) {
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, methodName, priority)
        return this
    }

})
