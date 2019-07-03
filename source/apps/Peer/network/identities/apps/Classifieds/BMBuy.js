"use strict"

/*

    BMBuy

*/

window.BMBuy = BMStorableNode.extend().newSlots({
    type: "BMBuy",
    post: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("Buy")
        this.setCanDelete(true)
        this.setSubtitle(Math.floor(Math.random()*10000))
        this.addStoredSlot("subtitle")
    },
    
    setPost: function(aPost) {
        if (this.post()) {
            this.removeSubnode(this.post())
        }
        
        this._post = aPost
        this.addSubnode(aPost)
        return this
    },

})
