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
        //this.addGestureRecognizer(SlideGestureRecognizer.clone())
        return this
    },

    setCanReorder: function(aBool) {
        if (aBool) {
            this.setTapHoldPeriod(500)
        } else {
            this.setTapHoldPeriod(null)
        }
        return null
    },

    setupRowContentView: function() {
        var cv = DivView.clone().setDivClassName("BrowserRowContentView")
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

    // sliding
    
    canDelete: function() {
        return this.node() && this.node().hasAction("delete")
    },

    // touch sliding

    // didTouchStart
    onSlideGestureBegin: function() {
        console.log(this.type() + " onSlideGestureBegin")
        this._touchDeleteOffset = this.clientWidth() * 0.5;
        this.setTransition("right 0s")        
        return this
    },

    addDeleteXView: function() {
        if (!this._dragDeleteView) {
            var dv = DivView.clone().setPosition("absolute").setDivClassName("BrowserRowDeleteXView")
            dv.setBackgroundColor("black")
            var h = this.clientHeight()
            dv.setMinAndMaxHeight(h+2)
            dv.setMinAndMaxWidth(this.clientWidth())
            dv.setTop(this.offsetTop())

            var cb = CloseButton.clone().setTransition("opacity 0.1s")
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
        let event = slideGesture.currentEvent()
        if (this.canDelete()) {

            let xd = slideGesture.dx()
            console.log(">>> " + this.type() + " onSlideGestureMove ", xd)
			
            if (xd > 0) { 
                xd = 0; 
            }

            if (this._lastXd != xd) {
                this.setTouchLeft(xd)
                this._lastXd = xd

                this._isReadyToTouchDelete  = -xd >= this._touchDeleteOffset

                if (this._dragDeleteView) {
                    this._dragDeleteButtonView.setOpacity(this._isReadyToTouchDelete? 1 : 0.2)
                }
            }
        }
    },

    setTouchLeft: function(right) {
        //this.setTransform("translateX(" + (-right) + "px)");
        this.setLeft(right)
    },

    isReadyToTouchDelete: function() {
        return this._isReadyToTouchDelete 
    },

    /*
    onSlideGestureCancel: function(event) {
        console.log(this.type() + " onTouchCancel")
        this._isTouchDown = false
        this.slideBack()
    },
    */
	
    onSlideGestureComplete: function(event) {
        console.log(">>> " + this.type() + " onSlideGestureComplete")

        if (this._isTouchDown) {
            var diff = this.touchDownDiffWithEvent(event)
            if (this.isReadyToTouchDelete()) {
                this.slideForwardAndDelete()
            } else {
		        this.slideBack()
            }
            this._isTouchDown = false
        }
    },

    slideForwardAndDelete: function() {
        if (this.canDelete()) {
            this.setBackgroundColor("black")
            this.removeDeleteXView()
            this.setTransition(this.transitionStyle())
            this.delete()

            /*
            this.disableColumnUntilTimeout(400)

            var t = 0.2;
            this.setTransition("all linear " + t + "s")

            setTimeout(() => {
                this.setTouchLeft(- this.clientWidth())
            })
            
            setTimeout(() => {
                this.didCompleteSlide()
                this.delete()
            }, 300)
            */
        }		
    },

    slideBack: function() {
        if (this.canDelete()) {
            this.disableColumnUntilTimeout(400)

            this.setTransition(this.transitionStyle())
            setTimeout(() => {
                this.setTouchLeft(0)
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
            var mdiff = this.parentPosForEvent(event).subtract(this._initDragParentPos)
            console.log("mdiff         = ", mdiff.asString())
            var np = this._initDragRelativePos.add(mdiff)
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
