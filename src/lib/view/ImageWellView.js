
ImageWellView = NodeView.extend().newSlots({
    type: "ImageWellView",
    imageView: null,
    isEditable: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForDrop(true)
        this.dragUnhighlight()
        this.turnOffUserSelect()
        return this
    },

    syncToNode: function () {
        var node = this.node()
        this.parentView().syncToNode()
        NodeView.syncToNode.apply(this)
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
    
    acceptsDrop: function(event) {
        return this.isEditable()
    },
    
    setImageDataURLs: function(dataURLs) {
        if (JSON.stringify(dataURLs) == JSON.stringify(this.imageDataURLs())) {
            return this
        }
        
        this.removeAllSubviews();
        //console.log("setImageDataURLs = ", dataURLs)

        dataURLs.forEach( (dataURL) => {
            var imageView = ImageView.clone().setFromDataURL(dataURL)
            imageView.setIsEditable(this.isEditable())
            this.addSubview(imageView);
            //this.node().addSubview(ImageNode.clone().setView(imageView))
        })
    },
    
    imageDataURLs: function() {
        var urls =  this.subviews().map(function (imageView) { return imageView.dataURL(); })
        urls = urls.select(function (url) { return url != null; })
        return urls
    },
    
    onDropImageDataUrl: function(dataUrl) {
        var imageView = ImageView.clone().setFromPath(dataUrl)
        imageView.setIsEditable(this.isEditable())
        this.addSubview(imageView)
		this.syncToNode()
        return this        
    },
    
})
