"use strict"

/*

    ImageWellView

*/

window.ImageWellView = class ImageWellView extends NodeView {
    
    initPrototype () {
        this.newSlot("imageView", null)
        this.newSlot("isEditable", true)
    }

    init () {
        super.init()
        this.setIsRegisteredForDrop(true)
        this.dragUnhighlight()
        this.turnOffUserSelect()
        this.setTransition("all 0.3s")
        this.autoFitParentWidth()
        this.autoFitChildHeight()
        this.setMinHeightPx(100)
        //this.setTextAlign("center")
        return this
    }

    syncToNode () {
        super.suncToNode()
        this.tellParentViews("didUpdateImageWellView", this)
        return this
    }

    /*
    syncFromNode () {
        super.syncFromNode()
        this.valueView().setBackgroundColor("transparent")
        return this
    }
    */
    
    isEditable () {
        // we need this to override the normal isContentEditable return value
        return this._isEditable
    }
    
    setIsEditable (aBool) {
        this._isEditable = aBool
        assert(this.isEditable() === aBool)
        if (this.imageView()) {
            this.imageView().setIsEditable(aBool)
        }
        return this
    }
    
    dragHighlight () {
        this.setBackgroundColor("#eee")
    }
    
    dragUnhighlight () {
        this.setBackgroundColor("transparent")
    }
    
    isFull () {
        //console.log("this.imageView().dataURL()  = ", this.imageView().dataURL() )
        return this.subviews().length > 0
    }
    
    acceptsDrop (event) {
        /*
        if (!this.node()) {
            console.warn(this.typeId() + ".acceptsDrop() missing node")
        }
        */
        const accepts = (!this.isFull()) && (this.isEditable() !== false)
        /*
        this.debugLog(".acceptsDrop():")
        console.log("    isEditable: " + this.isEditable())
        console.log("        isFull: " + this.isFull())
        console.log("       accepts: " + accepts)
        console.log("\n")
        */
        return accepts        
    }

    setValue (aValue) {
        this.setImageDataURL(aValue)
        return this
    }

    value () {
        return this.imageDataURL()
    }
    
    setImageDataURL (dataURL) {
        if (Type.isArray(dataURL)) {
            dataURL = dataURL[0]
        }

        if (Type.isNull(dataURL) || Type.isUndefined(dataURL)) {
            dataURL = ""
        }
        
        //this.debugLog(".setImageDataURL = ", dataURL)
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
    }
    
    imageDataURL () {
        const iv = this.imageView()
        if (iv && iv.dataURL()) {
            return iv.dataURL()
        }
        return null
    }
    
    onDropImageDataUrl (dataURL) {
        this.setImageDataURL(dataURL)
        this.scheduleSyncToNode() //this.syncToNode()
        return this        
    }
    
    willRemoveSubview (aSubview) {
        super.willRemoveSubview(aSubview)

        if (aSubview === this.imageView()) {
            this.setImageView(null)
        }
        return this
    }
    
}.initThisClass()
