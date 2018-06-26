
"use strict"

window.BMSell = BMStorableNode.extend().newSlots({
    type: "BMSell",
    post: null,
    hasSent: false,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
		
        this.setTitle("Sell")
        this.setActions(["delete"])
        //this.setSubtitle(Math.floor(Math.random()*10000))
        this.addStoredSlots(["subtitle", "hasSent"])
        
        this.setPost(BMClassifiedPost.clone())
        this.addSubnode(this.post())
        this.post().setIsEditable(true)
    },

    
    subtitle: function() {
        return this.post().subtitle()
    },

    didLoadFromStore: function() {
        console.log("BMSell didLoadFromStore setting post to be editable")
        //this.post().setIsEditable(true)
        //this.post().didUpdateNode()
    },


})
