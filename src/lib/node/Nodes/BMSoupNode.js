
BMSoupNode = BMNode.extend().newSlots({
    type: "BMSoupNode",
	soupName: null,	
	soupFolder: null,
}).setSlots({
	/*
    init: function () {
        BMNode.init.apply(this)
    },
	*/
    
    soupFolder: function() {
        if (!this._soupFolder) {
			if (this.soupName() == null) {
				throw "soupName is null"
			}
            this._soupFolder = IndexedDBFolder.root().folderAt(this.soupName())
        }
        return this._soupFolder
    },

	soupAddItem: function(aNode) {
        this.soupFolder().atPut(aNode.pid(), aNode.nodeDict())
		return this
	},

	soupRemoveItem: function(aNode) {
        this.soupFolder().asyncRemoveAt(aNode.pid())
		return this
	},

    asyncSoupLoadItems: function(callback) {
        var self = this

        this.soupFolder().asyncValues(function (values) {
            values.forEach(function(nodeDict) {
                //console.log("load json ", json)
				var proto = window[nodeDict._type]
				
                var aNode = proto.clone().setNodeDict(nodeDict)
                //console.log("loaded aNode ", aNode)
                BMNode.addItem.apply(self, [aNode])
            })
            
            //self.updateIndex()
            
            if (callback) { 
                callback()
            }
        })

        return this
    },

})
