"use strict"

window.ShelfItemView = DivView.extend().newSlots({
    type: "ShelfItemView",
    isSelected: false,
    isSelectable: true,
	restCloseButtonOpacity: 0.4,
	iconView: null,
	destinationNode: null,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.setIsRegisteredForClicks(true)
        this.turnOffUserSelect()
		this.setTransition("all 0.35s")
		
		var itemSize = 78
		this.setMinAndMaxWidth(itemSize)
		this.setMinAndMaxHeight(itemSize)
		this.setIsRegisteredForMouse()
		
		var iv = DivView.clone().setDivClassName("ShelfIconView")
		this.setIconView(iv)
        this.addSubview(iv)
        
        var iconSize = 46
        iv.setPosition("relative")
        iv.setLeft((itemSize-iconSize)/2)
        iv.setTop((itemSize-iconSize)/2)
		iv.setMinAndMaxWidth(iconSize)
		iv.setMinAndMaxHeight(iconSize)
		iv.makeBackgroundNoRepeat()
		//this.makeBackgroundContain()
		iv.makeBackgroundCentered()
        return this
    },
    
    /*
    shelf: function () {
        return this.parentView()
    },
    */

    setImageDataUrl: function(imageDataUrl) {
        var iv = this.iconView()
        
        if (imageDataUrl) {
    		iv.setBackgroundImageUrlPath(imageDataUrl)        
    		iv.setBackgroundSizeWH(64, 64)     
        } else {
            iv.setBackgroundColor("#aaa")
        }
        
		return this
	},
	
    setIconName: function(name) {
        var iv = this.iconView()
		iv.setBackgroundImageUrlPath(this.pathForIconName(name))        
		iv.setBackgroundSizeWH(24, 24)
        return this
	},
	
	// --- colors ---
	
	currentBgColor: function() {
		if (this.isSelected()) {
			return this.selectedBgColor()
		} 
		
		return this.unselectedBgColor()
	},

    unselectedBgColor: function() {
        return "transparent"
    },
    
    selectedBgColor: function() {
		if (!this.column()) {
			return "transparent"
		}
        return this.column().selectionColor()
    },
    
    // --- mouse hover ---

    onMouseEnter: function(event) {
        console.log(this.typeId() + " onMouseEnter")
        this.setOpacity(1)
    },
    
    onMouseLeave: function(event) {
        console.log(this.typeId() + " onMouseLeave")
        this.show() 
    },
    
    onMouseUp: function (event) {
        console.log(this.typeId() + " onMouseUp")

    },
    
	// --- selecting ---
    
    onClick: function (event) {
        if (this.isSelectable()) {
            this.select()
            this.tellParentViews("didClickItem", this)
        }
		return false
    },

    setIsSelected: function (aBool) {
		if (this._isSelected != aBool) {
	        this._isSelected = aBool
            this.show()
		}
        return this
    },
    
    show: function() {
        if (this.isSelected()) {
            this.showSelected()    
        } else {
            this.showUnselected() 
        }
    
        //this.updateSubviews()        
    },

	showSelected: function() {
        this.setOpacity(1)
		return this		
	},
	
	showUnselected: function() {
        this.setOpacity(0.3)		
	},
    
    select: function() {
        this.setIsSelected(true)		
        return this
    },

    unselect: function() {
        this.setIsSelected(false)
        return this
    },

})
