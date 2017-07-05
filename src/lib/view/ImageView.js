
ImageView = NodeView.extend().newSlots({
    type: "ImageView",
    imageElement: null,
    closeButtonView: null,
    dataURL: null,
    isEditable: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        
        this.setDivClassName("ImageView")
        this.registerForDrop(false)
        //this.setEditable(false)
		this.setContentEditable(false)
        this.dragUnhighlight()
        this.turnOffUserSelect()
        this.turnOffUserSelect()
        return this
    },

	// --- editable ---
    
    setIsEditable: function(aBool) {
        if (aBool) {
            this.addCloseButton()
        } else {
            this.removeCloseButton()
        }
        return this
    },

    
    setEditable: function (aBool) {

        return this
    },
    
	// --- close button ---

    addCloseButton: function() {
        if (this.closeButtonView() == null) {
            this.setCloseButtonView(NodeView.clone().setDivClassName("ImageCloseButton"))
            this.addSubview(this.closeButtonView()) 
            this.closeButtonView().setTarget(this).setAction("close").setInnerHTML("&#10799;")
        }
        return this        
    },
    
    removeCloseButton: function() {
        if (this.closeButtonView() != null) {
            this.removeSubview(this.closeButtonView()) 
            this.setCloseButtonView(null)
        }
    },
    
    close: function() {
        //console.log("close action")
        this.removeAfterFadeDelay(0.4)
        setTimeout( () => { 
            this.removeSubview(this.closeButtonView())
			this.syncToNode()
			
            var style = this.element().style;
            style.width = "0px";
            style.paddingLeft = "0px";
            style.paddingRight = "0px";
            style.marginLeft = "0px";
            style.marginRight = "0px";
        }, 0)
    },

	// --- sync ---

    syncToNode: function () {
        this.parentView().syncToNode()
        NodeView.syncToNode.apply(this)
        return this
    },

/*
    syncFromNode: function () {
        var node = this.node()
        
        return this
    },
    
    syncToNode: function () {
        //var node = this.node()
        this.parentView().syncToNode()
        NodeView.syncToNode.apply(this)
        return this
    },
*/

    
    /*
    onDidEdit: function (changedView) {     
        //this.log("onDidEdit")   
        this.syncToNode()
    },
    
    dragHighlight: function() {
        this.setBackgroundColor("#eee")
    },
    
    dragUnhighlight: function() {
        this.setBackgroundColor("transparent")
    },
        
    onDropFiles: function (files) {
        var file = files[0];
        console.log(this.type() + " onDropFiles " + typeof(file) + " " + file);

        this.setFromPath(file)
                    
        event.preventDefault();
        return true;
    },
    */
    
    removeChildren: function() {
        var e = this.element()
        while (e.hasChildNodes()) {
            e.removeChild(e.lastChild);
        }
        return this
    },
    
    newImage: function() {
        var image = new Image();
        image.style.maxHeight = "100%";
        image.style.maxWidth = "100%";
        image.style.marginTop = "20px";
        image.style.marginBottom = "20px";
        image.style.marginLeft = "10px";
        image.style.marginRight = "10px";
        return image        
    },

    setFromPath: function(src) {        
        var image = this.newImage();
        image.src = src;

        this.element().appendChild(image); 
        this.setImageElement(image)
        
        //console.log("image.outerHTML  = " + typeof(image.outerHTML) + " [" + image.outerHTML + "]")
        this.fetchDataURLFromSrc(src)
        return this     
    },

	// --- set dataURL or set normal src url and create a dataURL ---
    
    setFromDataURL: function(dataURL) {
        //console.log("setFromDataURL: ", dataURL)
        var image = this.newImage();
        image.src = dataURL;
        this.element().appendChild(image); 
        this.setImageElement(image);
        return this;
    },
    
    fetchDataURLFromSrc: function(src) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            canvas.height = this.height;
            canvas.width = this.width;
            ctx.drawImage(this, 0, 0);
            var data = canvas.toDataURL("image/jpeg");
            this.setDataURL(data);
            //console.log("this._dataURL = ",data)
            this.syncToNode()
        };
        
        
        img.src = src;
        /*
        if (img.complete || img.complete === undefined) {
            img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            img.src = src;
        }
        */
  
    },
    
})
