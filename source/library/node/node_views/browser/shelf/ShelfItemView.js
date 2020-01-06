"use strict"

/* 

    ShelfItemView

*/

window.ShelfItemView = class ShelfItemView extends NodeView {
    
    initPrototype () {
        this.newSlot("isSelectable", true)
        this.newSlot("restCloseButtonOpacity", 0.4)
        this.newSlot("iconView", null)
        this.newSlot("badgeView", null)
        this.newSlot("markerView", null)
        this.newSlot("destinationNode", null)
    }

    init () {
        super.init()
        this.setIsRegisteredForClicks(true)
        this.turnOffUserSelect()
        this.setTransition("all 0.35s")
		
        this.setIsRegisteredForMouse()
		
        const iv = DomView.clone().setDivClassName("ShelfIconView")
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
    }
    
    didUpdateNode () {
        super.didUpdateNode()
        this.syncFromNode()
    }

    setupBadgeView () {	
        const v = DomView.clone().setDivClassName("ShelfBadgeView")
        this.setBadgeView(v)
	    this.addSubview(v)
        return this
    }
	
    setupMarkerView () {	
        const v = DomView.clone().setDivClassName("ShelfMarkerView")
        this.setMarkerView(v)
	    this.addSubview(v)
        return this
    }
    
    name () {
        if (this.destinationNode()) {
            return this.destinationNode().title()
        }
        return this.typeId()
    }

    syncFromNode () {
        const node = this.node()
        this.setDestinationNode(node)
        const iconUrl = node.shelfIconUrl()
        const iconName = node.shelfIconName()
		
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
    }
	
    didChangeHeight () {
        super.didChangeHeight()
	     window.SyncScheduler.shared().scheduleTargetAndMethod(this.markerView(), "verticallyAlignAbsoluteNow", 0)
        return this
    }
    
    setItemWidthHeight (itemWidth, itemHeight) {
        //let itemWidth = 78
        //let itemHeight = 70
		
        this.setMinAndMaxWidth(itemWidth)
        this.setMinAndMaxHeight(itemHeight)
		
        const iv = this.iconView()
        const iconWidth  = itemWidth  * 0.7
        const iconHeight = itemHeight * 0.7
        iv.setPosition("relative")
        iv.setLeft((itemWidth-iconWidth)/2)
        iv.setTop((itemHeight-iconHeight)/2)
        iv.setMinAndMaxWidth(iconWidth)
        iv.setMinAndMaxHeight(iconHeight)
        return this
    }
    
    setDestinationNode (aNode) {
        this._destinationNode = aNode
        if (aNode) {
            this.setToolTip(aNode.title().capitalized())
        }
        return this
    }
    
    /*
    shelf () {
        return this.parentView()
    }
    */

    setImageDataUrl (imageDataUrl) {
        const iv = this.iconView()
        
        if (imageDataUrl) {
    		iv.setBackgroundImageUrlPath(imageDataUrl)        
    		iv.setBackgroundSizeWH(64, 64)     
    		this.setItemWidthHeight(78, 70)
        } else {
            iv.setBackgroundColor("#aaa")
        }
        
        return this
    }
	
    setIconName (name) {
        const iv = this.iconView()
        iv.setBackgroundImageUrlPath(this.pathForIconName(name))        
        iv.setBackgroundSizeWH(24, 24)
        this.setItemWidthHeight(78, 45)
        return this
    }
    
    // --- selecting ---
    
    onClick (event) {
        super.onClick(event)

        //console.log(this.name() + ".onClick()")
        
        if (this.isSelectable()) {
            this.select()
            this.tellParentViews("didClickItem", this)            

        }

        const destNode = this.destinationNode()
        if (destNode) {
            App.shared().browser().setNode(destNode).scheduleSyncFromNode() 
        }
        
        return false
    }

}.initThisClass()
