
ImageWellView = NodeView.extend().newSlots({
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
        this.subviews().forEach(function (imageView) { imageView.setIsEditable(aBool); })
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
        var accepts = (!this.isFull()) && this.isEditable()
        //console.log(this.typeId() + " isFull:" + this.isFull() + " count:" + this.imageCount() + "/" + this.maxImageCount() + " accepts:" + accepts)
        return accepts        
    },
    
    setImageDataURLs: function(dataURLs) {
        if (JSON.stringify(dataURLs) == JSON.stringify(this.imageDataURLs())) {
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
        var imageView = ImageView.clone().fetchDataURLFromSrc(dataURL)
        imageView.setIsEditable(this.isEditable())
        imageView.setMaxHeight(180)
        this.addSubview(imageView);    
        return this
    },
    
    imageDataURLs: function() {
        var urls =  this.subviews().map(function (imageView) { return imageView.dataURL(); })
        urls = urls.select(function (url) { return url != null; })
        return urls
    },
    
    onDropImageDataUrl: function(dataURL) {
        this.addImageDataURL(dataURL)
		this.syncToNode()
        return this        
    },
    
})
