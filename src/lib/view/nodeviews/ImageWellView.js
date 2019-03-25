"use strict"

/*

    ImageWellView

*/

window.ImageWellView = NodeView.extend().newSlots({
    type: "ImageWellView",
    imageView: null,
    isEditable: true,
    maxImageCount: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForDrop(true)
        this.dragUnhighlight()
        this.turnOffUserSelect()
        this.setTransition("all 0.3s")
        return this
    },

    syncToNode: function () {
        this.tellParentViews("didUpdateImageWellView", this)
        return this
    },
    
    setIsEditable: function(aBool) {
        this._isEditable = aBool
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
        if (this.maxImageCount() == null) {
            return false
        }
        
        return this.imageCount() >= this.maxImageCount()
    },
    
    acceptsDrop: function(event) {
        const accepts = (!this.isFull()) && (this.isEditable() !== false)
        //console.log(this.typeId() + " isFull:" + this.isFull() + " count:" + this.imageCount() + "/" + this.maxImageCount() + " accepts:" + accepts)
        return accepts        
    },
    
    setImageDataURLs: function(dataURLs) {
        if (JSON.stringify(dataURLs) === JSON.stringify(this.imageDataURLs())) {
            return this
        }
        
        this.removeAllSubviews();
        //console.log("setImageDataURLs = ", dataURLs)

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
        imageView.setMaxHeight(180)
        this.addSubview(imageView);    
        return this
    },
    
    imageDataURLs: function() {
        let urls = this.subviews().map(imageView => imageView.dataURL())
        const imageDataURLs = urls.select(url => url != null)
        return imageDataURLs
    },
    
    onDropImageDataUrl: function(dataURL) {
        this.addImageDataURL(dataURL)
        this.scheduleSyncToNode() //this.syncToNode()
        return this        
    },
})
