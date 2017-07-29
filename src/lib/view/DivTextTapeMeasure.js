/*
	Used to measure rendered text dimensions given a string and a style.
*/

DivTextTapeMeasure = ideal.Proto.extend().newSlots({
	idName: "DivTextTapeMeasure",
    type: "Div",
	stylesToCopy: ['fontSize','fontStyle', 'fontWeight', 'fontFamily','lineHeight', 'textTransform', 'letterSpacing'],
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
		var e = document.createElement('div');
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
		var e = this.testElement()
		
		this.stylesToCopy().forEach(function (styleName) {
			var v = DivView.style[styleName]
			if (v) {
				e.style[styleName] = v
			} else {
				delete e.style[styleName]
			}
		})
		
		e.innerHTML = DivView.innerHTML
		
		//var height = (e.clientHeight + 1)
		var width = (e.clientWidth + 1) 
		this.clean()
		return width
	},
	
	widthOfDivClassWithText: function(divClassName, text) { 
		var e = this.testElement()
		e.className = divClassName
		e.innerHTML = text
		
		//var height = (e.clientHeight + 1)
		var width = (e.clientWidth + 1) 
		e.innerHTML = ""
		//console.log(divClassName, " '" + text + "' width = ", width)
		//this.clean()
		return width
	},
	
	clean: function() {
		var e = this.testElement()
		e.innerHTML = ""
		this.stylesToCopy().forEach(function (styleName) {
			delete e.style[styleName]
		})		
	},
	
})
