"use strict"

/*
    
    BrowserRow

    Base row view.  
    
    Features:
    - applying styles to match state
    - supports slide-to-delete and pan-to-reorder gestures.
    - right side delete button
    
    NOTES
    
    Row styles lookup order:

        node -> (fallback to) -> row -> (fallback to) -> column

    See lookedUpStyles method.

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

    slideDeleteOffset: 0,
    dragDeleteButtonView: null,
    isDeleting: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForClicks(true)
        this.turnOffUserSelect()
        this.setAcceptsFirstResponder(false)
        
        this.setupRowContentView()

        //console.log("WebBrowserWindow.shared().isTouchDevice() = ", WebBrowserWindow.shared().isTouchDevice())
        if (TouchScreen.shared().isSupported() || true) { // testing 
            //
        } else {
	        this.setIsRegisteredForMouse(true) // TODO: replace with TapGesture?
            this.addCloseButton()
        }

        this.setTransition(this.transitionStyle())

        //this.animateOpen()
        
        this.addGestureRecognizer(LongPressGestureRecognizer.clone()) // for long press & pan reordering
        this.addGestureRecognizer(SlideGestureRecognizer.clone()) // for slide delete
        //this.addGestureRecognizer(TapGestureRecognizer.clone()) 

        //this.addGestureRecognizer(RightEdgePanGestureRecognizer.clone()) // use to adjust width?
        this.addGestureRecognizer(BottomEdgePanGestureRecognizer.clone()) // use to adjust height?

        return this
    },

    // bottom edge pan 

    acceptsBottomEdgePan: function() {
        if (this.node().canEditRowHeight) {
            if (this.node().canEditRowHeight()) {
                return true
            }
        }
        return false
    },

    onBottomEdgePanBegin: function(aGesture) {
        this._beforeEdgePanBorderBottom = this.borderBottom()
        this.setBorderBottom("1px dashed red")
        this.setTransition("min-height 0s, max-height 0s")
    },

    onBottomEdgePanMove: function(aGesture) {
        const p = aGesture.currentPosition() // position in document coords
        const f = this.frameInDocument()
        const h = p.y() - f.y()
        const minHeight = this.node() ? this.node().nodeRowMinHeight() : 10;
        if (h >= minHeight) {
            this.setMinAndMaxHeight(h) // need to do same for contentView?
        } else {
            this.setMinAndMaxHeight(minHeight) 
        }
        return this
    },

    onBottomEdgePanComplete: function(aGesture) {
        this.setBorderBottom(this._beforeEdgePanBorderBottom)
    },

    // -- contentView -- a special subview within the BrowserRow for it's content
    // we route style methods to it

    setupRowContentView: function() {
        const cv = DomView.clone().setDivClassName("BrowserRowContentView")
        cv.setWidthPercentage(100).setHeightPercentage(100) 
        cv.setPosition("absolute")
        cv.setTransition("all 0.2s ease, transform 0s, left 0s, right 0s")
        cv.setZIndex(1) // so it will be above other views like the slide delete button 
        this.setContentView(cv)
        this.addSubview(cv)
        return this
    },

    /*
    setMinAndMaxWidth: function(w) {
        NodeView.setMinAndMaxWidth.apply(this, [w])
        this.contentView().setMinAndMaxWidth(w)
        return this
    },

    setMinAndMaxHeight: function(w) {
        NodeView.setMinAndMaxHeight.apply(this, [w])
        this.contentView().setMinAndMaxHeight(w)
        return this
    },
    */

    addContentSubview: function(aView) {
        return this.contentView().addSubview(aView)
    },

    removeContentSubview: function(aView) {
        return this.contentView().removeSubview(aView)
    },

    setBackgroundColor: function(s) {
        this.contentView().setBackgroundColor(s)
        return this
    },

    setColor: function(s) {
        this.contentView().setColor(s)
        return this
    },

    setOpacity: function(v) {
        this.contentView().setOpacity(v)
        return this
    },

    // -----------
    
    browser: function() {
        return this.column().browser()
    },

    column: function () {
        return this.parentView()
    },
    
    // node style dict
    
    rowStyles: function() {
        return null
    },

    didChangeParentView: function() {
        NodeView.didChangeParentView.apply(this)
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this, "applyStyles", 0)
        this.applyStyles()
        return this
    },

    lookedUpStyles: function() {
        const debugStyles = false

        if (this.node()) {
            const ns = this.node().nodeRowStyles()
            if (ns) {
                if (debugStyles) {
                    console.log(this.typeId() + " using nodeRowStyles")
                }
                return ns
            }
        }

        const rs = this.rowStyles()
        if (rs) {
            if (debugStyles) {
                console.log(this.typeId() + " using rowStyles")
            }
            return rs
        }

        if (this.column()) {
            const cs = this.column().rowStyles()
            if (cs) {
                if (debugStyles) {
                    console.log(this.typeId() + " using column().rowStyles()")
                }
                return cs
            }
        } else if (debugStyles) {
            const title = this.node() ? this.node().title() : "no node yet"
            console.log(this.typeId() + " (" + title + ") has no column yet")
        }

        return BMViewStyles.sharedWhiteOnBlackStyle()
    },

    /*
    currentRowStyle: function() {
        const styles = this.node().nodeRowStyles()
        //styles.selected().set
        
        if (this.isSelected()) {
        	return styles.selected()
 		}
        
        return styles.unselected()
    },
    */
    
    select: function() {
        if (!this.isSelected()) {
            this.setShouldShowFlash(true)
        }

        NodeView.select.apply(this)
        return this
    },
    
    // update
     
    updateSubviews: function() {   
        if (this.closeButtonView()) {
            if (this.node()) {
                this.closeButtonView().setColor(this.currentStyle().color()) // needed?
            }
			
            if (this.canDelete()) {
                this.closeButtonView().setOpacity(this.restCloseButtonOpacity())
            } else {
                this.closeButtonView().setOpacity(0)
            }
        }

        /*
        // take up full height if node asks for it
        const node = this.node()
        if (node && node.nodeRowMinHeight()) {
            const e = this.element()
            if (node.nodeRowMinHeight() === -1) {
                this.setHeight("auto")                
                this.setPaddingBottom("calc(100% - 20px)")
            } else {
                this.setHeight(this.pxNumberToString(node.nodeRowMinHeight()))
            }
        }
        */
        
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
        console.log(this.typeId() + ".onTabKeyUp()")
    },

    onControl_i_KeyUp: function(event) {
        if (this.node().nodeCanInspect()) { 
            this.setIsInspecting(!this.isInspecting())
            //console.log(this.typeId() + ".isInspecting() = ", this.isInspecting())
            this.scheduleSyncToNode()
        }
    },

    // --- styles ---
    
    styles: function() { 
        const lookedUpStyles = this.lookedUpStyles()
        if (lookedUpStyles) {
            return lookedUpStyles
        } else {
            this.lookedUpStyles()
        }
        throw new Error("missing styles")
    },

    applyStyles: function() {
        /*
        const node = this.node() 
        
        if (node) {
            this.styles().copyFrom(node.nodeRowStyles()) // TODO: optimize this 
        }
        */
        NodeView.applyStyles.apply(this)
    
        // flash

        /*
        if (this.shouldShowFlash() && this.selectedFlashColor()) {
            this.setBackgroundColor(this.selectedFlashColor())
            //setTimeout(() => { this.setBackgroundColor(this.currentBgColor()) }, 100)
            setTimeout(() => { NodeView.applyStyles.apply(this) }, 100)
            this.setShouldShowFlash(false)
        } 
        */

        
        return this
    },
    
    willAcceptFirstResponder: function() {
        NodeView.willAcceptFirstResponder.apply(this)
	    console.log(this.typeId() + ".willAcceptFirstResponder()")
        return this
    },

    
    // close button
    
    addCloseButton: function() {
        if (this.closeButtonView() == null) {
            //const c = CenteredDomView.clone()

            const cb = DomView.clone().setDivClassName("BrowserRowCloseButton")
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
        if (this.closeButtonView() !== null) {
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
            this.setIsDeleting(true)
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
        if (this.node()) {
            let canDelete = this.node().canDelete()
            return canDelete
        }
        return false
    },

    // -- tap gesture ---

    justTap: function() {
        if (this.isSelectable()) {
            //console.log(this.typeId() + ".requestSelection()")
            this.requestSelection()
        }
    },

    onTapComplete: function() {
        //console.log(this.typeId() + ".onTapComplete()")
        //this.justTap()
        return this
    },

    // -- slide gesture ---

    acceptsSlide: function() {
        return this.canDelete()
    },

    onSlideBegin: function() {
        //console.log(this.typeId() + ".onSlideBegin()")
        this.setSlideDeleteOffset(this.clientWidth() * 0.5);
        this.contentView().setTransition("all 0s") 
        this.setupSlide() 
        return this
    },

    setupSlide: function() {
        if (!this.dragDeleteButtonView()) {
            const h = this.clientHeight()

            this.element().style.backgroundColor = "black"
            //this.element().style.outline = "1px dashed blue"
            const cb = CloseButton.clone().setTransition("opacity 0.1s")
            cb.setMinAndMaxHeight(h)
            cb.setPosition("absolute")
            cb.setTop(0)
            cb.setRight(10)
            this.addSubview(cb)
            cb.setZIndex(0)
            this.setDragDeleteButtonView(cb)
        }
        return this
    },

    cleanupSlide: function() {
        if (this.dragDeleteButtonView()) {
            this.dragDeleteButtonView().removeFromParentView()
            this.setDragDeleteButtonView(null)
        }
        this.setTouchRight(null)
    },
	
    onSlideMove: function(slideGesture) {
        const d = slideGesture.distance()
        const isReadyToDelete = d >= this._slideDeleteOffset

        this.setTouchRight(d)

        if (this._dragDeleteButtonView) {
            this._dragDeleteButtonView.setOpacity(isReadyToDelete ? 1 : 0.2)
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
        const d = slideGesture.distance()
        const isReadyToDelete  = d >= this._slideDeleteOffset

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
        this.setIsDeleting(true)
        const dt = 0.08 // seconds
        this.contentView().setTransition("right " + dt + "s")
        this.setTransition(this.transitionStyle())
        
        setTimeout(() => {
            this.setTouchRight(this.clientWidth())
            setTimeout(() => {
                this.cleanupSlide()
                this.delete()
            }, dt*1000)
        }, 0)
    },

    slideBack: function() {
        this.disableColumnUntilTimeout(400)

        this.contentView().setTransition("all 0.2s ease")

        setTimeout(() => {
            this.setTouchRight(0)
            this.contentView().setTransition(this.transitionStyle())
        })

        setTimeout(() => {
            this.didCompleteSlide()
        }, 300)
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
    
    onMouseOver: function(event) {
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

    onMouseUp: function (event) {
        NodeView.onMouseUp.apply(this, [event])
    },

    // tap hold

    acceptsLongPress: function() {
        return this.column().canReorderRows()
    },
    
    onLongPressBegin: function(aGesture) {
    },

    onLongPressCancelled: function(aGesture) {
    },

    onLongPressComplete: function(longPressGesture) {
        longPressGesture.deactivate() // needed?

        const pan = this.addPanGesture()
        pan.setShouldRemoveOnComplete(true)
        pan.setMinDistToBegin(0)
        pan.onDown(longPressGesture.currentEvent())
        this._isReordering = true
        pan.attemptBegin()
        this.setTransition("all 0s, transform 0.2s") //, min-height 1s, max-height 1s")
        this.contentView().setTransition("transform 0.2s")
        setTimeout(() => { 
            this.zoomForPan()
        })
    },

    zoomForPan: function() {
        const r = 1.1
        this.setTransform("scale(" + r + ")")
        return this
    },

    unzoomForPan: function() {
        this.setTransform("scale(1)")
        return this
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
        this.setBoxShadow("0px 0px 10px 10px rgba(0, 0, 0, 0.5)")
        return this
    },

    removeShadow: function() {
        this.setBoxShadow("none")
        return this
    },

    columnGroup: function() {
        return this.column().columnGroup()
    },

    acceptsPan: function() {
        return this._isReordering
    },

    onPanBegin: function(aGesture) {
        this.setTransition("top 0s")
        
        // visibility
        this.column().setOverflow("visible")
        this.columnGroup().setOverflow("visible")
        this.columnGroup().scrollView().setOverflow("visible")
        this.setZIndex(3)

        //this.setBorder("1px solid rgba(255, 255, 255, 0.05)")

        this.column().absolutePositionRows()

        this._dragStartPos = this.relativePos()

        this.setTop(this._dragStartPos.y())
        this.addShadow()
    },

    onPanMove: function(aGesture) {
        const np = this._dragStartPos.add(aGesture.diffPos()) 
        this.setTop(np.y())
        this.column().stackRows()
        this.setTop(np.y())
    },

    onPanCancelled: function(aGesture) {
        this.onPanComplete(aGesture) // needed?
        return this
    },

    onPanComplete: function(aGesture) {
        // visibility
        this.column().setOverflow("hidden")
        this.columnGroup().setOverflow("hidden")
        this.columnGroup().scrollView().setOverflow("hidden")

        this.setTransition(this.transitionStyle())
        this.removeShadow()

        this.column().stackRows()
        
        this.unzoomForPan()
        setTimeout(() => {
            this.column().relativePositionRows()
            this.column().didReorderRows()
            this.setZIndex(null)
        }, 500)

        //this.removePanGesture() // this will happen automatically
        this._isReordering = false
    },

    // orient testing

    /*
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
    */

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
        if (this.isDeleting()) {
            return false
        }

        const modifierNames = Keyboard.shared().modifierNamesForEvent(event)

        if (modifierNames.length != 0) {
            const methodName = "on" + modifierNames.join("") + "Click"
            // examples: onShiftClick, onAltMetaClick, etc
            //console.log("methodName = ", methodName)
            if (this[methodName]) {
                this[methodName].apply(this, [event])
            }
        } else {
            this.justTap()
        }

        //console.log(this.typeId() + ".onClick()")
        GestureManager.shared().cancelAllBegunGestures()
        event.stopPropagation()
        return false
    },

    onControlClick: function() {
    },

    onAltClick: function() {
    },

    onShiftClick: function() {
    },

    // -------------------------

    didChangeIsSelected: function () {
        NodeView.didChangeIsSelected.apply(this)
        /*
        if (this.isSelected()) {
            this.setOpacity(1)
        } else {
            this.setOpacity(0.25)
        }
        */
	    this.updateSubviews()
        return this
    },

    /*
    sibilingDidChangeSelection: function() {

    },
    */
    
    nodeRowLink: function() {
        return this.node().nodeRowLink()
    },

    /*
    show: function() {
        const d = this.getComputedCssAttribute("display")
        const p = this.getComputedCssAttribute("position")
        console.log("row display:" + d + " position:" + p)
    },
    */

})
