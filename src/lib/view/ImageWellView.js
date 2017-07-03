
ImageWellView = NodeView.extend().newSlots({
    type: "ImageWellView",
    imageView: null,
    isEditable: true,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setDivClassName("ImageWellView")
        this.registerForDrop(true)
        this.dragUnhighlight()
        this.makeUnselectable()
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
        this.items().forEach(function (imageView) { imageView.setIsEditable(aBool); })
        return this
    },
    
    dragHighlight: function() {
        this.setBackgroundColor("#eee")
        //this.setColor("#fefefe")
    },
    
    dragUnhighlight: function() {
        this.setBackgroundColor("transparent")
        //this.setColor("#aaa")
    },
    
    acceptsDrop: function(event) {
        return this.isEditable()
    },
    
    setImageDataURLs: function(dataURLs) {
        if (JSON.stringify(dataURLs) == JSON.stringify(this.imageDataURLs())) {
            return this
        }
        
        this.removeAllItems();
        //console.log("setImageDataURLs = ", dataURLs)

        dataURLs.forEach( (dataURL) => {
            var imageView = ImageView.clone().setFromDataURL(dataURL)
            imageView.setIsEditable(this.isEditable())
            this.addItem(imageView);
            //this.node().addItem(ImageNode.clone().setView(imageView))
        })
    },
    
    imageDataURLs: function() {
        var urls =  this.items().map(function (imageView) { return imageView.dataURL(); })
        urls = urls.select(function (url) { return url != null; })
        return urls
    },
    
    onDropImageDataUrl: function(dataUrl) {
        var imageView = ImageView.clone().setFromPath(dataUrl)
        imageView.setIsEditable(this.isEditable())
        this.addItem(imageView)
		this.syncToNode()
        return this        
    },
    
})
