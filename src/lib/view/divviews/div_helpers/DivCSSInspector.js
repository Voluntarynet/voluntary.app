"use strict"

/*
    DivCSSInspector
    Used to inspect class styles since css hides stylesheet.cssRules.
    
    example use:
    let value = DivCSSInspector.shared().setDivClassName("..").cssStyle.fontFamily

*/

window.DivCSSInspector = ideal.Proto.extend().newSlots({
    type: "DivCSSInspector",
    idName: "DivCSSInspector",
    //divClassName: null,
}).setSlots({
    
    shared: function() {
        return this
    },

    testElement: function() {
        if (!this._testElement) {
            this._testElement = this.createTestElement()
            document.body.appendChild(this._testElement);
            if (!document.getElementById(this.idName())) {
                throw new Error("missing element '" + this.idName() + "'")
            }
        }
        return this._testElement
    },
	
    createTestElement: function() {
        let e = document.createElement("div");
	    e.setAttribute("id", this.idName());
        e.style.display = "none";
        e.style.visibility = "hidden";
        return e
    },

    setDivClassName: function(aName) {
        this.testElement().setAttribute("class", aName);
        return this
    },

    cssStyle: function(key) {
        return this.testElement().style
    },
})
