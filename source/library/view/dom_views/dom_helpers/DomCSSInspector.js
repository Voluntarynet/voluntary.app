"use strict"

/*
    DomCSSInspector
    Used to inspect class styles since css hides stylesheet.cssRules.
    
    example use:
    const value = DomCSSInspector.shared().setDivClassName("..").cssStyle.fontFamily

*/

window.DomCSSInspector = class DomCSSInspector extends ProtoClass {
    
    initPrototype () {
        this.newSlot("idName", "DomCSSInspector")
    }

    testElement () {
        if (!this._testElement) {
            this._testElement = this.createTestElement()
            document.body.appendChild(this._testElement);
            if (!document.getElementById(this.idName())) {
                throw new Error("missing element '" + this.idName() + "'")
            }
        }
        return this._testElement
    }
	
    createTestElement () {
        const e = document.createElement("div");
	    e.setAttribute("id", this.idName());
        e.style.display = "none";
        e.style.visibility = "hidden";
        return e
    }

    setDivClassName (aName) {
        this.testElement().setAttribute("class", aName);
        return this
    }

    cssStyle (key) {
        return this.testElement().style
    }
    
}.initThisClass()
