/*
	BMDataStore
	A visible representation of the NodeStore

*/

BMDataStore = BMNode.extend().newSlots({
    type: "BMDataStore",
}).setSlots({
    init: function () {
		BMNode.init.apply(this)
		this.setTitle("DataStore")
		this.setNodeMinWidth(300)
    },

	subtitle: function() {
		return this.store().shortStatsString()
	},
	
	store: function() {
		return NodeStore.shared()
	},
	

    prepareToSyncToView: function() {		
		if (this.subnodes().length == 0) {
			this.refreshSubnodes()
		}
    },
	
	refreshSubnodes: function() {
		console.log(this.type() + " refreshSubnodes")
		this.removeAllSubnodes()
        this.store().sdb().keys().sort().forEach( (key) => {
			var subnode = BMDataStoreRecord.clone().setTitle(key)
			subnode.setSubtitle(this.store().sdb().at(key).length + " bytes")
			this.addRecord(subnode)
		})		
	},
	
	subnodeForClassName: function(aClassName) {
		var subnode = this.firstSubnodeWithTitle(aClassName)
		if (!subnode) {
			subnode = BMNode.clone().setTitle(aClassName).setNoteIsSubnodeCount(true)
			this.justAddSubnode(subnode)		
		}
		return subnode
	},
	
	addRecord: function(aRecord) {
		var className = aRecord.title().split("_").first()
		
		if (className == "") { 
			className = "roots" 
		}
		
		var classNode = this.subnodeForClassName(className)
		classNode.justAddSubnode(aRecord)	
		return this	
	},
})
