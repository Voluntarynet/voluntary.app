"use strict"

/*

    ImageWellView

*/

NodeView.newSubclassNamed("ImageWellView").newSlots({
    imageView: null,
    isEditable: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForDrop(true)
        this.dragUnhighlight()
        this.turnOffUserSelect()
        this.setTransition("all 0.3s")
        this.autoFitParentWidth()
        this.autoFitChildHeight()
        this.setMinHeightPx(100)
        this.setTextAlign("center")
        return this
    },

    syncToNode: function () {
        this.tellParentViews("didUpdateImageWellView", this)
        return this
    },

    /*
    syncFromNode: function() {
        NodeView.syncFromNode.apply(this)
        this.valueView().setBackgroundColor("transparent")
        return this
    },
    */
    
    isEditable: function() {
        // we need this to override the normal isContentEditable return value
        return this._isEditable
    },
    
    
    setIsEditable: function(aBool) {
        this._isEditable = aBool
        //console.log("this.isEditable() = " + this.isEditable() + " aBool: " + aBool)
        assert(this.isEditable() === aBool)
        this.subviews().forEach(imageView => imageView.setIsEditable(aBool))
        return this
    },
    
    dragHighlight: function() {
        this.setBackgroundColor("#eee")
    },
    
    dragUnhighlight: function() {
        this.setBackgroundColor("transparent")
    },
    
    imageCount: function() {
        return this.subviews().length
    },
    
    isFull: function() {
        return this.imageCount() != 0
    },
    
    acceptsDrop: function(event) {
        if (!this.node()) {
            console.warn(this.typeId() + ".acceptsDrop() missing node")
        }
        const accepts = (!this.isFull()) && (this.isEditable() !== false)
        console.log(this.typeId() + ".acceptsDrop():")
        console.log("    isEditable: " + this.isEditable())
        console.log("        isFull: " + this.isFull())
        console.log("       accepts: " + accepts)
        console.log("\n")
        return accepts        
    },

    setValue: function(aValue) {
        this.setImageDataURLs(aValue)
        return this
    },

    value: function() {
        return this.imageDataURLs()
    },
    
    setImageDataURLs: function(dataURLs) {
        if (dataURLs === null || dataURLs === "") {
            dataURLs = []
        }

        if (JSON.stringify(dataURLs) === JSON.stringify(this.imageDataURLs())) {
            return this
        }
        
        this.removeAllSubviews();
        console.log("setImageDataURLs = ", dataURLs)

        dataURLs.forEach( (dataURL) => {
            this.addImageDataURL(dataURL)
        })
    },
    
    addImageDataURL: function(dataURL) {
        if (this.isFull()) {
            return this
        }
        const imageView = ImageView.clone().fetchDataURLFromSrc(dataURL)
        imageView.setIsEditable(this.isEditable())
        //imageView.setMaxHeightPx(180)
        imageView.autoFitChildHeight()
        imageView.autoFitParentWidth()
        this.addSubview(imageView);    
        return this
    },
    
    imageDataURLs: function() {
        const urls = this.subviews().map(imageView => imageView.dataURL())
        const imageDataURLs = urls.select(url => url != null)
        return imageDataURLs
    },
    
    onDropImageDataUrl: function(dataURL) {
        this.addImageDataURL(dataURL)
        this.scheduleSyncToNode() //this.syncToNode()
        return this        
    },
})
