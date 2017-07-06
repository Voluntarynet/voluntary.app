
function DomElement_atInsertElement(el, index, child) {
    var children = el.children
    
    if (index < children.length) {
        el.insertBefore(children[index])
        return
    }
    
    if (index == children.length) {
        el.appendChild(child)
        return
    }
    
    throw new Error("invalid dom child index")
}

DivView = ideal.Proto.extend().newSlots({
    type: "DivView",
    divClassName: "",
    element: null,
    
    // parent view and subviews
    parentView: null,
    subviews: null,
    subviewProto: null,
    
    // target / action
    target: null,
    action: null,
    showsHaloWhenEditable: false,
    tabCount: 0,
    validColor: null,
    invalidColor: null,
	isHandlingEvent: false,
	
	// key views
	interceptsTab: true,
	nextKeyView: null,
	canMakeKey: true,
	unfocusOnEnterKey: false,
}).setSlots({
    init: function () {
        this._subviews = []
        var e = document.createElement("div");
        //e._viewObject = this
        e.setAttribute('class', this.divClassName());
        this._element = e
        //this.element().style.transition = "all .2s"
        this.setSubviewProto(DivView)
        return this
    },

/*    
    applyCSS: function(ruleName) {
        if (ruleName == null) { 
            ruleName = this.divClassName()
        }
        CSS.ruleAt(ruleName).applyToElement(this.element())
        return this
    },
*/

	// --- css properties ---
	
	// transform
	
	setTextTransform: function(s) {
        this.element().style.textTransform = s
		return this
	},
	
	textTransform: function() {
		return this.element().style.textTransform
	},

	// font weight
	
	setFontWeight: function(s) {
        this.element().style.fontWeight = s
		return this
	},
	
	fontWeight: function() {
		return this.element().style.fontWeight
	},
	
	// padding left
	
    setPaddingLeft: function(aNumber) {
        this.element().style.paddingLeft = aNumber + "px"
        return this
    },

	paddingLeft: function() {
		return this.element().style.paddingLeft.before("px")
	},

	// padding right
	
    setPaddingRight: function(aNumber) {
        this.element().style.paddingRight = aNumber + "px"
        return this
    },

	paddingRight: function() {
		return this.element().style.paddingRight.before("px")
	},

	// text align

    setTextAlign: function(s) {
        this.element().style.textAlign = s
        return this
    },

	textAlign: function() {
		return this.element().style.textAlign
	},

	// background color
	
    setBackgroundColor: function(s) {
        this.element().style.backgroundColor = s
        return this
    },

	backgroundColor: function() {
		return this.element().style.backgroundColor
	},

	// opacity

	setOpacity: function(v) {
        this.element().style.opacity = v
		return this
	},
	
	opacity: function() {
		return this.element().style.opacity
	},

	// z index 
	
	setZIndex: function(v) {
        this.element().style.zIndex = v
		return this
	},
	
	zIndex: function() {
        return this.element().style.zIndex
	},

	// cursor 
	
    setCursor: function(s) {
        this.element().style.cursor = s
		//console.log(this.divClassName(), " setCursor " + s) 
        return this
    },

    cursor: function() {
        return this.element().style.cursor 
    },

	makeCursorDefault: function() {
		this.setCursor("default")
		return this
	},
	
	makeCursorPointer: function() {
		this.setCursor("pointer")
		return this
	},

	makeCursorText: function() {
		this.setCursor("text")
		return this
	},
	
	makeCursorGrab: function() {
		this.setCursor("grab")
		return this
	},
	
	makeCursorGrabbing: function() {
		this.setCursor("grab")
		return this
	},
	
	// --- focus and blur ---

    focus: function() {
		//console.log(this.type() + " focus")
        setTimeout( () => {
            this.element().focus()
        }, 0)
        return this
    },

	hasFocus: function() {
		return this.isActiveElement()
	},

    blur: function () { // surrender focus
        this.element().blur()
        return this
    },

	// top

    setTop: function (y) {
        var v = y + "px"
        this.element().style.top = v;
        //console.log("setTop " + v)
        return this
    },

	top: function() {
		if (this.element().style.top.length) {
			return this.element().style.top.before("px")
		}
		return 0
	},
	
	/* 
	
	// doesn't work?
	
	setWidth: function(aNumber) {
		if (aNumber == "auto") {
			this.element().style.left = "auto"
		} else {
	        this.element().style.left = aNumber + "px"
		}
        return this		
	},
	*/
	
	// left

    setLeft: function (aNumber) {
        var s = aNumber + "px"
        this.element().style.left = s;
        return this
    },

	left: function() {
		if (this.element().style.left.length) {
			return this.element().style.left.before("px")
		}
		return 0
	},
	
	// float
	
	setFloat: function(s) {
		this.element().style.float = s
		return this
	},
	
	float: function() {
		return this.element().style.float
	},
	
	// border 
	
	setBorder: function(s) {
		this.element().style.border = s
		return this
	},
	
	setBorderTop: function(s) {
		this.element().style.borderTop = s
		return this
	},
	
	setBorderBottom: function(s) {
		this.element().style.borderBottom = s
		return this
	},
	
	border: function() {
		return this.element().style.border
	},
    
	// alignment
	
	setTextAlign: function(s) {
		this.element().style.textAlign = s
		return this		
	},
	
	textAlign: function() {
		return this.element().style.textAlign
	},	
	
	// color
	
    setColor: function(c) {
        this.element().style.color = c;
        return this
    },
    
    color: function() {
        return this.element().style.color 
    },
    
    setIsVisible: function(aBool) {
		var v = aBool ? "visible" : "hidden"
		if (this.element().style.visibility != v) {
        	this.element().style.visibility = v
		}
        return this
    },

	isVisible: function() {
        return this.element().style.visibility != "hidden";
	},
    
    setDisplay: function(s) {
        //assert(s in { "none", ...} );
        this.element().style.display = s;
        return this
    },
    
	display: function() {
		return this.element().style.display
	},

    turnOffUserSelect: function() {
        this.element().style.userSelect = "none";
        this.element().style.webkitUserSelect = "none";
        this.element().style.MozUserSelect = "none";
        this.setUserSelect("none");
        return this
    },

    turnOnUserSelect: function() {
		this.setUserSelect("text")
        return this
    },
	
	// user selection 
	
    setUserSelect: function(v) {
        var s = this._element.style
        s.userSelect = v;
        s["-moz-user-select"] = v;
        s["-khtml-user-select"] = v;
        s["-webkit-user-select"] = v;
        s["-o-user-select"] = v;

        s.userSelect = v;
        s.webkitUserSelect = v;
        s.MozUserSelect = v;
        return this
    },
	
	// spell check
	
	setSpellCheck: function(aBool) {
		this._element.setAttribute('spellcheck', aBool);
		return this
	},
	
	// tool tip
	
	setToolTip: function(aName) {	
		if (aName) {	
			this._element.setAttribute('title', aName);
		} else {
			this._element.removeAttribute('title');
		}
		return this
	},
	
	// width and height
	
    width: function() {
        return this.element().clientWidth
    },
    
    minWidth: function() {
        var s = this.element().style.minWidth
		assert(s.includes("px"))
        var w = Number(s.replace("px", ""))
        return w
    },

    setMinAndMaxWidth: function(aNumber) {
		if (typeof(aNumber) == "string") {
	        this.element().style.minWidth = aNumber 
	        this.element().style.maxWidth = aNumber 		
		} else {
			assert(typeof(aNumber) == "number")
	        this.element().style.minWidth = aNumber + "px"
	        this.element().style.maxWidth = aNumber + "px"
		}
        return this        
    },

	setMinAndMaxHeight: function(aNumber) {
		assert(typeof(aNumber) == "number")
        this.element().style.minHeight = aNumber + "px"
        this.element().style.maxHeight = aNumber + "px"
        return this		
	},
	
	// div class name

    setDivClassName: function (aName) {
		if (this._divClassName != aName) {
	        this._divClassName = aName
	        if (this._element) {
	            this._element.setAttribute('class', aName);
	        }
		}
        return this
    },

    divClassName: function (aName) {
        if (this._element) {
            var className = this._element.getAttribute('class');
            this._divClassName = className
            return className
        }
        return this._divClassName
    },

	// --- subviews ---
    
    newSubviewFromProto: function () {
        var anSubview = this.subviewProto().clone()
        if (anSubview == null) {
            throw new Error("null anSubview")
        }
        return anSubview
    },

    addSubview: function(anSubview) {
        if (anSubview == null) {
            anSubview = this.newSubviewFromProto()
        }
        
        this._subviews.append(anSubview)
        
        if ( anSubview.element() == null) {
                console.log("anSubview = ", anSubview)
                throw new Error("null anSubview.element()")
        }
        this._element.appendChild(anSubview.element());
        anSubview.setParentView(this)
		this.didChangeSubviewList()
        return anSubview
    },
    
    addSubviews: function(someSubviews) {
        someSubviews.forEach( (subview) => { this.addSubview(subview) })
        return this
    },
 
    newSubviewForNode: function(aNode) {
		var proto = null
		

		if (!proto) {
			proto = this.subviewProto()
		}
		
		if (!proto) {
			proto = aNode.viewClass()
			if (proto) {
				//console.log("viewClass = ", aNode.viewClass())
			}
		}
				
        if (!proto) {
            throw new Error("missing proto to create newSubviewForNode(" + aNode.type() + ")")
        }

		var subview = proto.clone()
		
		if (!subview.setNode) {
			console.log("Div WARNING: node " + aNode.type() + " has view proto = " + proto.type() + " but it's missing setNode method")
			console.log("Div WARNING: missing " + subview.type() + ".setNode method, node is a '" + aNode.type() + "' view proto = " + proto.type())
			console.log(this.type() + ".subviewProto() = ", this.subviewProto().type())
			console.log(aNode.type() + ".viewClass() = ", aNode.viewClass().type())
		}
		
        return subview.setNode(aNode)
    },
    
    atInsertSubview: function (anIndex, anSubview) {
        this.subviews().atInsert(anIndex, anSubview)
        DomElement_atInsertElement(this.element(), anIndex, anSubview.element())
        return anSubview
    },
    
    subviewForNode: function(aNode) {
        return this.subviews().detect((aView) => { return aView.node() == aNode; })
    },

	// --- fade animations ---
	
	fadeInToDisplayInlineBlock: function() {
        this.setDisplay("inline-block")
        setTimeout( () => { 
            this.setOpacity(1)
        }, 0)	
		return this
	},	

	fadeOutToDisplayNone: function() {
		this.setOpacity(0)
        setTimeout( () => { 
            this.setDisplay("none")
        }, 200)	
		return this
	},
    
    removeAfterFadeDelay: function(delayInSeconds) {
        // call removeSubview for a direct actions
        // use justRemoteSubview for internal changes
        
        this.element().style.transition = "all " + delayInSeconds + "s"
        setTimeout( () => { 
            this.setOpacity(0)
        }, 0)
        
        setTimeout( () => { 
            this.parentView().removeSubview(this)
        }, delayInSeconds*1000)        
        
        return this
    },
    
    willRemove: function() {
    },
    
	didChangeSubviewList: function() {
	},
	
	hasSubview: function(anSubview) {
		var children = this._element.childNodes
		for (var i = 0; i < children.length; i ++) {
			var child = children[i]
			if (anSubview.element() == child) {
				return true
			}
		}
		return false		
	},
	
    removeSubview: function (anSubview) {
		//console.log("WANRING: " + this.type() + " removeSubview " + anSubview.type())
		/*
		if (!this.hasSubview(anSubview)) {
			console.log(this.type() + " removeSubview " + anSubview.type() + " failed - no child found!")
			return anSubview
		}
		*/
		
        anSubview.willRemove()
        this._subviews.remove(anSubview)

		/*
		var children = this._element.childNodes
		for (var i = 0; i < children.length; i ++) {
			var child = children[i]
			if (anSubview.element() == child) {
				console.log("has remove match")
			}
		}
		*/
		
		if (this.hasSubview(anSubview)) {
			if(!DivView._didShowWarning) {
				DivView._didShowWarning = true
				console.log("WANRING: " + this.type() + " removeSubview " + anSubview.type() + " failed - no child found!")
			}
        	this._element.removeChild(anSubview.element());
		}
		
        anSubview.setParentView(null)
		this.didChangeSubviewList()
        return anSubview
    },
    
    removeAllSubviews: function() {
        this.subviews().copy().forEach((aView) => { this.removeSubview(aView) })
        return this
    },

    indexOfSubview: function(anSubview) {
        return this.subviews().indexOf(anSubview)
    },

    subviewAfter: function(anSubview) {
        var index = this.indexOfSubview(anSubview)
        var nextIndex = index + 1
        if (nextIndex < this.subviews().length) {
            return this.subviews()[nextIndex]
        }
        return null
    },

	// --- active element ---

	isActiveElement: function() {
		return document.activeElement == this._element 
	},
	
	isActiveElementAndEditable: function() {
		return this.isActiveElement() && this.contentEditable()
	},
	
	// --- inner html ---

    setInnerHTML: function (v) {
        if (v == null) { 
			v = "" 
		}
		
        v = "" + v //escape(v)

        if (v != this._element.innerHTML) {

            if (this.isActiveElementAndEditable()) {
				ShowStack();
                console.log("WARNING: attempt to setInnerHTML on active element. ")
                // Can't do this until we can properly set the cursor.
                // there also seems to be some inconsistency problem
                // maybe with DOM update sync?
                return 
            }
            
            this._element.innerHTML = v
        }

        return this
    },

    innerHTML: function() {
        return this._element.innerHTML
    },

    setString: function (v) {
        return this.setInnerHTML(v)
    },
    
    loremIpsum: function (maxWordCount) {
        this.setInnerHTML("".loremIpsum(10, 40))
        return this
    },

	// --- updates ---

    tellParents: function(msg, aView) {
        var f = this[msg]
        if (f && f.apply(this, [aView])) {
            return
        }

        var p = this.parentView()
        if (p) {
            p.tellParents(msg, aView)
        }
    },

	// --- events --------------------------------------------------------------------
    
    // globally track whether we are inside an event 

	setIsHandlingEvent: function() {
		DivView_isHandlingEvent = true
		return this
	},
	
	isHandlingEvent: function() {
		return DivView_isHandlingEvent
	},

	handleEventFunction: function(f) {
		//  a try gaurd to make sure isHandlingEvent has correct value
		//  isHandlingEvent is used to determine if view should inform node of changes
		//  - it should only while handling an event
		
		var error = null
		
		this.setIsHandlingEvent(true)
		
		try {
			f()
		} catch (e) {
			//StackTrace.showError(e)
			console.log(e)
		}
		
		this.setIsHandlingEvent(false)
		
		if (error) {
			throw error
		}
	},
	
    // --- onClick target & action ---
    
    registerForClicks: function (aBool) {
        if (aBool) {
            this.element().onclick =  (event) =>{ 
				this.handleEventFunction( () => { this.onClick(event) })
			}
            //this.element().ondblclick = function (event) { this.onDoubleClick(event) }
			this.makeCursorPointer()
        } else {
            this.element().onclick = null
            this.element().ondbclick = null
			this.makeCursorDefault()
        }
        return this
    },
    
    setAction: function (anAction) {
        this._action = anAction
        this.registerForClicks(anAction != null)
        return this       
    },
    
    onClick: function(event) {
        var t = this.target()
        if (t && this.action) {
            t[this.action()].apply(t, [this])
        } else {
            throw new Error("no target for action " + this.action())
        }
        return this
    },
    
    onDoubleClick: function (event) {
        
        return this
    },
    
    // drag & drop
    
    registerForDrop: function (aBool) {
        if (aBool) {
            this.element().ondragover  =  (event) => { return this.onDragOver(event) }
            this.element().ondragleave =  (event) => { return this.onDragLeave(event) }
            this.element().ondragend   =  (event) => { return this.onDragEnd(event) }
            this.element().ondrop      =  (event) => { return this.onDrop(event) }
        } else {
            this.element().ondragover  = null
            this.element().ondragleave = null
            this.element().ondragend   = null
            this.element().ondrop     = null
        }
        return this
    },   
    
    acceptsDrop: function() {
        return true
    },    
         
    onDragOver: function (event) {
        //console.log("onDragOver ");

        if (this.acceptsDrop()) {
            this.onDragOverAccept(event)
            event.preventDefault()
            return true
        }

        return false;
    },
    
    onDragOverAccept: function(event) {
        //console.log("onDragOverAccept ");
        this.dragHighlight()
    },
    
    onDragLeave: function (event) {
        //console.log("onDragLeave ", this.acceptsDrop());
        this.dragUnhighlight()
        return this.acceptsDrop();
    },
    
    dragHighlight: function() {
        
    },
    
    dragUnhighlight: function() {
        
    },
    
    onDragEnd: function (event) {
        this.dragUnhighlight();
        //console.log("onDragEnd");
    },

    onDrop: function (event) {
        //var file = event.dataTransfer.files[0];
        //console.log('onDrop ' + file.path);
        this.onDataTransfer(event.dataTransfer)
        this.dragUnhighlight()
        event.preventDefault();
        return true;
    },
   
    onDataTransfer: function(dataTransfer) {     
        //console.log('onDataTransfer ', dataTransfer);
        
        if (dataTransfer.files.length) {   
            var dataUrls = []
            for (var i = 0; i < dataTransfer.files.length; i ++) {
                var file = dataTransfer.files[i]
                //console.log("file: ", file)
                
                if (!file.type.match('image.*')) {
                    continue;
                }

                var reader = new FileReader();
                reader.onload = ((event) => {
                    this.onDropImageDataUrl(event.target.result)
                })
                reader.readAsDataURL(file);

            }
        }

    },
    
    onDropImageDataUrl: function(dataUrl) {
        console.log('onDropImageDataUrl: ', dataUrl);
        //this.node().onDropFiles(filePaths)
    },
    
    onDropFiles: function(filePaths) {
        console.log('onDropFiles ' + filePaths);
        //this.node().onDropFiles(filePaths)
    },
    
    // --- content editing ---
    
    setContentEditable: function (aBool) {
		//console.log(this.divClassName() + " setContentEditable(" + aBool + ")")
		if (aBool) {
        	this.makeCursorText()
		}

        this.element().contentEditable = aBool ? 'true' : 'false'
        
        if (this.showsHaloWhenEditable()) {
            this.element().style.boxShadow = aBool ? "0px 0px 5px #ddd" : "none"
        }
        this.registerForKeyboard(aBool)
        
        if (aBool) {
            this.turnOnUserSelect()
            this.registerForPaste()
        } else {
            this.unregisterForPaste()
        }
        
        return this
    },

	contentEditable: function() {
		return this.element().contentEditable == "true"
	},
    
    // mouse events
    
    registerForMouse: function (aBool) {
        if (aBool) {
            this.element().onmousedown =  (event) => { return this.onMouseDown(event) }
            this.element().onmousemove =  (event) => { return this.onMouseMove(event) }
            this.element().onmouseout  =  (event) => { return this.onMouseOut(event) }
            this.element().onmouseover =  (event) => { return this.onMouseOver(event) }
            this.element().onmouseup   =  (event) => { return this.onMouseUp(event) }
        } else {
            this.element().onmousedown  = null
            this.element().onmousemove  = null
            this.element().onmouseout   = null
            this.element().onmouseover  = null
            this.element().onmouseup    = null
        }
        return this
    },    
    
    onMouseDown: function (event) {
    },
    
    onMouseMove: function (event) {
    },
    
    onMouseOut: function (event) {
    },
    
    onMouseOver: function (event) {
    },

    onMouseUp: function (event) {
    },
        
    // --- keyboard events ---
    
    registerForKeyboard: function (aBool) {
        if (aBool) {
            /*
            this.element().onkeydown  =  (event) => {       
                return this.onKeyDown(event) 
            }

            this.element().onkeypress =  (event) => { return this.onKeyPress(event) }
            */
            this.element().onkeyup    =  (event) => { 
                //this._onkeyupInnerHTML = this._element.innerHTML // THIS NEEDS TO BE HERE OR DOM innerHTML ISN'T CONSISTENT?
                //console.log("onkeyup [" + this._element.innerHTML  + "]")
                return this.onKeyUp(event) 
            }
            DivView._tabCount ++
            this.element().tabIndex   = DivView._tabCount
            this.element().style.outline = "none"
        } else {
            this.element().onkeydown  = null
            this.element().onkeypress = null
            this.element().onkeyup    = null
            delete this.element().tabindex 
        }
        return this
    },    
    
	specialKeyCodes: function () { 
		return {
			8:  "delete", // "delete" on Apple keyboard
			9:  "tab", 
			13:  "enter", 
			16:  "shift", 
			17:  "control", 
			18:  "alt", 
			20:  "capsLock", 
			27:  "escape", 
			33:  "pageUp", 
			34:  "pageDown", 
			37: "leftArrow",  
			38: "upArrow",  
			39: "rightArrow", 
			40: "downArrow",  
			46: "delete", 
			/* 
			107: "add",  
			109: "subtract",  
			111: "divide",  
			144: "numLock",  
			145: "scrollLock",  
			186: "semiColon",  
			187: "equalsSign", 
			*/ 
		}
	},
	
	specialNameForKeyEvent: function(event) {
		var code = event.keyCode
		var result = this.specialKeyCodes()[code]
		
		if (event.shiftKey && (code == 187)) {
			return "plus"
		}
		
		//console.log("specialNameForKeyEvent ", code, " = ", result)
		
		return result
	},
	
    onKeyDown: function (event) {
		event.specialKeyName = this.specialNameForKeyEvent(event)
		
		if (event.specialKeyName == "enter" && this.unfocusOnEnterKey()) {
			console.log(" releasing focus")
			// this.releaseFocus() // todo: implement something to pass focus up view chain to whoever wants it
			this._element.parentElement.focus()
		}
		
		/*
		if (this.interceptsTab()) {
	        if (event.keyId == "tab") {
		        event.preventDefault()
	            this.onTabKeyDown()
	        }
		}
		*/    
		
		if (event.specialKeyName) {
			var name = "on" + event.specialKeyName.capitalized() + "KeyDown"
			if (this[name]) {
				this[name].apply(this, [event])
		        event.preventDefault()
			}
		}
    },
    
    onKeyPress: function (event) {
       // console.log("onKeyPress")
    },
    
    onKeyUp: function (event) {
		//console.log(this.type() + " onKeyUp")
		
		var shouldPropogate = true
		event.specialKeyName = this.specialNameForKeyEvent(event)

		/*
		if (this.interceptsTab()) {
	        if (event.keyId == "tab") {
	            event.preventDefault()
				return
	        }
		}
		*/
        
        //console.log("event: ", event)
        //event.preventDefault()
        
        if ((!this.isValid()) && (this.invalidColor() != null)) {
             this.setColor(this.invalidColor())
        } else {
            if (this.color() == this.invalidColor()) {
                this.setColor(null)
            }
        }

		if (event.specialKeyName) {
			var name = "on" + event.specialKeyName.capitalized() + "KeyUp"
			if (this[name]) {
				shouldPropogate = this[name].apply(this, [event])
		        event.preventDefault()
				//console.log("shouldPropogate = ", shouldPropogate)
			}
		}
        
        this.tellParents("onDidEdit", this)
		return shouldPropogate
    },

	// --- tabs and next key view ----
    
    onTabKeyDown: function() {
        this.selectNextKeyView()
    },

	selectNextKeyView: function() {
		console.log(this.type() + " selectNextKeyView")
        var nkv = this.nextKeyView()
        if (nkv) {
            //if (nkv.initialFirstResponder()) {
                //nkv.focus()
            //}
        }	
	},
	
	// --- error checking ---
    
    isValid: function() {
        return true
    },

	// --- focus and blur event handling ---
    
    registerForFocus: function(aBool) {
		
        if (aBool) {
			//console.log(this.type() + " registerForFocus(" + aBool + ")")
            this.element().onfocus = () => { this.onFocus() };
            this.element().onblur  = () => { this.onBlur() };
        } else {
            this.element().onfocus = null
            this.element().onblur = null
        }

        return this
    },

	onFocus: function() {
        // subclasses can override 
		//console.log(this.type() + " onFocus")
		return this
	},

	onBlur: function() {
        // subclasses can override 
		//console.log(this.type() + " onBlur")
		return this
	},
    

    
    
    // --- text selection ------------------
    
	selectAll: function() {
		if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(this._element);
            range.select();
        } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(this._element);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
	},
	
	// --- paste from clipboard ---

    paste: function (e) {
        // prevent pasting text by default after event
        e.preventDefault(); 

        var clipboardData = {},
        rDataText,
        rDataHTML;

        clipboardData = e.clipboardData;
        rDataHTML = clipboardData.getData('text/html');
        rDataPText = clipboardData.getData('text/plain');

        var htmlToPlainText = function (html)
        {
           var tmp = document.createElement("DIV");
           tmp.innerHTML = html;
           return tmp.textContent || tmp.innerText || "";
        }

        if (rDataHTML && rDataHTML.trim().length != 0) {
            this.replaceSelectedText(htmlToPlainText(rDataHTML))
            return false; // prevent returning text in clipboard
        }

        if (rDataPText && rDataPText.trim().length != 0) {
            this.replaceSelectedText(htmlToPlainText(rDataPText))
            return false; // prevent returning text in clipboard
        }
    },
    
    pasteListenerFunc: function () {
        if (!this._pasteListenerFunc) {
            this._pasteListenerFunc = function(e) { this.paste(e) }
        }
        return this._pasteListenerFunc
    },
    
    unregisterForPaste: function () {
        this.element().removeEventListener('paste', this.pasteListenerFunc());
    },
    
    registerForPaste: function() {
        this.element().addEventListener('paste', this.pasteListenerFunc(), false);
        return this
    },

    replaceSelectedText: function(replacementText) {
        var sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(replacementText));
            }
        } else if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            range.text = replacementText;
        }
    },
    
    setContentAfterOrBeforeString: function(aString, afterOrBefore) {
        var uniqueClassName = "UniqueClass_" + this._uniqueId
        var e = this.element()
        if (e.className.indexOf(uniqueClassName) == -1) {
            var newRuleKey = "DivView" + uniqueClassName + ':' + afterOrBefore
            var newRuleValue = 'content: "'+ aString + '";'
            //console.log("newRule '" + newRuleKey + "', '" + newRuleValue + "'")
            document.styleSheets[0].addRule(newRuleKey, newRuleValue);
            e.className += " " + uniqueClassName
        }
        return this
    },
       
    setContentAfterString: function(aString) {
        this.setContentAfterOrBeforeString(aString, "after")
        return this
    },
    
    setContentBeforeString: function(aString) {
        this.setContentAfterOrBeforeString(aString, "before")
        return this
    },    

})
