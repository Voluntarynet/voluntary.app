"use strict"

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


window.DivView = ideal.Proto.extend().newSlots({
    type: "DivView",
    divClassName: "",
    element: null,
    
    // parent view and subviews
    parentView: null,
    subviews: null,
    
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
	
    // event handling
    isRegisteredForDrop: false,
    isRegisteredForWindowResize: false,
    isRegisteredForClicks: false,
    isRegisteredForKeyboard: false,
    isRegisteredForMouse: false,
    isRegisteredForFocus: false,
    isRegisteredForPaste: false,
    isRegisteredForVisibility: false,
	
    intersectionObserver: null,
    
    acceptsFirstResponder: false,
}).setSlots({

    
    init: function () {
        this._subviews = []
        this.setupElement()
        this.setIsRegisteredForDrop(false)
        return this
    },

    setDivId: function(aString) {
        this.element().id = aString
        return this
    },
	
    setElement: function(e) {
	    this._element = e
	    this.setIsRegisteredForFocus(true)
	    e._divView = this // try to avoid depending on this as much as possible - keep refs to divViews, not elements
	    return this
    },
	    
    setupElement: function() {
        this.setElement(document.createElement("div"))
        this.setDivId(this.type() + "-" + this._uniqueId)
        this.setupDivClassName()      
        return this  
    },

    setupDivClassName: function() {
        var ancestorNames = this.ancestors().map((obj) => { 
            if (obj.type().contains(".")) {
                return ""
            }
            return obj.type() 
        })
		
        // small hack to remove duplicate first name (as instance and first proto names are the same)
        if (ancestorNames.length > 1 && ancestorNames[0] == ancestorNames[1]) {
		    ancestorNames.removeFirst()
        }
		
        this.setDivClassName(ancestorNames.join(" ").strip())
        return this
    },
	
    insertDivClassName: function(aName) {
        var names = this.divClassName().split(" ")
        names.removeOccurancesOf(aName) // avoid duplicates
        names.atInsert(0, aName)
        this.setDivClassNames(names)
        return this
    },
	
    removeDivClassName: function(aName) {
        var names = this.divClassName().split(" ")
        names.removeOccurancesOf(aName)
        this.setDivClassNames(names)
        return this
    },
	
    setDivClassNames: function(names) {
        this.setDivClassName(names.join(" "))
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

    setCssAttribute: function(key, newValue, didChangeCallbackFunc) {
        var style = this.cssStyle()
        var oldValue = style[key]
        if(String(oldValue) != String(newValue)) {
            if (newValue == null) {
                delete style[key]
            } else {
                style[key] = newValue
            }
			
            if (didChangeCallbackFunc) {
                didChangeCallbackFunc()
            }
        }
		
        return this
    },
	
    getCssAttribute: function(key, errorCheck) {
        if(errorCheck) {
            throw new Error("getCssAttribute called with 2 arguments")
        }
        return this.cssStyle()[key]
    },


    // --- css properties ---
    /*	
	setDivComment: function(s) {
		this.element().id =  "comment-" + s
		console.log("data-comment = " + s)
		return this
	},
	*/
	
    setPosition: function(s) {
        this.setCssAttribute("position", s)
        return this		
    },
	
    position: function() {
        return this.getCssAttribute("position")
    },
	
    // transform
	
    setTextTransform: function(s) {
        this.setCssAttribute("text-transform", s)
        return this
    },
	
    textTransform: function() {
        return this.getCssAttribute("text-transform")
    },
	
    // zoom
	
    setZoom: function(s) {
        this.setCssAttribute("zoom", s)
        return this
    },
	
    zoom: function() {
        return this.getCssAttribute("zoom")
    },
	
    zoomRatio: function() {
        return Number(this.zoom().before("%"))/100
    },
	
    setZoomRatio: function(r) {
	    this.setZoomPercentage(r*100)
        return this
    },
	
    setZoomPercentage: function(aNumber) {
	    assert(typeof(aNumber) == "number") 
        this.setCssAttribute("zoom", aNumber + "%")
	    return this
    },

    // font family

    setFontFamily: function(s) {
        this.setCssAttribute("font-family", s)
        return this
    },
	
    fontFamily: function() {
        return this.getCssAttribute("font-family")
    },	
	
    // font weight
	
    setFontWeight: function(s) {
        this.setCssAttribute("font-weight", s)
        return this
    },
	
    fontWeight: function() {
        return this.getCssAttribute("font-weight")
    },
	
    // margin

    setMargin: function(aNumber) {
        this.setCssAttribute("margin", aNumber + "px")
        return this
    },

    margin: function() {
        return this.getCssAttribute("margin")
    },

    setMarginLeft: function(aNumber) {
        this.setCssAttribute("margin-left", aNumber + "px")
        return this
    },
	
    setMarginRight: function(aNumber) {
        this.setCssAttribute("margin-right", aNumber + "px")
        return this
    },

    setMarginTop: function(aNumber) {
        this.setCssAttribute("margin-top", aNumber + "px")
        return this
    },
	
    setMarginBottom: function(aNumber) {
        this.setCssAttribute("margin-bottom", aNumber + "px")
        return this
    },

    // padding left

    setPadding: function(aNumber) {
        this.setCssAttribute("padding", aNumber + "px")
        return this
    },

    setPaddingRight: function(aNumber) {
        this.setCssAttribute("padding-right", aNumber + "px")
        return this
    },
	
    setPaddingLeft: function(aNumber) {
        this.setCssAttribute("padding-left", aNumber + "px")
        return this
    },

    setPaddingTop: function(aNumber) {
        this.setCssAttribute("padding-top", aNumber + "px")
        return this
    },

    setPaddingBottom: function(aNumber) {
        this.setCssAttribute("padding-bottom", aNumber + "px")
        return this
    },

    paddingLeft: function() {
        return this.getCssAttribute("padding-left").before("px")
    },

    // padding right
	
    setPaddingRight: function(aNumber) {
        this.setCssAttribute("padding-right", aNumber + "px")
        return this
    },

    paddingRight: function() {
        return this.getCssAttribute("padding-right").before("px")
    },

    // text align

    setTextAlign: function(s) {
        this.setCssAttribute("text-align", s)
        return this
    },

    textAlign: function() {
        return this.getCssAttribute("text-align")
    },

    // background color
	
    setBackgroundColor: function(v) {
        this.setCssAttribute("background-color", v)
        return this
    },

    backgroundColor: function() {
        return this.getCssAttribute("background-color")
    },
	
    // background image
	
    setBackgroundImage: function(v) {
        this.setCssAttribute("background-image", v)
        return this
    },

    backgroundImage: function() {
        return this.getCssAttribute("background-image")
    },
	
    setBackgroundImageUrlPath: function(path) {
        this.setBackgroundImage("url(\"" + path + "\)")
        return this
    },

    // background size
    
    setBackgroundSizeWH: function(x, y) {
        this.setCssAttribute("background-size", x + "px " + y + "px")
        return this
    },
	
    setBackgroundSize: function(s) {
	    assert(typeof(s) == "string")
        this.setCssAttribute("background-size", s)
        return this
    },
	
    makeBackgroundCover: function() {
	    this.setBackgroundSize("cover")
	    return this
    },
	
    makeBackgroundContain: function() {
	    this.setBackgroundSize("contain")
	    return this
    },
	
    // background repeat
	
    makeBackgroundNoRepeat: function() {
	    this.setBackgroundRepeat("no-repeat")
        return this
    },


    setBackgroundRepeat: function(s) {
	    assert(typeof(s) == "string")
        this.setCssAttribute("background-repeat", s)
        return this
    },

    backgroundRepeat: function() {
        return this.getCssAttribute("background-repeat")
    },
	
    // background position
	
    makeBackgroundCentered: function() {
        this.setBackgroundPosition("center")
        return this
    },
	
    setBackgroundPosition: function(s) {
        this.setCssAttribute("background-position", s)
        return this
    },
	
    backgroundPosition: function() {
        return this.getCssAttribute("background-position")
    },

    // icons - TODO: find a better place for this
	
    pathForIconName: function(aName) { 
        return "icons/" + aName + ".svg"
    },    
	
    // transition
	
    setTransition: function(s) {
        this.setCssAttribute("transition", s)
		
        if (this._transitions) {
            this.transitions().syncFromDiv()
        }
		
        return this
    },	
	
    transition: function() {
        return this.getCssAttribute("transition")
    },	

    // transitions
	
    transitions: function() {
        if (this._transitions == null) {
            this._transitions = DivTransitions.clone().setDivView(this).syncFromDiv()
        }
        return this._transitions
    },

    // opacity

    setOpacity: function(v) {
        this.setCssAttribute("opacity", v)
        return this
    },
	
    opacity: function() {
        return this.getCssAttribute("opacity")
    },

    // z index 
	
    setZIndex: function(v) {
        this.setCssAttribute("z-index", v)
        return this
    },
	
    zIndex: function() {
        return this.getCssAttribute("z-index")
    },

    // cursor 
	
    setCursor: function(s) {
        this.setCssAttribute("cursor", s)
        return this
    },

    cursor: function() {
        return this.getCssAttribute("cursor")
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
        if (!this.isActiveElement()) {
    	    
    	    //console.log(this.typeId() + ".focus() " + document.activeElement._divView)
    	    
            setTimeout( () => {
                this.element().focus()
                //console.log(this.typeId() + " did refocus after 0 timeout? " + this.isActiveElement())
            }, 0)
        }
        return this
    },
    
    focusAfterDelay: function(seconds) {
        setTimeout( () => {
            this.element().focus()
        }, seconds*1000)
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
        this.setCssAttribute("top", v)
        //console.log("setTop " + v)
        return this
    },

    top: function() {
        var v = this.getCssAttribute("top")
        if (v.length) {
            return v.before("px")
        }
        return 0
    },
	
    // left

    setLeft: function (aNumber) {
        var s = aNumber + "px"
        this.setCssAttribute("left", s)
        return this
    },

    left: function() {
        var s = this.getCssAttribute("left")
        if (s.length) {
            return Number(s.before("px"))
        }
        return 0
    },
	
    // right
	
    setRight: function (aNumber) {
        var s = aNumber + "px"
        this.setCssAttribute("right", s)
        return this
    },

    right: function() {
        var s = this.getCssAttribute("right")
        if (s.length) {
            return s.before("px")
        }
        return 0
    },	
	
    // bottom
	
    setBottom: function (aNumber) {
        var s = aNumber + "px"
        this.setCssAttribute("bottom", s)
        return this
    },

    bottom: function() {
        var s = this.getCssAttribute("bottom")
        if (s.length) {
            return s.before("px")
        }
        return 0
    },	
	
    // float
	
    setFloat: function(s) {
        this.setCssAttribute("float", s)
        return this
    },
	
    float: function() {
        return this.getCssAttribute("float")
    },
	
    // border 
	
    setBorder: function(s) {
        this.setCssAttribute("border", s)
        return this
    },
	
    border: function() {
        return this.getCssAttribute("border")
    },
	
    // border top
	
    setBorderTop: function(s) {
        this.setCssAttribute("border-top", s)
        return this
    },
	
    borderTop: function() {
        return this.getCssAttribute("border-top")
    },
	
    // border bottom

    setBorderBottom: function(s) {
        this.setCssAttribute("border-bottom", s)
        return this
    },
	
    borderBottom: function() {
        return this.getCssAttribute("border-bottom")
    },
	
    // border left

    setBorderLeft: function(s) {
	    //console.log(this.typeId() + " border-left set '", s, "'")
        this.setCssAttribute("border-left", s)
        return this
    },
	
    borderLeft: function() {
        return this.getCssAttribute("border-left")
    },

    // border right

    setBorderRight: function(s) {
        this.setCssAttribute("border-right", s)
        return this
    },

    borderRight: function() {
        return this.getCssAttribute("border-right")
    },
		
    // border radius
	
    setBorderRadius: function(s) {
        this.setCssAttribute("border-radius", s)
	    return this
    },
	
    borderRadius: function() {
        return this.getCssAttribute("border-radius")
    },
    
    // alignment
	
    setTextAlign: function(s) {
        this.setCssAttribute("text-align", s)
        return this		
    },
	
    textAlign: function() {
        return this.getCssAttribute("text-align")
    },	
	
    // flex grow
	
    setFlexGrow: function(v) {
        this.setCssAttribute("flex-grow", v)
        return this
    },

    flexGrow: function() {
        return this.getCssAttribute("flex-grow")
    },
	
    // flex shrink

    setFlexShrink: function(v) {
        this.setCssAttribute("flex-shrink", v)
        return this
    },

    flexShrink: function() {
        return this.getCssAttribute("flex-shrink")
    },
	
    // flex basis
	
    setFlexBasis: function(v) {
        this.setCssAttribute("flex-basis", v)
        return this
    },

    flexBasis: function() {
        return this.getCssAttribute("flex-basis")
    },
			
    // color
	
    setColor: function(v) {
        this.setCssAttribute("color", v)
        return this
    },
    
    color: function() {
        return this.getCssAttribute("color")
    },
    
    // filters

    setFilter: function(s) {
        this.setCssAttribute("filter", s)
        return this
    },
    
    filter: function() {
        return this.getCssAttribute("filter")
    },    
    
    // visibility
    
    setIsVisible: function(aBool) {
        var v = aBool ? "visible" : "hidden"
        this.setCssAttribute("visibility", v)
        return this
    },

    isVisible: function() {
        return this.getCssAttribute("visibility") != "hidden";
    },
    
    // display

    setDisplay: function(s) {
        //assert(s in { "none", ...} );
        this.setCssAttribute("display", s)
        return this
    },
    
    display: function() {
        return this.getCssAttribute("display")
    },
	
    // white space
	
    setWhiteSpace: function(s) {
        this.setCssAttribute("white-space", s)
        return this
    },
    
    whiteSpace: function() {
        return this.getCssAttribute("white-space")
    },
	
    // over flow
	
    setOverflow: function(s) {
        this.setCssAttribute("overflow", s)
        return this
    },
    
    overflow: function() {
        return this.getCssAttribute("overflow")
    },
	
    // text over flow
	
    setTextOverflow: function(s) {
        this.setCssAttribute("text-overflow", s)
        return this
    },
    
    textOverflow: function() {
        return this.getCssAttribute("text-overflow")
    },
	
    // user select
	
    userSelectKeys: function() {
        return [
            "-moz-user-select", 
            "-khtml-user-select", 
            "-webkit-user-select", 
            "-o-user-select"
        ]
    },

    userSelect: function() {
        var style = this.cssStyle()
        var result = this.userSelectKeys().detect(key => style[key])
        result = result || style.userSelect
        return result 
    },
	
    turnOffUserSelect: function() {
        this.setUserSelect("none");
        return this
    },

    turnOnUserSelect: function() {
        this.setUserSelect("text")
        return this
    },
	
    // user selection 
	
    setUserSelect: function(aString) {
        var style = this.cssStyle()
        //console.log("'" + aString + "' this.userSelect() = '" + this.userSelect() + "' == ", this.userSelect() == aString)
        if (this.userSelect() != aString) {
            style.userSelect = aString
            this.userSelectKeys().forEach(key => style[key] = aString)
        }
        return this
    },
	
    // spell check
	
    setSpellCheck: function(aBool) {
        this.element().setAttribute("spellcheck", aBool);
        return this
    },
	
    // tool tip
	
    setToolTip: function(aName) {	
        if (aName) {	
            this.element().setAttribute("title", aName);
        } else {
            this.element().removeAttribute("title");
        }
        return this
    },
	
    // width and height
	
    calcWidth: function() {
        return DivTextTapeMeasure.widthOfDivClassWithText(this.divClassName(), this.innerHTML())
    },
	
    setWidth: function(s) {
	    assert(typeof(s) == "string")
	    this.setCssAttribute("width", s, () => { this.didChangeWidth() })
	    return this
    },
	
    setWidthPercentage: function(aNumber) {
	    assert(typeof(aNumber) == "number")
        var newValue = aNumber + "%"
	    this.setCssAttribute("width", newValue, () => { this.didChangeWidth() })
	    return this
    },

    /*
    hideScrollbar: function() {
        // need to do JS equivalent of: .class::-webkit-scrollbar { display: none; }
	    // this.setCssAttribute("-webkit-scrollbar", { display: "none" }) // doesn't work
	    return this
    },
    */
    
    // clientX - includes padding but not scrollbar, border, or margin
        
    clientWidth: function() {
        return this.element().clientWidth
    },
    
    clientHeight: function() {
        return this.element().clientHeight
    },
    
    // offsetX - includes borders, padding, scrollbar 
    
    offsetWidth: function() {
        return this.element().offsetWidth
    },
    
    offsetHeight: function() { 
        return this.element().offsetHeight
    },
    
    // width
    
    minWidth: function() {
        var s = this.getCssAttribute("min-width")
        assert(s.includes("px"))
        var w = Number(s.replace("px", ""))
        return w
    },

    maxWidth: function() {
        var w = this.getCssAttribute("max-width")
        if (w == "") {
            return null
        }
        assert(w.includes("px"))
        w = Number(w.replace("px", ""))
        return w
    },

    cssStyle: function() {
        return this.element().style
    },

    setMinWidth: function(v) {
        var type = typeof(v)
        var newValue = null
        if (v == null) {
            newValue = null //""
        } else if (type == "string") {
	        newValue = v 
        } else if (type == "number") {
	        newValue = v + "px"
        } else {
            throw new Error(type + " is invalid argument type")
        }
		
        this.setCssAttribute("min-width", newValue, () => { this.didChangeWidth() })

        return this        
    },

    didChangeWidth: function() {
    },
	
    didChangeHeight: function() {	
    },

    setMaxWidth: function(v) {
        if (v == this._maxWidth) {
            return this
        }
		
        var type = typeof(v)
        var newValue = null
        if (v == null) {
            newValue = ""
        } else if (type == "string") {
	        newValue = v 
        } else if (type == "number") {
	        newValue = v + "px"
        } else {
            throw new Error(type + " is invalid argument type")
        }
        this._maxWidth = newValue

        this.setCssAttribute("max-width", newValue, () => { this.didChangeWidth() })
				
        return this        
    },

    setMinAndMaxWidth: function(v) {
        //console.log(this.type() + " setMinAndMaxWidth ", v)
        //StackTrace.showCurrentStack()
        this.setMinWidth(v)
        this.setMaxWidth(v)
        return this        
    },

    setMinAndMaxHeight: function(aNumber) {
        assert(typeof(aNumber) == "number")
        var newValue = aNumber + "px"
        this.setCssAttribute("min-height", newValue, () => { this.didChangeHeight() })
        this.setCssAttribute("max-height", newValue, () => { this.didChangeHeight() })
        return this		
    },

    setMinAndMaxHeightPercentage: function(aNumber) {
        assert(typeof(aNumber) == "number")
        var newValue = aNumber + "%"
        this.setCssAttribute("min-height", newValue, () => { this.didChangeHeight() })
        this.setCssAttribute("max-height", newValue, () => { this.didChangeHeight() })
        return this		
    },
	
    setHeightPercentage: function(aNumber) {
        assert(typeof(aNumber) == "number")
        var newValue = aNumber + "%"
        this.setCssAttribute("height", newValue, () => { this.didChangeHeight() })
        return this		
    },
	
    setMinHeight: function(newValue) {
        this.setCssAttribute("min-height", newValue, () => { this.didChangeHeight() })
        return this		
    },
	
    setMaxHeight: function(newValue) {
        this.setCssAttribute("max-height", newValue, () => { this.didChangeHeight() })
        return this		
    },

    setHeight: function(newValue) {
        this.setCssAttribute("height", newValue, () => { this.didChangeHeight() })
        return this		
    },	
	
    height: function() {
        return this.getCssAttribute("height")
    },
	
    // --- div class name ---

    setDivClassName: function (aName) {
        if (this._divClassName != aName) {
	        this._divClassName = aName
	        if (this.element()) {
	            this.element().setAttribute("class", aName);
	        }
        }
        return this
    },

    divClassName: function () {
        if (this.element()) {
            var className = this.element().getAttribute("class");
            this._divClassName = className
            return className
        }
        return this._divClassName
    },

    // --- subviews ---

    addSubview: function(anSubview) {
        if (anSubview == null) {
            throw new Error("anSubview can't be null")
        }
        
        this._subviews.append(anSubview)
        
        if (anSubview.element() == null) {
            //console.log("anSubview = ", anSubview)
            throw new Error("null anSubview.element()")
        }
        this.element().appendChild(anSubview.element());
        anSubview.setParentView(this)
        this.didChangeSubviewList()
        return anSubview
    },
    
    addSubviews: function(someSubviews) {
        someSubviews.forEach(subview => this.addSubview(subview))
        return this
    },
    
    atInsertSubview: function (anIndex, anSubview) {
        this.subviews().atInsert(anIndex, anSubview)
        DomElement_atInsertElement(this.element(), anIndex, anSubview.element())
        return anSubview
    },

    // --- subview utilities ---
    
    sumOfSubviewHeights: function() {
        return this.subviews().sum(subview => subview.clientHeight())
    },

    performOnSubviewsExcept: function(methodName, exceptedSubview) {
        this.subviews().forEach(subview => {
            if (subview != exceptedSubview) {
                subview[methodName].apply(subview)
            }
        })

        return this
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
	
    removeFromParentView: function() {
        this.parentView().removeSubview(this)
        return this
    },
    
    removeAfterFadeDelay: function(delayInSeconds) {
        // call removeSubview for a direct actions
        // use justRemoteSubview for internal changes
        
        this.setTransition("all " + delayInSeconds + "s")
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
	
    hasSubview: function(aSubview) {
        return this.subviews().indexOf(aSubview) != -1
    },
	
    hasChildElement: function(anElement) {
        var children = this.element().childNodes
        for (var i = 0; i < children.length; i ++) {
            var child = children[i]
            if (anElement === child) {
                return true
            }
        }
        return false		
    },
	
    removeSubview: function (anSubview) {
        //console.warn("WARNING: " + this.type() + " removeSubview " + anSubview.type())

        if (!this.hasSubview(anSubview)) {
            console.warn(this.type() + " removeSubview " + anSubview.type() + " failed - no child found!")
            StackTrace.showCurrentStack()
            return anSubview
        }
		
        anSubview.willRemove()
        this._subviews.remove(anSubview)

        if (this.hasChildElement(anSubview.element())) {
        	this.element().removeChild(anSubview.element());
        }

        if (this.hasChildElement(anSubview.element())) {
            console.warn("WARNING: " + this.type() + " removeSubview " + anSubview.type() + " failed - still has element after remove")
            StackTrace.showCurrentStack()
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
        return document.activeElement == this.element() 
    },
	
    isActiveElementAndEditable: function() {
        return this.isActiveElement() && this.contentEditable()
    },
	
    // --- inner html ---

    setInnerHTML: function(v) {
        if (v == null) { 
            v = "" 
        }
		
        v = "" + v
		
        if (v == this.element().innerHTML) {
            return this
        }

        var isFocused = this.isActiveElementAndEditable()
        
        if (isFocused) {
            this.blur()
        }
        
        this.element().innerHTML = v
            
        if (isFocused) {
            this.focus()
        }

	    return this
    },

    innerHTML: function() {
        return this.element().innerHTML
    },

    setString: function (v) {
        return this.setInnerHTML(v)
    },
    
    loremIpsum: function (maxWordCount) {
        this.setInnerHTML("".loremIpsum(10, 40))
        return this
    },

    // --- updates ---

    tellParentViews: function(msg, aView) {
        var f = this[msg]
        if (f && f.apply(this, [aView])) {
            return // stop propogation
        }

        var p = this.parentView()
        if (p) {
            p.tellParentViews(msg, aView)
        }
    },

    // --- events --------------------------------------------------------------------
    
    // globally track whether we are inside an event 

    setIsHandlingEvent: function() {
        DivView._isHandlingEvent = true
        return this
    },
	
    isHandlingEvent: function() {
        return DivView._isHandlingEvent
    },

    handleEventFunction: function(eventFunc) {
        //  a try gaurd to make sure isHandlingEvent has correct value
        //  isHandlingEvent is used to determine if view should inform node of changes
        //  - it should only while handling an event
		
        var error = null
		
        this.setIsHandlingEvent(true)
		
        try {
            eventFunc()
        } catch (e) {
            //console.log(e)
            StackTrace.showError(e)
            //error = e
        }
		
        this.setIsHandlingEvent(false)
		
        if (error) {
            throw error
        }
    },
	
    // --- window resize events ---
	
    windowResizeListenerFunc: function() {
        if (!this._windowResizeListenerFunc) { // so callback is unique to this div        
            this._windowResizeListenerFunc = (event) => { this.onWindowResize(event) }
        }
        return this._windowResizeListenerFunc	
    },
	
    setIsRegisterForWindowResize: function(aBool) {        
        if (aBool) {
            if (this._isRegisteredForWindowResize == false) {
                this._isRegisteredForWindowResize = true
            	window.addEventListener("resize", this.windowResizeListenerFunc(), false);
            }
        } else {
            if (this._isRegisteredForWindowResize == true) {
                this._isRegisteredForWindowResize = false
	            window.removeEventListener("resize", this.windowResizeListenerFunc());
            }
        }
        
        return this
    },
    
    onWindowResize: function(event) {
        //console.log("onWindowResize")
        //var r = document.body.getBoundingClientRect()
        //console.log("onResize ")
        //console.log("onResize " + r.width + " x " + r.right)
        //console.log("onResize " + window.innerWidth + " x " + window.innerHeight)
        //console.log("onResize " + document.body.clientHeight + " x " + document.body.clientHeight)        
    },
	
    // --- onClick event, target & action ---
    
    setIsRegisteredForClicks: function (aBool) {
        if (aBool) {
            if (this._isRegisteredForClicks == false) {
                this._isRegisteredForClicks = true
	            this.element().onclick =  (event) =>{ 
                    this.handleEventFunction( () => { this.onClick(event) })
                }
	            //this.element().ondblclick = function (event) { this.onDoubleClick(event) }
                this.makeCursorPointer()
            }
        } else {
            if (this._isRegisteredForClicks == true) {
                this._isRegisteredForClicks = false
	            this.element().onclick = null
	            //this.element().ondbclick = null
                this.makeCursorDefault()
            }
        }
        return this
    },
    
    hasTargetAndAction: function() {
        return (this.target() != null) && (this.action() != null)
    },
    
    setTarget: function(anObject) {
        this._target = anObject
        this.setIsRegisteredForClicks(this.hasTargetAndAction())    
        return this
    },
    
    setAction: function (anActionString) {
        this._action = anActionString
        this.setIsRegisteredForClicks(this.hasTargetAndAction())
        return this       
    },
    
    onClick: function(event) {
        this.sendActionToTarget()
        event.stopPropagation()
        return this
    },
    
    sendActionToTarget: function() {
        if (!this.action()) {
            return null
        }

        var t = this.target()
        if (!t) {
            throw new Error("no target for action " + this.action())
        }
        
        var method = t[this.action()]
        if (!method) {
            throw new Error("no target for action " + this.action())
        }

        return method.apply(t, [this])
    },
    
    onDoubleClick: function (event) {
        return this
    },
    
    // drag & drop
    
    setIsRegisteredForDrop: function (aBool) {
        if (aBool) {
            if (this._isRegisteredForDrop == false) {
                this._isRegisteredForDrop = true
	            this.element().ondragstart  = (event) => { return this.onDragStart(event) }
	            this.element().ondragover  =  (event) => { return this.onDragOver(event) }
	            this.element().ondragenter  = (event) => { return this.onDragEnter(event) }
	            this.element().ondragleave =  (event) => { return this.onDragLeave(event) }
	            this.element().ondragend   =  (event) => { return this.onDragEnd(event) }
	            this.element().ondrop      =  (event) => { return this.onDrop(event) }
            }
        } else {
            if (this._isRegisteredForDrop == true) {
                this._isRegisteredForDrop = false
				
                /*
				var preventFunc = (event) => { 
					if(event.preventDefault) { 
						event.preventDefault(); 
					}
					event.returnValue = false; 
					return false 
				}
				*/
				
	            this.element().ondragstart = null
	            this.element().ondragover  = null
	            this.element().ondragenter = null
	            this.element().ondragleave = null
	            this.element().ondragend   = null
	            this.element().ondrop      = null
            }
        }
        return this
    },   
    
    acceptsDrop: function() {
        return true
    },    
        
    onDragStart: function (event) {
        return true;
    },
	
    onDragEnter: function (event) { // needed?
        if (this.acceptsDrop()) {
            this.onDragOverAccept(event)
            event.preventDefault()
            return true
        }

        return false;
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
        if (this.acceptsDrop()) {
            //var file = event.dataTransfer.files[0];
            //console.log('onDrop ' + file.path);
            this.onDataTransfer(event.dataTransfer)
            this.dragUnhighlight()
            event.preventDefault();
            return true;
        }
        return false
    },
   
    onDataTransfer: function(dataTransfer) {     
        //console.log('onDataTransfer ', dataTransfer);
        
        if (dataTransfer.files.length) {   
            var dataUrls = []
            for (var i = 0; i < dataTransfer.files.length; i ++) {
                var file = dataTransfer.files[i]
                //console.log("file: ", file)
                
                if (!file.type.match("image.*")) {
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
        console.log("onDropImageDataUrl: ", dataUrl);
        //this.node().onDropFiles(filePaths)
    },
    
    onDropFiles: function(filePaths) {
        console.log("onDropFiles " + filePaths);
        //this.node().onDropFiles(filePaths)
    },
    
    // --- editing - abstracted from content editable for use in non text views ---
    
    setIsEditable: function(aBool) {
        // subclasses can override for non text editing behaviors e.g. a checkbox, toggle switch, etc
        this.setContentEditable(aBool)
        return this
    },
    
    isEditable: function() {
        return this.isContentEditable()
    },
    
    // --- content editing ---
    
    setContentEditable: function (aBool) {
        //console.log(this.divClassName() + " setContentEditable(" + aBool + ")")
        if (aBool) {
        	this.makeCursorText()
            //this.element().ondblclick =  (event) => { this.selectAll();	}
        } else {
            this.element().ondblclick = null
        }

        this.element().contentEditable = aBool ? "true" : "false"
        
        if (this.showsHaloWhenEditable()) {
            this.setCssAttribute("box-shadow", aBool ? "0px 0px 5px #ddd" : "none")
        }
        this.setIsRegisteredForKeyboard(aBool)
        
        if (aBool) {
            this.turnOnUserSelect()
        } 

        this.setIsRegisteredForPaste(aBool)

        return this
    },
    
    isContentEditable: function() {
        return this.element().contentEditable
    },

    contentEditable: function() {
        return this.element().contentEditable == "true"
    },
	
    // touch events

    touchstartListenerFunc: function () {
        if (!this._touchstartListenerFunc) {
            this._touchstartListenerFunc = (e) => { this.onTouchStart(e) }
        }
        return this._touchstartListenerFunc
    },

    touchmoveListenerFunc: function () {
        if (!this._touchmoveListenerFunc) {
            this._touchmoveListenerFunc = (e) => { this.onTouchMove(e) }
        }
        return this._touchmoveListenerFunc
    },

    touchcancelListenerFunc: function () {
        if (!this._touchcancelListenerFunc) {
            this._touchcancelListenerFunc = (e) => { this.onTouchCancel(e) }
        }
        return this._touchcancelListenerFunc
    },

    touchendListenerFunc: function () {
        if (!this._touchendListenerFunc) {
            this._touchendListenerFunc = (e) => { this.onTouchEnd(e) }
        }
        return this._touchendListenerFunc
    },
    
    setIsRegisteredForTouch: function(aBool) {
        if (aBool) {
            if (this._isRegisteredForPaste == false) {
                this._isRegisteredForPaste = true
                //var b = Modernizr.passiveeventlisteners ? {passive: true} : false
                var b = { passive: true}
	        	this.element().addEventListener("touchstart",  this.touchstartListenerFunc(), b);
	        	this.element().addEventListener("touchmove",   this.touchmoveListenerFunc(), b);
	        	this.element().addEventListener("touchcancel", this.touchcancelListenerFunc(), b);
	        	this.element().addEventListener("touchend",    this.touchendListenerFunc(), b);
            }
        } else {
            if (this._isRegisteredForPaste == true) {
                this._isRegisteredForPaste = false
	        	this.element().removeEventListener("touchstart",  this.touchstartListenerFunc());
	        	this.element().removeEventListener("touchmove",   this.touchmoveListenerFunc());
	        	this.element().removeEventListener("touchcancel", this.touchcancelListenerFunc());
	        	this.element().removeEventListener("touchend",    this.touchendListenerFunc());
            }
        }
        return this
    },

    touchDownDiffWithEvent: function(event) {
        assert(this._onTouchDownEventPosition) 

        var thisTouch = event.changedTouches[0]
        var lastTouch = this._onTouchDownEventPosition
        var d = {} 
        d.xd = thisTouch.screenX - lastTouch.screenX
        d.yd = thisTouch.screenY - lastTouch.screenY
        d.dist = Math.sqrt(d.xd*d.xd + d.yd*d.yd)
        return d
    },

    onTouchStart: function(event) {
        this._isTouchDown = true
        var touches = event.changedTouches
        //console.log(this.type() + " onTouchStart ", touches)
        this._onTouchDownEventPosition = { screenX: touches[0].screenX, screenY: touches[0].screenY }
        //console.log(this.type() + " onTouchStart  this._onTouchDownEventPosition ", this._onTouchDownEventPosition)
    },
	
    onTouchMove: function(event) {
        //console.log(this.type() + " onTouchMove diff ", JSON.stringify(this.touchDownDiffWithEvent(event)))
    },
	
    onTouchCancel: function(event) {
        //console.log(this.type() + " onTouchCancel")
        this._isTouchDown = false
    },
	
    onTouchEnd: function(event) {
        //console.log(this.type() + " onTouchEnd diff ", JSON.stringify(this.touchDownDiffWithEvent(event)))
        if (this._isTouchDown) {

	        this._isTouchDown = false
        }
    },	

    
    // mouse events
    
    setIsRegisteredForMouse: function (aBool) {
        if (aBool) {
            if (this._isRegisteredForMouse == false) {
                this._isRegisteredForMouse = true
	            this.element().onmousedown  =  (event) => { return this.onMouseDown(event) }
	            this.element().onmousemove  =  (event) => { return this.onMouseMove(event) }
	            this.element().onmouseout   =  (event) => { return this.onMouseOut(event) }
	            this.element().onmouseover  =  (event) => { return this.onMouseOver(event) }
	            this.element().onmouseup    =  (event) => { return this.onMouseUp(event) }
	            
	            this.element().onmouseenter =  (event) => { return this.onMouseEnter(event) }
	            this.element().onmouseleave =  (event) => { return this.onMouseLeave(event) }

            }
        } else {
            if (this._isRegisteredForMouse == true) {
                this._isRegisteredForMouse = false
	            this.element().onmousedown  = null
	            this.element().onmousemove  = null
	            this.element().onmouseout   = null
	            this.element().onmouseover  = null
	            this.element().onmouseup    = null

	            this.element().onmouseenter = null
	            this.element().onmouseleave = null

            }
        }
        return this
    },    
    
    onMouseDown: function (event) {
        //console.log(this.typeId() + ".onMouseDown()")
        this._isMouseDown = true
        this._onMouseDownEventPosition = { x: event.clientX, y: event.clientY }
        event.stopPropagation()
    },
    
    mouseDownDiffWithEvent: function(event) {
        assert(this._onMouseDownEventPosition) 
        this._onMouseUpEventPosition = { x: event.clientX, y: event.clientY }
        
        var p1 = this._onMouseDownEventPosition
        var p2 = this._onMouseUpEventPosition
        
        var d = {} 
        d.xd = p1.x - p2.x
        d.yd = p1.y - p2.y
        d.dist = Math.sqrt(d.xd*d.xd + d.yd*d.yd)
        
        return d
    },
    
    isMouseDown: function () {
        return this._isMouseDown
    },
    
    onMouseMove: function (event) {
	    /*
        if (this.isMouseDown()) {
            var diff = this.mouseDownDiffWithEvent(event)
            console.log("onMouseMove:" + JSON.stringify(diff))
        }
		*/
    },
    
    onMouseOut: function (event) {
        //console.log("onMouseOut")
    },
    
    onMouseOver: function (event) {
    },

    onMouseUp: function (event) {
        //console.log(this.typeId() + ".onMouseUp()")
        this._isMouseDown = false
        var diff = this.mouseDownDiffWithEvent(this._onMouseDownEventPosition) 
        this._onMouseDownEventPosition = null 
        event.stopPropagation()
    },
        
    // --- keyboard events ---
    
    setIsRegisteredForKeyboard: function (aBool) {
        if (aBool) {
            if (this._isRegisteredForKeyboard == false) {
                this._isRegisteredForKeyboard = true
	            /*
	            this.element().onkeydown  =  (event) => {       
	                return this.onKeyDown(event) 
	            }

	            this.element().onkeypress =  (event) => { return this.onKeyPress(event) }
	            */
	            this.element().onkeyup    =  (event) => { 
	                //this._onkeyupInnerHTML = this.element().innerHTML // THIS NEEDS TO BE HERE OR DOM innerHTML ISN'T CONSISTENT?
	                //console.log("onkeyup [" + this.element().innerHTML  + "]")
	                return this.onKeyUp(event) 
	            }
	            DivView._tabCount ++
	            this.element().tabIndex   = DivView._tabCount
                this.setCssAttribute("outline", "none")
            }
        } else {
            if (this._isRegisteredForKeyboard == true) {
                this._isRegisteredForKeyboard = false
	            this.element().onkeydown  = null
	            this.element().onkeypress = null
	            this.element().onkeyup    = null
	            delete this.element().tabindex 
            }
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
            this.element().parentElement.focus()
        }
		
        /*
		if (this.interceptsTab()) {
	        if (event.keyId == "tab") {
		        event.preventDefault()
	            this.onTabKeyDown()
	        }
		}
		*/    
		
        // onEnterKeyDown onLeftArrowKeyUp
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
		
        var shouldPropogate = true
        event.specialKeyName = this.specialNameForKeyEvent(event)
        //		console.log(this.type() + " onKeyUp event.specialKeyName=", event.specialKeyName)

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
		    // onEnterKeyUp onLeftArrowKeyUp
            var name = "on" + event.specialKeyName.capitalized() + "KeyUp"
            if (this[name]) {
                shouldPropogate = this[name].apply(this, [event])
		        event.preventDefault()
                //console.log("shouldPropogate = ", shouldPropogate)
            }
        }
        
        this.didEdit()
        return shouldPropogate
    },
    
    
    didEdit: function() {
        this.tellParentViews("onDidEdit", this)
        return this
    },
    
    onEnterKeyUp: function() {
        return this
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
    
    setIsRegisteredForFocus: function(aBool) {
        if (aBool) {
            if (this._isRegisteredForFocus == false) {
                this._isRegisteredForFocus = true
                //console.log(this.type() + " setIsRegisteredForFocus(" + aBool + ")")
	            this.element().onfocus = () => { this.willAcceptFirstResponder(); this.onFocus() };
	            this.element().onblur  = () => { this.didReleaseFirstResponder(); this.onBlur() };
            }
        } else {
            if (this._isRegisteredForFocus == true) {
                this._isRegisteredForFocus = false
                this.element().onfocus = null
                this.element().onblur = null
            }
        }
        return this
    },
    
    willAcceptFirstResponder: function() {
	    //console.log(this.type() + ".willAcceptFirstResponder()")
        return this
    },
    
    didReleaseFirstResponder: function() {
        // called on focus event from browser
        return this
    },
	
    // firstResponder
	
    willBecomeFirstResponder: function() {
        // called if becomeFirstResponder accepts
    },
	
    becomeFirstResponder: function() {
	    if (this.acceptsFirstResponder()) {
	        this.willBecomeFirstResponder()
	        this.focus()
	    } else if (this.parentView()) {
	        this.parentView().becomeFirstResponder()
	    }
	    return this
    },
	
    releaseFirstResponder: function() {
	    // walk up parent view chain and focus on the first view to 
	    // answer true for the acceptsFirstResponder message
	    //console.log(this.type() + ".releaseFirstResponder()")
	    
	    this.blur()
	    if (this.parentView()) {
	        this.parentView().becomeFirstResponder()
	    }
	    return this
    },
	
    // --------------------------------------------------------

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
    
    innerText: function() {
        var e = this.element()
	    return e.textContent || e.innerText || "";		
    },
    
    // --- set caret ----
    
    moveCaretToEnd: function() {
        var contentEditableElement = this.element()
        var range, selection;
        
        if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }
        else if(document.selection)//IE 8 and lower
        { 
            range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            range.select();//Select the range (make it the visible selection
        }
        return this
    },

    // --- text selection ------------------
    
    selectAll: function() {
        if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(this.element());
            range.select();
        } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(this.element());
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
    },
	
    // --- paste from clipboard ---

    paste: function (e) {
        // prevent pasting text by default after event
        e.preventDefault(); 

        var clipboardData = e.clipboardData;
        var rDataHTML = clipboardData.getData("text/html");
        var rDataPText = clipboardData.getData("text/plain");

        var htmlToPlainTextFunc = function (html) {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
        }

        if (rDataHTML && rDataHTML.trim().length != 0) {
            this.replaceSelectedText(htmlToPlainTextFunc(rDataHTML))
            return false; // prevent returning text in clipboard
        }

        if (rDataPText && rDataPText.trim().length != 0) {
            this.replaceSelectedText(htmlToPlainTextFunc(rDataPText))
            return false; // prevent returning text in clipboard
        }
    },
    
    pasteListenerFunc: function () {
        if (!this._pasteListenerFunc) {
            this._pasteListenerFunc = (e) => { this.paste(e) }
        }
        return this._pasteListenerFunc
    },
    
    setIsRegisteredForPaste: function(aBool) {
        if (aBool) {
            if (this._isRegisteredForPaste == false) {
                this._isRegisteredForPaste = true
	        	this.element().addEventListener("paste", this.pasteListenerFunc(), false);
            }
        } else {
            if (this._isRegisteredForPaste == true) {
                this._isRegisteredForPaste = false
	        	this.element().removeEventListener("paste", this.pasteListenerFunc());
            }
        }
        return this
    },

    replaceSelectedText: function(replacementText) {
        var range;
        if (window.getSelection) {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(replacementText));
            }
            

            console.log("inserted node")
        } else if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            range.text = replacementText;
            console.log("set range.text")
        }

        if (range) {
            // now move the selection to just the end of the range
            range.setStart(range.endContainer, range.endOffset);
        }
        
        return this
    },

    /*
    // untested

    setCaretPosition: function(caretPos) {
        var elem = this.element();

        if(elem != null) {
            if(elem.createTextRange) {
                var range = elem.createTextRange();
                range.move("character", caretPos);
                range.select();
            }
            else {
                if(elem.selectionStart) {
                    elem.focus();
                    elem.setSelectionRange(caretPos, caretPos);
                } else {
                    elem.focus();
                }
            }
        }
    },
    */
    
    clearSelection: function() {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
        return this
    },
    
    setContentAfterOrBeforeString: function(aString, afterOrBefore) {
        var uniqueClassName = "UniqueClass_" + this._uniqueId
        var e = this.element()
        if (e.className.indexOf(uniqueClassName) == -1) {
            var newRuleKey = "DivView" + uniqueClassName + ":" + afterOrBefore
            var newRuleValue = "content: \"" + aString + "\;"
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
    
    // scroll top
    
    setScrollTop: function(v) {
        this.element().scrollTop = v
        return this
    },

    scrollTop: function() {
        return this.element().scrollTop
    },
    
    // scroll width & scroll height
  
    scrollWidth: function() {
        return this.element().scrollWidth // a read-only value
    },
      
    scrollHeight: function() {
        return this.element().scrollHeight // a read-only value
    },
    
    // offset width & offset height
    
    offsetLeft: function() {
        return this.element().offsetLeft // a read-only value
    },
      
    offsetTop: function() {
        return this.element().offsetTop // a read-only value
    },        
    
    // scroll actions
    
    scrollToTop: function() {
        console.log("]]]]]]]]]]]] " + this.typeId() + ".scrollToTop()")
        this.setScrollTop(0)
        return this       
    },
    
    scrollToBottom: function() {
        var focusedElement = document.activeElement
        var needsRefocus = focusedElement != this.element()
        console.log("]]]]]]]]]]]] " + this.typeId() + ".scrollToTop() needsRefocus = ", needsRefocus)
        
        this.setScrollTop(this.scrollHeight())
        
        if (needsRefocus) {
            focusedElement.focus()
        }
        //e.animate({ scrollTop: offset }, 500); // TODO: why doesn't this work?
        return this
    },
    
    scrollSubviewToTop: function(aSubview) {
        console.log("]]]]]]]]]]]] " + this.typeId() + ".scrollSubviewToTop()")
        assert(this.subviews().contains(aSubview))
        //this.setScrollTop(aSubview.offsetTop())
        //this.setScrollTopSmooth(aSubview.offsetTop())
        //this.setScrollTop(aSubview.offsetTop() + aSubview.scrollHeight())
        this.animateValue(
            () => { return aSubview.offsetTop() }, 
            () => { return this.scrollTop() }, 
            (v) => { this.setScrollTop(v) }, 
            200)
        return this
    },
    
    animateValue: function(targetFunc, valueFunc, setterFunc, duration) { // duration in milliseconds         
        console.log("]]]]]]]]]]]] " + this.typeId() + ".animateValue()")
        if (duration == null) {
            duration = 200
        }
        //duration = 1500
        var startTime = Date.now();
        
        var step = () => {
            var dt = (Date.now() - startTime)
            var r =  dt / duration
            r = Math.sin(r*Math.PI/2)
            r = r*r*r

            var currentValue = valueFunc()
            var currentTargetValue = targetFunc()
            
            //console.log("time: ", dt, " /", duration, " r:", r, " top:", currentValue, "/", currentTargetValue)
            
            if (dt > duration) {
                setterFunc(currentTargetValue)
            } else {
                var newValue = currentValue + (currentTargetValue - currentValue) * r
                setterFunc(newValue)
                window.requestAnimationFrame(step);
            }
        }
        
        window.requestAnimationFrame(step);
        
        return this    
    },
    
    setScrollTopSmooth: function(newScrollTop, scrollDuration) { 
        this.animateValue(() => { return newScrollTop }, () => { return this.scrollTop() }, (v) => { this.setScrollTop(v) }, scrollDuration)
        return this    
    },
    
    dynamicScrollIntoView: function() {
        this.parentView().scrollSubviewToTop(this)
        return this
    },
    
    scrollIntoView: function() {
        var focusedView =  WebBrowserWindow.activeDivView()
        //console.log("]]]]]]]]]]]] " + this.typeId() + ".scrollIntoView() needsRefocus = ", focusedView != this)

        if (focusedView && focusedView != this) {
            console.log("scrollIntoView - registerForVisibility")
            // this hack is needed to return focus that scrollIntoView grabs from other elements
            // need to do this before element().scrollIntoView appearently
            this.registerForVisibility()
            this._endScrollIntoViewFunc = () => {
                console.log("_endScrollIntoViewFunc - returning focus")
                //focusedView.focus()
                // need delay to allow scroll to finish - hack - todo: check for full visibility
                focusedView.focusAfterDelay(0.2)
            }
        }
        setTimeout(() => {
            this.element().scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth", })
        }, 0)
        

        
        /*
        if (focusedView != this) {
            focusedView.focusAfterDelay(0.5) // todo: get this value from transition property
        }
        */
        return this
    },
    
    isScrolledIntoView: function() {
        var e = this.element()
        var top = e.getBoundingClientRect().top;
        var bottom = e.getBoundingClientRect().bottom;
        var isVisible = (top >= 0) && (bottom <= window.innerHeight);
        return isVisible;
    },

    // helpers
	
    verticallyAlignAbsoluteNow: function() {
        var pv = this.parentView()
        if (pv) {
            this.setPosition("absolute")
            this.setTop(pv.clientHeight()/2 - this.clientHeight()/2)
        }
        return this
    },
	
    horizontallyAlignAbsoluteNow: function() {
        var pv = this.parentView()
        if (pv) {
            this.setPosition("absolute")
            this.setRight(pv.clientWidth()/2 - this.clientWidth()/2)
        }
        return this
    },
	
    // visibility event
	
    onVisibility: function() {
	    //console.log(this.typeId() + ".onVisibility()")
	    this.unregisterForVisibility()
	    return this
    },
	
    unregisterForVisibility: function() {
	    var obs = this.intersectionObserver()
	    if (obs) {
	        obs.disconnect()
            this.setIntersectionObserver(null);
            this.setIsRegisteredForVisibility(false)
	    }
	    return this
    },
	
    registerForVisibility: function() {
	    if (this.isRegisteredForVisibility()) {
	        return this
	    }
	    
	    var root = document.body
	    
	    if (this.parentView()) {
	        root = this.parentView().parentView().element() // hack for scroll view - todo: make more general
	        //root = this.parentView().element()
	    }
	    
        var intersectionObserverOptions = {
            root: root, // watch for visibility in the viewport 
            rootMargin: "0px",
            threshold: 1.0
        }
    
        var obs = new IntersectionObserver((entries, observer) => { 
            entries.forEach(entry => {
                if (entry.isIntersecting) { 
                    
                    console.log("onVisibility!")
                    if (this._endScrollIntoViewFunc) {
            	        this._endScrollIntoViewFunc() 
            	        // hack around lack of end of scrollIntoView event 
            	        // needed to return focus that scrollIntoView grabs from other elements
            	    }
	    
                    this.onVisibility() 
                }
            })
        }, intersectionObserverOptions)
        
        this.setIntersectionObserver(obs);
        obs.observe(this.element());

        this.setIsRegisteredForVisibility(true)
        return this
    },
})
