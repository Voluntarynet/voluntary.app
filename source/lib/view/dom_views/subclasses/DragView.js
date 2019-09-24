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

        //this.setOutline("1px dashed white")
        //this.setBackgroundColor("black")

        return this
    },

    /*
    setViewBeingDragged: function(aView) {
        this._viewBeingDragged = aView
        return this
    },
    */

    
    syncToViewSize: function() {
        const aView = this.viewBeingDragged()

        const w = aView.computedWidth("width")
        const h = aView.computedHeight("height")

        // match dimensions
        this.setMinAndMaxWidth(w)
        this.setMinAndMaxHeight(h)

        const p = aView.positionInDocument()
        this.setLeft(p.x())
        this.setTop(p.y())

        this.setOutline("1px dashed white")
        this.setBackgroundColor("black")
        this.setColor("white")
        this.setZIndex(1)
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
    },

    onPanMove: function(aGesture) {
        const np = this._dragStartPos.add(aGesture.diffPos()) 
        this.setLeft(np.x())
        this.setTop(np.y())
        
        const p = aGesture.currentEvent()._cachedPoints.first()
        const views = DocumentBody.shared().viewsUnderPoint(p)
        //const names = views.map(v => v.typeId())
        //const s = names.join(", ")
        //this.setInnerHTML(s)

        // find a view that wants to accept drag
        this.hoverOverViews(views)
    },

    hoverOverViews: function(currentHoverViews) {
        const hoverViews = this.hoverViews()
        const exitedViews = []
        const enteredViews = []

        hoverViews.forEach((v) => {
            if (!currentHoverViews.contains(v)) {
                // exited 
                exitedViews.push(v)
                if(v.onDropHoverExit) {
                    v.onDropHoverExit(this)
                    console.log(v.typeId() + " onDropHoverExit")
                    v.setBorder("none")

                }
            }
        })

        currentHoverViews.forEach((v) => {
            if (hoverViews.contains(v)) {
                // move
                if (v.onDropHoverMove) {
                    v.onDropHoverMove(this)
                    console.log(v.typeId() + " onDropHoverMove")
                }
            } else {
                // enter
                if (v.acceptsDropHover && v.acceptsDropHover(this)) {
                    if (v.onDropHoverEnter) {
                        v.onDropHoverEnter(this)
                        console.log(v.typeId() + " onDropHoverEnter")
                        //this.setInnerHTML(v.typeId() + " onDropHoverEnter")
                        //enteredViews.push(v)
                        v.setBorder("1px dashed yellow")
                    }
                }
            }
        })

        //currentHoverViews.removeItems(exitedViews)
        //currentHoverViews.appendItems(enteredViews)
        this.setHoverViews(currentHoverViews)
        return this
    },



    onPanCancelled: function(aGesture) {
        this.onPanComplete(aGesture) // needed?
        return this
    },

    onPanComplete: function(aGesture) {
        // visibility

        //this.setTransition(this.transitionStyle())
        //this.removePanShadow()
        //this.removePanZoom()
        //this.end()

        /*
        setTimeout(() => {
            this.column().relativePositionRows()
            this.column().didReorderRows()
            this.setZIndex(null)
        }, 500)
        */

    },

})
