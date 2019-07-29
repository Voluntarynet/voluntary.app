"use strict"

/*

    DomTextTapeMeasure

    Used to measure rendered text dimensions given a string and a style.
    
*/


ideal.Proto.newSubclassNamed("DomTextTapeMeasure").newSlots({
    idName: "DomTextTapeMeasure",
    type: "Div",
    stylesToCopy: ["fontSize","fontStyle", "fontWeight", "fontFamily","lineHeight", "textTransform", "letterSpacing"],
}).setSlots({
	
    testElement: function() {
        if (!this._testElement) {
            this._testElement = this.createTestElement()
            if (!document.getElementById(this.idName())) {
                throw new Error("missing element '" + this.idName() + "'")
            }
        }
        return this._testElement
    },
	
    createTestElement: function() {
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
    },
	
    widthOfDivWithText: function(div, text) { 
        const e = this.testElement()
		
        this.stylesToCopy().forEach(function (styleName) {
            const v = DomView.style[styleName]
            if (v) {
                e.style[styleName] = v
            } else {
                delete e.style[styleName]
            }
        })
		
        e.innerHTML = DomView.innerHTML
		
        //let height = (e.clientHeight + 1)
        const width = (e.clientWidth + 1) 
        this.clean()
        return width
    },
	
    widthOfDivClassWithText: function(divClassName, text) { 
        const e = this.testElement()
        e.className = divClassName
        e.innerHTML = text
		
        //let height = (e.clientHeight + 1)
        const width = (e.clientWidth + 1) 
        e.innerHTML = ""
        //console.log(divClassName, " '" + text + "' width = ", width)
        //this.clean()
        return width
    },
	
    clean: function() {
        const e = this.testElement()
        e.innerHTML = ""
        this.stylesToCopy().forEach(styleName => delete e.style[styleName] )
        return this	
    },
	
})
