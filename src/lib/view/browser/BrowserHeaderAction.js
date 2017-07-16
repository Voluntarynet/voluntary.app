
BrowserHeaderAction = NodeView.extend().newSlots({
    type: "BrowserHeaderAction",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        return this
    },

    updateImage: function () {
        var path = 'icons/' + this.action() + '_active.png'
        this.setBackgroundImage('url("' + path + '")')
		
		this.setToolTip(this.action())

		if (this.target() && this.target().subnodeProto() && this.target().subnodeProto().nodeVisibleClassName()) {
			var noun = this.target().subnodeProto().nodeVisibleClassName().toLowerCase()
			var beginsWithVowel = ["a", "e", "i", "o", "u"].contains(noun[0])
			var article = beginsWithVowel ? "an" : "a";
			this.setToolTip(this.action() + " " + article + " " + noun)
		}
		
        return this
    },

    syncFromNode: function() {
        this.updateImage()
        return this
    },
})
