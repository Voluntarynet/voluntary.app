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
		
		this.setIsRegisteredForMouse()
		
		var iv = DivView.clone().setDivClassName("ShelfIconView")
		this.setIconView(iv)
        this.addSubview(iv)

		iv.makeBackgroundNoRepeat()
		//this.makeBackgroundContain()
		iv.makeBackgroundCentered()

        this.setItemWidthHeight(78, 70)

        return this
    },
    
    name: function() {
        if (this.destinationNode()) {
            return this.destinationNode().title()
        }
        return this.typeId()
    },
    
    setItemWidthHeight: function(itemWidth, itemHeight) {
		//var itemWidth = 78
		//var itemHeight = 70
		
		this.setMinAndMaxWidth(itemWidth)
		this.setMinAndMaxHeight(itemHeight)
		
        var iv = this.iconView()
        var iconWidth = itemWidth*.7
        var iconHeight = itemHeight*.7
        iv.setPosition("relative")
        iv.setLeft((itemWidth-iconWidth)/2)
        iv.setTop((itemHeight-iconHeight)/2)
		iv.setMinAndMaxWidth(iconWidth)
		iv.setMinAndMaxHeight(iconHeight)
		return this
    },
    
    setDestinationNode: function(aNode) {
        this._destinationNode = aNode
        if (aNode) {
            this.setToolTip(aNode.title().capitalized())
        }
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
    		this.setItemWidthHeight(78, 70)
        } else {
            iv.setBackgroundColor("#aaa")
        }
        
		return this
	},
	
    setIconName: function(name) {
        var iv = this.iconView()
		iv.setBackgroundImageUrlPath(this.pathForIconName(name))        
		iv.setBackgroundSizeWH(24, 24)
        this.setItemWidthHeight(78, 45)
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
/*
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
    */
    
	// --- selecting ---
    
    onClick: function (event) {
        DivView.onClick.apply(this, [event])
        
        if (this.isSelectable()) {
            console.log(this.name() + ".onClick()")
            this.select()
            this.tellParentViews("didClickItem", this)            

            var destNode = this.destinationNode()
            if (destNode) {
                App.shared().browser().setNode(destNode).scheduleSyncFromNode() // this.browser().syncFromNode()
            }
        }
        
		return false
    },

    setIsSelected: function (aBool) {
		if (this._isSelected != aBool) {
	        this._isSelected = aBool
            this.show()
            console.warn(this.name() + ".setIsSelected(" + aBool + ")")
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
