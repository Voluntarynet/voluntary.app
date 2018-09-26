"use strict"
/*

	base row view, just knows about selected, selectable and colors
*/

window.BrowserRow = NodeView.extend().newSlots({
    type: "BrowserRow",
    isSelectable: true,
    closeButtonView: null,
    defaultHeight: 60,
    restCloseButtonOpacity: 0.4,
    transitionStyle: "all 0.2s ease, width 0s, max-width 0s, min-width 0s",
    selectedFlashColor: "#ccc",
    shouldShowFlash: false,
    shouldCenterCloseButton: true, 
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        //this.setOwnsView(false)
        this.setIsRegisteredForClicks(true)
        this.turnOffUserSelect()
        this.setAcceptsFirstResponder(false)
        
        if (WebBrowserWindow.shared().isTouchDevice()) {
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
    
    // node style dict 
    
    currentRowStyle: function() {
        var styles = this.node().nodeRowStyles()
        //styles.selected().set
        
        if (this.isSelected()) {
        	return styles.selected()
 		}
        
        return styles.unselected()
    },
    
    select: function() {
        if (!this.isSelected()) {
            this.setShouldShowFlash(true)
        }

        NodeView.select.apply(this)
        return this
    },
    
    // update
     
    updateSubviews: function() {        
        if (this.node()) {
            this.currentRowStyle().applyToView(this)
        }
        
        if (this.closeButtonView()) {
            if (this.node()) {
                this.closeButtonView().element().style.color = this.currentRowStyle().color()
            }
			
            if (this.canDelete()) {
                this.closeButtonView().setOpacity(this.restCloseButtonOpacity())
            } else {
                this.closeButtonView().setOpacity(0)
            }
        }
        
        this.applyStyles()

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
	
    applyStyles: function() {
        var node = this.node() 
        
        if (node) {
            this.styles().copyFrom(node.nodeRowStyles())
        }
        
        NodeView.applyStyles.apply(this)
        
        //console.log(this.node().title() + " this.currentBgColor() = ", this.currentBgColor())
        //console.log("this.node().nodeRowStyles().selected().backgroundColor() = ", this.currentBgColor())

        /*
        if (!this.isSelected() && this.selectedFlashColor()) {
            console.log("flashing")
            this.setTransition("0s all")
            this.setBackgroundColor(this.selectedFlashColor())
            this.setTransition("0.3s all")
        }
        */

        //this.setTransition("0.0s all")

        if (this.shouldShowFlash() && this.selectedFlashColor()) {
            this.setBackgroundColor(this.selectedFlashColor())
            //setTimeout(() => { this.setBackgroundColor(this.selectedFlashColor()) }, 0)
            //setTimeout(() => { this.setBackgroundColor(this.currentBgColor()) }, 300)
        } else {
            // this.setBackgroundColor(this.currentBgColor())
        }
        
        //this.setTransition("0.3s all")
        //this.setTransition("0.3s background-color")
        //this.transitions().at("backgroundColor").setDuration(1)
        setTimeout(() => { this.setBackgroundColor(this.currentBgColor()) }, 100)
        this.setShouldShowFlash(false)
        
        return this
    },
    
    willAcceptFirstResponder: function() {
        NodeView.willAcceptFirstResponder.apply(this)
	    console.log(this.type() + ".willAcceptFirstResponder()")
        return this
    },
    
    currentBgColor: function() {
        if (this.isSelected()) {
            return this.selectedBgColor()
        } 
		
        return this.unselectedBgColor()
    },

    unselectedBgColor: function() {
        if (this.node()) {
            var c = this.node().nodeRowStyles().unselected().backgroundColor()
            if (c) {
                return c
            }
        }
		
        return "transparent"
    },
    
    selectedBgColor: function() {
        if (this.node()) {
            var c = this.node().nodeRowStyles().selected().backgroundColor()
            if (c) {
                return c
            }
        }
		
        if (!this.column()) {
            return "transparent"
        }
		
        return this.column().selectionColor()
    },
    
    // close button
    
    addCloseButton: function() {
        if (this.closeButtonView() == null) {
            //let c = CenteredDivView.clone()

            let cb = DivView.clone().setDivClassName("BrowserRowCloseButton")
            //this.setCloseButtonView(NodeView.clone().setDivClassName("BrowserRowCloseButton"))
            this.setCloseButtonView(cb)
            this.addSubview(cb) 
            cb.setBackgroundImageUrlPath(this.pathForIconName("close-white"))
            cb.makeBackgroundContain()
            cb.makeBackgroundCentered()
            cb.makeBackgroundNoRepeat()  
            cb.setMinAndMaxWidth(8).setMinAndMaxHeight(8)
            cb.setAction("delete")
            cb.setOpacity(0).setTransition(this.transitionStyle())
            if (this.shouldCenterCloseButton()) {
                cb.verticallyAlignAbsoluteNow()
            }
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
        console.log("delete")
        if (this.canDelete()) {
            this.setOpacity(0)
            //this.setRight(-this.clientWidth())
            this.setMinAndMaxHeight(0)
            setTimeout(() => {
	            this.node().performAction("delete")
            }, 240)
        }
    },

    /*
	animateOpen: function() {
		this.setTransition(this.transitionStyle())
		this.setOpacity(0)
		this.setMinAndMaxHeight(0)
		setTimeout(() => {
			this.setOpacity(1)
			this.setMinAndMaxHeight(this.defaultHeight())
		}, 0)		
	},
	*/

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
    
    hasCloseButton: function() {
        return this.closeButtonView() && this.closeButtonView().target() != null
    },
    
    onMouseEnter: function(event) {
        if (this.canDelete() && this.closeButtonView()) {
            this.closeButtonView().setOpacity(1)
            this.closeButtonView().setTarget(this)
            //console.log("this.closeButtonView().target() = ", this.closeButtonView().target())
            //console.log("this.closeButtonView().action() = ", this.closeButtonView().action())
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
    
    /*
    requestSelectionOfRow: function() {
        this.tellParentViews("requestSelectionOfRow", this)
    },
    */
    
    requestSelection: function () {
        this.select()
        //console.log(this.type() + " tellParentViews didClickRow")
        //this.tellParentViews("didClickRow", this)
        this.tellParentViews("requestSelectionOfRow", this)
        return this      
    },
	
    willAcceptFirstResponder: function() {
	    console.log(this.type() + ".willAcceptFirstResponder()")
	    this.requestSelection()
    },
    
    onClick: function (event) {
        if (this.isSelectable()) {
            this.requestSelection()
        }
        event.stopPropagation()
        return false
    },

    didChangeIsSelected: function () {
        NodeView.didChangeIsSelected.apply(this)
	    this.updateSubviews()
        return this
    },
    
    nodeRowLink: function() {
        return this.node().nodeRowLink()
    },

})
