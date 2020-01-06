"use strict"

/*

    DragView
    
    A view to globally drag and drop another view or data.

    Dragging Protocol

        Messages sent to the Item 
            
            - onDragItemBegin
            - onDragItemCancelled
            - onDragItemDropped   

        Messages sent to Source 
            
            - onDragSourceBegin
            - onDragSourceHover
            - onDragSourceCancelled // dropped on a view that doesn't accept it
            - onDragSourceDropped
            - onDragSourceEnd

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
            
            - acceptsDropHover
            - onDragDestinationEnter // not sent if destination === source
            - onDragDestinationHover
            - onDragDestinationExit
            - acceptsDropHoverComplete
            - onDragDestinationDropped
            - onDragDestinationEnd

        Messages sent by Destination to item

        onDragRequestRemove() // return true if approved


    Example use (from within a view to be dragged):

    onLongPressComplete (longPressGesture) {
        const dv = DragView.clone().setItem(this).setSource(this.column())
        dv.openWithEvent(longPressGesture.currentEvent()) // TODO: eliminate this step?
    } 

*/

window.DragView = class DragView extends DomStyledView {
    
    initPrototype () {
        // the view that will be dragged when operation is complete
        this.newSlot("item", null)

        // the view which is the owner of the view being dragged that implements the source protocol
        this.newSlot("source", null)

        // the view on which the item is dropped
        this.newSlot("destination", null)

        this.newSlot("validOperations", new Set(["move", "copy", "link", "delete"]))

        // a list of views that self is currently hovering over
        this.newSlot("hoverViews", null)

        // start position in screen coordinates 
        this.newSlot("dragStartPos", null)

        // the drag operation type: move, copy, link, delete
        this.newSlot("dragOperation", "move").setDoesHookSetter(true)
    }

    didUpdateSlotDragOperation () {
        assert(this.validOperations().has(this.dragOperation()))
    }

    init () {
        super.init()
        this.setHoverViews([])

        this.setDisplay("block")
        this.setPosition("absolute")
        this.turnOffUserSelect()
        this.setOverflow("hidden")
        this.setMinWidthPx(10)
        this.setMinHeightPx(10)
        this.setWidth("fit-content")
        this.setMinHeight("fit-content")

        this.setIsDebugging(true)

        return this
    }

    // operation type helpers

    isCopyOp () {
        return this.dragOperation() === "copy"
    }

    isMoveOp () {
        return this.dragOperation() === "move"
    }

    isLinkOp () {
        return this.dragOperation() === "link"
    }

    isDeleteOp () {
        return this.dragOperation() === "delete"
    }


    // ----

    setupView () {
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
    }

    hasPan () {
        return !Type.isNull(this.defaultPanGesture())
    }


    openWithEvent (event) {
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
    }

    acceptsPan () {
        return true
    }

    // --------------------------

    open () {        
        this.setupView()
        DocumentBody.shared().addSubview(this)
        this.orderFront()

        this.onBegin()

        return this
    }

    onBegin () {
        this.sendProtocolMessage(this.item(), "onDragItemBegin")
        this.sendProtocolMessage(this.source(), "onDragSourceBegin")
    }
    
    // --- panning ---

    onPanBegin (aGesture) {
        this.debugLog("onPanBegin")
        this.setDragStartPos(this.item().positionInDocument())

        // animate the start of the drag

        setTimeout(() => {
            this.addPanStyle()
        })

        this.onPanMove(aGesture)
    }

    updatePosition () {
        const newPosition = this.dragStartPos().add(this.defaultPanGesture().diffPos()) 
        this.setLeft(newPosition.x())
        this.setTop(newPosition.y())
    }

    onPanMove (aGesture) {
        this.updatePosition()
        
        setTimeout(() => { 
            this.hoverOverViews()
        })
    }

    onPanCancelled (aGesture) {
        this.sendProtocolMessage(this.item(),  "onDragItemCancelled")
        this.sendProtocolMessage(this.source(), "onDragSourceCancelled")
        this.sendProtocolMessage(this.source(), "onDragSourceEnd")
        // TODO: add slide back animation?
        this.close()
    }

    firstAcceptingDropTarget () {
        return this.hoverViews().detect((v) => {
            return v.acceptsDropHoverComplete && v.acceptsDropHoverComplete(this)
        })
    }

    currentOperation () {
        const keyboard = Keyboard.shared()

        if (keyboard.alternateKey().isDown()) {
            return "copy"
        }

        if (keyboard.alternateKey().isDown()) {
            return "link"
        }

        return "move"
    }

    onPanComplete (aGesture) {
        this.debugLog("onPanComplete")

        //this.setDragOperation(this.currentOperation())

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
                this.sendProtocolAction(aView, "Dropped") // onDragSourceDropped onDragDestinationDropped

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
    }

    // --- hovering behaviors ---

    viewsUnderDefaultPan () {
        return DocumentBody.shared().viewsUnderPoint(this.dropPoint())
    }

    dropPoint () {
        return this.defaultPanGesture().currentPosition()
    }

    newHoverViews () {
        return this.viewsUnderDefaultPan().select(v => v.acceptsDropHover && v.acceptsDropHover(this))
    }

    hoverOverViews () {
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
    }

    exitAllHovers () {
        this.hoverViews().forEach((aView) => { this.sendProtocolAction(aView, "Exit") })
        this.setHoverViews([])
    }

    // drop hover protocol

    sendProtocolAction (aView, action) {
        // onDragSourceHover & onDragDestinationHover
        const isSource = aView === this.source()
        const methodName = "onDrag" + (isSource ? "Source" : "Destination") + action
        this.sendProtocolMessage(aView, methodName)
    }

    sendProtocolMessage (receiver, methodName) {
        if (!methodName.contains("Hover") && this.isDebugging()) {

            let msg = receiver.typeId() + " " + methodName 

            if (methodName.contains("Dropped")) {
                msg += " " + this.dragOperation()
            }
    
            if (!receiver[methodName]) {
                msg += " <<<<<<<<<<<<<< NOT FOUND "
            }

            this.debugLog(msg)
        }

        if (receiver[methodName]) {
            receiver[methodName].apply(receiver, [this])
        }
    }
    
    // close

    close () {
        this.debugLog("close")
        // handle calling this out of seqence?

        this.exitAllHovers()
        // TODO: animate move to end location before removing

        this.removePanStyle()
        DocumentBody.shared().removeSubview(this)
        return this
    }


    // --- drag style ---

    addPanStyle () {
        const r = 1.1
        this.setTransform("scale(" + r + ")")
        this.setBoxShadow("0px 0px 10px 10px rgba(0, 0, 0, 0.5)")
        return this
    }

    removePanStyle () {
        this.setTransform("scale(1)")
        this.setBoxShadow("none")
        return this
    }

}.initThisClass()
