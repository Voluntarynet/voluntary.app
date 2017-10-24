"use strict"
/*

	base row view, just knows about selected, selectable and colors
*/

window.BrowserRow = NodeView.extend().newSlots({
    type: "BrowserRow",
    isSelected: false,
    isSelectable: true,
    closeButtonView: null,
	defaultHeight: 60,
	restCloseButtonOpacity: 0.4,
	transitionStyle: "all 0.2s ease, width 0s, max-width 0s, min-width 0s",
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setOwnsView(false)
        this.setIsRegisteredForClicks(true)
        this.turnOffUserSelect()

		if (WebBrowserWindow.isTouchDevice()) {
			this.setIsRegisteredForTouch(true)
		} else {
	        this.setIsRegisteredForMouse(true)
			this.addCloseButton()
		}

		this.setTransition(this.transitionStyle())
		//this.animateOpen()
        return this
    },
    
    column: function () {
        return this.parentView()
    },
    
    updateSubviews: function() {
        this.setBackgroundColor(this.currentBgColor())
        
        if (this.closeButtonView()) {
            if (this.canDelete()) {
                this.closeButtonView().setOpacity(this.restCloseButtonOpacity())
            } else {
                this.closeButtonView().setOpacity(0)
            }
        }
        
        return this
    },
    
    // -------------
    
    onDidEdit: function (changedView) {   
        //console.log("onDidEdit")
        this.scheduleSyncToNode() //this.syncToNode()
    },
    
	// --- sync ---
	
    syncFromNode: function () {
        // is this ever called?
        this.updateSubviews()
        return this
    },
    
    onTabKeyUp: function() {
        console.log(this.type() + " onTabKeyUp")
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
    
    // close button
    
    addCloseButton: function() {
        if (this.closeButtonView() == null) {
            this.setCloseButtonView(NodeView.clone().setDivClassName("BrowserRowCloseButton"))
            this.addSubview(this.closeButtonView()) 
            this.closeButtonView().setTarget(null).setAction("delete").setInnerHTML("&#10799;")
            this.closeButtonView().setOpacity(0).setTransition(this.transitionStyle())
            /*
            this.closeButtonView().setBackgroundImageUrlPath(this.pathForIconName(this.action()))
    		this.closeButtonView().setBackgroundSizeWH(20, 20) // use "contain" instead?
    		this.closeButtonView().setBackgroundPosition("center")
    		*/
        }
        return this
    },
    
    removeCloseButton: function() {
        if (this.closeButtonView() != null) {
            this.removeSubview(this.closeButtonView()) 
            this.setCloseButtonView(null)
        }
    },
    
    delete: function() {
        if (this.canDelete()) {
			this.setOpacity(0)
			//this.setRight(-this.clientWidth())
			this.setMinAndMaxHeight(0)
			setTimeout(() => {
	            this.node().performAction("delete")
			}, 240)
        }
    },

	animateOpen: function() {
		this.setTransition(this.transitionStyle())
		this.setOpacity(0)
		this.setMinAndMaxHeight(0)
		setTimeout(() => {
			this.setOpacity(1)
			this.setMinAndMaxHeight(this.defaultHeight())
		}, 0)		
	},

    // sliding
    
    canDelete: function() {
        return this.node() && this.node().hasAction("delete")
    },
    

	// touch sliding
	
	onTouchMove: function(event) {
		console.log(this.type() + " onTouchMove diff ", JSON.stringify(this.touchDownDiffWithEvent(event)))
        if (this.canDelete()) {
            var diff = this.touchDownDiffWithEvent(event)
            //console.log("onMouseMove:" + JSON.stringify(diff))
            this.setTransition("all 0s")
			var xd = diff.xd
			
			if (xd > 0) { 
				xd = 0; 
			}
			
            this.setRight(-xd)
        }
	},
	
	onTouchCancel: function(event) {
		console.log(this.type() + " onTouchCancel")
        this._isTouchDown = false
        this.slideBack()
	},
	
	onTouchEnd: function(event) {
		console.log(this.type() + " onTouchEnd diff ", JSON.stringify(this.touchDownDiffWithEvent(event)))

		if (this._isTouchDown) {
			var diff = this.touchDownDiffWithEvent(event)
			if ((-diff.xd) > this.clientWidth() * 0.25) {
				this.delete()
			} else {
		        this.slideBack()
			}
	        this._isTouchDown = false
		}
	},
	
    /*
    onMouseMove: function (event) {
        if (this.isMouseDown() && this.canDelete()) {
            var diff = this.mouseDownDiffWithEvent(event)
            //console.log("onMouseMove:" + JSON.stringify(diff))
            this.setTransition("all 0s")
            this.setRight(diff.xd)
        }
    },
    */
    
    hasCloseButton: function() {
        return this.closeButtonView() && this.closeButtonView().target() != null
    },
    
    onMouseEnter: function(event) {
        //console.log(this.type() + " onMouseEnter")
        
        if (this.canDelete() && !this.hasCloseButton()) {
            this.closeButtonView().setOpacity(1)
            this.closeButtonView().setTarget(this)
        }
    },
    
    onMouseLeave: function(event) {
        //console.log(this.type() + " onMouseLeave")
        if (this.hasCloseButton()) {
            this.closeButtonView().setOpacity(this.restCloseButtonOpacity())
            this.closeButtonView().setTarget(null)
        }        
    },
    
    onMouseUp: function (event) {
        NodeView.onMouseUp.apply(this, [event])
        this.slideBack()
    },

	slideBack: function() {
        if (this.canDelete()) {
            this.setTransition(this.transitionStyle())
            setTimeout(() => {
                this.setRight(0)
            })
        }		
	},
    
	// --- selecting ---
    
    onClick: function (event) {
        if (this.isSelectable()) {
            this.select()
            //console.log(this.type() + " tellParentViews didClickRow")
            this.tellParentViews("didClickRow", this)
        }
		return false
    },

    setIsSelected: function (aBool) {
		if (this._isSelected != aBool) {
	        this._isSelected = aBool
        
	        if (aBool) {
	            this.showSelected()    
	        } else {
	            this.showUnselected() 
	        }
        
	        this.updateSubviews()
	        //this.syncToNode()
		}
        return this
    },

	showSelected: function() {
        //this.setBorderTop("1px solid #333")
        //this.setBorderBottom("1px solid #444")
        this.setOpacity(1)
		return this		
	},
	
	showUnselected: function() {
        //this.setBorderTop("1px solid transparent")
        //this.setBorderBottom("1px solid transparent")
        //this.setOpacity(0.7)		
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
