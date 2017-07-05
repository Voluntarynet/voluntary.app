
BMDataStoreRecord = BMNode.extend().newSlots({
    type: "BMDataStoreRecord",
	key: null,
}).setSlots({
    init: function () {
		BMNode.init.apply(this)
        //this.setViewClassName("GenericView")
        this.setViewClassName("BMDataStoreRecordView")
    },

/*
	subtitle: function() {
		return this.value().length + " bytes"
	},
	*/
	
	value: function() {
		return NodeStore.shared().sdb().at(this.title())
	},
})

