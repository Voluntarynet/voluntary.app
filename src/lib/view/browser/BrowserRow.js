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
    contentView: null,
    touchDeleteOffset: 0,
    canReorder: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        //this.setOwnsView(false)
        this.setIsRegisteredForClicks(true)
        this.turnOffUserSelect()
        this.setAcceptsFirstResponder(false)
        
        this.setupRowContentView()

        //console.log("WebBrowserWindow.shared().isTouchDevice() = ", WebBrowserWindow.shared().isTouchDevice())
        if (WebBrowserWindow.shared().isTouchDevice()) {
            this.setIsRegisteredForTouch(true)
        } else {
	        this.setIsRegisteredForMouse(true)
            this.addCloseButton()
        }

        this.setTransition(this.transitionStyle())
        this.setCanReorder(true)

        //this.animateOpen()

        this.addGestureRecognizer(LongPressGestureRecognizer.clone())
        this.addGestureRecognizer(SlideGestureRecognizer.clone())
        //this.addGestureRecognizer(TapGestureRecognizer.clone())
        return this
    },

    /*
    setCanReorder: function(aBool) {
        this._canReorder = aBool
        // should we do this now, or always register and decide what to do with event when it happens?
        let lgr = LongPressGestureRecognizer.clone().setTimePeriod(500)
        if (aBool) {
            this.addGestureRecognizer(lgr)
        } else {
            this.removeGestureRecognizer(lgr)
        }
        return this
    },
    */

    setupRowContentView: function() {
        let cv = DivView.clone().setDivClassName("BrowserRowContentView")
        cv.setWidthPercentage(100).setHeightPercentage(100) 
        //cv.setBackgroundColor("blue").setZIndex(100)
        cv.setPosition("absolute")
        this.setContentView(cv)
        this.addSubview(cv)
        return this
    },
    
    column: function () {
        return this.parentView()
    },
    
    // node style dict
    
    currentRowStyle: function() {
        let styles = this.node().nodeRowStyles()
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
        let node = this.node() 
        
        if (node) {
            this.styles().copyFrom(node.nodeRowStyles())
        }
        
        NodeView.applyStyles.apply(this)
    
        // flash

        if (this.shouldShowFlash() && this.selectedFlashColor()) {
            this.setBackgroundColor(this.selectedFlashColor())
        } 
        
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
            let c = this.node().nodeRowStyles().unselected().backgroundColor()
            if (c) {
                return c
            }
        }
		
        return "transparent"
    },
    
    selectedBgColor: function() {
        if (this.node()) {
            let c = this.node().nodeRowStyles().selected().backgroundColor()
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
            this.contentView().addSubview(cb) 
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
            this.contentView().removeSubview(this.closeButtonView()) 
            this.setCloseButtonView(null)
        }
    },
    
    delete: function() {
        //console.log("delete")
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
    
    canDelete: function() {
        return this.node() && this.node().hasAction("delete")
    },

    // -- tap gesture ---

    onTapComplete: function() {
        console.log(this.type() + ".onTapComplete()")
        return this
    },

    // -- slide gesture ---

    onSlideGestureBegin: function() {
        if (this.canDelete()) {
            this.setTouchDeleteOffset(this.clientWidth() * 0.5);
            this.setTransition("all 0s")       
            this.addDeleteXView() 
        }
        return this
    },

    addDeleteXView: function() {
        if (!this._dragDeleteView) {
            let dv = DivView.clone().setPosition("absolute").setDivClassName("BrowserRowDeleteXView")
            dv.setBackgroundColor("black")
            let h = this.clientHeight()
            dv.setMinAndMaxHeight(h+2)
            dv.setMinAndMaxWidth(this.clientWidth())
            dv.setTop(this.offsetTop())

            let cb = CloseButton.clone().setTransition("opacity 0.1s")
            cb.setMinAndMaxHeight(h)
            cb.setMinAndMaxWidth(h)
            dv.addSubview(cb)
            this.parentView().addSubview(dv)

            this.setBackgroundColor(this.column().columnGroup().backgroundColor())
            this.setZIndex(10)
            dv.setZIndex(0)
            this._dragDeleteView = dv
            this._dragDeleteButtonView = cb
        }
        return this
    },

    removeDeleteXView: function() {
        if (this._dragDeleteView) {
            this._dragDeleteView.removeFromParentView()
            this._dragDeleteView = null
        }
    },
	
    onSlideGestureMove: function(slideGesture) {
        if (this.canDelete()) {

            let d = slideGesture.distance()
            let isReadyToDelete  = d >= this._touchDeleteOffset

            //console.log("slideGesture.dx() = ", slideGesture.dx())
            //console.log("isReadyToDelete = ", isReadyToDelete)
            //this.setTouchLeft(d)
            this.setTouchRight(d)

            if (this._dragDeleteView) {
                this._dragDeleteButtonView.setOpacity(isReadyToDelete ? 1 : 0.2)
            }
        }
    },

    setTouchRight: function(v) {
        //this.setTransform("translateX(" + (v) + "px)");
        //this.setLeft(-v)
        this.setRight(v)
    },
	
    onSlideGestureComplete: function(slideGesture) {
        //console.log(">>> " + this.type() + " onSlideGestureComplete")
        
        let d = slideGesture.distance()
        let isReadyToDelete  = d >= this._touchDeleteOffset

        if (isReadyToDelete) {
            this.finishSlideAndDelete()
        } else {
            this.slideBack()
        }
    },

    onSlideGestureCancelled: function(aGesture) {
        this.slideBack()
    },

    finishSlideAndDelete: function() {
        if (this.canDelete()) {
            //console.log("-this.clientWidth() = ", -this.clientWidth())
            this.setTouchRight(this.clientWidth())
            this.setBackgroundColor("black")
            this.removeDeleteXView()
            this.setTransition(this.transitionStyle())
            this.delete()
        }
    },

    slideBack: function() {
        if (this.canDelete()) {
            this.disableColumnUntilTimeout(400)

            this.setTransition(this.transitionStyle())

            setTimeout(() => {
                this.setTouchRight(0)
            })

            setTimeout(() => {
                this.didCompleteSlide()
            }, 300)
        }		
    },

    disableColumnUntilTimeout: function(ms) {
        //this.column().columnGroup().disablePointerEventsUntilTimeout(ms)
        //this.setPointerEvents("none")
    },

    didCompleteSlide: function() {
        this.removeDeleteXView()
    },

    /*
    showTouchDeleteReady: function() {

    },

    showTouchDeleteButton: function() {

    },

    hideTouchDeleteButton: function() {

    },
    */
    
    hasCloseButton: function() {
        return this.closeButtonView() && this.closeButtonView().target() != null
    },
    
    onMouseEnter: function(event) {
        if (this.canDelete() && this.closeButtonView()) {
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

    /*
    onMouseDown: function (event) {
        NodeView.onMouseDown.apply(this, [event])
    },
    */

    onMouseUp: function (event) {
        NodeView.onMouseUp.apply(this, [event])
        this.slideBack()
        this._isDraggingView = false
    },

    // tap hold
    
    onLongPressGestureBegin: function(gesture) {
    },

    onLongPressGestureCancelled: function(gesture) {
    },

    onLongPressGestureComplete: function(aGesture) {
        let event = aGesture.currentEvent()
        this.setBackgroundColor("red")
        this._isDraggingView = true
    },

    onMouseMove: function(event) {
        /*
        if (this._isDraggingView) {
            let mdiff = this.parentPosForEvent(event).subtract(this._initDragParentPos)
            console.log("mdiff         = ", mdiff.asString())
            let np = this._initDragRelativePos.add(mdiff)
            this.setPosition("absolute")
            this.setRelativePos(np)
        }
        */
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
