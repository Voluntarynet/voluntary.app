"use strict"

/*

    DocumentBody

*/

window.DocumentBody = class DocumentBody extends DomView {
    
    initPrototype () {

    }

    init () {
        super.init()

        /*
        window.SyncScheduler.shared().scheduleTargetAndMethod(this, "autoAdjustZoomForMobile")

        setTimeout(() => {
            this.setIsRegisteredForDocumentResize(true)
        })
        */

        // setup shared devices for later use
        Devices.shared().setupIfNeeded()
        return this
    }

    shared () {   
        return this.sharedInstanceForClass(DocumentBody)
    }
    
    setupElement () {
        document.body._domView = this
        //this._element = document.body
        // get this from element override
        return this
    }
    
    element () {
        return document.body
    }
    
    zoomAdjustedWidth () {
        return WebBrowserWindow.shared().width() * this.zoomRatio()
    }
    
    zoomAdjustedHeight () {
        return WebBrowserWindow.shared().width() * this.zoomRatio()
    }
    
    zoomAdjustedSize () { // TODO: move to Point
        return { width: this.zoomAdjustedWidth(), height: this.zoomAdjustedHeight() }
    }

    allDomElements () {
        const domElements = this.element().getElementsByTagName("*");
        return domElements
    }

    viewsUnderPoint (aPoint) {
        const elements = document.elementsFromPoint(aPoint.x(), aPoint.y())
        const views = elements.map(e => this.firstViewForElement(e)).nullsRemoved()
        return views
    }

    firstViewForElement (e) {
        // search up the dom element parents to find one
        // associated with a DomView instance 

        while (e) {
            const view = e._domView
            if (view) {
                return view
            }
            e = e.parentElement
        }

        return null
    }

    /*
    onDocumentResize () {
	     window.SyncScheduler.shared().scheduleTargetAndMethod(this, "autoAdjustZoomForMobile")
        //this.autoAdjustZoomForMobile()
    }
    
    autoAdjustZoomForMobile () {
        const w = WebBrowserScreen.shared().width();
        const h = WebBrowserScreen.shared().height();
        
        console.log("screen " + w + "x" + h)

        let z = "100%"
        
        if (w < 800) {
            z = "300%"
        }
        
        this.setZoom(z)
        
        //console.log("DocumentBody windowWidth: " + WebBrowserWindow.shared().width() + " zoom: " + this.zoom() )
        return this
    }
    */
   
}.initThisClass()

