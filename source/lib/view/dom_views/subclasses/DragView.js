"use strict"

/*

    DragView
    
    A view to globally drag and drop another view or data.

    Drop Protocol:

        - acceptsDropHover
        - onDropHoverEnter
        - onDropHoverMove
        - onDropHoverExit

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
    dropPoint: null,
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

    
    syncToViewSize: function() {
        const aView = this.viewBeingDragged()

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
        
        this.syncToViewSize()
        DocumentBody.shared().addSubview(this)
        this.orderFront()

        // notify viewBeingDragged that we're starting drag, 
        // so parent can maybe hide it and add a empty stand-in?

        if (this.viewBeingDragged().willStartDrag) {
            this.viewBeingDragged().willStartDrag(this)
            /// dragComplete, dragCancelled
        }

        return this
    },

    end: function() {
        DocumentBody.shared().removeSubview(this)
        this.exitAllHovers()
        return this
    },

    initPanWithEvent: function(event) {
        const pan = this.addDefaultPanGesture()
        pan.setShouldRemoveOnComplete(true)
        pan.setMinDistToBegin(0)
        pan.onDown(event)
        pan.attemptBegin()
        this.setTransition("all 0s, transform 0.2s") //, min-height 1s, max-height 1s")
        this.setTransition("transform 0.2s")
        setTimeout(() => { 
            this.addPanZoom()
        })
        return this
    },

    acceptsPan: function() {
        return true
    },

    // --- panning ---

    onPanBegin: function(aGesture) {
        this.setTransition("top 0s, left 0s")

        this._dragStartPos = this.viewBeingDragged().positionInDocument()

        this.addPanShadow()

        this.onPanMove(aGesture)
    },

    onPanMove: function(aGesture) {
        const np = this._dragStartPos.add(aGesture.diffPos()) 
        this.setLeft(np.x())
        this.setTop(np.y())

        this.setDropPoint(aGesture.currentPosition())
        
        const p = aGesture.currentEvent()._cachedPoints.first()
        const views = DocumentBody.shared().viewsUnderPoint(p)

        /*
        if (this.isDebugging()) {
            const names = views.map(v => v.typeId()).join(", ")
            this.setInnerHTML(s)
        }
        */

        setTimeout(() => { this.hoverOverViews(views) })
    },

    hoverOverViews: function(currentHoverViews) {
        // find a views that wants to accept drag

        const hoverViews = this.hoverViews()

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
            v.setBorder("1px dashed yellow")
        }
        //}
    },

    hoverMoveView: function(v) {
        if (v.onDropHoverMove) {
            v.onDropHoverMove(this)
            v.setBorder("1px dashed red")
        }
    },
    
    hoverExitView: function(v) {
        if(v.onDropHoverExit) {
            v.onDropHoverExit(this)
            v.setBorder("none")
        }
    },


    // pan

    onPanCancelled: function(aGesture) {
        this.onPanComplete(aGesture) // needed?
        return this
    },

    onPanComplete: function(aGesture) {

        
        this.removePanShadow()
        this.removePanZoom()
        this.end()

        /*
        setTimeout(() => {
            this.column().relativePositionRows()
            this.column().didReorderRows()
            this.setZIndex(null)
        }, 500)
        */

    },

})
