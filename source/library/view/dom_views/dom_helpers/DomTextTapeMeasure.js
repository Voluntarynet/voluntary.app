"use strict"

/*

    DomTextTapeMeasure

    Used to measure rendered text dimensions given a string and a style.
    
    Example uses:

            const size1 = DomTextTapeMeasure.shared().sizeOfCSSClassWithText(this.divClassName(), text);
            const h = size1.height;

            const size2 = DomTextTapeMeasure.shared().sizeOfElementWithText(domElement, text);
            const w = size2.width;

*/

window.DomTextTapeMeasure = class DomTextTapeMeasure extends ProtoClass {
    
    initPrototype () {
        this.newSlot("idName", "DomTextTapeMeasure")
        this.newSlot("stylesToCopy", [
            "fontSize",
            "fontStyle", 
            "fontWeight", 
            "fontFamily",
            "lineHeight", 
            "textTransform", 
            "letterSpacing"
        ])
    }
	
    testElement () {
        if (!this._testElement) {
            this._testElement = this.createTestElement()
            if (!document.getElementById(this.idName())) {
                throw new Error("missing element '" + this.idName() + "'")
            }
        }
        return this._testElement
    }
	
    createTestElement () {
        const e = document.createElement("div");
	    e.setAttribute("id", this.idName());
        document.body.appendChild(e);
        e.style.display = "block";
        e.style.position = "absolute";
        e.style.width = "auto";
        e.style.left = -1000;
        e.style.top  = -1000;
        e.style.visibility = "hidden";
        return e		
    }

    sizeOfElementWithText (element, text) { 
        const e = this.testElement()
		
        this.stylesToCopy().forEach(function (styleName) {
            const v = element.style[styleName]
            if (v) {
                e.style[styleName] = v
            } else {
                delete e.style[styleName]
            }
        })
		
        e.innerHTML = element.innerHTML
		
        const width = (e.clientWidth + 1) 
        const height = (e.clientHeight + 1) 
        this.clean()
        return { width: width, height: height }
    }
	
    sizeOfCSSClassWithText (divClassName, text) { 
        const e = this.testElement()
        this.clean()
        e.className = divClassName
        e.innerHTML = text
		
        const width = (e.clientWidth + 1) 
        const height = (e.clientHeight + 1) 
        e.innerHTML = ""
        return { width: width, height: height }
    }
	
    clean () {
        const e = this.testElement()
        e.innerHTML = ""
        this.stylesToCopy().forEach(styleName => delete e.style[styleName] )
        return this	
    }
	
}.initThisClass()
