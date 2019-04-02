"use strict"

/*
    DivView

    Base view class. Wraps a dom element.

    TODO: add dict[propertyName] -> validValueSet and check css values when set
*/

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
    //isHandlingEvent: false,
	
    // key views
    interceptsTab: true,
    nextKeyView: null,
    canMakeKey: true,
    unfocusOnEnterKey: false,
	
    // event handling
    isRegisteredForVisibility: false,
    intersectionObserver: null,
    
    acceptsFirstResponder: false,

    gestureRecognizers: null,
    eventListenersDict: null,
}).setSlots({
    init: function () {
        this.setSubviews([])
        this.setupElement()
        this.setEventListenersDict({})
        this.setIsRegisteredForDrop(false)
        return this
    },

    gestureRecognizers: function() {
        if (this._gestureRecognizers == null) {
            this._gestureRecognizers = []
        }
        return this._gestureRecognizers
    },

    setDivId: function(aString) {
        this.element().id = aString
        return this
    },
	
    setElement: function(e) {
	    this._element = e
	    setTimeout(() => { this.setIsRegisteredForFocus(true); }, 0)
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
        let ancestorNames = this.ancestors().map((obj) => { 
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
        let names = this.divClassName().split(" ")
        names.removeOccurancesOf(aName) // avoid duplicates
        names.atInsert(0, aName)
        this.setDivClassNames(names)
        return this
    },
	
    removeDivClassName: function(aName) {
        let names = this.divClassName().split(" ")
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

    stylesheetWithClassName: function(className) {
        for (let i = 0; i < document.styleSheets.length; i++) {
            let stylesheet = document.styleSheets[i]

            if ("cssRules" in stylesheet) {
                try {
                    let rules = stylesheet.cssRules
                    for (let j = 0; j < rules.length; j++) {
                        let rule = rules[j]
                        let ruleClassName = rule.selectorText.split(" ")[0]
                        console.log("rule.selectorText: ", rule.selectorText)
                        if (ruleClassName == className) {
                            return stylesheet
                        }
                    }
                } catch (e) {
                    //console.log("couldn't add CSS rule: " + rule + "")
                }
            }
        }
        return null
    },

    /*
    setCssClassAttribute: function(name, value) {
      
        //let stylesheet = this.stylesheetWithClassName(className)
        //console.log(className + " stylesheet: ", stylesheet)
        for (let i = 0; i < document.styleSheets.length; i++) {
            let stylesheet = document.styleSheets[i]
            if ("cssRules" in stylesheet) {
                try {
                    stylesheet.insertRule(rule, stylesheet.cssRules.length); 
                    console.log("== added CSS rule: " + rule + "")
                    break;
                } catch (e) {
                    console.log("couldn't add CSS rule: " + rule + "")
                }
            }
        }
        // TODO: hack - add something to remove existing rule instead of inserting more
        return this
    },
    */

    setCssAttribute: function(key, newValue, didChangeCallbackFunc) {
        let style = this.cssStyle()
        let oldValue = style[key]
        if(String(oldValue) !== String(newValue)) {
            if (newValue == null) {
                //console.log("deleting css key ", key)
                //delete style[key]
                style.removeProperty(key)
                //console.log(this.cssStyle()[key])
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

    // css px attributes

    setPxCssAttribute: function(name, value, didChangeCallbackFunc) {
        this.setCssAttribute(name, this.pxNumberToString(value), didChangeCallbackFunc)
        return this
    },

    getPxCssAttribute: function(name, errorCheck) {
        let s = this.getCssAttribute(name, errorCheck)
        if (s.length) {
            return this.pxStringToNumber(s)
        }
        return 0
    },

    // --- css properties ---
	
    setPosition: function(s) {
        this.setCssAttribute("position", s)
        return this		
    },
	
    position: function() {
        return this.getCssAttribute("position")
    },

    // pointer events

    setPointerEvents: function(s) {
        return this.setCssAttribute("pointer-events", s)
    },

    pointerEvents: function() {
        return this.getCssAttribute("pointer-events")
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
        console.log("setZoomRatio: ", r)
	    this.setZoomPercentage(r*100)
        return this
    },
	
    setZoomPercentage: function(aNumber) {
	    assert(Type.isNumber(aNumber)) 
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

    setMarginString: function(s) {
        this.setCssAttribute("margin", s)
        return this
    },

    setMargin: function(aNumber) {
        this.setPxCssAttribute("margin", aNumber)
        return this
    },

    margin: function() {
        return this.getCssAttribute("margin")
    },

    setMarginLeft: function(aNumber) {
        this.setPxCssAttribute("margin-left", aNumber)
        return this
    },
	
    setMarginRight: function(aNumber) {
        this.setPxCssAttribute("margin-right", aNumber)
        return this
    },

    setMarginTop: function(aNumber) {
        this.setPxCssAttribute("margin-top", aNumber)
        return this
    },
	
    setMarginBottom: function(aNumber) {
        this.setPxCssAttribute("margin-bottom", aNumber)
        return this
    },

    // padding left

    setPadding: function(aNumber) {
        this.setPxCssAttribute("padding", aNumber)
        return this
    },

    setPaddingRight: function(aNumber) {
        this.setPxCssAttribute("padding-right", aNumber)
        return this
    },
	
    setPaddingLeft: function(aNumber) {
        this.setPxCssAttribute("padding-left", aNumber)
        return this
    },

    setPaddingTop: function(aNumber) {
        this.setPxCssAttribute("padding-top", aNumber)
        return this
    },

    setPaddingBottom: function(aNumber) {
        this.setPxCssAttribute("padding-bottom", aNumber)
        return this
    },

    paddingLeft: function() {
        return this.psStringToNumber(this.getCssAttribute("padding-left"))
    },

    // padding right
	
    setPaddingRight: function(aNumber) {
        this.setPxCssAttribute("padding-right", aNumber)
        return this
    },

    paddingRight: function() {
        return this.psStringToNumber(this.getCssAttribute("padding-right"))
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
        this.setBackgroundImage("url(\"" + path + "\")")
        return this
    },

    // background size
    
    setBackgroundSizeWH: function(x, y) {
        this.setCssAttribute("background-size", x + "px " + y + "px")
        return this
    },
	
    setBackgroundSize: function(s) {
	    assert(Type.isString(s))
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
	    assert(Type.isString(s))
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
        const pathSeparator = "/"
        return ["resources", "icons", aName + ".svg"].join(pathSeparator)
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

    // transforms

    setTransform: function(s) {
        this.setCssAttribute("transform", s)
        return this
    },

    setTransformOrigin: function(s) {
        //transform-origin: x-axis y-axis z-axis|initial|inherit;
        //const percentageString = this.percentageNumberToString(aNumber)
        this.setCssAttribute("transform-origin", s)
        return this
    },

    /*
    TODO: add setter/getters for:

        perspective-origin: x-axis y-axis|initial|inherit;
        transform-style: flat|preserve-3d|initial|inherit;
        backface-visibility: hidden | visible;

    */

    // perspective

    setPerspective: function(n) {
        this.setPxCssAttribute("perspective", n)
        return this
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

    setTopString: function (s) {
        this.setCssAttribute("top", s)
        return this
    },

    setTop: function (aNumber) {
        this.setPxCssAttribute("top", aNumber)
        return this
    },

    top: function() {
        return this.getPxCssAttribute("top")
    },
	
    // left

    setLeftString: function (s) {
        this.setCssAttribute("left", s)
        return this
    },

    setLeft: function (aNumber) {
        this.setPxCssAttribute("left", aNumber)
        return this
    },

    left: function() {
        return this.getPxCssAttribute("left")
    },
   
    // right
    
    setRightString: function (s) {
        this.setCssAttribute("right", s)
        return this
    },

    setRight: function (aNumber) {
        this.setPxCssAttribute("right", aNumber)
        return this
    },

    right: function() {
        return this.getPxCssAttribute("right")
    },	
	
    // bottom
    
    setBottomString: function (s) {
        this.setCssAttribute("bottom", s)
        return this
    },

    setBottom: function (aNumber) {
        this.setPxCssAttribute("bottom", aNumber)
        return this
    },

    bottom: function() {
        return this.getPxCssAttribute("bottom")
    },	
	
    // float
	
    setFloat: function(s) {
        this.setCssAttribute("float", s)
        return this
    },
	
    float: function() {
        return this.getCssAttribute("float")
    },

    // box shadow

    setBoxShadow: function(s) {
        this.setCssAttribute("box-shadow", s)
        return this
    },
	
    border: function() {
        return this.getCssAttribute("box-shadow")
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
        if (Type.isNumber(s)) {
            this.setPxCssAttribute("border-radius", s)
        } else {
            this.setCssAttribute("border-radius", s)
        }
	    return this
    },
	
    borderRadius: function() {
        return this.getCssAttribute("border-radius")
    },
    
    // line height

    setLineHeight: function(aNumber) {
        this.setPxCssAttribute("line-height", aNumber)
        assert(this.lineHeight() == aNumber)
        return this		
    },
	
    lineHeight: function() {
        return this.getPxCssAttribute("line-height")
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
        let v = aBool ? "visible" : "hidden"
        this.setCssAttribute("visibility", v)
        return this
    },

    isVisible: function() {
        return this.getCssAttribute("visibility") !== "hidden";
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
        assert(Type.isString(s))
        this.setCssAttribute("overflow", s)
        return this
    },
    
    overflow: function() {
        return this.getCssAttribute("overflow")
    },

    // overflow x

    setOverflowX: function(s) {
        assert(Type.isString(s))
        this.setCssAttribute("overflow-x", s)
        return this
    },
    
    overflowX: function() {
        return this.getCssAttribute("overflow-x")
    },

    // overflow y

    setOverflowY: function(s) {
        assert(Type.isString(s))
        this.setCssAttribute("overflow-y", s)
        return this
    },
    
    overflowY: function() {
        return this.getCssAttribute("overflow-y")
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
        let style = this.cssStyle()
        let result = this.userSelectKeys().detect(key => style[key])
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
        let style = this.cssStyle()
        //console.log("'" + aString + "' this.userSelect() = '" + this.userSelect() + "' === ", this.userSelect() == aString)
        if (this.userSelect() !== aString) {
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
    
    setWidthString: function(s) {
	    assert(Type.isString(s) || s === null)
	    this.setCssAttribute("width", s, () => { this.didChangeWidth() })
	    return this
    },

    setWidth: function(s) {
	    this.setWidthString(s)
	    return this
    },
	
    setWidthPercentage: function(aNumber) {
        const newValue = this.percentageNumberToString(aNumber)
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
        let s = this.getCssAttribute("min-width")
        return this.pxStringToNumber(s)
    },

    maxWidth: function() {
        let w = this.getCssAttribute("max-width")
        if (w === "") {
            return null
        }
        return this.pxStringToNumber(w)
    },

    cssStyle: function() {
        return this.element().style
    },

    setMinWidth: function(v) {
        let type = typeof(v)
        let newValue = null
        if (v == null) {
            newValue = null
        } else if (type === "string") {
	        newValue = v 
        } else if (type === "number") {
	        newValue = this.pxNumberToString(v)
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
        /*
        if (v === this._maxWidth) {
            return this
        }
        */
		
        let type = typeof(v)
        let newValue = null
        if (v == null) {
            newValue = null
        } else if (type === "string") {
	        newValue = v 
        } else if (type === "number") {
	        newValue = this.pxNumberToString(v)
        } else {
            throw new Error(type + " is invalid argument type")
        }
        //this._maxWidth = newValue

        this.setCssAttribute("max-width", newValue, () => { this.didChangeWidth() })
        return this        
    },

    setMinAndMaxWidth: function(aNumber) {
        let newValue = this.pxNumberToString(aNumber)
        this.setCssAttribute("max-width", newValue, () => { this.didChangeWidth() })
        this.setCssAttribute("min-width", newValue, () => { this.didChangeWidth() })
        return this        
    },

    setMinAndMaxHeight: function(aNumber) {
        let newValue = this.pxNumberToString(aNumber)
        this.setCssAttribute("min-height", newValue, () => { this.didChangeHeight() })
        this.setCssAttribute("max-height", newValue, () => { this.didChangeHeight() })
        return this		
    },

    percentageNumberToString: function(aNumber) {
        assert(Type.isNumber(aNumber) && (aNumber >= 0) && (aNumber <= 100))
        return aNumber + "%"
    },

    pxNumberToString: function(aNumber) {
        if (aNumber === null) {
            return null
        }

        if (typeof(aNumber) === "string") {
            if (aNumber.beginsWith("calc") || aNumber.endsWith("px")) {
                return aNumber
            }
        }

        assert(Type.isNumber(aNumber))
        return aNumber + "px"
    },

    pxStringToNumber: function(s) {
        assert(Type.isString(s))
        if (s === "") {
            return 0
        }
        assert(s.endsWith("px"))
        return Number(s.replace("px", ""))
    },

    setMinAndMaxHeightPercentage: function(aNumber) {
        let newValue = this.percentageNumberToString(aNumber)
        this.setCssAttribute("min-height", newValue, () => { this.didChangeHeight() })
        this.setCssAttribute("max-height", newValue, () => { this.didChangeHeight() })
        return this		
    },
	
    setHeightPercentage: function(aNumber) {
        let newValue = this.percentageNumberToString(aNumber)
        this.setHeightString(newValue)
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

    setWidthPxNumber: function(aNumber) {
        this.setWidthString(this.pxNumberToString(aNumber))
        return this
    },

    setHeightPxNumber: function(aNumber) {
        this.setHeightString(this.pxNumberToString(aNumber))
        return this
    },

    setHeight: function(s) {
        if (Type.isNumber(s)) {
            return this.setHeightPxNumber(s)
        }
        this.setHeightString(s)
        return this		
    },	

    setWidthToAuto: function() {
        this.setWidthString("auto")
        return this
    },

    setHeightToAuto: function() {
        this.setHeightString("auto")
    },

    setHeightString: function(s) {
        assert(Type.isString(s) || s === null)
        this.setCssAttribute("height", s, () => { this.didChangeHeight() })
        return this		
    },	
	
    height: function() {
        return this.getCssAttribute("height")
    },
	
    // --- div class name ---

    setDivClassName: function (aName) {
        if (this._divClassName !== aName) {
	        this._divClassName = aName
	        if (this.element()) {
	            this.element().setAttribute("class", aName);
	        }
        }
        return this
    },

    divClassName: function () {
        if (this.element()) {
            let className = this.element().getAttribute("class");
            this._divClassName = className
            return className
        }
        return this._divClassName
    },

    // --- subviews ---

    subviewCount: function() {
        return this.subviews().length
    },

    hasSubview: function(aSubview) {
        return this.subviews().contains(aSubview)
    },

    addSubview: function(aSubview) {
        if (aSubview == null) {
            throw new Error("aSubview can't be null")
        }

        if (this.hasSubview(aSubview)) {
            throw new Error(this.type() + ".addSubview(" + aSubview.type() + ") attempt to add duplicate subview ")
        }
        
        this.willAddSubview(aSubview)
        this.subviews().append(aSubview)
        
        if (aSubview.element() == null) {
            throw new Error("null aSubview.element()")
        }

        this.element().appendChild(aSubview.element());
        aSubview.setParentView(this)
        this.didChangeSubviewList()
        return aSubview
    },
    
    addSubviews: function(someSubviews) {
        someSubviews.forEach(subview => this.addSubview(subview))
        return this
    },

    orderSubviewFront: function(aSubview) {
        if (this.subviews().last() !== aSubview) {
            this.removeSubview(aSubview)
            this.addSubview(aSubview)
        }
        return this
    },

    orderFront: function() {
        let pv = this.parentView()
        if (pv) {
            pv.orderSubviewFront(this)
        }
        return this
    },

    orderSubviewBack: function(aSubview) {
        throw new Error("unimplemented")

        //if (this.subviews().first() !== aSubview) {
        //    this.removeSubview(aSubview)
        //    implement insertSubviewAt() with DomElement_atInsertElement()
        //}
        return this
    },

    orderBack: function() {
        let pv = this.parentView()
        if (pv) {
            pv.orderSubviewBack(this)
        }
        return this
    },
    
    atInsertSubview: function (anIndex, aSubview) {
        this.subviews().atInsert(anIndex, aSubview)
        DomElement_atInsertElement(this.element(), anIndex, aSubview.element())
        return aSubview
    },

    // --- subview utilities ---
    
    sumOfSubviewHeights: function() {
        return this.subviews().sum(subview => subview.clientHeight())
    },

    performOnSubviewsExcept: function(methodName, exceptedSubview) {
        this.subviews().forEach(subview => {
            if (subview !== exceptedSubview) {
                subview[methodName].apply(subview)
            }
        })

        return this
    },
    
    // --- fade animations ---
    
    hideAndFadeIn: function() {
        this.setOpacity(0)
        this.setTransition("all 0.5s")
        setTimeout( () => { 
            this.setOpacity(1)
        }, 0)	
    },

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
    
    // -----------------------

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
        return this.subviews().indexOf(aSubview) !== -1;
    },
	
    hasChildElement: function(anElement) {
        let children = this.element().childNodes
        for (let i = 0; i < children.length; i ++) {
            let child = children[i]
            if (anElement === child) {
                return true
            }
        }
        return false		
    },
    
    willAddSubview: function (aSubview) {
        // for subclasses to over-ride
    },

    willRemoveSubview: function (aSubview) {
        // for subclasses to over-ride
    },

    removeSubview: function (aSubview) {
        //console.warn("WARNING: " + this.type() + " removeSubview " + aSubview.type())

        if (!this.hasSubview(aSubview)) {
            console.warn(this.type() + " removeSubview " + aSubview.typeId() + " failed - no child found among: ", this.subviews().map(view => view.typeId()))
            StackTrace.shared().showCurrentStack()
            return aSubview
        }
        this.willRemoveSubview(aSubview)
		
        aSubview.willRemove()
        this.subviews().remove(aSubview)

        if (this.hasChildElement(aSubview.element())) {
        	this.element().removeChild(aSubview.element());
        } else {
            //console.warn("WARNING: " + this.type() + " removeSubview " + aSubview.type() + " missing element")
        }

        if (this.hasChildElement(aSubview.element())) {
            console.warn("WARNING: " + this.type() + " removeSubview " + aSubview.type() + " failed - still has element after remove")
            StackTrace.shared().showCurrentStack()
        }
		
        aSubview.setParentView(null)
        this.didChangeSubviewList()
        return aSubview
    },
    
    removeAllSubviews: function() {
        this.subviews().copy().forEach((aView) => { this.removeSubview(aView) })
        assert(this.subviews().length === 0)
        return this
    },

    indexOfSubview: function(aSubview) {
        return this.subviews().indexOf(aSubview)
    },

    subviewAfter: function(aSubview) {
        let index = this.indexOfSubview(aSubview)
        let nextIndex = index + 1
        if (nextIndex < this.subviews().length) {
            return this.subviews()[nextIndex]
        }
        return null
    },

    // --- active element ---

    isActiveElement: function() {
        return document.activeElement === this.element() 
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
		
        if (v === this.element().innerHTML) {
            return this
        }

        let isFocused = this.isActiveElementAndEditable()
        
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
        let f = this[msg]
        if (f && f.apply(this, [aView])) {
            return // stop propogation
        }

        let p = this.parentView()
        if (p) {
            p.tellParentViews(msg, aView)
        }
    },

    // --- events --------------------------------------------------------------------

    // --- event listeners ---

    listenerNamed: function(className) {
        let dict = this.eventListenersDict()
        if (!dict[className]) {
            assert(className in window)
            let proto = window[className]
            dict[className] = proto.clone().setElement(this.element()).setDelegate(this)
        } 
        return dict[className]
    },

    clipboardListener: function() {
        return this.listenerNamed("ClipboardListener")
    },

    documentListener: function() {
        let listener = this.listenerNamed("DocumentListener")
        listener.setElement(window)
        return listener
    },

    dragListener: function() {
        return this.listenerNamed("DragListener")
    },

    dropListener: function() {
        return this.listenerNamed("DropListener")
    },

    focusListener: function() {
        return this.listenerNamed("FocusListener")
    },

    mouseListener: function() {
        return this.listenerNamed("MouseListener")
    },

    keyboardListener: function() {
        return this.listenerNamed("KeyboardListener")
    },

    touchListener: function() {
        return this.listenerNamed("TouchListener")
    },

    // ---

	
    // --- window resize events ---
    
    isRegisteredForDocumentResize: function() {
        return this.documentListener().isListening()
    },

    setIsRegisteredForDocumentResize: function(aBool) {   
        this.documentListener().setIsListening(aBool)
        return this
    },
    
    onDocumentResize: function(event) {   
        return true
    },
	
    // --- onClick event, target & action ---
    
    isRegisteredForClicks: function() {
        return this.mouseListener().isListening()
    },

    setIsRegisteredForClicks: function (aBool) {
        this.mouseListener().setIsListening(aBool)

        if (aBool) {
            this.makeCursorPointer()
        } else {
            this.makeCursorDefault()
        }

        return this
    },
    
    hasTargetAndAction: function() {
        return (this.target() !== null) && (this.action() !== null)
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
        return false
    },
    
    sendActionToTarget: function() {
        if (!this.action()) {
            return null
        }

        let t = this.target()
        if (!t) {
            throw new Error("no target for action " + this.action())
        }
        
        let method = t[this.action()]
        if (!method) {
            throw new Error("no target for action " + this.action())
        }

        return method.apply(t, [this])
    },
    
    onDoubleClick: function (event) {
        return true
    },
    
    // -- dropping ---
    
    isRegisteredForDrop: function() {
        return this.dropListener().isListening()
    },

    setIsRegisteredForDrop: function (aBool) {
        this.dropListener().setIsListening(aBool)
        return this
    },

    acceptsDrop: function() {
        return true
    },    
        
    // ---------------------
	
    onDragEnter: function (event) { 
        // triggered on drop target
        console.log("onDragEnter acceptsDrop: ", this.acceptsDrop());
        //event.preventDefault() // needed?

        if (this.acceptsDrop()) {
            this.onDragOverAccept(event)
            event.preventDefault()
            return true
        }

        return false;
    },
	
    onDragOver: function (event) {
        // triggered on drop target
        //console.log("onDragOver acceptsDrop: ", this.acceptsDrop(), " event:", event);
        //event.preventDefault() // needed?
        //event.dataTransfer.dropEffect = 'copy';

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
        // triggered on drop target
        //console.log("onDragLeave ", this.acceptsDrop());
        this.dragUnhighlight()
        return this.acceptsDrop();
    },
    
    dragHighlight: function() {
        
    },
    
    dragUnhighlight: function() {
        
    },

    onDrop: function (event) {
        // triggered on drop target
        if (this.acceptsDrop()) {
            //let file = event.dataTransfer.files[0];
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
            let dataUrls = []
            for (let i = 0; i < dataTransfer.files.length; i ++) {
                let file = dataTransfer.files[i]
                //console.log("file: ", file)
                
                if (!file.type.match("image.*")) {
                    continue;
                }

                let reader = new FileReader();
                reader.onload = ((event) => {
                    this.onDropImageDataUrl(event.target.result)
                })
                reader.readAsDataURL(file);

            }
        }

    },
    
    onDropImageDataUrl: function(dataUrl) {
        console.log("onDropImageDataUrl: ", dataUrl);
    },
    
    onDropFiles: function(filePaths) {
        console.log("onDropFiles " + filePaths);
    },

    // dragging

    isRegisteredForDrag: function() {
        return this.dragListener().isListening()
    },

    setIsRegisteredForDrag: function (aBool) {
        this.dragListener().setIsListening(aBool)
        return this
    },

    onDragStart: function (event) {
        // triggered in element being dragged
        return true; 
    },
    
    onDragEnd: function (event) {
        // triggered in element being dragged
        this.dragUnhighlight();
        //console.log("onDragEnd");
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

        this.setIsRegisteredForClipboard(aBool)

        return this
    },
    
    isContentEditable: function() {
        let result = this.element().contentEditable
        if (result === "inherit" && this.parentView()) {
            return this.parentView().isContentEditable()
        }
        return this
    },

    contentEditable: function() {
        return this.element().contentEditable === "true"
    },
	
    // touch events

    setTouchAction: function(s) {
        this.setCssAttribute("-ms-touch-action", s) // needed?
        this.setCssAttribute("touch-action", s)
        return this
    },

    isRegisteredForTouch: function() {
        return this.touchListener().isListening()
    },

    setIsRegisteredForTouch: function(aBool) {
        this.touchListener().setIsListening(aBool)

        if (aBool) {
            this.setTouchAction("none") // testing
        }

        return this
    },

    onTouchStart: function(event) {
        //this.onPointsStart(points)
    },

    onTouchMove: function(event) {
        //this.onPointsMove(points)
    },
	
    onTouchCancel: function(event) {
        //this.onPointsCancel(points)
    },
	
    onTouchEnd: function(event) {
        //this.onPointsEnd(points)
    },	

    /// GestureRecognizers

    hasGestureType: function(typeName) {
        return this.gesturesOfType(typeName).length > 0
        
    },

    addGestureRecognizer: function(gr) {
        this.gestureRecognizers().append(gr)
        gr.setViewTarget(this)
        gr.start()
        return gr
    },

    removeGestureRecognizer: function(gr) {
        if (this.gestureRecognizers()) {
            gr.stop()
            gr.setViewTarget(null)
            this.gestureRecognizers().remove(gr)
        }
        return this
    },

    gesturesOfType: function(typeName) {
        return this.gestureRecognizers().select(gr => gr.type() == typeName)
    },

    removeGestureRecognizersOfType: function(typeName) {
        if (this.gestureRecognizers()) {
            this.gestureRecognizers().select(gr => gr.type() == typeName).forEach(gr => this.removeGestureRecognizer(gr))
        }
        return this
    },

    /*
    requestActiveGesture: function(aGesture) {
        return GestureManager.shared().requestActiveGesture(aGesture);
    },

    firstActiveGesture: function() {
        return this.gestureRecognizers().detect((gr) => {
            return gr.isActive()
        })
    },

    requestActiveGesture: function(aGesture) {
        assert(aGesture)

        let first = this.firstActiveGesture()

        if (!first) {
            this.cancelAllGesturesExcept(aGesture)
            return true
        }
        
        if (first === aGesture) {
            return true
        }

        return false
    },
`   */

    cancelAllGesturesExcept: function(aGesture) {
        this.gestureRecognizers().forEach((gr) => {
            //if (gr.type() !== aGesture.type()) {
            if (gr !== aGesture) {
                gr.cancel()
            }
        })
        return this
    },

    // --- mouse events ---

    isRegisteredForMouse: function() {
        return this.mouseListener().isListening()
    },

    setIsRegisteredForMouse: function(aBool, useCapture) {
        this.mouseListener().setUseCapture(useCapture).setIsListening(aBool) //.setIsDebugging(true)
        return this
    },
    
    onMouseMove: function (event) {
        return true
    },
    
    onMouseOver: function(event) {
        return true
    },

    onMouseLeave: function(event) {
        return true
    },
    
    onMouseOver: function (event) {
        return true
    },

    onMouseDown: function (event) {
        return true
    },

    onMouseUp: function (event) {
        return true
    },
        
    // --- keyboard events ---

    isRegisteredForKeyboard: function() {
        return this.keyboardListener().isListening()
    },

    setIsRegisteredForKeyboard: function(aBool, useCapture) {
        this.keyboardListener().setUseCapture(useCapture).setIsListening(aBool)

        let e = this.element()
        if (aBool) {
            DivView._tabCount ++
            e.tabIndex = DivView._tabCount // need this in order for focus to work on BrowserColumn?
            //this.setCssAttribute("outline", "none"); // needed?
        } else {
	        delete e.tabindex 
        }

        return this
    },

	
    onKeyDown: function (event) {
        let specialKeyName = Keyboard.specialNameForKeyEvent(event)
		
        if (specialKeyName === "enter" && this.unfocusOnEnterKey()) {
            console.log(" releasing focus")
            // this.releaseFocus() // TODO: implement something to pass focus up view chain to whoever wants it
            this.element().parentElement.focus()
        }
		
        /*
		if (this.interceptsTab()) {
	        if (event.keyId === "tab") {
		        event.preventDefault()
	            this.onTabKeyDown()
	        }
		}
		*/    
		
        // onEnterKeyDown onLeftArrowKeyUp
        if (specialKeyName) {
            let name = "on" + specialKeyName.capitalized() + "KeyDown"
            if (this[name]) {
                this[name].apply(this, [event])
		        event.preventDefault()
            }
        }
        return true
    },
    
    onKeyPress: function (event) {
        // console.log("onKeyPress")
        return true
    },
    
    onKeyUp: function (event) {
        let shouldPropogate = true
        let specialKeyName = Keyboard.specialNameForKeyEvent(event)
        //console.log(this.typeId() + " onKeyUp specialKeyName=", specialKeyName)

        /*
		if (this.interceptsTab()) {
	        if (event.keyId === "tab") {
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
            if (this.color() === this.invalidColor()) {
                this.setColor(null)
            }
        }

        if (specialKeyName) {
		    // onEnterKeyUp onLeftArrowKeyUp
            let name = "on" + specialKeyName.capitalized() + "KeyUp"
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
        return true
    },
    
    // --- tabs and next key view ----
    
    onTabKeyDown: function() {
        this.selectNextKeyView()
        return true
    },

    selectNextKeyView: function() {
        console.log(this.typeId() + " selectNextKeyView")
        let nkv = this.nextKeyView()
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
    
    isRegisteredForFocus: function() {
        return this.focusListener().isListening()
    },

    setIsRegisteredForFocus: function(aBool) {
        this.focusListener().setIsListening(aBool)
        return this
    },
    
    willAcceptFirstResponder: function() {
	    //console.log(this.typeId() + ".willAcceptFirstResponder()")
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
	    //console.log(this.typeId() + ".releaseFirstResponder()")
	    
	    this.blur()
	    if (this.parentView()) {
	        this.parentView().becomeFirstResponder()
	    }
	    return this
    },
	
    // --------------------------------------------------------

    onFocus: function() {
        this.willAcceptFirstResponder();
        // subclasses can override 
        //console.log(this.typeId() + " onFocus")
        return true
    },

    onBlur: function() {
        this.didReleaseFirstResponder();
        // subclasses can override 
        //console.log(this.typeId() + " onBlur")
        return true
    },
    
    innerText: function() {
        let e = this.element()
	    return e.textContent || e.innerText || "";		
    },
    
    // --- set caret ----
    
    moveCaretToEnd: function() {
        let contentEditableElement = this.element()
        let range, selection;
        
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
            let range = document.body.createTextRange();
            range.moveToElementText(this.element());
            range.select();
        } else if (window.getSelection) {
            let range = document.createRange();
            range.selectNode(this.element());
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
    },
	
    // --- paste from clipboard ---

    onPaste: function (e) {
        // prevent pasting text by default after event
        e.preventDefault(); 

        let clipboardData = e.clipboardData;
        let rDataHTML = clipboardData.getData("text/html");
        let rDataPText = clipboardData.getData("text/plain");

        let htmlToPlainTextFunc = function (html) {
            let tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
        }

        if (rDataHTML && rDataHTML.trim().length !== 0) {
            this.replaceSelectedText(htmlToPlainTextFunc(rDataHTML))
            return false; // prevent returning text in clipboard
        }

        if (rDataPText && rDataPText.trim().length !== 0) {
            this.replaceSelectedText(htmlToPlainTextFunc(rDataPText))
            return false; // prevent returning text in clipboard
        }
        return true
    },
    
    // ------------

    isRegisteredForClipboard: function() {
        return this.clipboardListener().isListening()
    },

    setIsRegisteredForClipboard: function(aBool) {
        this.clipboardListener().setIsListening(aBool)
        return this
    },

    replaceSelectedText: function(replacementText) {
        let range;
        if (window.getSelection) {
            let sel = window.getSelection();
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
        let elem = this.element();

        if(elem != null) {
            if(elem.createTextRange) {
                let range = elem.createTextRange();
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
        let uniqueClassName = "UniqueClass_" + this._uniqueId
        let e = this.element()
        if (e.className.indexOf(uniqueClassName) === -1) {
            let newRuleKey = "DivView" + uniqueClassName + ":" + afterOrBefore
            let newRuleValue = "content: \"" + aString + "\;"
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
        this.setScrollTop(0)
        return this       
    },
    
    scrollToBottom: function() {
        let focusedElement = document.activeElement
        let needsRefocus = focusedElement !== this.element()
        // console.log("]]]]]]]]]]]] " + this.typeId() + ".scrollToTop() needsRefocus = ", needsRefocus)
        
        this.setScrollTop(this.scrollHeight())
        
        if (needsRefocus) {
            focusedElement.focus()
        }
        //e.animate({ scrollTop: offset }, 500); // TODO: why doesn't this work?
        return this
    },
    
    scrollSubviewToTop: function(aSubview) {
        console.log("]]]]]]]]]]]] " + this.typeId() + ".scrollSubviewToTop()")
        assert(this.hasSubview(aSubview))
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
        let startTime = Date.now();
        
        let step = () => {
            let dt = (Date.now() - startTime)
            let r =  dt / duration
            r = Math.sin(r*Math.PI/2)
            r = r*r*r

            let currentValue = valueFunc()
            let currentTargetValue = targetFunc()
            
            //console.log("time: ", dt, " /", duration, " r:", r, " top:", currentValue, "/", currentTargetValue)
            
            if (dt > duration) {
                setterFunc(currentTargetValue)
            } else {
                let newValue = currentValue + (currentTargetValue - currentValue) * r
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
        let focusedView =  WebBrowserWindow.shared().activeDivView()
        //console.log("]]]]]]]]]]]] " + this.typeId() + ".scrollIntoView() needsRefocus = ", focusedView !== this)

        if (focusedView && focusedView !== this) {
            //console.log("scrollIntoView - registerForVisibility")
            // this hack is needed to return focus that scrollIntoView grabs from other elements
            // need to do this before element().scrollIntoView appearently
            this.registerForVisibility()
            this._endScrollIntoViewFunc = () => {
                //console.log("_endScrollIntoViewFunc - returning focus")
                //focusedView.focus()
                // need delay to allow scroll to finish - hack - TODO: check for full visibility
                focusedView.focusAfterDelay(0.2)
            }
        }
        setTimeout(() => {
            this.element().scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth", })
        }, 0)
        

        
        /*
        if (focusedView !== this) {
            focusedView.focusAfterDelay(0.5) // TODO: get this value from transition property
        }
        */
        return this
    },

    boundingClientRect: function() {
        return this.element().getBoundingClientRect()
    },

    containsWinPoint: function() {

    },
    
    isScrolledIntoView: function() {
        let r = this.boundingClientRect()
        let isVisible = (r.top >= 0) && (r.bottom <= window.innerHeight);
        return isVisible;
    },

    // helpers

    /*
    mouseUpPos: function() { 
        return this.viewPosForWindowPos(Mouse.shared().upPos())
    },

    mouseCurrentPos: function() { 
        return this.viewPosForWindowPos(Mouse.shared().currentPos())
    },
    */

    mouseDownPos: function() { 
        return this.viewPosForWindowPos(Mouse.shared().downPos())
    },

    // view position helpers ----

    setRelativePos: function(p) {
        // why not a 2d transform?
        this.setLeft(p.x())
        this.setTop(p.y())
        return this
    },


    winPosForEvent: function(event) {
        let p = EventPoint.clone().set(event.clientX, event.clientY)
    },

    parentPosForEvent: function(event) {
        let p = this.winPosForEvent(event)
        let pv = this.parentView()
        if (pv) {
            return p.subtract(pv.windowPos())
        }
        return p
    },

    viewPosForEvent: function(event) {
        return this.winPosForEvent(event).subtract(this.windowPos())
    },

    /*
    windowPos: function() {
        let b = this.boundingClientRect()
        let p = EventPoint.clone().set(b.x, b.y)
        return p
    },
    */
   
    containsPoint: function(aPoint) {
        return this.winBounds().containsPoint(aPoint)
    },

    winBounds: function() {
        let p = this.windowPos()
        let s = this.size()
        return Rectangle.clone().setOrigin(p).setSize(s)
    },

    size: function() {
        return EventPoint.clone().set(this.clientWidth(), this.clientHeight());
    },

    windowPos: function() {
        let elem = this.element()
        let box = elem.getBoundingClientRect();
    
        let body = document.body;
        let docEl = document.documentElement;
    
        let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        let scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
    
        let clientTop = docEl.clientTop || body.clientTop || 0;
        let clientLeft = docEl.clientLeft || body.clientLeft || 0;
    
        let top  = box.top +  scrollTop - clientTop;
        let left = box.left + scrollLeft - clientLeft;
    
        return EventPoint.clone().set(Math.round(left), Math.round(top));
        //return p
    },

    relativePos: function() {
        let pv = this.parentView()
        if (pv) {
            return this.windowPos().subtract(pv.windowPos())
            //return pv.windowPos().subtract(this.windowPos())
        }
        return this.windowPos()
    },

    setRelativePos: function(p) {
        //this.setPosition("absolute")
        this.setLeft(p.x())
        this.setTop(p.y())
        return this
    },

    viewPosForWindowPos: function(pos) {
        return this.windowPos().subtract(pos)
    },

    // --------------

    verticallyAlignAbsoluteNow: function() {
        let pv = this.parentView()
        if (pv) {
            this.setPosition("absolute")
            setTimeout(() => {
                this.setTop(pv.clientHeight()/2 - this.clientHeight()/2)
            }, 0)
        }
        return this
    },
	
    horizontallyAlignAbsoluteNow: function() {
        let pv = this.parentView()
        if (pv) {
            this.setPosition("absolute")
            setTimeout(() => {
                this.setRight(pv.clientWidth()/2 - this.clientWidth()/2)
            }, 0)
        }
        return this
    },

    setVerticalAlign: function(s) {
        this.setCssAttribute("vertical-align", s)
        return this
    },
	
    // visibility event
	
    onVisibility: function() {
	    //console.log(this.typeId() + ".onVisibility()")
	    this.unregisterForVisibility()
	    return true
    },
	
    unregisterForVisibility: function() {
	    let obs = this.intersectionObserver()
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
	    
	    let root = document.body
	    
	    if (this.parentView()) {
	        root = this.parentView().parentView().element() // hack for scroll view - TODO: make more general
	        //root = this.parentView().element()
	    }
	    
        let intersectionObserverOptions = {
            root: root, // watch for visibility in the viewport 
            rootMargin: "0px",
            threshold: 1.0
        }
    
        let obs = new IntersectionObserver((entries, observer) => { 
            entries.forEach(entry => {
                if (entry.isIntersecting) { 
                    
                    //console.log("onVisibility!")
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

    // centering

    fillParentView: function() {
        this.setWidthPercentage(100)
        this.setHeightPercentage(100)
        return this
    },

    centerInParentView: function() {
        this.setMinAndMaxWidth(null)
        this.setMinAndMaxHeight(null)
        //this.setWidth("100%")
        //this.setHeight("100%")
        this.setOverflow("auto")
        this.setMarginString("auto")
        this.setPosition("absolute")
        this.setTop(0).setLeft(0).setRight(0).setBottom(0)
    },

    /*
    verticallyCenterFromTopNow: function() {
        if (this.parentView() === null) {
            console.warn("verticallyCenterFromTopNow called on view with no superview")
            return this
        }

        this.setPosition("absolute")
        this.setDisplay("inline-block")

        // timeout used to make sure div is placed and laid out first
        // TODO: consider ordering issue
        setTimeout(() => { 
            let sh = this.parentView().clientHeight()
            let h = this.clientHeight()
            this.setTop(sh/2 - h/2)
        }, 1)

        return this
    },

    horiontallyCenterFromLeftNow: function() {
        if (this.parentView() === null) {
            console.warn("horiontallyCenterFromLeftNow called on view with no superview")
            return this
        }

        this.setPosition("absolute")
        this.setDisplay("inline-block")

        // timeout used to make sure div is placed and laid out first
        // TODO: consider ordering issue
        setTimeout(() => { 
            let sw = this.parentView().clientWidth()
            let w = this.clientWidth()
            this.setTop(sw/2 - w/2)
        }, 1)

        return this
    },
    */

    rootView: function() {
        return  WebBrowserWindow.shared().documentBody()
    },

    disablePointerEventsUntilTimeout: function(ms) {
        this.setPointerEvents("none")
        console.log(this.typeId() + " disabling pointer events")

        setTimeout(() => {
            console.log(this.typeId() + " enabling pointer events")
            this.setPointerEvents("inherit")
        }, ms)
        
        return this
    },

    containerize: function() {
        // create a subview of same size as parent and put all other subviews in it
        let container = DivView.clone()
        container.setMinAndMaxHeight(this.clientHeight())
        container.setMinAndMaxWidth(this.clientWidth())
        this.moveAllSubviewsToView(container)
        this.addSubview(container)
        return container
    },

    uncontainerize: function() {
        assert(this.subviewCount() === 1)
        let container = this.subviews().first()
        this.removeSubview(container)
        container.moveAllSubviewsToView(this)
        return this
    },

    moveAllSubviewsToView: function(aView) {
        this.subviews().copy().forEach((sv) => {
            this.remove(sv)
            aView.addSubview(sv)
        })
        return this
    },

})
