"use strict"

/*
    DocumentListener

    Listens to a set of document related events.

*/

window.DocumentListener = class DocumentListener extends EventSetListener {
    
    initPrototype () {

    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        this.addEventNameAndMethodName("resize", "onDocumentResize");

        // not sure how to organize these other events yet

        //this.addEventNameAndMethodName("pagehide", "onPageHide");
        //this.addEventNameAndMethodName("pageshow", "onPageShow");

        //this.addEventNameAndMethodName("submit", "onSumit");

        //this.addEventNameAndMethodName("online", "onBrowserOnline");
        //this.addEventNameAndMethodName("offline", "onBrowserOffline");

        //this.addEventNameAndMethodName("error", "onBrowserResourceLoadError");

        //this.addEventNameAndMethodName("fullscreenchange", "onBrowserFullScreenChange");
        //this.addEventNameAndMethodName("fullscreenerror", "onBrowserFullScreenError");

        return this
    }

    listenTarget () {
        return window // is this the best way to handle this?
    }
    
}.initThisClass()
