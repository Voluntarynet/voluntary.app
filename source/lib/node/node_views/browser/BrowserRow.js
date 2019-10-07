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

NodeView.newSubclassNamed("BrowserRow").newSlots({
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
        this.turnOffUserSelect()
        this.setAcceptsFirstResponder(false)
        
        this.setupRowContentView()

        //console.log("WebBrowserWindow.shared().isTouchDevice() = ", WebBrowserWindow.shared().isTouchDevice())
        if (TouchScreen.shared().isSupported() || true) { // testing 
            //
        } else {
            //this.addCloseButton()
        }

        this.setTransition(this.transitionStyle())

        //this.animateOpen()
        
        this.addGestureRecognizer(LongPressGestureRecognizer.clone()) // for long press & pan reordering
        this.addGestureRecognizer(SlideGestureRecognizer.clone()) // for slide delete
        this.addGestureRecognizer(TapGestureRecognizer.clone()) 

        //this.addGestureRecognizer(RightEdgePanGestureRecognizer.clone()) // use to adjust width?
        this.addGestureRecognizer(BottomEdgePanGestureRecognizer.clone()) // use to adjust height?

        return this
    },

    // bottom edge pan 

    acceptsBottomEdgePan: function() {
        if (this.node().nodeCanEditRowHeight) {
            if (this.node().nodeCanEditRowHeight()) {
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
        const newHeight = p.y() - f.y()
        const minHeight = this.node() ? this.node().nodeMinRowHeight() : 10;
        if (newHeight < 10) {
            newHeight = 10;
        }
        this.node().setNodeMinRowHeight(newHeight)
        this.updateSubviews()

        /*
            this.node().setNodeMinRowHeight(h)
            this.updateSubviews()
            //this.setMinAndMaxHeight(newHeight) // what about contentView?
            //this.contentView().autoFitParentHeight()
        */

        return this
    },

    onBottomEdgePanComplete: function(aGesture) {
        this.setBorderBottom(this._beforeEdgePanBorderBottom)
    },

    // -- contentView -- a special subview within the BrowserRow for it's content
    // we route style methods to it

    setupRowContentView: function() {
        const cv = DomView.clone().setDivClassName("BrowserRowContentView")
        cv.setWidthPercentage(100)
        cv.setHeightPercentage(100) 
        cv.setPosition("relative")
        cv.setFloat("left")

        //cv.autoFitParentWidth().autoFitParentHeight() // can't do this since we need to float left for sliding

        cv.setTransition("all 0.2s ease, transform 0s, left 0s, right 0s")
        cv.setMinHeightPx(60)
        cv.setZIndex(2) // so it will be above other views like the slide delete button 
        this.setZIndex(1)
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

    /*
    lockSize: function() {
        NodeView.lockSize.apply(this)
        this.contentView().lockSize()
        return this
    },

    unlockSize: function() {
        NodeView.unlockSize.apply(this)
        this.contentView().unlockSize()
        return this
    },
    */

    // ----

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

    // --- helpers --------
    
    browser: function() {
        return this.column().browser()
    },

    column: function () {
        return this.parentView()
    },
    
    columnGroup: function() {
        return this.column().columnGroup()
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
    
    /*
    selectNextKeyView: function () {
        this.column().selectNextRow()
        return this
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
            const node = this.node()

            if (node) {
                this.closeButtonView().setColor(this.currentStyle().color()) // needed?
            }
			
            if (this.canDelete()) {
                this.closeButtonView().setOpacity(this.restCloseButtonOpacity())
            } else {
                this.closeButtonView().setOpacity(0)
            }

            if (node) {
                const h = node.nodeMinRowHeight()
                if (h) {
                    this.setMinAndMaxHeight(h) 
                    this.contentView().autoFitParentHeight()
                }
            }
        }

        /*
        // take up full height if node asks for it
        const node = this.node()
        if (node && node.nodeMinRowHeight()) {
            const e = this.element()
            if (node.nodeMinRowHeight() === -1) {
                this.setHeight("auto")                
                this.setPaddingBottom("calc(100% - 20px)")
            } else {
                this.setHeight(this.pxNumberToString(node.nodeMinRowHeight()))
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
    
    /*
    onTabKeyUp: function() {
        console.log(this.typeId() + ".onTabKeyUp()")
    },
    */

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
            
            cb.setMinAndMaxWidthAndHeight(8)
            cb.setAction("delete")
            cb.setOpacity(0).setTransition(this.transitionStyle())
            if (this.shouldCenterCloseButton()) {
                b.verticallyAlignAbsoluteNow()
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

    acceptsTapBegin: function(aGesture) {
        return true
    },

    onTapComplete: function(aGesture) {
        //console.log(this.typeId() + ".onTapComplete()")
        const keyModifiers = Keyboard.shared().modifierNamesForEvent(aGesture.upEvent());
        const hasThreeFingersDown = aGesture.numberOfFingersDown() === 3;
        const isAltTap = keyModifiers.contains("Alternate");
    
        /*
        if (keyModifiers.length) {
            const methodName = "just" + keyModifiers.join("") + "Tap"
            //console.log(this.typeId() + " tap method " + methodName)
            if (this[methodName]) {
                this[methodName].apply(this)
            }
        } 
        */
        
        if (hasThreeFingersDown || isAltTap) {
            this.justInspect()
        } else {
            this.setIsInspecting(false)
            this.justTap()
        }

        return this
    },

    justInspect: function(event) {
        console.log(this.typeId() + ".justInspect()")
        if (this.node().nodeCanInspect()) { 
            this.setIsInspecting(true)
            //this.scheduleSyncToNode()
            //this.select()
            this.justTap()
        }
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

    underContentViewColor: function() {
        return "black"
    },

    setupSlide: function() {
        if (!this.dragDeleteButtonView()) {
            const h = this.clientHeight()

            // need to do this because we re-route setBackgroundColor
            this.element().style.backgroundColor = this.underContentViewColor()
            const cb = CloseButton.clone().setOpacity(0).setTransition("opacity 0.1s")
            this.addSubview(cb)

            const size = 10
            cb.setMinAndMaxWidthAndHeight(size)
            cb.verticallyAlignAbsoluteNow()
            cb.setRight(size * 2)
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
            }, dt * 1000)
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
    
    hasCloseButton: function() {
        return this.closeButtonView() && this.closeButtonView().target() != null
    },
    
    /*
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
    */

    // tap hold

    acceptsLongPress: function() {
        if (!this.column()) {
            console.log("missing parent view on: " + this.typeId())
        }

        return this.column().canReorderRows()
    },
    
    onLongPressBegin: function(aGesture) {
    },

    onLongPressCancelled: function(aGesture) {
    },

    onLongPressComplete: function(longPressGesture) {
        longPressGesture.deactivate() // needed?

        const dv = DragView.clone().setItem(this).setSource(this.column())
        dv.openWithEvent(longPressGesture.currentEvent())
    },

    // --- add/remove pan gesture ----

    /*
    addPanGesture: function() {
        return this.addGestureRecognizer(PanGestureRecognizer.clone())
    },

    removePanGesture: function() {
        this.removeGestureRecognizersOfType("PanGestureRecognizer")
        return this
    },
    */

    // --- handle pan gesture ---

    acceptsPan: function() {
        return this._isReordering
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
        //this.syncFromNode() // need this to update selection color on fields?
        //console.log('test sync')
        return this
    },

    /*
    sibilingDidChangeSelection: function() {

    },
    */
    
    nodeRowLink: function() {
        //console.log(this.typeId() + ".visibleSubnodes() isInspecting:" + this.isInspecting())
        if (this.isInspecting()) {
            return  this.node().nodeInspector()
        }

        return this.node().nodeRowLink()
    },

    /*
    show: function() {
        const d = this.getComputedCssAttribute("display")
        const p = this.getComputedCssAttribute("position")
        console.log("row display:" + d + " position:" + p)
    },
    */

    // --- dragging source protocol ---

    hideForDrag: function() {
        console.log(this.typeId() + " hideForDrag")
        //this.setDisplay("none")
        this.setVisibility("hidden")
        //console.log(this.typeId() + " '" + this.node().title() + "'.hideForDrag() visibility: ", this.visibility())
        //this.setBorder("1px dashed blue")
    },

    unhideForDrag: function() {
        console.log(this.typeId() + " unhideForDrag")
        //this.setDisplay("block")
        this.setVisibility("visible")
        //console.log(this.typeId() + " '" + this.node().title() + "'.unhideForDrag() visibility: ", this.visibility())
        //this.setBorder(null)
    },

    onDragItemBegin: function(aDragView) {
        //this.column().onSubviewDragBegin(aDragView)
    },

    onDragItemCancelled: function(aDragView) {
        //this.column().onSubviewDragCancelled(aDragView)
    },

    onDragItemComplete: function(aDragView) {
        //this.column().onSubviewDragComplete(aDragView)
    },

    onDragRequestRemove: function() {
        //assert(this.hasParentView()) //
        if (this.hasParentView()) {
            this.removeFromParentView()
        }
        assert(!this.hasParentView()) //

        this.node().removeFromParentNode()
        assert(!this.node().parentNode())

        //this.delete() // we don't want to delete it, we want to move it
        return true
    },

    // --- dropping destination protocol implemented to handle selecting/expanding row ---

    acceptsDropHover: function() {
        return this.canDropSelect()
    },

    onDragDestinationEnter: function(dragView) {
        if (this.canDropSelect()) {
            this.setupDropHoverTimeout()
        }
    },

    onDragDestinationHover: function(dragView) {
    },

    onDragDestinationExit: function(dragView) {
        this.cancelDropHoverTimeout()
    },

    // ----

    dropHoverDidTimeoutSeconds: function() {
        return 0.3
    },

    canDropSelect: function() {
        return this.node().hasSubnodes()
    },

    setupDropHoverTimeout: function() {
        const seconds = this.dropHoverDidTimeoutSeconds()
        this._dropHoverEnterTimeout = setTimeout(
            () => { this.dropHoverDidTimeout() }, 
            seconds * 1000
        )
    },

    cancelDropHoverTimeout: function() {
        clearTimeout(this._dropHoverEnterTimeout)
        this._dropHoverEnterTimeout = null
    },

    dropHoverDidTimeout: function() {
        this.requestSelection()
    },

})
