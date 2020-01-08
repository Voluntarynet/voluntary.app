"use strict"

/*

    BMImageWellFieldRowView

*/

window.BMImageWellFieldRowView = class BMImageWellFieldRowView extends BMFieldRowView {
    
    initPrototype () {

    }

    init () {
        super.init()
        //this.keyView().setDivClassName("BMImageWellKeyField") //.setDisplay("none")
        //this.valueView().setIsEditable(false)
        this.turnOffUserSelect()
        this.keyView().setTransition("all 0.3s")
        return this
    }

    createValueView () {
        return ImageWellView.clone()
    }
	
    imageWellView () {
        return this.valueView()
    }

    syncFromNode () {
        super.syncFromNode()

        const field = this.node()

        /*
        const field = this.node()

        if (this.imageWellView()) {
            //console.log("field = ", field.type())
            // sync key view
            this.keyView().setInnerHTML(field.key())
            this.keyView().setIsEditable(field.keyIsEditable())
		    this.updateKeyView()

            this.imageWellView().setImageDataURL(field.value())
            this.imageWellView().setIsEditable(field.valueIsEditable())

        }
        */
        
        this.applyStyles() // normally this would happen in updateSubviews
        this.imageWellView().setImageDataURL(field.value())

        return this
    }

    syncToNode () {
        const field = this.node()
				
        this.updateKeyView()
		
        if (field.valueIsEditable()) {
            const data = this.imageWellView().imageDataURL()
            //console.log("data = " + (data ? data.slice(0, 40) + "..." : "null"))
        	field.setValue(data)
        }
        
        //super.suncToNode()
        return this
    }

    dataUrl () {
        return this.imageWellView().imageDataURL()
    }

    isEmpty () {
        return Type.isNull(this.dataUrl())
    }
    
    updateKeyView () {
        let opacity = 1
        
        if(this.node().onlyShowsKeyWhenEmpty && this.node().onlyShowsKeyWhenEmpty()) {
		    opacity = this.isEmpty() ? 0 : 1
        }
        
	    this.keyView().setOpacity(opacity)
	    
        return this
    }
    
    didUpdateImageWellView (anImageWell) {
        //this.debugLog(".didUpdateImageWellView()")
        this.scheduleSyncToNode() 
        return this
    }
    
}.initThisClass()
