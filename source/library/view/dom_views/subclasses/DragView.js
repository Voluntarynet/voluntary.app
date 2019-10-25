"use strict"

/*

    DragView
    
    A view to globally drag and drop another view or data.

    Dragging Protocol

        Messages sent to the Item 
            
            - onDragItemBegin
            - onDragItemCancelled
            - onDragItemComplete


        Messages sent to Source 
            
            - onDragSourceBegin
            - onDragSourceHover
            - onDragSourceCancelled // dropped on a view that doesn't accept it
            
            // using these messages avoids a bunch of conditions in the receiver 
            // the source is repsonsible for completing the drag operation
            // the DragView will set it's destination slot before calling these
            
            - onDragSourceMoveToDestination
            - onDragSourceCopyToDestination
            - onDragSourceLinkToDestination
            
            - onDragSourceMoveToSelf
            - onDragSourceCopyToSelf
            - onDragSourceLinkToSelf
        
            
        Messages sent to Destination or Hover target 
            
            - onDragDestinationEnter // not sent if destination === source
            - onDragDestinationHover
            - onDragDestinationExit
            - onDragDestinationComplete

    Example use (from within a view to be dragged):

    onLongPressComplete: function(longPressGesture) {
        const dv = DragView.clone().setItem(this).setSource(this.column())
        dv.openWithEvent(longPressGesture.currentEvent()) // TODO: eliminate this step?
    } 

*/

