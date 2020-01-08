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

window.BrowserRow = class BrowserRow extends NodeView {
    
    initPrototype () {
        this.newSlot("isSelectable", true) //.setDuplicateOp("copyValue")
        this.newSlot("closeButtonView", null)
        this.newSlot("defaultHeight", 60)
        this.newSlot("restCloseButtonOpacity", 0.4)
        this.newSlot("transitionStyle", "all 0.2s ease, width 0s, max-width 0s, min-width 0s")
        this.newSlot("selectedFlashColor", "#ccc")
        this.newSlot("shouldShowFlash", false)
        this.newSlot("shouldCenterCloseButton", true)
        this.newSlot("contentView", null)
    
        this.newSlot("slideDeleteOffset", 0)
        this.newSlot("dragDeleteButtonView", null)
        this.newSlot("isDeleting", false)
        this.newSlot("lastTapDate", null)
    }

    init () {
        super.init()
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
        this.addGestureRecognizer(TapGestureRecognizer.clone()) // for selection, and tap-longpress
        //this.addGestureRecognizer(RightEdgePanGestureRecognizer.clone()) // for adjusting width?
        this.addGestureRecognizer(BottomEdgePanGestureRecognizer.clone()) // for adjusting height?

        this.setIsRegisteredForKeyboard(true)

        return this
    }

    duplicate () {
        const dup = super.duplicate()
        dup.setNode(this.node().duplicate())
        return dup
    }

    // bottom edge pan 

    acceptsBottomEdgePan () {
        if (this.node().nodeCanEditRowHeight) {
            if (this.node().nodeCanEditRowHeight()) {
                return true
            }
        }
        return false
    }

    onBottomEdgePanBegin (aGesture) {
        this._beforeEdgePanBorderBottom = this.borderBottom()
        this.setBorderBottom("1px dashed red")
        this.setTransition("min-height 0s, max-height 0s")
    }

    onBottomEdgePanMove (aGesture) {
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
    }

    onBottomEdgePanComplete (aGesture) {
        this.setBorderBottom(this._beforeEdgePanBorderBottom)
    }

    // -- contentView -- a special subview within the BrowserRow for it's content
    // we route style methods to it

    setupRowContentView () {
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
    }

    desiredWidth () {
        return this.calcWidth()
    }

    /*
    setMinAndMaxWidth (w) {
        super.setMinAndMaxWidth(w)
        this.contentView().setMinAndMaxWidth(w)
        return this
    }

    setMinAndMaxHeight (h) {
        super.setMinAndMaxHeight(h)
        this.contentView().setMinAndMaxHeight(h)
        return this
    }
    */

    addContentSubview (aView) {
        return this.contentView().addSubview(aView)
    }

    removeContentSubview (aView) {
        return this.contentView().removeSubview(aView)
    }

    /*
    lockSize () {
        super.lockSize()
        this.contentView().lockSize()
        return this
    }

    unlockSize () {
        super.unlockSize()
        this.contentView().unlockSize()
        return this
    }
    */

    // ----

    setBackgroundColor (s) {
        this.contentView().setBackgroundColor(s)
        return this
    }

    setColor (s) {
        this.contentView().setColor(s)
        return this
    }

    setOpacity (v) {
        this.contentView().setOpacity(v)
        return this
    }

    // --- helpers --------
    
    browser () {
        return this.column().browser()
    }

    column () {
        return this.parentView()
    }
    
    columnGroup () {
        return this.column().columnGroup()
    }

    // node style dict
    
    rowStyles () {
        return null
    }

    didChangeParentView () {
        super.didChangeParentView()
        //window.SyncScheduler.shared().scheduleTargetAndMethod(this, "applyStyles", 0)
        this.applyStyles()
        return this
    }

    lookedUpStyles () {
        const debugStyles = false

        if (this.node()) {
            const ns = this.node().nodeRowStyles()
            if (ns) {
                if (debugStyles) {
                    this.debugLog(" using nodeRowStyles")
                }
                return ns
            }
        }

        const rs = this.rowStyles()
        if (rs) {
            if (debugStyles) {
                this.debugLog(" using rowStyles")
            }
            return rs
        }

        if (this.column()) {
            const cs = this.column().rowStyles()
            if (cs) {
                if (debugStyles) {
                    this.debugLog(" using column().rowStyles()")
                }
                return cs
            }
        } else if (debugStyles) {
            const title = this.node() ? this.node().title() : "no node yet"
            this.debugLog(" (" + title + ") has no column yet")
        }

        return BMViewStyles.shared().sharedWhiteOnBlackStyle()
    }

    /*
    currentRowStyle () {
        const styles = this.node().nodeRowStyles()
        //styles.selected().set
        
        if (this.isSelected()) {
        	return styles.selected()
 		}
        
        return styles.unselected()
    }
    */
    

    select () {
        if (!this.isSelected()) {
            this.setShouldShowFlash(true)
        }

        super.select()
        return this
    }
    
    // update
     
    updateSubviews () {   
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
    }
    
    // -------------
    
    onDidEdit (aView) {
        //this.browser().fitColumns()
        this.scheduleSyncToNode() 
        return true // stop propogation
    }
    
    // --- sync ---
	
    syncFromNode () {
        // is this ever called?
        this.updateSubviews()
        return this
    }

    // --- styles ---
    
    styles () { 
        const lookedUpStyles = this.lookedUpStyles()
        if (lookedUpStyles) {
            return lookedUpStyles
        } else {
            this.lookedUpStyles() // for debugging
        }
        throw new Error("missing styles")
    }

    applyStyles () {
        /*
        const node = this.node() 
        
        if (node) {
            this.styles().copyFrom(node.nodeRowStyles(), copyDict) // TODO: optimize this 
        }
        */
        super.applyStyles()

        // flash

        /*
        if (this.shouldShowFlash() && this.selectedFlashColor()) {
            this.setBackgroundColor(this.selectedFlashColor())
            //setTimeout(() => { this.setBackgroundColor(this.currentBgColor()) }, 100)
            setTimeout(() => { super.applyStyles() }, 100)
            this.setShouldShowFlash(false)
        } 
        */

        
        return this
    }
    
    
    // close button
    
    addCloseButton () {
        if (this.closeButtonView() === null) {
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
    }
    
    removeCloseButton () {
        if (this.closeButtonView() !== null) {
            this.contentView().removeSubview(this.closeButtonView()) 
            this.setCloseButtonView(null)
        }
    }
    
    delete () {
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
    }

    /*
	animateOpen () {
		this.setTransition(this.transitionStyle())
		this.setOpacity(0)
		this.setMinAndMaxHeight(0)
		setTimeout(() => {
			this.setOpacity(1)
			this.setMinAndMaxHeight(this.defaultHeight())
		}, 0)		
	},
	*/
    
    canDelete () {
        if (this.node()) {
            return this.node().canDelete()
        }
        return false
    }

    // -- tap gesture ---

    justTap () {
        if (this.isSelectable()) {
            //this.debugLog(".requestSelection()")
            this.requestSelection()
        }
    }

    acceptsTapBegin (aGesture) {
        return true
    }

    onTapComplete (aGesture) {
        this.setLastTapDate(new Date())
        //this.debugLog(".onTapComplete()")
        const keyModifiers = Keyboard.shared().modifierNamesForEvent(aGesture.upEvent());
        const hasThreeFingersDown = aGesture.numberOfFingersDown() === 3;
        const isAltTap = keyModifiers.contains("Alternate");
    
        /*
        if (keyModifiers.length) {
            const methodName = "just" + keyModifiers.join("") + "Tap"
            //this.debugLog(" tap method " + methodName)
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
    }

    // --- dragging key ---


    on_d_KeyDown (event) {
        //this.debugLog(" on_d_KeyDown ", event._id)
        this.setIsRegisteredForDrag(true)
        return true
    }

    on_d_KeyUp (event) {
        //this.debugLog(" on_d_KeyUp ", event._id)
        this.setIsRegisteredForDrag(false)
        return true
    }

    // ---
    
    justInspect (event) {
        this.debugLog(".justInspect()")
        if (this.node().nodeCanInspect()) { 
            this.setIsInspecting(true)
            this.scheduleSyncToNode()
            //this.select()
            this.justTap()
        }
    }

    // -- slide gesture ---

    acceptsSlide () {
        return this.canDelete()
    }

    onSlideBegin () {
        //this.debugLog(".onSlideBegin()")
        this.setSlideDeleteOffset(this.clientWidth() * 0.5);
        this.contentView().setTransition("all 0s") 
        this.setupSlide() 
        return this
    }

    underContentViewColor () {
        return "black"
    }

    setupSlide () {
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
    }

    cleanupSlide () {
        if (this.dragDeleteButtonView()) {
            this.dragDeleteButtonView().removeFromParentView()
            this.setDragDeleteButtonView(null)
        }
        this.setTouchRight(null)
    }
	
    onSlideMove (slideGesture) {
        const d = slideGesture.distance()
        const isReadyToDelete = d >= this._slideDeleteOffset

        this.setTouchRight(d)

        if (this._dragDeleteButtonView) {
            this._dragDeleteButtonView.setOpacity(isReadyToDelete ? 1 : 0.2)
        }
    }

    setTouchRight (v) {
        //this.setTransform("translateX(" + (v) + "px)");
        //this.setLeft(-v)
        //this.setRight(v)
        this.contentView().setRight(v)
    }
	
    onSlideComplete (slideGesture) {
        //console.log(">>> " + this.type() + " onSlideComplete")
        const d = slideGesture.distance()
        const isReadyToDelete  = d >= this._slideDeleteOffset

        if (isReadyToDelete) {
            this.finishSlideAndDelete()
        } else {
            this.slideBack()
        }
    }

    onSlideCancelled (aGesture) {
        this.slideBack()
    }

    finishSlideAndDelete () {
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
    }

    slideBack () {
        this.disableColumnUntilTimeout(400)

        this.contentView().setTransition("all 0.2s ease")

        setTimeout(() => {
            this.setTouchRight(0)
            this.contentView().setTransition(this.transitionStyle())
        })

        setTimeout(() => {
            this.didCompleteSlide()
        }, 300)
    }

    disableColumnUntilTimeout (ms) {
        //this.column().columnGroup().disablePointerEventsUntilTimeout(ms)
        //this.setPointerEvents("none")
    }

    didCompleteSlide () {
        this.cleanupSlide()
    }
    
    hasCloseButton () {
        return this.closeButtonView() && this.closeButtonView().target() != null
    }
    
    /*
    onMouseOver (event) {
        if (this.canDelete() && this.closeButtonView()) {
            this.closeButtonView().setOpacity(1)
            this.closeButtonView().setTarget(this)
        }
    }
    
    onMouseLeave (event) {
        //this.debugLog(" onMouseLeave")
        if (this.hasCloseButton()) {
            this.closeButtonView().setOpacity(this.restCloseButtonOpacity())
            this.closeButtonView().setTarget(null)
        }        
    }
    */

    // tap hold

    acceptsLongPress () {
        if (!this.column()) {
            console.log("missing parent view on: " + this.typeId())
        }

        return this.column().canReorderRows()
    }
    
    onLongPressBegin (aGesture) {
        if (this.isRegisteredForDrag()) {
            aGesture.cancel() // don't allow in-browser drag when we're doing a drag outside
        }
    }

    onLongPressCancelled (aGesture) {
    }

    isTapLongPress () {
        // ok, now we need to figure out if this is a tap-hold or tap-tap-hold
        const maxDt = 0.7 // between tap time + long tap hold time before complete is triggered
        let isTapTapHold = false
        const t1 = this.lastTapDate()
        const t2 = new Date()
        if (t1) {
            const dtSeconds = (t2.getTime() - t1.getTime())/1000
            //console.log("dtSeconds = " + dtSeconds)
            
            if (dtSeconds < maxDt) {
                isTapTapHold = true
            }
        }
        return isTapTapHold
    }

    onLongPressComplete (longPressGesture) {
        longPressGesture.deactivate() // needed?

        const isTapLongPress = this.isTapLongPress()

        const dv = DragView.clone().setItem(this).setSource(this.column())


        if (isTapLongPress) {
            dv.setDragOperation("copy")
        } else { // otherwise, it's just a normal long press
            dv.setDragOperation("move")
        }
        
        dv.openWithEvent(longPressGesture.currentEvent())
    }

    // --- add/remove pan gesture ----

    /*
    addPanGesture () {
        return this.addGestureRecognizer(PanGestureRecognizer.clone())
    }

    removePanGesture () {
        this.removeGestureRecognizersOfType("PanGestureRecognizer")
        return this
    }
    */

    // --- handle pan gesture ---

    acceptsPan () {
        return this._isReordering
    }
   
    // orient testing

    /*
    onOrientBegin (aGesture) {
        this.debugLog(".onOrientBegin()")
        aGesture.show()
    }

    onOrientMove (aGesture) {
        this.debugLog(".onOrientMove()")
        aGesture.show()
    }

    onOrientComplete (aGesture) {
        this.debugLog(".onOrientComplete()")
        aGesture.show()
    }
    */

    // --- selecting ---
    
    /*
    requestSelectionOfRow () {
        this.tellParentViews("requestSelectionOfRow", this)
    }
    */
    
    requestSelection () {
        this.select()
        //this.debugLog(" tellParentViews didClickRow")
        //this.tellParentViews("didClickRow", this)
        this.tellParentViews("requestSelectionOfRow", this)

        const node = this.node()
        if (node && node.onRequestSelectionOfNode) {
            node.onRequestSelectionOfNode(this)
        }
        
        return this      
    }
	
    willAcceptFirstResponder () {
        super.willAcceptFirstResponder()
	    //this.debugLog(".willAcceptFirstResponder()")
        this.requestSelection()
        return this
    }

    // -------------------------

    didChangeIsSelected () {
        super.didChangeIsSelected()
        /*
        if (this.isSelected()) {
            this.setOpacity(1)
        } else {
            this.setOpacity(0.25)
        }
        */
        this.updateSubviews()
        return this
    }

    /*
    sibilingDidChangeSelection () {

    }
    */
    
    nodeRowLink () {
        //this.debugLog(".visibleSubnodes() isInspecting:" + this.isInspecting())
        if (this.isInspecting()) {
            return  this.node().nodeInspector()
        }

        return this.node().nodeRowLink()
    }

    /*
    show () {
        const d = this.getComputedCssAttribute("display")
        const p = this.getComputedCssAttribute("position")
        console.log("row display:" + d + " position:" + p)
    }
    */

    // --- dragging source protocol ---

    hideForDrag () {
        this.setVisibility("hidden")
    }

    unhideForDrag () {
        this.setVisibility("visible")
    }

    onDragItemBegin (aDragView) {
        //this.column().onSubviewDragBegin(aDragView)
    }

    onDragItemCancelled (aDragView) {
        //this.column().onSubviewDragCancelled(aDragView)
    }

    onDragItemDropped (aDragView) {
        //this.column().onSubviewDragComplete(aDragView)
    }

    onDragRequestRemove () {
        //assert(this.hasParentView()) //
        if (this.hasParentView()) {
            this.removeFromParentView()
        }
        assert(!this.hasParentView()) //

        this.node().removeFromParentNode()
        assert(!this.node().parentNode())

        //this.delete() // we don't want to delete it, we want to move it
        return true
    }

    // --- dropping destination protocol implemented to handle selecting/expanding row ---

    acceptsDropHover () {
        return this.canDropSelect()
    }

    onDragDestinationEnter (dragView) {
        if (this.canDropSelect()) {
            this.setupDropHoverTimeout()
        }
    }

    onDragDestinationHover (dragView) {
    }

    onDragDestinationExit (dragView) {
        this.cancelDropHoverTimeout()
    }

    // ----

    dropHoverDidTimeoutSeconds () {
        return 0.3
    }

    canDropSelect () {
        if (this.node().title() === "Prototypes") {
            console.log("---")
        }
        return this.node().hasSubnodes() || this.node().nodeCanReorderSubnodes()
    }

    setupDropHoverTimeout () {
        const seconds = this.dropHoverDidTimeoutSeconds()
        this._dropHoverEnterTimeout = setTimeout(
            () => { this.dropHoverDidTimeout() }, 
            seconds * 1000
        )
    }

    cancelDropHoverTimeout () {
        clearTimeout(this._dropHoverEnterTimeout)
        this._dropHoverEnterTimeout = null
    }

    dropHoverDidTimeout () {
        this.requestSelection()
    }

    // Browser style drag

    onDragStart (event) {
        // triggered in element being dragged
        // DownloadURL only works in Chrome?
        
        /*
        application/json // doesn't work
        application/x-javascript // doesn't work
        text/javascript // doesn't work
        text/x-javascript // doesn't work
        text/x-json // doesn't work
        text/plain // works
        text/html // doesn't works 

        text/uri-list // should work
        */
       
        const json = this.node().copyArchiveDict() 
        //const fileDetails = "application/json:filename.json:{}"
        //event.dataTransfer.setData("text/plain", "test")

        const mimeType = "text/plain"
        event.dataTransfer.setData(mimeType, JSON.stringify(json, null, 4))
        event.dataTransfer.effectAllowed = "copy";

        /*
        const fileDetails = "application/octet-stream:Eadui.ttf:http://thecssninja.com/gmail_dragout/Eadui.ttf"
        event.dataTransfer.setData("DownloadURL", fileDetails);

        //event.dataTransfer.setData("DownloadURL", fileDetails);
            <a href="Eadui.ttf" id="dragout" draggable="true" data-downloadurl="
            application/octet-stream
            :Eadui.ttf
            :http://thecssninja.com/gmail_dragout/Eadui.ttf">Font file</a>
        */


        return true;
    }

}.initThisClass()
