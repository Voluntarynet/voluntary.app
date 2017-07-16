
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
	
	removeAllSubnodes: function() {
		this.subnodes().slice().forEach((subnode) => {
			this.removeSubnode(subnode)
		})
		return this
	},
	
    prepareToSyncToView: function() {
		console.log(this.type() + " prepareToSyncToView - refreshSubnodes")
		
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
			this.justAddSubnode(subnode)
			
		})		
	},
})