DomStyledView.newSubclassNamed("DragView").newSlots({
    item: null, // the view that will be dragged when operation is complete
    source: null, // the owner of the view being dragged that implements the source protocol
    destination: null, // the view on which the item is dropped

    hoverViews: null, // a list of views that self is currently hovering over
    dragOperation: "move", // the drag operation type: move, copy, link, delete

    dragStartPos: null, //
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

        //this.setIsDebugging(true)

        return this
    },

    setupView: function() {
        const aView = this.item()
        assert(aView.hasParentView())

        const f = aView.frameInDocument()

        const w = f.size().width() //aView.computedWidth()
        const h = f.size().height() //aView.computedHeight()

        // match dimensions
        this.setMinAndMaxWidth(w)
        this.setMinAndMaxHeight(h)

        const p = f.origin()
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


    openWithEvent: function(event) {
        // TODO: this is a hack, find a way to init pan without this

        // setup the Pan Gesture to already be started
        const pan = this.addDefaultPanGesture()
        pan.setShouldRemoveOnComplete(true)
        pan.setMinDistToBegin(0)
        pan.onDown(event)
        pan.attemptBegin()

        this.setTransition("all 0s, transform 0.1s, box-shadow 0.1s")
        this.open()
        
        return this
    },

    acceptsPan: function() {
        return true
    },

    // --------------------------

    open: function() {        
        this.setupView()
        DocumentBody.shared().addSubview(this)
        this.orderFront()

        this.onBegin()

        return this
    },

    onBegin: function() {
        this.sendProtocolMessage(this.item(), "onDragItemBegin")
        this.sendProtocolMessage(this.source(), "onDragSourceBegin")
    },
    
    // --- panning ---

    onPanBegin: function(aGesture) {
        this.debugLog("onPanBegin")
        this.setDragStartPos(this.item().positionInDocument())

        // animate the start of the drag

        setTimeout(() => {
            this.addPanStyle()
        })

        this.onPanMove(aGesture)
    },

    updatePosition: function() {
        const newPosition = this.dragStartPos().add(this.defaultPanGesture().diffPos()) 
        this.setLeft(newPosition.x())
        this.setTop(newPosition.y())
    },

    onPanMove: function(aGesture) {
        this.updatePosition()
        
        setTimeout(() => { 
            this.hoverOverViews()
        })
    },

    onPanCancelled: function(aGesture) {
        this.sendProtocolMessage(this.item(),  "onDragItemCancelled")
        this.sendProtocolMessage(this.source(), "onDragSourceCancelled")
        this.sendProtocolMessage(this.source(), "onDragSourceEnd")
        // TODO: add slide back animation?
        this.close()
    },

    firstAcceptingDropTarget: function() {
        return this.hoverViews().detect((v) => {
            return v.acceptsDropHoverComplete && v.acceptsDropHoverComplete(this)
        })
    },

    onPanComplete: function(aGesture) {
        this.debugLog("onPanComplete")

        const aView = this.firstAcceptingDropTarget()
        
        if(!aView) {
            this.onPanCancelled(aGesture)
            return;
        }

        const isSource = aView === this.source()

        this.setDestination(aView)

        if (aView) {
            const completionCallback = () => {
                this.sendProtocolMessage(this.item(), "onDragItemDropped")
                this.sendProtocolAction(aView, "Dropped")


                this.sendProtocolMessage(this.source(), "onDragSourceEnd")
                if (aView !== this.source()) {
                    this.sendProtocolMessage(aView, "onDragDestinationEnd")
                }

                this.close()
            }
            const period = 0.2 // seconds
            const destFrame = aView.dropCompleteDocumentFrame()

            this.animateToDocumentFrame(destFrame, period, completionCallback)
            this.removePanStyle()
            this.hoverViews().remove(aView) // so no exit hover message will be sent to it
        } else {
            this.close()
        }
    },

    // --- hovering behaviors ---

    viewsUnderDefaultPan: function() {
        return DocumentBody.shared().viewsUnderPoint(this.dropPoint())
    },

    dropPoint: function() {
        return this.defaultPanGesture().currentPosition()
    },

    newHoverViews: function() {
        return this.viewsUnderDefaultPan().select(v => v.acceptsDropHover && v.acceptsDropHover(this))
    },

    hoverOverViews: function() {
        const oldViews = this.hoverViews()
        const newViews = this.newHoverViews()

        // if new view was not in old one's, we must be entering it
        const enteringViews = newViews.select(v => !oldViews.contains(v))

        // if new view was in old one's, we're still hovering
        const hoveringViews = newViews.select(v => oldViews.contains(v))

        // if old view isn't in new ones, we must have exited it
        const exitingViews = oldViews.select( v => !newViews.contains(v))
 
        // onDragSourceEnter onDragDestinationEnter 
        enteringViews.forEach(aView => this.sendProtocolAction(aView, "Enter"))

        // onDragSourceHover onDragDestinationHover
        hoveringViews.forEach(aView => this.sendProtocolAction(aView, "Hover"))

        // onDragSourceExit onDragDestinationExit 
        exitingViews.forEach(aView =>  this.sendProtocolAction(aView, "Exit")) 

        this.setHoverViews(newViews)
        return this
    },

    exitAllHovers: function() {
        this.hoverViews().forEach((aView) => { this.sendProtocolAction(aView, "Exit") })
        this.setHoverViews([])
    },

    // drop hover protocol

    sendProtocolAction: function(aView, action) {
        // onDragSourceHover & onDragDestinationHover
        const isSource = aView === this.source()
        const methodName = "onDrag" + (isSource ? "Source" : "Destination") + action
        this.sendProtocolMessage(aView,methodName )
    },

    sendProtocolMessage: function(receiver, methodName) {
        const msg = receiver.typeId() + " " + methodName + " " + (receiver[methodName] ? "" : " <<<<<<<<<<<<<< NOT FOUND ")

        if (!methodName.contains("Hover")) {
            this.debugLog(msg)
        }

        if (receiver[methodName]) {
            receiver[methodName].apply(receiver, [this])
        }
    },
    
    // close

    close: function() {
        this.debugLog("close")
        // handle calling this out of seqence?

        this.exitAllHovers()
        // TODO: animate move to end location before removing

        this.removePanStyle()
        DocumentBody.shared().removeSubview(this)
        return this
    },


    // --- drag style ---

    addPanStyle: function() {
        const r = 1.1
        this.setTransform("scale(" + r + ")")
        this.setBoxShadow("0px 0px 10px 10px rgba(0, 0, 0, 0.5)")
        return this
    },

    removePanStyle: function() {
        this.setTransform("scale(1)")
        this.setBoxShadow("none")
        return this
    },

})
