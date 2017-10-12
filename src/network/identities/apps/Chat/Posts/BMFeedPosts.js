
"use strict"

window.BMFeedPosts = BMStorableNode.extend().newSlots({
    type: "BMFeedPosts",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setTitle("feed")
        this.setShouldStore(true)	
    },

	finalize: function() {
		BMStorableNode.finalize.apply(this)
		this.setTitle("feed")
	},
})