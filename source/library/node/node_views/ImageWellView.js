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
        //this.setTextAlign("center")

        return this
    },

    syncToNode: function () {
        NodeView.syncToNode.apply(this)
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
        assert(this.isEditable() === aBool)
        if (this.imageView()) {
            this.imageView().setIsEditable(aBool)
        }
        return this
    },
    
    dragHighlight: function() {
        this.setBackgroundColor("#eee")
    },
    
    dragUnhighlight: function() {
        this.setBackgroundColor("transparent")
    },
    
    isFull: function() {
        //console.log("this.imageView().dataURL()  = ", this.imageView().dataURL() )
        return this.subviews().length > 0
    },
    
    acceptsDrop: function(event) {
        /*
        if (!this.node()) {
            console.warn(this.typeId() + ".acceptsDrop() missing node")
        }
        */
        const accepts = (!this.isFull()) && (this.isEditable() !== false)
        /*
        console.log(this.typeId() + ".acceptsDrop():")
        console.log("    isEditable: " + this.isEditable())
        console.log("        isFull: " + this.isFull())
        console.log("       accepts: " + accepts)
        console.log("\n")
        */
        return accepts        
    },

    setValue: function(aValue) {
        this.setImageDataURL(aValue)
        return this
    },

    value: function() {
        return this.imageDataURL()
    },
    
    setImageDataURL: function(dataURL) {
        if (Type.isArray(dataURL)) {
            dataURL = dataURL[0]
        }

        if (Type.isNull(dataURL) || Type.isUndefined(dataURL)) {
            dataURL = ""
        }
        
        //console.log(this.typeId() + ".setImageDataURL = ", dataURL)
        this.removeAllSubviews()

        if (dataURL) {
            this.setImageView(ImageView.clone())
            this.addSubview(this.imageView())

            const iv = this.imageView()
            iv.fetchDataURLFromSrc(dataURL)
            iv.autoFitChildHeight()
            iv.autoFitParentWidth()
        }
        return this
    },
    
    imageDataURL: function() {
        const iv = this.imageView()
        if (iv && iv.dataURL()) {
            return iv.dataURL()
        }
        return null
    },
    
    onDropImageDataUrl: function(dataURL) {
        this.setImageDataURL(dataURL)
        this.scheduleSyncToNode() //this.syncToNode()
        return this        
    },
    
    willRemoveSubview: function(aSubview) {
        NodeView.willRemoveSubview.apply(this, [aSubview])
        if (aSubview === this.imageView()) {
            this.setImageView(null)
        }
        return this
    },
})
