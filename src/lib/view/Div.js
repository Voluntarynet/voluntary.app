
function DomElement_atInsert(el, index, child) {
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

Div = ideal.Proto.extend().newSlots({
    type: "Div",
    divClassName: "",
    items: null,
    element: null,
    parentItem: null,
    itemProto: null,
    
    // target / action
    target: null,
    action: null,
    showsHaloWhenEditable: false,
    tabCount: 0,
    validColor: null,
    invalidColor: null,
	isHandlingEvent: false,
	
	interceptsTab: true,
	nextKeyView: null,
	canMakeKey: true,
}).setSlots({
    init: function () {
        this._items = []
        var e = document.createElement("div");
        e._item = this
        e.setAttribute('class', this.divClassName());
        this._element = e
        this.element().style.transition = "all .2s"
        this.setItemProto(Div)
        return this
    },
    
    applyCSS: function(ruleName) {
        if (ruleName == null) { 
            ruleName = this.divClassName()
        }
        CSS.ruleAt(ruleName).applyToElement(this.element())
        return this
    },

	setFontWeight: function(s) {
        this.element().style.fontWeight = s
		return this
	},
	
	fontWeight: function() {
		return this.element().style.fontWeight
	},
	
    setPaddingLeft: function(aNumber) {
        this.element().style.paddingLeft = aNumber + "px"
        return this
    },

	paddingLeft: function() {
		return this.element().style.paddingLeft.before("px")
	},
	
    setPaddingRight: function(aNumber) {
        this.element().style.paddingRight = aNumber + "px"
        return this
    },

	paddingRight: function() {
		return this.element().style.paddingRight.before("px")
	},

    setTextAlign: function(s) {
        this.element().style.textAlign = s
        return this
    },

	textAlign: function() {
		return this.element().style.textAlign
	},

    setBackgroundColor: function(s) {
        this.element().style.backgroundColor = s
        return this
    },

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
	
    width: function() {
        return this.element().clientWidth
    },
    
    minWidth: function() {
        var s = this.element().style.minWidth
        var w = Number(s.replace("px", ""))
        return w
    },

    setMinAndMaxWidth: function(aNumber) {
		assert(typeof(aNumber) == "number")
        this.element().style.minWidth = aNumber + "px"
        this.element().style.maxWidth = aNumber + "px"
        return this        
    },

	setMinAndMaxHeight: function(aNumber) {
		assert(typeof(aNumber) == "number")
        this.element().style.minHeight = aNumber + "px"
        this.element().style.maxHeight = aNumber + "px"
        return this		
	},

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
    
    newItemFromProto: function () {
        var anItem = this.itemProto().clone()
        if (anItem == null) {
            throw new Error("null anItem")
        }
        return anItem
    },

    addItem: function(anItem) {
        if (anItem == null) {
            anItem = this.newItemFromProto()
        }
        
        this._items.append(anItem)
        
        if ( anItem.element() == null) {
                console.log("anItem = ", anItem)
                throw new Error("null anItem.element()")
        }
        this._element.appendChild(anItem.element());
        anItem.setParentItem(this)
		this.didChangeItemList()
        return anItem
    },
    
    addItems: function(someItems) {
        someItems.forEach( (item) => { this.addItem(item) })
        return this
    },
 
    newItemForNode: function(aNode) {
		var proto = null
		

		if (!proto) {
			proto = this.itemProto()
		}
		
		if (!proto) {
			proto = aNode.viewClass()
			if (proto) {
				//console.log("viewClass = ", aNode.viewClass())
			}
		}
				
        if (!proto) {
            throw new Error("missing proto to create newItemForNode(" + aNode.type() + ")")
        }

		var item = proto.clone()
		
		if (!item.setNode) {
			console.log("Div WARNING: node " + aNode.type() + " has view proto = " + proto.type() + " but it's missing setNode method")
			console.log("Div WARNING: missing " + item.type() + ".setNode method, node is a '" + aNode.type() + "' view proto = " + proto.type())
			console.log(this.type() + ".itemProto() = ", this.itemProto().type())
			console.log(aNode.type() + ".viewClass() = ", aNode.viewClass().type())
		}
		
        return item.setNode(aNode)
    },
    
    atInsert: function (anIndex, anItem) {
        this.items().atInsert(anIndex, anItem)
        DomElement_atInsert(this.element(), anIndex, anItem.element())
        return anItem
    },
    
    itemForNode: function(aNode) {
        return this.items().detect((item) => { return item.node() == aNode; })
    },

	// fade
	
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
        // call removeItem for a direct actions
        // use justRemoteItem for internal changes

        
        this.element().style.transition = "all " + delayInSeconds + "s"
        setTimeout( () => { 
            this.setOpacity(0)
        }, 0)
        
        setTimeout( () => { 
            this.parentItem().removeItem(this)
        }, delayInSeconds*1000)        
        
        return this
    },
    
    willRemove: function() {
    },
    
	didChangeItemList: function() {
	},
	
	hasItem: function(anItem) {
		var children = this._element.childNodes
		for (var i = 0; i < children.length; i ++) {
			var child = children[i]
			if (anItem.element() == child) {
				return true
			}
		}
		return false		
	},
	
    removeItem: function (anItem) {
	//	ShowStack()
		//console.log("WANRING: " + this.type() + " removeItem " + anItem.type())
		/*
		if (!this.hasItem(anItem)) {
			console.log(this.type() + " removeItem " + anItem.type() + " failed - no child found!")
			return anItem
		}
		*/
		
        anItem.willRemove()
        this._items.remove(anItem)
		/*
		var children = this._element.childNodes
		for (var i = 0; i < children.length; i ++) {
			var child = children[i]
			if (anItem.element() == child) {
				console.log("has remove match")
			}
		}
		*/
		if (this.hasItem(anItem)) {
			if(!Div._didShowWarning) {
				Div._didShowWarning = true
				console.log("WANRING: " + this.type() + " removeItem " + anItem.type() + " failed - no child found!")
			}
        	this._element.removeChild(anItem.element());
		}
        anItem.setParentItem(null)
		this.didChangeItemList()
        return anItem
    },
    
    removeAllItems: function() {
        this.items().copy().forEach((item) => { this.removeItem(item) })
        return this
    },

    indexOfItem: function(anItem) {
        return this.items().indexOf(anItem)
    },

    itemAfter: function(anItem) {
        var index = this.indexOfItem(anItem)
        var nextIndex = index + 1
        if (nextIndex < this.items().length) {
            return this.items()[nextIndex]
        }
        return null
    },

	isActiveElement: function() {
		return document.activeElement == this._element 
	},
	
	isActiveElementAndEditable: function() {
		return this.isActiveElement() && this.contentEditable()
	},

    setInnerHTML: function (v) {
        if (v == null) { v = "" }
        v = "" + v //escape(v)
        var a = this._element.innerHTML
        var b = v
        //a = a.replaceAll("&nbsp;", " ")
        //b = b.replaceAll("&nbsp;", " ")

        if (a != b) {

            if (this.isActiveElementAndEditable()) {
				ShowStack();
                console.log("WARNING: attempt to setInnerHTML on active element. ")
                // Can't do this until we can properly set the cursor.
                // there also seems to be some inconsistency problem
                // maybe with DOM update sync?
                return 
            }
        

            //console.log("e[" + a + "] -> e[" + b + "]")
            //console.log("setInnerHTML [" + this._element.innerHTML  + "] -> [" + v + "]")
            //console.log("[" + this._element.innerHTML + "] -> [" + v + "]")
            //NotificationCenter.showCurrentNoteStack()
            //ShowStack()
            
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

    tellParents: function(msg, item) {
        var f = this[msg]
        if (f && f.apply(this, [item])) {
            return
        }

        var p = this.parentItem()
        if (p) {
            p.tellParents(msg, item)
        }
    },
    
    // onclick target & action

	setIsHandlingEvent: function() {
		Div._isHandlingEvent = true
		return this
	},
	
	isHandlingEvent: function() {
		return Div._isHandlingEvent
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
			//Stack.showError(e)
			console.log(e)
		}
		
		this.setIsHandlingEvent(false)
		
		if (error) {
			throw error
		}
	},
	
    
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
    
    /*
    onDataTransfer: function(dataTransfer) {     
        console.log('onDataTransfer ', dataTransfer);
        
        //var file = event.dataTransfer.files[0];
        //console.log('onDataTransfer file[0]: ' + file.path);
        
        for (var i = 0; i < dataTransfer.files.length; i ++) {
            var file = files[i];
            var reader = new FileReader();

            //var fileIsImage = /\.(jpe?g|png|gif)$/i.test(file.name);

             reader.addEventListener("load",  () => {
                    console.log('onDataTransfer load ');
                   var image = new Image();
                    image.height = 100;
                    image.title = file.name;
                    image.src = reader.result;
                    this.element().appendChild( image );
              }, false);

              if (file) {
                reader.readAsDataURL(file);
              }
        }        
    },
    */
   
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
    
    /* 
    onDataTransfer: function(dataTransfer) {     
        console.log('onDataTransfer ', dataTransfer);
        if (dataTransfer.files.length) {   
            var filePaths = []
            var dataUrls = []
            for (var i = 0; i < dataTransfer.files.length; i ++) {
                var file = dataTransfer.files[i]
                console.log("file: ", file)
                var path = file.path
                filePaths.push(path)
                var dataUrl = FileReader.readAsDataURL(file) 
                filePaths.push(dataUrl)
            }
            console.log('onDataTransfer filePaths: ', filePaths);
            assert(filePaths.length == dataTransfer.files.length)
            this.onDropFiles(filePaths)
        }
    },
    */
    
    onDropImageDataUrl: function(dataUrl) {
        console.log('onDropImageDataUrl: ', dataUrl);
        //this.node().onDropFiles(filePaths)
    },
    
    onDropFiles: function(filePaths) {
        console.log('onDropFiles ' + filePaths);
        //this.node().onDropFiles(filePaths)
    },
    
    // editing
    
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
    
    // mouse 
    
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
        
    // keyboard 
    
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
            Div._tabCount ++
            this.element().tabIndex   = Div._tabCount
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
		
		console.log("specialNameForKeyEvent ", code, " = ", result)
		
		return result
	},
	
    onKeyDown: function (event) {
		event.specialKeyName = this.specialNameForKeyEvent(event)

		console.log("onKeyDown event.specialKeyName = " + event.specialKeyName)
		
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
		event.specialKeyName = this.specialNameForKeyEvent(event)
		console.log("onKeyUp event.specialKeyName = " + event.specialKeyName)

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
				this[name].apply(this, [event])
			}
		}
        
        this.tellParents("onDidEdit", this)
    },
    
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
    
    isValid: function() {
        return true
    },

	// --- get focus and blur/unfocus events ---
    
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
		console.log(this.type() + " onFocus")
		return this
	},

	onBlur: function() {
        // subclasses can override 
		console.log(this.type() + " onBlur")
		return this
	},
    
	// --- focus and blur/unfocus ---

    focus: function() {
		//console.log(this.type() + " focus")
        setTimeout( () => {
            this.element().focus()
        }, 0)
        return this
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
	
	border: function() {
		return this.element().style.border
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
        return this
    },

    turnOnUserSelect: function() {
        this.element().style.userSelect = "text";
        this.element().style.webkitUserSelect = "text";
        this.element().style.MozUserSelect = "text";
        return this
    },
    
    
    // ---------------------
    
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
            var newRuleKey = "div." + uniqueClassName + ':' + afterOrBefore
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
    
    makeUnselectable: function() {
        var s = this._element.style
        s.userSelect = "none";
        s["-moz-user-select"] = "none";
        s["-khtml-user-select"] = "none";
        s["-webkit-user-select"] = "none";
        s["-o-user-select"] = "none";
        return this
    },

})
