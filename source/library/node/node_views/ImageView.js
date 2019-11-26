"use strict"

/*

    ImageView

*/

NodeView.newSubclassNamed("ImageView").newSlots({
    closeButtonView: null,
    dataURL: null,
    isEditable: false,
    imageContainer: null,
    rawImageView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForDrop(false)
        
        this.setImageContainer(DomView.clone().setDivClassName("ImageViewImageContainer"))
        this.setWidthPercentage(100)
        this.setHeightPercentage(100)
        //this.imageContainer().setWidth("fit-content")
        //this.imageContainer().setHeight("fit-content")
        //this.imageContainer().setBackgroundSize("contain")
        //this.imageContainer().autoFitChildWidth()
        //this.imageContainer().autoFitChildHeight()
        this.addSubview(this.imageContainer())

        //this.setEditable(false)
        this.setIsEditable(false)
        this.dragUnhighlight()
        this.turnOffUserSelect()
        this.setTransition("all 0.3s")
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
        if (this.closeButtonView() === null) {
            const cb = ButtonView.clone().setDivClassName("ImageCloseButton")
            this.setCloseButtonView(cb)
            this.addSubview(cb) 
            cb.setTarget(this).setAction("close") //.setInnerHTML("&#10799;")

	        cb.setBackgroundImageUrlPath(this.pathForIconName("close"))
            cb.setBackgroundSizeWH(10, 10) // use "contain" instead?
            cb.setBackgroundPosition("center")
            cb.makeBackgroundNoRepeat()
        }
        return this        
    },
    
    removeCloseButton: function() {
        if (this.closeButtonView() !== null) {
            this.removeSubview(this.closeButtonView()) 
            this.setCloseButtonView(null)
        }
    },

    collapse: function() {
        this.closeButtonView().setOpacity(0).setTarget(null)
        this.setOpacity(0)
		
        this.setWidth("0px")
		
        this.setPaddingLeft(0)
        this.setPaddingRight(0)
		
        this.setMarginLeft(0)
        this.setMarginRight(0)
		
        //this.rawImageView().setMinAndMaxWidth(0)
        //this.imageContainer().setMinAndMaxWidth(0)
        //this.setMinAndMaxWidth(0)
        /*
        let style = this.cssStyle();
        style.paddingLeft = "0px";
        style.paddingRight = "0px";
        style.marginLeft = "0px";
        style.marginRight = "0px";	
        */
    },
    
    close: function() {
        const seconds = 0.3
		
        this.collapse()
        
        setTimeout( () => { 
            this.removeCloseButton()
            const parentView = this.parentView()
            this.removeFromParentView()
            /*
            if (parentView && parentView.subviewRequestsClose) {
                parentView.subviewRequestsClose(this)
            }
            */
            //this.debugLog(".close complete parentView = ", parentView)
            parentView.scheduleSyncToNode()
        }, seconds * 1000)
    },

    // --- sync ---
    
    removeRawImageView: function() {
        if (this.rawImageView()) {
            this.imageContainer().removeSubview(this.rawImageView())
            this.setRawImageView(null)
        }
        return this
    },
    
    setFromDataURL: function(dataURL) {
        //console.log("setFromDataURL: ", dataURL)
        if (!dataURL) {
            console.warn(this.typeId() + ".setFromDataURL() called with null argument")
            return this
        }
		
        assert(dataURL.beginsWith("data:")) 

        this.removeRawImageView()
        this.setDataURL(dataURL)

        const image = new Image();
        image.src = dataURL;

        this.setRawImageView(DomView.clone().setElement(image).setDivClassName("ImageViewImageObject"))
        this.imageContainer().addSubview(this.rawImageView())
	
        return this
    },
    
    fetchDataURLFromSrc: function(src) {
        if (src.beginsWith("data:")) {
	        this.setFromDataURL(src)
        } else {
		    const img = new Image();
            img.crossOrigin = "Anonymous";
        
	        img.onload = () => {
	            let canvas = document.createElement("CANVAS");
	            let ctx = canvas.getContext("2d");
	            canvas.height = this.height;
	            canvas.width = this.width;
	            ctx.drawImage(img, 0, 0);
	            let data = canvas.toDataURL("image/jpeg");
	            this.didFetchDataURL(data)
	        };

            img.src = src;

            /*
            if (img.complete || img.complete === undefined) {
                img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                img.src = src;
            }
            */
        }
		
        return this
    },
    
    didFetchDataURL: function(dataURL) {
        this.setFromDataURL(dataURL)
        this.scheduleSyncToNode() 
        return this
    },
    
}).initThisProto()
