"use strict"

/* 

    ShelfItemView

*/

NodeView.newSubclassNamed("ShelfItemView").newSlots({
    isSelected: false,
    isSelectable: true,
    restCloseButtonOpacity: 0.4,
    iconView: null,
    badgeView: null,
    markerView: null,
    destinationNode: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForClicks(true)
        this.turnOffUserSelect()
        this.setTransition("all 0.35s")
		
        this.setIsRegisteredForMouse()
		
        let iv = DomView.clone().setDivClassName("ShelfIconView")
        this.setIconView(iv)
        this.addSubview(iv)
        iv.makeBackgroundNoRepeat()
        //this.makeBackgroundContain()
        iv.makeBackgroundCentered()

        // this.setupBadgeView()
        this.setupMarkerView()

        this.setItemWidthHeight(78, 70)

        this.styles().selected().setOpacity(1)
        this.styles().unselected().setOpacity(0.45)
        return this
    },
    
    didUpdateNode: function() {
        NodeView.didUpdateNode.apply(this)
        this.syncFromNode()
    },

    setupBadgeView: function() {	
        let v = DomView.clone().setDivClassName("ShelfBadgeView")
        this.setBadgeView(v)
	    this.addSubview(v)
        return this
    },
	
    setupMarkerView: function() {	
        let v = DomView.clone().setDivClassName("ShelfMarkerView")
        this.setMarkerView(v)
	    this.addSubview(v)
        return this
    },
    
    name: function() {
        if (this.destinationNode()) {
            return this.destinationNode().title()
        }
        return this.typeId()
    },

    syncFromNode: function() {
        let node = this.node()
        this.setDestinationNode(node)
        let iconUrl = node.shelfIconUrl()
        let iconName = node.shelfIconName()
		
        if (iconUrl) {
            this.setImageDataUrl(iconUrl)
        } else if (iconName) {
            this.setIconName(iconName)
        } else {
            this.iconView().setBackgroundColor("#aaa")
        }
		
        this.applyStyles()
		
        //console.log("vert align")
        if (this.node().nodeViewShouldBadge()) {
            this.markerView().setOpacity(0.5)
        } else {
            this.markerView().setOpacity(0)
        }
        //this.markerView().verticallyAlignAbsoluteNow()
		
        return this
    },
	
    didChangeHeight: function() {
        NodeView.didChangeHeight.apply(this)
	     window.SyncScheduler.shared().scheduleTargetAndMethod(this.markerView(), "verticallyAlignAbsoluteNow", 0)
        return this
    },
    
    setItemWidthHeight: function(itemWidth, itemHeight) {
        //let itemWidth = 78
        //let itemHeight = 70
		
        this.setMinAndMaxWidth(itemWidth)
        this.setMinAndMaxHeight(itemHeight)
		
        let iv = this.iconView()
        let iconWidth  = itemWidth  * 0.7
        let iconHeight = itemHeight * 0.7
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
        let iv = this.iconView()
        
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
        let iv = this.iconView()
        iv.setBackgroundImageUrlPath(this.pathForIconName(name))        
        iv.setBackgroundSizeWH(24, 24)
        this.setItemWidthHeight(78, 45)
        return this
    },
    
    // --- selecting ---
    
    onClick: function (event) {
        NodeView.onClick.apply(this, [event])
        //console.log(this.name() + ".onClick()")
        
        if (this.isSelectable()) {
            this.select()
            this.tellParentViews("didClickItem", this)            

        }

        let destNode = this.destinationNode()
        if (destNode) {
            App.shared().browser().setNode(destNode).scheduleSyncFromNode() 
        }
        
        return false
    },

})
