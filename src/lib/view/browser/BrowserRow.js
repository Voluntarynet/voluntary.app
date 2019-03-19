"use strict"

/*
    
    BrowserRow

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

        } else {
	        this.setIsRegisteredForMouse(true) // TODO: replace with TapGesture?
            this.addCloseButton()
        }

        this.setTransition(this.transitionStyle())

        //this.animateOpen()

        
        /*
        this.addGestureRecognizer(LongPressGestureRecognizer.clone()) // for long press & pan reordering
        this.addGestureRecognizer(SlideGestureRecognizer.clone()) // for slide delete
        this.addGestureRecognizer(OrientGestureRecognizer.clone()) //
        */
        return this
    },

    setupRowContentView: function() {
        let cv = DivView.clone().setDivClassName("BrowserRowContentView")
        cv.setWidthPercentage(100).setHeightPercentage(100) 
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
        console.log(this.typeId() + " onTabKeyUp")
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
	    console.log(this.typeId() + ".willAcceptFirstResponder()")
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
        //console.log(this.typeId() + ".onTapComplete()")
        return this
    },

    // -- slide gesture ---

    onSlideBegin: function() {
        if (this.canDelete()) {
            this.setTouchDeleteOffset(this.clientWidth() * 0.5);
            this.setTransition("all 0s")       
            this.setupSlide() 
        }
        return this
    },

    setupSlide: function() {
        if (!this._dragDeleteButtonView) {
            let h = this.clientHeight()

            this.setBackgroundColor("black")
            this.contentView().setBackgroundColor(this.column().columnGroup().backgroundColor())
            let cb = CloseButton.clone().setTransition("opacity 0.1s")
            cb.setMinAndMaxHeight(h)
            cb.setMinAndMaxWidth(h)
            this.addSubview(cb)
            //this.parentView().addSubview(dv)
            //this.setBackgroundColor(this.column().columnGroup().backgroundColor())
            cb.setZIndex(0)
            this.contentView().setZIndex(1)
            this._dragDeleteButtonView = cb
        }
        return this
    },

    cleanupSlide: function() {
        if (this._dragDeleteButtonView) {
            this._dragDeleteButtonView.removeFromParentView()
            this._dragDeleteButtonView = null
            this.setBackgroundColor(null)

        }
    },
	
    onSlideMove: function(slideGesture) {
        if (this.canDelete()) {
            let d = slideGesture.distance()
            let isReadyToDelete  = d >= this._touchDeleteOffset

            //console.log("slideGesture.distance() = ", d)
            //console.log("isReadyToDelete = ", isReadyToDelete)

            this.setTouchRight(d)

            if (this._dragDeleteButtonView) {
                this._dragDeleteButtonView.setOpacity(isReadyToDelete ? 1 : 0.2)
            }
        }
    },

    setTouchRight: function(v) {
        //this.setTransform("translateX(" + (v) + "px)");
        //this.setLeft(-v)
        //this.setRight(v)
        this.contentView().setRight(v)
    },
	
    onSlideComplete: function(slideGesture) {
        //console.log(">>> " + this.type() + " onSlideComplete")
        
        let d = slideGesture.distance()
        let isReadyToDelete  = d >= this._touchDeleteOffset

        if (isReadyToDelete) {
            this.finishSlideAndDelete()
        } else {
            this.slideBack()
        }
    },

    onSlideCancelled: function(aGesture) {
        this.slideBack()
    },

    finishSlideAndDelete: function() {
        if (this.canDelete()) {
            //console.log("-this.clientWidth() = ", -this.clientWidth())
            this.setTouchRight(this.clientWidth())
            this.setBackgroundColor("black")
            this.cleanupSlide()
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
        this.cleanupSlide()
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
        //console.log(this.typeId() + " onMouseLeave")
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
    
    onLongPressBegin: function(aGesture) {
    },

    onLongPressCancelled: function(aGesture) {
    },

    onLongPressComplete: function(aGesture) {
        if (this.column().canReorder()) {
            let pan = this.addPanGesture()
            pan.setShouldRemoveOnComplete(true)
            pan.setMinDistToBegin(0)
            pan.onDown(aGesture.currentEvent())
            pan.attemptBegin()
            this.setBackgroundColor("red")
        }
    },

    // --- pan gesture ----

    addPanGesture: function() {
        return this.addGestureRecognizer(PanGestureRecognizer.clone())
    },

    removePanGesture: function() {
        this.removeGestureRecognizersOfType("PanGestureRecognizer")
        return this
    },

    addShadow: function() {
        this.setBoxShadow("0px 0px 20px 10px rgba(0, 0, 0, 0.5)")
        return this
    },

    removeShadow: function() {
        this.setBoxShadow("none")
        return this
    },

    onPanBegin: function(aGesture) {
        if (!this._isDraggingView) {
            //this.setBackgroundColor("blue")
            this._isDraggingView = true

            //this.setTransition("color 0.3s, top 0s")
            //this.setTransform("scale(1.5)")
            this.setTransition("top 0s")

            this.column().absolutePositionRows()

            this._dragStartPos = this.relativePos()
            // this.column().stackRows()

            //this.setPosition("absolute")
            this.setTop(this._dragStartPos.y())
            this.setZIndex(1)
            this.column().setPosition("relative")
            this.addShadow()
        }
    },

    onPanMove: function(aGesture) {
        if (this._isDraggingView) {
            let np = this._dragStartPos.add(aGesture.diffPos()) 
            //console.log("aGesture.diffPos.y() = ", aGesture.diffPos().y())
            //console.log("onPanMove y = ", np.y())
            this.setTop(np.y())
            this.column().stackRows()
            //this.column().orderRows()
            this.setTop(np.y())
        }
    },

    onPanCancelled: function(aGesture) {
        this.onPanComplete(aGesture) // needed?
        return this
    },

    onPanComplete: function(aGesture) {
        if (this._isDraggingView) {
            this._isDraggingView = false

            //this.setPosition("relative")
            this.setZIndex(0)
            this.setTransition(this.transitionStyle())
            this.removeShadow()

            this.column().stackRows()

            setTimeout(() => {
                this.setBackgroundColor(this.currentBgColor())
                this.column().relativePositionRows()
                this.column().didReorderRows()
            }, 500)
        }
    },

    // orient testing

    onOrientBegin: function(aGesture) {
        console.log(this.typeId() + ".onOrientBegin()")
        aGesture.show()
    },

    onOrientMove: function(aGesture) {
        console.log(this.typeId() + ".onOrientMove()")
        aGesture.show()
    },

    onOrientComplete: function(aGesture) {
        console.log(this.typeId() + ".onOrientComplete()")
        aGesture.show()
    },

    onMouseMove: function(event) {
    },
    
    // --- selecting ---
    
    /*
    requestSelectionOfRow: function() {
        this.tellParentViews("requestSelectionOfRow", this)
    },
    */
    
    requestSelection: function () {
        this.select()
        //console.log(this.typeId() + " tellParentViews didClickRow")
        //this.tellParentViews("didClickRow", this)
        this.tellParentViews("requestSelectionOfRow", this)
        return this      
    },
	
    willAcceptFirstResponder: function() {
	    console.log(this.typeId() + ".willAcceptFirstResponder()")
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
