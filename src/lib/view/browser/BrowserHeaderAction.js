
BrowserHeaderAction = NodeView.extend().newSlots({
    type: "BrowserHeaderAction",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("BrowserHeaderAction")
        return this
    },

    updateImage: function () {
        var path = 'icons/' + this.action() + '_active.png'
        this.element().style['background-image'] = 'url("' + path + '")';
		//console.log("this.target() = ", this.target().type())
		//console.log("this.target().nodeVisibleClassName() = ", this.target().subnodeProto().nodeVisibleClassName())
		
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
