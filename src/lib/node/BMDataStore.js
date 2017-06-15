
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
	
	removeAllItems: function() {
		this.items().slice().forEach((item) => {
			this.removeItem(item)
		})
		return this
	},
	
    prepareToSyncToView: function() {
		console.log(this.type() + " prepareToSyncToView")
		
		if (this.items().length == 0) {
			this.refreshItems()
		}
    },

	refreshItems: function() {
		console.log(this.type() + " refreshItems")
		this.removeAllItems()
        this.store().sdb().keys().sort().forEach( (key) => {
			var item = BMDataStoreRecord.clone().setTitle(key)
			item.setSubtitle(this.store().sdb().at(key).length + " bytes")
			this.justAddItem(item)
			
		})		
	},
})
