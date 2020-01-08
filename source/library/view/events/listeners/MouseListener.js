"use strict"

/*
    MouseListener

    Listens to a set of mouse events.

*/


window.MouseListener = class MouseListener extends EventSetListener {
    
    initPrototype () {
    }

    init () {
        super.init()
        return this
    }

    setupEventsDict () {
        this.addEventNameAndMethodName("mousedown", "onMouseDown");
        this.addEventNameAndMethodName("mouseup",   "onMouseUp");

        this.addEventNameAndMethodName("mouseover",  "onMouseOver");  // triggered only when mouse enters element
        this.addEventNameAndMethodName("mouseleave", "onMouseLeave"); // triggered only when mouse exits element

        this.addEventNameAndMethodName("mousemove", "onMouseMove");

        // NOTE: don't see a good use case for these, so commenting out for now
        //this.addEventNameAndMethodName("mouseout",   "onMouseOut");   // triggered when mouse exits any child element        
        //this.addEventNameAndMethodName("mouseenter", "onMouseEnter"); // triggered when mouse enters any child element

        this.addEventNameAndMethodName("click",    "onClick");
        this.addEventNameAndMethodName("dblclick", "onDoubleClick"); // is this valid?

        this.addEventNameAndMethodName("contextmenu", "onContextMenu"); // occurs on right mouse click on element
        return this
    }

}.initThisClass()
