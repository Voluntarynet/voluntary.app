
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
        return this
    },

    syncFromNode: function() {
        this.updateImage()
        return this
    },
})
