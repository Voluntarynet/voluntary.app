"use strict"

/*
    expected syncMethods:

        // store
    	syncToStore

        // node
    	syncToView
    	syncFromView

        // view
    	syncToNode	
    	syncFromNode
    	
    example use:
    
    SyncScheduler.scheduleTargetAndMethod(this, "syncToView")
*/

window.SyncAction = ideal.Proto.extend().newSlots({
    type: "SyncAction",	
	target: null,
	method: null,
	order: 0,
	args: null,
}).setSlots({
	send: function() {
		//console.log("   sending " + this.description())
		this.target()[this.method()].apply(this.target(), this.args() ? this.args() : [])
	},
	
	actionsKey: function() {
		return this.target().typeId() + "." + this.method()
	},
	
	equals: function(anAction) {
		return anAction != null && (this.target() === anAction.target()) && (this.method() == anAction.method())
	},
	
	description: function() {
		return this.target().typeId() + "." + this.method() + "() order:" + this.order()
	},
})


window.SyncScheduler = ideal.Proto.extend().newSlots({
    type: "SyncScheduler",	
	actions: ideal.Map.clone(),
	syncSets: ideal.Map.clone(),
	hasTimeout: false,
	isProcessing: false,	
	debug: false,
	
	currentAction: null,
}).setSlots({
	

    syncSet: function(syncMethod) {
        var sets = this.syncSets()
        if (!sets.at(syncMethod)) {
            sets.atPut(syncMethod, ideal.Map.clone())
        }
        return sets.at(syncMethod)
    },

	newActionForTargetAndMethod: function(target, syncMethod, order) {
		return SyncAction.clone().setTarget(target).setMethod(syncMethod).setOrder(order ? order : 0)
	},
	
    scheduleTargetAndMethod: function(target, syncMethod, optionalOrder) { // higher order performed last
		var action = this.newActionForTargetAndMethod(target, syncMethod, optionalOrder)
		if (this.actions().at(action.actionsKey())) {
			return false
		}
		this.actions().atIfAbsentPut(action.actionsKey(), action)
    	this.setTimeoutIfNeeded()
		return true
    },

    hasScheduledTargetAndMethod: function(target, syncMethod) {
		var action = this.newActionForTargetAndMethod(target, syncMethod)
    	return this.actions().hasKey(action.actionsKey())
    },

    isSyncingTargetAndMethod: function(target, syncMethod) {
		var ca = this.currentAction()
		if (ca) {
			var action = this.newActionForTargetAndMethod(target, syncMethod)
    		return ca.equals(action)
		}
		return false
    },
    
    unscheduleTargetAndMethod: function(target, syncMethod) {
        this.actions().removeKey(this.newActionForTargetAndMethod(target, syncMethod).actionsKey())
    },
	
	setTimeoutIfNeeded: function() {
	    if (!this.hasTimeout()) {
            this.setHasTimeout(true)
	        setTimeout(() => { 
	            this.setHasTimeout(false)
	            this.processSets() 
	        }, 0)
	    }
	    return this
	},
	
	clearActions: function() {
	    this.setActions(ideal.Map.clone())
	    return this
	},
	
	orderedActions: function() {
		var sorter = function (a1, a2) { return a1.order() - a2.order() }
		return this.actions().values().sort(sorter)
	},
	
    processSets: function() {
		assert(!this.isProcessing())
        this.setIsProcessing(true)
        var indent = "    "

        var error = null
        try {
            //console.log(this.description())
			if (this.debug()) { 
            	console.log("Sync")
			}
			
            var actions = this.orderedActions()
            this.clearActions()
            
			//console.log("--- sending ----")
            actions.forEach((action) => {
				this.setCurrentAction(action)
				action.send()
            })
			//console.log("--- done sending ----")
        } catch (e) {
            error = e
        } 
        
		this.setCurrentAction(null)
		
        this.setIsProcessing(false)
        
        if (error) {
            throw error
        }
        
        return this
    },

	description: function() {
		var parts = []
        var actions = this.orderedActions()
        
        actions.forEach((action) => {
		    parts.push("    " + action.description())
        })
		
		return this.type() + ":\n" + parts.join("\n")
	},
})
