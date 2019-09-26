"use strict"

/*

    DragView
    
    A view to globally drag and drop another view or data.

    NOTES:
        - we want this to work the same on mouse and touch devices
            - always do a *move* when dragging?

    Drop Protocol - 
    
        Messages sent from DragView to viewBeingDragged:

            - onDragBegin
            - onDragCancelled
            - onDragComplete // sent before dropHoverComplete

        Messages sent from DragView to views it's dragged over:

            - acceptsDropHover // ignored? 
            - onDropHoverEnter
            - onDropHoverMove
            - onDropHoverExit
            - acceptsDropHoverComplete // sent on drag release over a view, if returns true, will call onDropHoverComplete
            - onDropHoverComplete // will get viewBeingDragged from dragView and deal with transfer
         

    Design:

    OPTION 1: COPY

    - copy a visual representation of the view into the DragView
        - place it in the window at the location of the view being dragged
        - animate it enlarging and adding a shadow
    - tell the view being dragged that isn't in drag mode so it hides

        ISSUES:
        - how to let the view change it's presentation to show
          what it would become in the new location


    OPTION 2: NO-COPY

    - request release of subview to be dragged
    - if ok, move it to same window location and parent view to DocumentBody
        - animate zoom and shadow

        ISSUES:
        - how to deal with parent view dependencies?

    BOTH:

        - insert a placeholder view to move around and show the drop location
        - on move: 
            - find who is willing to accept the drop 
                - send 
                acceptsDrop: messages on parent view chain?
            - send 
                - dropHoverBegin: dropHoverMove: dropHoverCancelled: dropHoverComplete: as appropriate

    Example use (from within a view to be dragged):

    startDrag: function() {
        const dv = DragView.clone().

    }

*/

DomStyledView.newSubclassNamed("DragView").newSlots({
    viewBeingDragged: null,
    hoverViews: null,
}).setSlots({
    init: function () {
        DomStyledView.init.apply(this)
        this.setHoverViews([])

        this.setDisplay("block") 
        this.setPosition("absolute")
        this.turnOffUserSelect()
        this.setOverflow("hidden")
        this.setMinWidthPx(10)
        this.setMinHeightPx(10)
        this.setWidth("fit-content")
        this.setMinHeight("fit-content")

        return this
    },

    
    syncToView: function() {
        const aView = this.viewBeingDragged()
        assert(aView.hasParentView())

        const w = aView.computedWidth()
        const h = aView.computedHeight()

        // match dimensions
        this.setMinAndMaxWidth(w)
        this.setMinAndMaxHeight(h)

        const p = aView.positionInDocument()
        this.setLeft(p.x())
        this.setTop(p.y())

        //this.setBackgroundColor("black")
        //this.setColor("white")
        this.setZIndex(10)

        this.setInnerHTML(aView.innerHTML())
    },
    

    hasPan: function() {
        return !Type.isNull(this.defaultPanGesture())
    },

    begin: function() {
        assert(this.hasPan())
        
        this.syncToView()
        DocumentBody.shared().addSubview(this)
        this.orderFront()

        // notify viewBeingDragged that we're starting drag, 
        // so parent can maybe hide it and add a empty stand-in?

        if (this.viewBeingDragged().onDragBegin) {
            this.viewBeingDragged().onDragBegin(this)
        }

        return this
    },


    initPanWithEvent: function(event) {
        const pan = this.addDefaultPanGesture()
        pan.setShouldRemoveOnComplete(true)
        pan.setMinDistToBegin(0)
        pan.onDown(event)
        pan.attemptBegin()
        this.setTransition("all 0s")
        //setTimeout(() => { 
        //   this.addPanZoom()
        //})
        return this
    },

    acceptsPan: function() {
        return true
    },

    // --- panning ---

    onPanBegin: function(aGesture) {
        this._dragStartPos = this.viewBeingDragged().positionInDocument()
        this.addPanZoom()
        this.addPanShadow()
        this.onPanMove(aGesture)
        this.onPanMove(aGesture)
    },

    onPanMove: function(aGesture) {
        const np = this._dragStartPos.add(aGesture.diffPos()) 
        this.setLeft(np.x())
        this.setTop(np.y())

        setTimeout(() => { 
            this.hoverOverViews()
        })

        /*
        this.viewBeingDragged().setMinAndMaxHeight(0)
        this.viewBeingDragged().setHeight(0)
        this.viewBeingDragged().setOverflow("hidden")
        this.viewBeingDragged().setVisibility("hidden")
        console.log("maxHeight: " + this.viewBeingDragged().maxHeight())
        console.log("overflow: " + this.viewBeingDragged().overflow())
        console.log("visibility: " + this.viewBeingDragged().visibility())
        */
    },

    onPanCancelled: function(aGesture) {
        if (this.viewBeingDragged().onDragCancelled) {
            this.viewBeingDragged().onDragCancelled(this)
        }

        this.end()
    },

    onPanComplete: function(aGesture) {
        for(let i = 0; i < this.hoverViews().length; i++ ) {
            let v = this.hoverViews()[i]
            if (v.acceptsDropHoverComplete && v.acceptsDropHoverComplete()) {

                v.onDropHoverComplete(this)
                this.hoverViews().remove(v)
                
                break;
            }
        }

        
        if (this.viewBeingDragged().onDragComplete) {
            this.viewBeingDragged().onDragComplete(this)
        }

        this.end()
    },

    // --- hovering behaviors ---

    viewsUnderDefaultPan: function() {
        const views = DocumentBody.shared().viewsUnderPoint(this.dropPoint())
        return views
    },

    dropPoint: function() {
        return this.defaultPanGesture().currentPosition()
    },

    hoverOverViews: function() {
        const hoverViews = this.hoverViews()
        const currentHoverViews = this.viewsUnderDefaultPan()

        hoverViews.forEach((v) => {
            if (!currentHoverViews.contains(v)) {
                this.hoverExitView(v)
            }
        })

        currentHoverViews.forEach((v) => {
            if (hoverViews.contains(v)) {
                this.hoverMoveView(v)
            } else {
                this.hoverEnterView(v)
            }
        })

        this.setHoverViews(currentHoverViews)
        return this
    },

    exitAllHovers: function() {
        this.hoverViews().forEach((v) => { this.hoverExitView(v) })
        this.setHoverViews([])
    },

    // drop hover protocol

    hoverEnterView: function(v) {
        //if (v.acceptsDropHover && v.acceptsDropHover(this)) {
        if (v.onDropHoverEnter) {
            v.onDropHoverEnter(this)

            if (this.isDebugging()) {
                v.setBorder("1px dashed yellow")
            }
        }
        //}
    },

    hoverMoveView: function(v) {
        if (v.onDropHoverMove) {
            v.onDropHoverMove(this)

            if (this.isDebugging()) {
                v.setBorder("1px dashed red")
            }
        }
    },
    
    hoverExitView: function(v) {
        if(v.onDropHoverExit) {
            v.onDropHoverExit(this)

            if (this.isDebugging()) {
                v.setBorder("none")
            }
        }
    },
    
    /*
    hoverCompleteView: function(v) {
        if(v.onDropHoverComplete) {
            v.onDropHoverComplete(this)

            if (this.isDebugging()) {
                v.setBorder("none")
            }
        }
    },
    */

    // pan

    end: function() {


        this.exitAllHovers()
        this.removePanShadow()
        this.removePanZoom()
        DocumentBody.shared().removeSubview(this)
        return this
    },


})
