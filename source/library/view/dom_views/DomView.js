"use strict"

/*
    DomView

    Base view class. Wraps a dom element.

    TODO: add dict[propertyName] -> validValueSet and check css values when set
*/

window.DomView = class DomView extends ProtoClass {
    
    initPrototype () {
        this.newSlot("divClassName", "")
        this.newSlot("elementType", "div")
        this.newSlot("element", null)

        // parent view and subviews

        this.newSlot("parentView", null)
        this.newSlot("subviews", null)

        // target / action

        this.newSlot("target", null)
        this.newSlot("action", null)
        this.newSlot("showsHaloWhenEditable", false)
        this.newSlot("tabCount", 0)
        this.newSlot("validColor", null)
        this.newSlot("invalidColor", null)

        // key views

        this.newSlot("interceptsTab", true)
        this.newSlot("nextKeyView", null)
        this.newSlot("canMakeKey", true)
        this.newSlot("unfocusOnEnterKey", false)

        // event handling

        this.newSlot("isRegisteredForVisibility", false)
        this.newSlot("intersectionObserver", null)
        this.newSlot("acceptsFirstResponder", false)
        this.newSlot("gestureRecognizers", null)
        this.newSlot("eventListenersDict", null)
        this.newSlot("defaultTapGesture", null)
    }

    init () {
        super.init()
        this.setSubviews([])
        this.setupElement()
        this.setEventListenersDict({})
        //this.setIsRegisteredForDrop(false)
        //this.setBoxSizing("border-box")
        return this
    }

    gestureRecognizers () {
        if (this._gestureRecognizers == null) {
            this._gestureRecognizers = []
        }
        return this._gestureRecognizers
    }

    setDivId (aString) {
        this.element().id = aString
        return this
    }

    setElement (e) {
        this._element = e
        setTimeout(() => { this.setIsRegisteredForFocus(true); }, 0)
        e._domView = this // try to avoid depending on this as much as possible - keep refs to divViews, not elements
        return this
    }

    createElement () {
        const e = document.createElement(this.elementType())
        return e
    }

    setupElement () {
        const e = this.createElement()
        this.setElement(e)
        this.setDivId(this.typeId())
        this.setupDivClassName()
        return this
    }

    setupDivClassName () {
        const ancestorNames = this.ancestors().map((obj) => {
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
    }

    insertDivClassName (aName) {
        const names = this.divClassName().split(" ")
        names.removeOccurancesOf(aName) // avoid duplicates
        names.atInsert(0, aName)
        this.setDivClassNames(names)
        return this
    }

    removeDivClassName (aName) {
        const names = this.divClassName().split(" ")
        names.removeOccurancesOf(aName)
        this.setDivClassNames(names)
        return this
    }

    setDivClassNames (names) {
        this.setDivClassName(names.join(" "))
        return this
    }

    /*    
    applyCSS (ruleName) {
        if (ruleName == null) { 
            ruleName = this.divClassName()
        }
        CSS.ruleAt(ruleName).applyToElement(this.element())
        return this
    }
    */

    stylesheetWithClassName (className) {
        for (let i = 0; i < document.styleSheets.length; i++) {
            const stylesheet = document.styleSheets[i]

            if ("cssRules" in stylesheet) {
                try {
                    const rules = stylesheet.cssRules
                    for (let j = 0; j < rules.length; j++) {
                        const rule = rules[j]
                        const ruleClassName = rule.selectorText.split(" ")[0]
                        console.log("rule.selectorText: ", rule.selectorText)
                        if (ruleClassName === className) {
                            return stylesheet
                        }
                    }
                } catch (e) {
                    //console.log("couldn't add CSS rule: " + rule + "")
                }
            }
        }
        return null
    }

    /*
    setCssClassAttribute (name, value) {
      
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
    }
    */

    setCssAttribute (key, newValue, didChangeCallbackFunc) {
        assert(Type.isString(key))

        const style = this.cssStyle()
        const doesSanityCheck = false
        const oldValue = style[key]

        if (String(oldValue) !== String(newValue)) {
            if (newValue == null) {
                //console.log("deleting css key ", key)
                //delete style[key]
                style.removeProperty(key)
                //console.log(this.cssStyle()[key])
            } else {
                style[key] = newValue

                if (doesSanityCheck) {
                    // sanity check the result
                    // but ignore these keys as they have equivalent functional values 
                    // that can have different string values
                    const ignoredKeys = { 
                        "background-position": true,  
                        "transition": true, 
                        "color": true , 
                        "background-color": true,
                        "box-shadow": true,
                        "border-bottom": true,
                        "transform-origin": true,
                        "outline": true,
                        "border": true,
                        "border-color": true
                    }

                    const resultValue = style[key]
                    if (!(key in ignoredKeys) && resultValue != newValue) {
                        let msg = "DomView: style['" + key + "'] not set to expected value\n";
                        msg += "     set: <" + typeof(newValue) + "> '" + newValue + "'\n";
                        msg += "     got: <" + typeof(resultValue) + "> '" + resultValue + "'\n";
                        console.warn(msg)
                        //throw new Error(msg) 
                    }
                }
            }

            if (didChangeCallbackFunc) {
                didChangeCallbackFunc()
            }
        }

        return this
    }

    getCssAttribute (key, errorCheck) {
        if (errorCheck) {
            throw new Error("getCssAttribute called with 2 arguments")
        }
        return this.cssStyle()[key]
    }

    // css px attributes

    setPxCssAttribute (name, value, didChangeCallbackFunc) {
        this.setCssAttribute(name, this.pxNumberToString(value), didChangeCallbackFunc)
        return this
    }

    getPxCssAttribute (name, errorCheck) {
        const s = this.getCssAttribute(name, errorCheck)
        if (s.length) {
            return this.pxStringToNumber(s)
        }
        return 0
    }

    // computed style

    getComputedCssAttribute (name, errorCheck) {
        return window.getComputedStyle(this.element()).getPropertyValue(name)
    }

    getComputedPxCssAttribute (name, errorCheck) {
        const s = this.getComputedCssAttribute(name, errorCheck)
        if (s.length) {
            return this.pxStringToNumber(s)
        }
        return 0
    }

    // --- css properties ---

    setPosition (s) {
        this.setCssAttribute("position", s)
        return this
    }

    position () {
        return this.getCssAttribute("position")
    }

    // pointer events

    setPointerEvents (s) {
        return this.setCssAttribute("pointer-events", s)
    }

    pointerEvents () {
        return this.getCssAttribute("pointer-events")
    }

    // transform

    setTextTransform (s) {
        this.setCssAttribute("text-transform", s)
        return this
    }

    textTransform () {
        return this.getCssAttribute("text-transform")
    }

    // zoom

    setZoom (s) {
        this.setCssAttribute("zoom", s)
        return this
    }

    zoom () {
        return this.getCssAttribute("zoom")
    }

    zoomRatio () {
        return Number(this.zoom().before("%")) / 100
    }

    setZoomRatio (r) {
        console.log("setZoomRatio: ", r)
        this.setZoomPercentage(r * 100)
        return this
    }

    setZoomPercentage (aNumber) {
        assert(Type.isNumber(aNumber))
        this.setCssAttribute("zoom", aNumber + "%")
        return this
    }

    // font family

    setFontFamily (s) {
        this.setCssAttribute("font-family", s)
        return this
    }

    fontFamily () {
        return this.getCssAttribute("font-family")
    }

    // font weight

    setFontWeight (s) {
        this.setCssAttribute("font-weight", s)
        return this
    }

    fontWeight () {
        return this.getCssAttribute("font-weight")
    }


    // font size

    setFontSize (s) {
        this.setPxCssAttribute("font-size", s)
        return this
    }

    fontSize () {
        return this.getPxCssAttribute("font-size")
    }

    computedFontSize () {
        return this.getComputedPxCssAttribute("font-size")
    }

    // margin

    setMarginString (s) {
        this.setCssAttribute("margin", s)
        return this
    }

    setMargin (s) {
        if (Type.isNumber(s)) {
            this.setPxCssAttribute("margin", s)
        } else {
            this.setCssAttribute("margin", s)
        }

        return this
    }

    margin () {
        return this.getCssAttribute("margin")
    }

    setMarginLeft (aNumber) {
        this.setPxCssAttribute("margin-left", aNumber)
        return this
    }

    setMarginRight (aNumber) {
        this.setPxCssAttribute("margin-right", aNumber)
        return this
    }

    setMarginTop (aNumber) {
        this.setPxCssAttribute("margin-top", aNumber)
        return this
    }

    setMarginBottom (aNumber) {
        this.setPxCssAttribute("margin-bottom", aNumber)
        return this
    }

    // padding left

    setPadding (aNumber) {
        this.setPxCssAttribute("padding", aNumber)
        return this
    }

    setPaddingRight (aNumber) {
        this.setPxCssAttribute("padding-right", aNumber)
        return this
    }

    setPaddingLeft (aNumber) {
        this.setPxCssAttribute("padding-left", aNumber)
        return this
    }

    setPaddingTop (aNumber) {
        this.setPxCssAttribute("padding-top", aNumber)
        return this
    }

    setPaddingBottom (aNumber) {
        this.setPxCssAttribute("padding-bottom", aNumber)
        return this
    }

    paddingLeft () {
        return this.psStringToNumber(this.getCssAttribute("padding-left"))
    }

    // padding right

    setPaddingRight (aNumber) {
        this.setPxCssAttribute("padding-right", aNumber)
        return this
    }

    paddingRight () {
        return this.psStringToNumber(this.getCssAttribute("padding-right"))
    }

    // text align

    setTextAlign (s) {
        this.setCssAttribute("text-align", s)
        return this
    }

    textAlign () {
        return this.getCssAttribute("text-align")
    }

    // background color

    setBackgroundColor (v) {
        this.setCssAttribute("background-color", v)
        return this
    }

    backgroundColor () {
        return this.getCssAttribute("background-color")
    }

    computedBackgroundColor () {
        return this.getComputedCssAttribute("background-color")
    }

    // background image

    setBackgroundImage (v) {
        this.setCssAttribute("background-image", v)
        return this
    }

    backgroundImage () {
        return this.getCssAttribute("background-image")
    }

    setBackgroundImageUrlPath (path) {
        this.setBackgroundImage("url(\"" + path + "\")")
        return this
    }

    // background size

    setBackgroundSizeWH (x, y) {
        this.setCssAttribute("background-size", x + "px " + y + "px")
        return this
    }

    setBackgroundSize (s) {
        assert(Type.isString(s))
        this.setCssAttribute("background-size", s)
        return this
    }

    makeBackgroundCover () {
        this.setBackgroundSize("cover")
        return this
    }

    makeBackgroundContain () {
        this.setBackgroundSize("contain")
        return this
    }

    // background repeat

    makeBackgroundNoRepeat () {
        this.setBackgroundRepeat("no-repeat")
        return this
    }

    setBackgroundRepeat (s) {
        assert(Type.isString(s))
        this.setCssAttribute("background-repeat", s)
        return this
    }

    backgroundRepeat () {
        return this.getCssAttribute("background-repeat")
    }

    // background position

    makeBackgroundCentered () {
        this.setBackgroundPosition("center")
        return this
    }

    setBackgroundPosition (s) {
        this.setCssAttribute("background-position", s)
        return this
    }

    backgroundPosition () {
        return this.getCssAttribute("background-position")
    }

    // icons - TODO: find a better place for this

    pathForIconName (aName) {
        const pathSeparator = "/"
        return ["resources", "icons", aName + ".svg"].join(pathSeparator)
    }

    // transition

    setTransition (s) {
        this.setCssAttribute("transition", s)

        if (this._transitions) {
            this.transitions().syncFromDomView()
        }

        return this
    }

    transition () {
        return this.getCssAttribute("transition")
    }

    // transitions

    transitions () {
        if (this._transitions == null) {
            this._transitions = DomTransitions.clone().setDomView(this).syncFromDomView()
        }
        return this._transitions
    }

    // transforms

    setTransform (s) {
        this.setCssAttribute("transform", s)
        return this
    }

    setTransformOrigin (s) {
        //transform-origin: x-axis y-axis z-axis|initial|inherit;
        //const percentageString = this.percentageNumberToString(aNumber)
        this.setCssAttribute("transform-origin", s)
        return this
    }

    /*
    TODO: add setter/getters for:

        perspective-origin: x-axis y-axis|initial|inherit;
        transform-style: flat|preserve-3d|initial|inherit;
        backface-visibility: hidden | visible;

    */

    // perspective

    setPerspective (n) {
        this.setPxCssAttribute("perspective", n)
        return this
    }

    // opacity

    setOpacity (v) {
        this.setCssAttribute("opacity", v)
        return this
    }

    opacity () {
        return this.getCssAttribute("opacity")
    }

    // z index 

    setZIndex (v) {
        this.setCssAttribute("z-index", v)
        return this
    }

    zIndex () {
        return this.getCssAttribute("z-index")
    }

    // cursor 

    setCursor (s) {
        this.setCssAttribute("cursor", s)
        return this
    }

    cursor () {
        return this.getCssAttribute("cursor")
    }

    makeCursorDefault () {
        this.setCursor("default")
        return this
    }

    makeCursorPointer () {
        this.setCursor("pointer")
        return this
    }

    makeCursorText () {
        this.setCursor("text")
        return this
    }

    makeCursorGrab () {
        this.setCursor("grab")
        return this
    }

    makeCursorGrabbing () {
        this.setCursor("grabbing")
        return this
    }

    makeCursorColResize () {
        this.setCursor("col-resize")
        return this
    }

    makeCursorRowResize () {
        this.setCursor("row-resize")
        return this
    }

    // --- focus and blur ---

    focus () {
        if (!this.isActiveElement()) {

            //this.debugLog(".focus() " + document.activeElement._domView)

            setTimeout(() => {
                this.element().focus()
                //this.debugLog(" did refocus after 0 timeout? " + this.isActiveElement())
            }, 0)
        }
        return this
    }

    focusAfterDelay (seconds) {
        setTimeout(() => {
            this.element().focus()
        }, seconds * 1000)
        return this
    }

    hasFocus () {
        return this.isActiveElement()
    }

    blur () { // surrender focus
        this.element().blur()
        return this
    }

    // top

    setTopString (s) {
        this.setCssAttribute("top", s)
        return this
    }

    setTop (aNumber) {
        this.setPxCssAttribute("top", aNumber)
        return this
    }

    top () {
        return this.getPxCssAttribute("top")
    }

    // left

    setLeftString (s) {
        this.setCssAttribute("left", s)
        return this
    }

    setLeft (aNumber) {
        this.setPxCssAttribute("left", aNumber)
        return this
    }

    left () {
        return this.getPxCssAttribute("left")
    }

    // right

    setRightString (s) {
        this.setCssAttribute("right", s)
        return this
    }

    setRight (aNumber) {
        this.setPxCssAttribute("right", aNumber)
        return this
    }

    right () {
        return this.getPxCssAttribute("right")
    }

    // bottom

    setBottomString (s) {
        this.setCssAttribute("bottom", s)
        return this
    }

    setBottom (aNumber) {
        this.setPxCssAttribute("bottom", aNumber)
        return this
    }

    bottom () {
        return this.getPxCssAttribute("bottom")
    }

    // float

    setFloat (s) {
        this.setCssAttribute("float", s)
        return this
    }

    float () {
        return this.getCssAttribute("float")
    }

    // box shadow

    setBoxShadow (s) {
        //this.debugLog(".setBoxShadow(" + s + ")")
        this.setCssAttribute("box-shadow", s)
        return this
    }

    boxShadow () {
        return this.getCssAttribute("box-shadow")
    }

    // sizing

    setBoxSizing (s) {
        //this.setBoxSizing("border-box") content-box
        return this.setCssAttribute("box-sizing", s)
    }

    boxSizing () {
        return this.getCssAttribute("box-sizing")
    }


    // border 

    setBorder (s) {
        this.setCssAttribute("border", s)
        return this
    }

    border () {
        return this.getCssAttribute("border")
    }

    // border color

    setBorderColor (s) {
        this.setCssAttribute("border-color", s)
        return this
    }

    borderColor () {
        return this.getCssAttribute("border-color")
    }

    // border top

    setBorderTop (s) {
        this.setCssAttribute("border-top", s)
        return this
    }

    borderTop () {
        return this.getCssAttribute("border-top")
    }

    // border bottom

    setBorderBottom (s) {
        this.setCssAttribute("border-bottom", s)
        return this
    }

    borderBottom () {
        return this.getCssAttribute("border-bottom")
    }

    // border left

    setBorderLeft (s) {
        //this.debugLog(" border-left set '", s, "'")
        this.setCssAttribute("border-left", s)
        return this
    }

    borderLeft () {
        return this.getCssAttribute("border-left")
    }

    // border right

    setBorderRight (s) {
        this.setCssAttribute("border-right", s)
        return this
    }

    borderRight () {
        return this.getCssAttribute("border-right")
    }

    // border radius

    setBorderRadius (s) {
        if (Type.isNumber(s)) {
            this.setPxCssAttribute("border-radius", s)
        } else {
            this.setCssAttribute("border-radius", s)
        }
        return this
    }

    borderRadius () {
        return this.getCssAttribute("border-radius")
    }

    // outline

    setOutline (s) {
        this.setCssAttribute("outline", s)
        return this
    }

    outline () {
        return this.getCssAttribute("outline")
    }

    // line height

    setLineHeight (aNumber) {
        this.setPxCssAttribute("line-height", aNumber)
        assert(this.lineHeight() == aNumber)
        return this
    }

    lineHeight () {
        return this.getPxCssAttribute("line-height")
    }

    // alignment

    setTextAlign (s) {
        this.setCssAttribute("text-align", s)
        return this
    }

    textAlign () {
        return this.getCssAttribute("text-align")
    }

    // clear

    setClear (v) {
        // clear: none|left|right|both|initial|inherit;
        this.setCssAttribute("clear", v)
        return this
    }

    clear () {
        return this.getCssAttribute("clear")
    }


    // flex direction

    setFlexDirection (v) {
        this.setCssAttribute("flex-direction", v)
        return this
    }

    flexDirection () {
        return this.getCssAttribute("flex-direction")
    }

    // flex grow

    setFlexGrow (v) {
        this.setCssAttribute("flex-grow", v)
        return this
    }

    flexGrow () {
        return this.getCssAttribute("flex-grow")
    }

    // flex shrink

    setFlexShrink (v) {
        this.setCssAttribute("flex-shrink", v)
        return this
    }

    flexShrink () {
        return this.getCssAttribute("flex-shrink")
    }

    // flex basis

    setFlexBasis (v) {
        if (Type.isNumber(v)) {
            v = this.pxNumberToString(v)
        }
        this.setCssAttribute("flex-basis", v)
        return this
    }

    flexBasis () {
        return this.getCssAttribute("flex-basis")
    }

    // color

    setColor (v) {
        this.setCssAttribute("color", v)
        return this
    }

    color () {
        return this.getCssAttribute("color")
    }

    // filters

    setFilter (s) {
        this.setCssAttribute("filter", s)
        return this
    }

    filter () {
        return this.getCssAttribute("filter")
    }

    // visibility

    setIsVisible (aBool) {
        const v = aBool ? "visible" : "hidden"
        this.setCssAttribute("visibility", v)
        return this
    }

    isVisible () {
        return this.getCssAttribute("visibility") !== "hidden";
    }

    // display

    setDisplay (s) {
        //assert(s in { "none", ...} );
        this.setCssAttribute("display", s)
        return this
    }

    display () {
        return this.getCssAttribute("display")
    }

    // visibility

    setVisibility (s) {
        this.setCssAttribute("visibility", s)
        return this
    }

    visibility () {
        return this.getCssAttribute("visibility")
    }

    // white space

    setWhiteSpace (s) {
        this.setCssAttribute("white-space", s)
        return this
    }

    whiteSpace () {
        return this.getCssAttribute("white-space")
    }

    // over flow

    setOverflow (s) {
        assert(Type.isString(s))
        this.setCssAttribute("overflow", s)
        return this
    }

    overflow () {
        return this.getCssAttribute("overflow")
    }

    // overflow x

    setOverflowX (s) {
        assert(Type.isString(s))
        this.setCssAttribute("overflow-x", s)
        return this
    }

    overflowX () {
        return this.getCssAttribute("overflow-x")
    }

    // overflow y

    setOverflowY (s) {
        assert(Type.isString(s))
        this.setCssAttribute("overflow-y", s)
        return this
    }

    overflowY () {
        return this.getCssAttribute("overflow-y")
    }



    /*	

    // text over flow

    // Overflow behavior at line end
    // Right end if ltr, left end if rtl 
    text-overflow: clip;
    text-overflow: ellipsis;
    text-overflow: "…";
    text-overflow: fade;
    text-overflow: fade(10px);
    text-overflow: fade(5%);

    // Overflow behavior at left end | at right end
    // Directionality has no influence 
    text-overflow: clip ellipsis;
    text-overflow: "…" "…";
    text-overflow: fade clip;
    text-overflow: fade(10px) fade(10px);
    text-overflow: fade(5%) fade(5%);

    // Global values 
    text-overflow: inherit;
    text-overflow: initial;
    text-overflow: unset;
    */

    setTextOverflow (s) {
        this.setCssAttribute("text-overflow", s)
        return this
    }

    textOverflow () {
        return this.getCssAttribute("text-overflow")
    }

    // user select

    userSelectKeys () {
        return [
            "-moz-user-select",
            "-khtml-user-select",
            "-webkit-user-select",
            "-o-user-select"
        ]
    }

    userSelect () {
        const style = this.cssStyle()
        let result = this.userSelectKeys().detect(key => style[key])
        result = result || style.userSelect
        return result
    }

    turnOffUserSelect () {
        this.setUserSelect("none");
        return this
    }

    turnOnUserSelect () {
        this.setUserSelect("text")
        return this
    }

    // user selection 

    setUserSelect (aString) {
        const style = this.cssStyle()
        //console.log("'" + aString + "' this.userSelect() = '" + this.userSelect() + "' === ", this.userSelect() == aString)
        if (this.userSelect() !== aString) {
            style.userSelect = aString
            this.userSelectKeys().forEach(key => style[key] = aString)
        }
        return this
    }

    // spell check

    setSpellCheck (aBool) {
        this.element().setAttribute("spellcheck", aBool);
        return this
    }

    // tool tip

    setToolTip (aName) {
        if (aName) {
            this.element().setAttribute("title", aName);
        } else {
            this.element().removeAttribute("title");
        }
        return this
    }

    // width and height

    computedWidth () {
        const w = this.getComputedPxCssAttribute("width")
        return w
    }

    computedHeight () {
        const h = this.getComputedPxCssAttribute("height")
        return h
    }

    // desired size

    desiredWidth () {
        return this.calcCssWidth()
    }

    desiredHeight () {
        return this.calcCssHeight()
    }

    // calculated CSS size (outside of parent view)

    calcCssWidth () {
        return DomTextTapeMeasure.shared().sizeOfCSSClassWithText(this.divClassName(), this.innerHTML()).width;
    }

    calcCssHeight () {
        return DomTextTapeMeasure.shared().sizeOfCSSClassWithText(this.element(), this.innerHTML()).height;
    }

    // calculated size (within parent view)

    calcWidth () {
        return DomTextTapeMeasure.shared().sizeOfElementWithText(this.element(), this.innerHTML()).width;
    }

    calcHeight () {
        return DomTextTapeMeasure.shared().sizeOfElementWithText(this.element(), this.innerHTML()).height;
    }

    // width

    setWidthString (s) {
        assert(Type.isString(s) || s === null)
        this.setCssAttribute("width", s, () => { this.didChangeWidth() })
        return this
    }

    setWidth (s) {
        this.setWidthString(s)
        return this
    }

    setWidthPercentage (aNumber) {
        const newValue = this.percentageNumberToString(aNumber)
        this.setCssAttribute("width", newValue, () => { this.didChangeWidth() })
        return this
    }

    /*
    hideScrollbar () {
        // need to do JS equivalent of: .class::-webkit-scrollbar { display: none; }
	    // this.setCssAttribute("-webkit-scrollbar", { display: "none" }) // doesn't work
	    return this
    }
    */

    // clientX - includes padding but not scrollbar, border, or margin

    clientWidth () {
        return this.element().clientWidth
    }

    clientHeight () {
        return this.element().clientHeight
    }

    // offsetX - includes borders, padding, scrollbar 

    offsetWidth () {
        return this.element().offsetWidth
    }

    offsetHeight () {
        return this.element().offsetHeight
    }

    // width

    minWidth () {
        const s = this.getCssAttribute("min-width")
        return this.pxStringToNumber(s)
    }

    maxWidth () {
        const w = this.getCssAttribute("max-width")
        if (w === "") {
            return null
        }
        return this.pxStringToNumber(w)
    }

    cssStyle () {
        return this.element().style
    }

    setMinWidth (v) {
        const type = typeof (v)
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
    }

    didChangeWidth () {
    }

    didChangeHeight () {
    }

    // --- lock/unlock size ---

    /*
    lockSize () {
        const h = this.computedHeight() 
        const w = this.computedWidth()
        this.setMinAndMaxWidth(w)
        this.setMinAndMaxHeight(h)
        return this
    }

    unlockSize () {
        this.setMinAndMaxWidth(null)
        this.setMinAndMaxHeight(null)
        return this
    }
    */

    // ----

    setMaxWidth (v) {
        /*
        if (v === this._maxWidth) {
            return this
        }
        */

        const type = typeof (v)
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
    }

    setMinAndMaxWidth (aNumber) {
        const newValue = this.pxNumberToString(aNumber)
        this.setCssAttribute("max-width", newValue, () => { this.didChangeWidth() })
        this.setCssAttribute("min-width", newValue, () => { this.didChangeWidth() })
        return this
    }

    setMinAndMaxHeight (aNumber) {
        const newValue = this.pxNumberToString(aNumber)
        this.setCssAttribute("min-height", newValue, () => { this.didChangeHeight() })
        this.setCssAttribute("max-height", newValue, () => { this.didChangeHeight() })
        return this
    }

    setMinAndMaxWidthAndHeight (aNumber) {
        this.setMinAndMaxWidth(aNumber)
        this.setMinAndMaxHeight(aNumber)
        return this
    }


    percentageNumberToString (aNumber) {
        assert(Type.isNumber(aNumber) && (aNumber >= 0) && (aNumber <= 100))
        return aNumber + "%"
    }

    pxNumberToString (aNumber) {
        if (aNumber === null) {
            return null
        }

        if (typeof (aNumber) === "string") {
            if (aNumber.beginsWith("calc") || aNumber.endsWith("px")) {
                return aNumber
            }
        }

        assert(Type.isNumber(aNumber))
        return aNumber + "px"
    }

    pxStringToNumber (s) {
        assert(Type.isString(s))
        if (s === "") {
            return 0
        }
        assert(s.endsWith("px"))
        return Number(s.replace("px", ""))
    }

    setMinAndMaxHeightPercentage (aNumber) {
        const newValue = this.percentageNumberToString(aNumber)
        this.setCssAttribute("min-height", newValue, () => { this.didChangeHeight() })
        this.setCssAttribute("max-height", newValue, () => { this.didChangeHeight() })
        return this
    }

    setHeightPercentage (aNumber) {
        const newValue = this.percentageNumberToString(aNumber)
        this.setHeightString(newValue)
        return this
    }

    setMinWidthPx (aNumber) {
        this.setMinWidth(this.pxNumberToString(aNumber))
        return this
    }

    setMinHeightPx (aNumber) {
        this.setMinHeight(this.pxNumberToString(aNumber))
        return this
    }

    setMaxHeightPx (aNumber) {
        this.setMaxHeight(this.pxNumberToString(aNumber))
        return this
    }

    maxHeight () {
        return this.getCssAttribute("max-height")
    }

    minHeight () {
        return this.getCssAttribute("min-height")
    }

    maxWidth () {
        return this.getCssAttribute("max-width")
    }

    minWidth () {
        return this.getCssAttribute("min-width")
    }

    setMinHeight (newValue) {
        assert(Type.isString(newValue))
        // <length> | <percentage> | auto | max-content | min-content | fit-content | fill-available
        this.setCssAttribute("min-height", newValue, () => { this.didChangeHeight() })
        return this
    }

    setMaxHeight (newValue) {
        assert(Type.isString(newValue))
        // <length> | <percentage> | none | max-content | min-content | fit-content | fill-available
        this.setCssAttribute("max-height", newValue, () => { this.didChangeHeight() })
        return this
    }

    setWidthPxNumber (aNumber) {
        this.setWidthString(this.pxNumberToString(aNumber))
        return this
    }

    setHeightPxNumber (aNumber) {
        this.setHeightString(this.pxNumberToString(aNumber))
        return this
    }

    setHeight (s) {
        // height: auto|length|initial|inherit;

        if (Type.isNumber(s)) {
            return this.setHeightPxNumber(s)
        }
        this.setHeightString(s)
        return this
    }

    setWidthToAuto () {
        this.setWidthString("auto")
        return this
    }

    setHeightToAuto () {
        this.setHeightString("auto")
    }

    setHeightString (s) {
        assert(Type.isString(s) || s === null)
        this.setCssAttribute("height", s, () => { this.didChangeHeight() })
        return this
    }

    height () {
        return this.getCssAttribute("height")
    }

    // --- div class name ---

    setDivClassName (aName) {
        if (this._divClassName !== aName) {
            this._divClassName = aName
            if (this.element()) {
                this.element().setAttribute("class", aName);
            }
        }
        return this
    }

    divClassName () {
        if (this.element()) {
            const className = this.element().getAttribute("class");
            this._divClassName = className
            return className
        }
        return this._divClassName
    }

    // --- parentView ---

    setParentView (aView) {
        if (this._parentView !== aView) {
            this._parentView = aView
            this.didChangeParentView()
        }
        return this
    }

    hasParentView () {
        return Type.isNullOrUndefined(this.parentView()) === false
    }

    didChangeParentView () {
        return this
    }

    // --- subviews ---

    hasSubviewDescendant (aView) {
        const match = this.subviews().detect((sv) => {
            return sv === aView || sv.hasSubviewDescendant(aView)
        })
        return !Type.isNullOrUndefined(match)
    }

    subviewCount () {
        return this.subviews().length
    }

    hasSubview (aSubview) {
        return this.subviews().contains(aSubview)
    }

    addSubviewIfAbsent (aSubview) {
        if (!this.hasSubview(aSubview)) {
            this.addSubview(aSubview)
        }
        return this
    }

    addSubview (aSubview) {
        assert(!Type.isNullOrUndefined(aSubview)) 
        assert(!Type.isNullOrUndefined(aSubview.element())) 

        if (this.hasSubview(aSubview)) {
            throw new Error(this.type() + ".addSubview(" + aSubview.type() + ") attempt to add duplicate subview ")
        }

        this.willAddSubview(aSubview)
        this.subviews().append(aSubview)

        this.element().appendChild(aSubview.element());
        aSubview.setParentView(this)
        this.didChangeSubviewList()
        return aSubview
    }

    addSubviews (someSubviews) {
        someSubviews.forEach(sv => this.addSubview(sv))
        return this
    }

    swapSubviews (sv1, sv2) {
        assert(sv1 !== sv2)
        assert(this.hasSubview(sv1))
        assert(this.hasSubview(sv2))
        
        const i1 = this.indexOfSubview(sv1)
        const i2 = this.indexOfSubview(sv2)

        this.removeSubview(sv1)
        this.removeSubview(sv2)

        if (i1 < i2) {
            this.atInsertSubview(i1, sv2) // i1 is smaller, so do it first
            this.atInsertSubview(i2, sv1)
        } else {
            this.atInsertSubview(i2, sv1) // i2 is smaller, so do it first          
            this.atInsertSubview(i1, sv2)
        }

        assert(this.indexOfSubview(sv1) === i2)
        assert(this.indexOfSubview(sv2) === i1)

        return this
    }

    orderSubviewFront (aSubview) {
        if (this.subviews().last() !== aSubview) {
            this.removeSubview(aSubview)
            this.addSubview(aSubview)
        }
        return this
    }

    orderFront () {
        const pv = this.parentView()
        if (pv) {
            pv.orderSubviewFront(this)
        }
        return this
    }

    orderSubviewBack (aSubview) {
        this.removeSubview(aSubview)
        this.atInsertSubview(0, aSubview)
        return this
    }

    orderBack () {
        const pv = this.parentView()
        if (pv) {
            pv.orderSubviewBack(this)
        }
        return this
    }

    replaceSubviewWith (oldSubview, newSubview) {
        assert(this.hasSubview(oldSubview))
        assert(!this.hasSubview(newSubview))
        
        const index = this.indexOfSubview(oldSubview)
        this.removeSubview(oldSubview)
        this.atInsertSubview(index, newSubview)

        assert(this.indexOfSubview(newSubview) === index)
        assert(this.hasSubview(newSubview))
        assert(!this.hasSubview(oldSubview))
        return this
    }

    atInsertSubview (anIndex, aSubview) {
        this.subviews().atInsert(anIndex, aSubview)
        assert(this.subviews()[anIndex] === aSubview)

        DomElement_atInsertElement(this.element(), anIndex, aSubview.element())
        assert(this.element().childNodes[anIndex] === aSubview.element())

        aSubview.setParentView(this) // TODO: unify with addSubview
        this.didChangeSubviewList() // TODO:  unify with addSubview
        return aSubview
    }

    moveSubviewToIndex (aSubview, i) {
        assert(i < this.subviews().length)
        assert(this.subviews().contains(aSubview))

        if (this.subviews()[i] !== aSubview) {
            this.removeSubview(aSubview)
            this.atInsertSubview(i, aSubview)
        }

        /*
        this.element().removeChild(aSubview.element())
        DomElement_atInsertElement(this.element(), anIndex, aSubview.element())
        this.subviews().remove(aSubview)
        this.subviews().atInsert(anIndex, aSubview)
        */
        return this
    }

    /*
    max-height: none
    min-height: ..
    
    width: auto
    height: auto

    */

    updateSubviewsToOrder (orderedSubviews) {
        assert(this.subviews() !== orderedSubviews)
        assert(this.subviews().length === orderedSubviews.length)

        for (let i = 0; i < this.subviews().length; i ++) {
            //const v1 = this.subviews()[i]
            const v2 = orderedSubviews[i]
            this.moveSubviewToIndex(v2, i)
            /*
            if (v1 !=== v2) {
                this.moveSubviewToIndex(v2, i)
            }
            */
        }
        
        return this
    }

    // --- subview utilities ---

    sumOfSubviewHeights () {
        return this.subviews().sum(subview => subview.clientHeight())
    }

    performOnSubviewsExcept (methodName, exceptedSubview) {
        this.subviews().forEach(subview => {
            if (subview !== exceptedSubview) {
                subview[methodName].apply(subview)
            }
        })

        return this
    }

    // --- animations ---

    animateToDocumentFrame (destinationFrame, seconds, completionCallback) {
        this.setTransition("all " + seconds + "s")
        assert(this.position() === "absolute")
        setTimeout(() => {
            this.setTop(destinationFrame.origin().y())
            this.setLeft(destinationFrame.origin().x())
            this.setMinAndMaxWidth(destinationFrame.size().width())
            this.setMinAndMaxHeight(destinationFrame.size().height())
        }, 0)

        setTimeout(() => {
            completionCallback()
        }, seconds * 1000)
        return this
    }

    animateToDocumentPoint (destinationPoint, seconds, completionCallback) {
        this.setTransition("all " + seconds + "s")
        assert(this.position() === "absolute")
        setTimeout(() => {
            this.setTop(destinationPoint.y())
            this.setLeft(destinationPoint.x())
        }, 0)

        setTimeout(() => {
            completionCallback()
        }, seconds * 1000)
        return this
    }

    hideAndFadeIn () {
        this.setOpacity(0)
        this.setTransition("all 0.5s")
        setTimeout(() => {
            this.setOpacity(1)
        }, 0)
    }

    fadeInToDisplayInlineBlock () {
        this.transitions().at("opacity").updateDuration("0.3s")
        this.setDisplay("inline-block")
        this.setOpacity(0)
        setTimeout(() => {
            this.setOpacity(1)
        }, 0)
        return this
    }

    fadeOutToDisplayNone () {
        this.transitions().at("opacity").updateDuration("0.3s")
        this.setOpacity(0)
        setTimeout(() => {
            this.setDisplay("none")
        }, 200)
        return this
    }

    // --- fade + height animations ----

    fadeInHeightToDisplayBlock () {
        this.setMinHeight("100%")
        this.setMaxHeight("100%")
        const targetHeight = this.calcHeight()

        this.setOverflow("hidden")
        this.transitions().at("opacity").updateDuration("0.3s")
        this.transitions().at("min-height").updateDuration("0.2s")
        this.transitions().at("max-height").updateDuration("0.2s")

        this.setDisplay("block")
        this.setOpacity(0)
        this.setMinAndMaxHeight(0)

        setTimeout(() => {
            this.setOpacity(1)
            this.setMinAndMaxHeight(targetHeight)
        }, 0)
        return this
    }

    fadeOutHeightToDisplayNone () {
        this.setOverflow("hidden")
        this.transitions().at("opacity").updateDuration("0.2s")
        this.transitions().at("min-height").updateDuration("0.3s")
        this.transitions().at("max-height").updateDuration("0.3s")

        setTimeout(() => {
            this.setOpacity(0)
            this.setMinAndMaxHeight(0)
        }, 1)

        /*
        setTimeout(() => {
            this.setDisplay("none")
        }, 300)
        */
        return this
    }

    // -----------------------

    removeFromParentView () {
        this.parentView().removeSubview(this)
        return this
    }

    removeAfterFadeDelay (delayInSeconds) {
        // call removeSubview for a direct actions
        // use justRemoteSubview for internal changes

        this.setTransition("all " + delayInSeconds + "s")
        setTimeout(() => {
            this.setOpacity(0)
        }, 0)

        setTimeout(() => {
            this.parentView().removeSubview(this)
        }, delayInSeconds * 1000)

        return this
    }

    willRemove () {
    }

    didChangeSubviewList () {
    }

    hasSubview (aSubview) {
        return this.subviews().indexOf(aSubview) !== -1;
    }

    hasChildElement (anElement) {
        const children = this.element().childNodes
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (anElement === child) {
                return true
            }
        }
        return false
    }

    willAddSubview (aSubview) {
        // for subclasses to over-ride
    }

    willRemoveSubview (aSubview) {
        // for subclasses to over-ride
    }

    removeSubviewIfPresent (aSubview) {
        if (this.hasSubview(aSubview)) {
            this.removeSubview(aSubview)
        }
        return this
    }

    removeSubview (aSubview) {
        //console.warn("WARNING: " + this.type() + " removeSubview " + aSubview.type())

        if (!this.hasSubview(aSubview)) {
            console.warn(this.type() + " removeSubview " + aSubview.typeId() + " failed - no child found among: ", this.subviews().map(view => view.typeId()))
            Error.showCurrentStack()
            return aSubview
        }

        this.willRemoveSubview(aSubview)
        aSubview.willRemove()

        this.subviews().remove(aSubview)

        // sanity check 

        const e = aSubview.element()
        if (this.hasChildElement(e)) {
            this.element().removeChild(e);

            if (this.hasChildElement(e)) {
                console.warn("WARNING: " + this.type() + " removeSubview " + aSubview.type() + " failed - still has element after remove")
                Error.showCurrentStack()
            }
        } else {
            console.warn("WARNING: " + this.type() + " removeSubview " + aSubview.type() + " parent element is missing this child element")
        }
 

        aSubview.setParentView(null)
        this.didChangeSubviewList()
        return aSubview
    }

    removeAllSubviews () {
        this.subviews().shallowCopy().forEach(subview => this.removeSubview(subview))
        assert(this.subviews().length === 0)
        return this
    }

    indexOfSubview (aSubview) {
        return this.subviews().indexOf(aSubview)
    }

    subviewAfter (aSubview) {
        const index = this.indexOfSubview(aSubview)
        const nextIndex = index + 1
        if (nextIndex < this.subviews().length) {
            return this.subviews()[nextIndex]
        }
        return null
    }

    sendAllViewDecendants (methodName, argList) {
        this.subviews().forEach((v) => {
            v[methodName].apply(v, argList)
            v.sendAllViewDecendants(methodName, argList)
        })
        return this
    }

    // --- active element ---

    isActiveElement () {
        return document.activeElement === this.element()
    }

    isActiveElementAndEditable () {
        return this.isActiveElement() && this.contentEditable()
    }

    isFocused () {
        return this.isActiveElement()
    }

    // --- inner html ---

    setInnerHTML (v) {
        const oldValue = this.element().innerHTML

        if (v == null) {
            v = ""
        }

        v = "" + v

        if (v === oldValue) {
            return this
        }

        /*
        if (this.type() === "BrowserRowNote") {
        //if (v !== "&gt;" && v !== "") {
            this.debugLog(" changing innerHTML from '" + oldValue + "' to '" + v + "'")
        }
        */

        const isFocused = this.isActiveElementAndEditable()

        if (isFocused) {
            this.blur()
        }

        this.element().innerHTML = v

        if (isFocused) {
            this.focus()
        }

        return this
    }

    innerHTML () {
        return this.element().innerHTML
    }

    setString (v) {
        return this.setInnerHTML(v)
    }

    string () {
        return this.innerHTML()
    }

    loremIpsum (maxWordCount) {
        this.setInnerHTML("".loremIpsum(10, 40))
        return this
    }

    // --- updates ---

    tellParentViews (msg, aView) {
        const f = this[msg]
        if (f && f.apply(this, [aView])) {
            return // stop propogation on first view returning non-false
        }

        const p = this.parentView()
        if (p) {
            p.tellParentViews(msg, aView)
        }
    }

    // --- events --------------------------------------------------------------------

    // --- event listeners ---

    listenerNamed (className) {
        const dict = this.eventListenersDict()
        if (!dict[className]) {
            assert(className in window)
            const proto = window[className]
            dict[className] = proto.clone().setListenTarget(this.element()).setDelegate(this)
        }
        return dict[className]
    }

    clipboardListener () {
        return this.listenerNamed("ClipboardListener")
    }

    documentListener () {
        return this.listenerNamed("DocumentListener") // listen target will be the window
    }

    dragListener () {
        return this.listenerNamed("DragListener")
    }

    dropListener () {
        return this.listenerNamed("DropListener")
    }

    focusListener () {
        return this.listenerNamed("FocusListener")
    }

    mouseListener () {
        return this.listenerNamed("MouseListener")
    }

    keyboardListener () {
        return this.listenerNamed("KeyboardListener")
    }

    touchListener () {
        return this.listenerNamed("TouchListener")
    }

    // ---


    // --- window resize events ---

    isRegisteredForDocumentResize () {
        return this.documentListener().isListening()
    }

    setIsRegisteredForDocumentResize (aBool) {
        this.documentListener().setIsListening(aBool)
        return this
    }

    onDocumentResize (event) {
        return true
    }

    // --- onClick event, target & action ---

    isRegisteredForClicks () {
        return this.mouseListener().isListening()
    }

    setIsRegisteredForClicks (aBool) {
        this.mouseListener().setIsListening(aBool)

        if (aBool) {
            this.makeCursorPointer()
        } else {
            this.makeCursorDefault()
        }

        return this
    }

    hasTargetAndAction () {
        return (this.target() !== null) && (this.action() !== null)
    }

    setTarget (anObject) {
        this._target = anObject
        this.setIsRegisteredForClicks(this.hasTargetAndAction())
        return this
    }

    setAction (anActionString) {
        this._action = anActionString
        //this.setIsRegisteredForClicks(this.hasTargetAndAction())
        if (anActionString && Type.isNullOrUndefined(this.onTapComplete)) { 
            // remove this later if we don't find anything using it
            console.warn(this.typeId() + " may have depended on setIsRegisteredForClicks")
        }
        return this
    }

    onClick (event) {
        this.debugLog(".onClick()")
        this.sendActionToTarget()
        event.stopPropagation()
        return false
    }

    sendActionToTarget () {
        if (!this.action()) {
            return null
        }

        const t = this.target()
        if (!t) {
            throw new Error("no target for action " + this.action())
        }

        const method = t[this.action()]
        if (!method) {
            throw new Error("no target for action " + this.action())
        }

        return method.apply(t, [this])
    }

    onDoubleClick (event) {
        return true
    }

    // -- browser dropping ---

    isRegisteredForDrop () {
        return this.dropListener().isListening()
    }

    setIsRegisteredForDrop (aBool) {
        this.dropListener().setIsListening(aBool)
        return this
    }

    acceptsDrop () {
        return true
    }

    // ---------------------

    onDragEnter (event) {
        // triggered on drop target
        console.log("onDragEnter acceptsDrop: ", this.acceptsDrop());
        //event.preventDefault() // needed?

        if (this.acceptsDrop()) {
            this.onDragOverAccept(event)
            event.preventDefault()
            return true
        }
        event.preventDefault()

        return false;
    }

    onDragOver (event) {
        // triggered on drop target
        //console.log("onDragOver acceptsDrop: ", this.acceptsDrop(), " event:", event);
        //event.preventDefault() // needed?
        //event.dataTransfer.dropEffect = 'copy';

        if (this.acceptsDrop()) {
            this.onDragOverAccept(event)
            event.preventDefault()
            return true
        }
        event.preventDefault()

        return false;
    }

    onDragOverAccept (event) {
        //console.log("onDragOverAccept ");
        this.dragHighlight()
    }

    onDragLeave (event) {
        // triggered on drop target
        //console.log("onDragLeave ", this.acceptsDrop());
        this.dragUnhighlight()
        return this.acceptsDrop();
    }

    dragHighlight () {

    }

    dragUnhighlight () {

    }

    onDrop (event) {
        // triggered on drop target
        if (this.acceptsDrop()) {
            //const file = event.dataTransfer.files[0];
            //console.log('onDrop ' + file.path);
            this.onDataTransfer(event.dataTransfer)
            this.dragUnhighlight()
            event.preventDefault();
            return true;
        }
        event.preventDefault();

        return false
    }

    onDataTransfer (dataTransfer) {
        //console.log('onDataTransfer ', dataTransfer);

        if (dataTransfer.files.length) {
            const dataUrls = []
            for (let i = 0; i < dataTransfer.files.length; i++) {
                const file = dataTransfer.files[i]
                //console.log("file: ", file)

                if (!file.type.match("image.*")) {
                    continue;
                }

                const reader = new FileReader();
                reader.onload = ((event) => {
                    this.onDropImageDataUrl(event.target.result)
                })
                reader.readAsDataURL(file);

            }
        }

    }

    onDropImageDataUrl (dataUrl) {
        console.log("onDropImageDataUrl: ", dataUrl);
    }

    onDropFiles (filePaths) {
        console.log("onDropFiles " + filePaths);
    }

    // dragging

    setDraggable (aBool) {
        assert(Type.isBoolean(aBool))
        this.element().setAttribute("draggable", aBool);
        return this
    }

    isRegisteredForDrag () {
        return this.dragListener().isListening()
    }

    setIsRegisteredForDrag (aBool) {
        this.dragListener().setIsListening(aBool)
        this.setDraggable(aBool)
        return this
    }

    onDragStart (event) {
        // triggered in element being dragged
        // DownloadURL only works in Chrome?
        
        /*
        application/json // doesn't work
        application/x-javascript // doesn't work
        text/javascript // doesn't work
        text/x-javascript // doesn't work
        text/x-json // doesn't work
        text/plain // works
        text/html // doesn't works 

        text/uri-list // should work
        */
       
        /*
        const json = { type: this.type() }
        //const fileDetails = "application/json:filename.json:{}"
        //event.dataTransfer.setData("text/plain", "test")

        //const mimeType = "text/plain"
        const mimeType = "image/png"
        event.dataTransfer.setData(mimeType, JSON.stringify(json))
        event.dataTransfer.effectAllowed = "copy";
        */

        /*
        const fileDetails = "application/octet-stream:Eadui.ttf:http://thecssninja.com/gmail_dragout/Eadui.ttf"
        event.dataTransfer.setData("DownloadURL", fileDetails);

        //event.dataTransfer.setData("DownloadURL", fileDetails);
            <a href="Eadui.ttf" id="dragout" draggable="true" data-downloadurl="
            application/octet-stream
            :Eadui.ttf
            :http://thecssninja.com/gmail_dragout/Eadui.ttf">Font file</a>
        */
        return false;
    }

    onDragEnd (event) {
        // triggered in element being dragged
        this.dragUnhighlight();
        //console.log("onDragEnd");
    }

    // --- editing - abstracted from content editable for use in non text views ---

    setIsEditable (aBool) {
        // subclasses can override for non text editing behaviors e.g. a checkbox, toggle switch, etc
        this.setContentEditable(aBool)
        return this
    }

    isEditable () {
        return this.isContentEditable()
    }

    // --- content editing ---

    setContentEditable (aBool) {
        //console.log(this.divClassName() + " setContentEditable(" + aBool + ")")
        if (aBool) {
            this.makeCursorText()
            //this.element().ondblclick = (event) => { this.selectAll();	}
        } else {
            this.element().ondblclick = null
        }

        this.element().contentEditable = aBool ? "true" : "false"

        /*
        if (this.showsHaloWhenEditable()) {
            this.setBoxShadow(aBool ? "0px 0px 5px #ddd" : "none")
        }
        */

        //this.element().style.hideFocus = true
        this.element().style.outline = "none"

        this.setIsRegisteredForKeyboard(aBool)

        if (aBool) {
            this.turnOnUserSelect()
        }

        this.setIsRegisteredForClipboard(aBool)

        return this
    }

    isContentEditable () { // there's a separate method for contentEditable() that just accesses element attribute
        //var v = window.getComputedStyle(this.element(), null).getPropertyValue("contentEditable");
        const s = this.element().contentEditable
        if (s === "inherit" && this.parentView()) {
            return this.parentView().isContentEditable()
        }
        const aBool = (s === "true" || s === true)
        return aBool
    }

    contentEditable () {
        return this.element().contentEditable === "true"
    }

    // touch events

    setTouchAction (s) {
        this.setCssAttribute("-ms-touch-action", s) // needed?
        this.setCssAttribute("touch-action", s)
        return this
    }

    isRegisteredForTouch () {
        return this.touchListener().isListening()
    }

    setIsRegisteredForTouch (aBool) {
        this.touchListener().setIsListening(aBool)

        if (aBool) {
            this.setTouchAction("none") // testing
        }

        return this
    }

    onTouchStart (event) {
        //this.onPointsStart(points)
    }

    onTouchMove (event) {
        //this.onPointsMove(points)
    }

    onTouchCancel (event) {
        //this.onPointsCancel(points)
    }

    onTouchEnd (event) {
        //this.onPointsEnd(points)
    }

    /// GestureRecognizers

    hasGestureType (typeName) {
        return this.gesturesOfType(typeName).length > 0
    }

    hasGestureRecognizer (gr) {
        return this.gestureRecognizers().contains(gr)
    }

    addGestureRecognizerIfAbsent (gr) {
        if (!this.hasGestureRecognizer(gr)) {
            this.addGestureRecognizer(gr)
        }
        return this
    }

    addGestureRecognizer (gr) {
        assert(!this.hasGestureRecognizer(gr))
        this.gestureRecognizers().append(gr)
        gr.setViewTarget(this)
        gr.start()
        return gr
    }

    removeGestureRecognizer (gr) {
        if (this.gestureRecognizers()) {
            gr.stop()
            gr.setViewTarget(null)
            this.gestureRecognizers().remove(gr)
        }
        return this
    }

    gesturesOfType (typeName) {
        return this.gestureRecognizers().select(gr => gr.type() == typeName)
    }

    removeGestureRecognizersOfType (typeName) {
        if (this.gestureRecognizers()) {
            this.gestureRecognizers().select(gr => gr.type() == typeName).forEach(gr => this.removeGestureRecognizer(gr))
        }
        return this
    }

    // default tap gesture

    addDefaultTapGesture () {
        if (!this.defaultTapGesture()) {
            this.setDefaultTapGesture( this.addGestureRecognizer(TapGestureRecognizer.clone()) )
        }
        return this.defaultTapGesture()
    }

    removeDefaultTapGesture () {
        if (this.defaultTapGesture()) {
            this.removeGestureRecognizer(this.defaultTapGesture())
            this.setDefaultTapGesture(null)
        }
        return this
    }

    // default pan gesture

    addDefaultPanGesture () {
        if (!this._defaultPanGesture) {
            this._defaultPanGesture = this.addGestureRecognizer(PanGestureRecognizer.clone()) 
        }
        return this._defaultPanGesture
    }

    defaultPanGesture () {
        return this._defaultPanGesture
    }

    removeDefaultPanGesture () {
        if (this._defaultPanGesture) {
            this.removeGestureRecognizer(this._defaultPanGesture)
            this._defaultPanGesture = null
        }
        return this
    }

    /*
    requestActiveGesture (aGesture) {
        return GestureManager.shared().requestActiveGesture(aGesture);
    }

    firstActiveGesture () {
        return this.gestureRecognizers().detect((gr) => {
            return gr.isActive()
        })
    }

    requestActiveGesture (aGesture) {
        assert(aGesture)

        const first = this.firstActiveGesture()

        if (!first) {
            this.cancelAllGesturesExcept(aGesture)
            return true
        }
        
        if (first === aGesture) {
            return true
        }

        return false
    }
`   */

    cancelAllGesturesExcept (aGesture) {
        this.gestureRecognizers().forEach((gr) => {
            //if (gr.type() !== aGesture.type()) {
            if (gr !== aGesture) {
                gr.cancel()
            }
        })
        return this
    }

    // --- mouse events ---

    isRegisteredForMouse () {
        return this.mouseListener().isListening()
    }

    setIsRegisteredForMouse (aBool, useCapture) {
        this.mouseListener().setUseCapture(useCapture).setIsListening(aBool) //.setIsDebugging(true)
        return this
    }

    onMouseMove (event) {
        return true
    }

    onMouseOver (event) {
        return true
    }

    onMouseLeave (event) {
        return true
    }

    onMouseOver (event) {
        return true
    }

    onMouseDown (event) {
        const methodName = Mouse.shared().downMethodNameForEvent(event)
        if (methodName !== "onMouseDown") {
            this.debugLog(".onMouseDown calling: ", methodName)
            this.invokeMethodNameForEvent(methodName, event)
        }
        return true
    }

    onMouseUp (event) {
        const methodName = Mouse.shared().upMethodNameForEvent(event)
        if (methodName !== "onMouseUp") {
            this.debugLog(".onMouseUp calling: ", methodName)
            this.invokeMethodNameForEvent(methodName, event)
        }
        return true
    }

    // --- keyboard events ---

    isRegisteredForKeyboard () {
        return this.keyboardListener().isListening()
    }

    setIsRegisteredForKeyboard (aBool, useCapture) {
        this.keyboardListener().setUseCapture(useCapture).setIsListening(aBool)

        const e = this.element()
        if (aBool) {
            DomView._tabCount++
            e.tabIndex = DomView._tabCount // need this in order for focus to work on BrowserColumn?
            //this.setCssAttribute("outline", "none"); // needed?
        } else {
            delete e.tabindex
        }

        return this
    }

    /*
    onEnterKeyDown (event) {
        this.debugLog(" onEnterKeyDown")
        if (this.unfocusOnEnterKey() && this.isFocused()) {
            this.debugLog(" releasing focus")
            // this.releaseFocus() // TODO: implement something to pass focus up view chain to whoever wants it
            //this.element().parentElement.focus()
            if (this.parentView()) {
                this.parentView().focus()
            }
        }
        return this
    }
    */

    onKeyDown (event) {
        //this.debugLog(" onKeyDown ", event._id)
        //Keyboard.shared().showEvent(event)

        const methodName = Keyboard.shared().downMethodNameForEvent(event)
        //console.log("onKeyDown methodName: ", methodName)
        this.invokeMethodNameForEvent(methodName, event)

        return true
    }

    invokeMethodNameForEvent (methodName, event) {
        //this.debugLog(".invokeMethodNameForEvent('" + methodName + "')")
        if (this[methodName]) {
            const stopProp = this[methodName].apply(this, [event])
            //event.preventDefault()
            if (stopProp === false) {
                //event.preventDefault()
                event.stopPropagation()
                return false
            }
        }

        return true
    }

    onKeyPress (event) {
        // console.log("onKeyPress")
        return true
    }

    onKeyUp (event) {
        let shouldPropogate = true
        //this.debugLog(" onKeyUp ", event._id)

        const methodName = Keyboard.shared().upMethodNameForEvent(event)
        //console.log("methodName: ", methodName)
        this.invokeMethodNameForEvent(methodName, event)

        this.didEdit()
        return shouldPropogate
    }

    didEdit () {
        this.debugLog(" didEdit")
        this.tellParentViews("onDidEdit", this)
        return this
    }

    onEnterKeyUp (event) {
        return true
    }

    // --- tabs and next key view ----

    onTabKeyDown (event) {
        // need to implement this on key down to prevent browser from handling tab?
        //this.debugLog(" onTabKeyDown ", event._id)

        if(this.selectNextKeyView()) {
            //event.stopImmediatePropagation() // prevent other listeners from getting this event
            //console.log("stopImmediatePropagation ")
        }
        console.log("---")
        return false
    }

    onTabKeyUp (event) {
        //this.debugLog(" onTabKeyUp ", event._id)
        return false
    }

    becomeKeyView () {
        this.focus()
        return this
    }

    selectNextKeyView () {
        // returns true if something is selected, false otherwise

        //this.debugLog(" selectNextKeyView")
        const nkv = this.nextKeyView()
        if (nkv) {
            nkv.becomeKeyView()
            return true
        } else {
            const p = this.parentView()
            if (p) {
                return p.selectNextKeyView()
            }
        }
        return false
    }

    // --- error checking ---

    isValid () {
        return true
    }

    // --- focus and blur event handling ---

    isRegisteredForFocus () {
        return this.focusListener().isListening()
    }

    setIsRegisteredForFocus (aBool) {
        this.focusListener().setIsListening(aBool)
        return this
    }

    willAcceptFirstResponder () {
        //this.debugLog(".willAcceptFirstResponder()")
        return this
    }

    didReleaseFirstResponder () {
        // called on focus event from browser
        return this
    }

    // firstResponder

    willBecomeFirstResponder () {
        // called if becomeFirstResponder accepts
    }

    becomeFirstResponder () {
        if (this.acceptsFirstResponder()) {
            this.willBecomeFirstResponder()
            this.focus()
        } else if (this.parentView()) {
            this.parentView().becomeFirstResponder()
        }
        return this
    }

    releaseFirstResponder () {
        // walk up parent view chain and focus on the first view to 
        // answer true for the acceptsFirstResponder message
        //this.debugLog(".releaseFirstResponder()")

        this.blur()
        if (this.parentView()) {
            this.parentView().becomeFirstResponder()
        }
        return this
    }

    // --------------------------------------------------------

    onFocus () {
        this.willAcceptFirstResponder();
        // subclasses can override 
        //this.debugLog(" onFocus")
        return true
    }

    onBlur () {
        this.didReleaseFirstResponder();
        // subclasses can override 
        //this.debugLog(" onBlur")
        return true
    }

    innerText () {
        const e = this.element()
        return e.textContent || e.innerText || "";
    }

    // --- set caret ----

    moveCaretToEnd () {
        const contentEditableElement = this.element()
        let range, selection;

        if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }
        else if (document.selection)//IE 8 and lower
        {
            range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            range.select();//Select the range (make it the visible selection
        }
        return this
    }

    // --- text selection ------------------

    selectAll () {
        if (document.selection) {
            const range = document.body.createTextRange();
            range.moveToElementText(this.element());
            range.select();
        } else if (window.getSelection) {
            const selection = window.getSelection(); 
            const range = document.createRange();
            range.selectNodeContents(this.element());
            selection.removeAllRanges();
            selection.addRange(range);  
        }
    }

    // --- paste from clipboard ---

    onPaste (e) {
        // prevent pasting text by default after event
        e.preventDefault();

        const clipboardData = e.clipboardData;
        const rDataHTML = clipboardData.getData("text/html");
        const rDataPText = clipboardData.getData("text/plain");

        const htmlToPlainTextFunc = function (html) {
            const tmp = document.createElement("DIV");
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
    }

    // ------------

    isRegisteredForClipboard () {
        return this.clipboardListener().isListening()
    }

    setIsRegisteredForClipboard (aBool) {
        this.clipboardListener().setIsListening(aBool)
        return this
    }

    replaceSelectedText (replacementText) {
        let range;
        if (window.getSelection) {
            const sel = window.getSelection();
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
    }

    /*
    // untested

    setCaretPosition (caretPos) {
        const elem = this.element();

        if(elem != null) {
            if(elem.createTextRange) {
                const range = elem.createTextRange();
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
    }
    */

    clearSelection () {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
        return this
    }

    setContentAfterOrBeforeString (aString, afterOrBefore) {
        const uniqueClassName = "UniqueClass_" + this.puuid()
        const e = this.element()
        if (e.className.indexOf(uniqueClassName) === -1) {
            const newRuleKey = "DomView" + uniqueClassName + ":" + afterOrBefore
            const newRuleValue = "content: \"" + aString + "\;"
            //console.log("newRule '" + newRuleKey + "', '" + newRuleValue + "'")
            document.styleSheets[0].addRule(newRuleKey, newRuleValue);
            e.className += " " + uniqueClassName
        }
        return this
    }

    setContentAfterString (aString) {
        this.setContentAfterOrBeforeString(aString, "after")
        return this
    }

    setContentBeforeString (aString) {
        this.setContentAfterOrBeforeString(aString, "before")
        return this
    }

    // scroll top

    setScrollTop (v) {
        this.element().scrollTop = v
        return this
    }

    scrollTop () {
        return this.element().scrollTop
    }

    // scroll width & scroll height

    scrollWidth () {
        return this.element().scrollWidth // a read-only value
    }

    scrollHeight () {
        return this.element().scrollHeight // a read-only value
    }

    // offset width & offset height

    offsetLeft () {
        return this.element().offsetLeft // a read-only value
    }

    offsetTop () {
        return this.element().offsetTop // a read-only value
    }

    // scroll actions

    scrollToTop () {
        this.setScrollTop(0)
        return this
    }

    scrollToBottom () {
        const focusedElement = document.activeElement
        const needsRefocus = focusedElement !== this.element()
        // console.log("]]]]]]]]]]]] " + this.typeId() + ".scrollToTop() needsRefocus = ", needsRefocus)

        this.setScrollTop(this.scrollHeight())

        if (needsRefocus) {
            focusedElement.focus()
        }
        //e.animate({ scrollTop: offset }, 500); // TODO: why doesn't this work?
        return this
    }

    scrollSubviewToTop (aSubview) {
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
    }

    animateValue (targetFunc, valueFunc, setterFunc, duration) { // duration in milliseconds         
        console.log("]]]]]]]]]]]] " + this.typeId() + ".animateValue()")
        if (duration == null) {
            duration = 200
        }
        //duration = 1500
        const startTime = Date.now();

        const step = () => {
            const dt = (Date.now() - startTime)
            let r = dt / duration
            r = Math.sin(r * Math.PI / 2)
            r = r * r * r

            const currentValue = valueFunc()
            const currentTargetValue = targetFunc()

            //console.log("time: ", dt, " /", duration, " r:", r, " top:", currentValue, "/", currentTargetValue)

            if (dt > duration) {
                setterFunc(currentTargetValue)
            } else {
                const newValue = currentValue + (currentTargetValue - currentValue) * r
                setterFunc(newValue)
                window.requestAnimationFrame(step);
            }
        }

        window.requestAnimationFrame(step);

        return this
    }

    setScrollTopSmooth (newScrollTop, scrollDuration) {
        this.animateValue(() => { return newScrollTop }, () => { return this.scrollTop() }, (v) => { this.setScrollTop(v) }, scrollDuration)
        return this
    }

    dynamicScrollIntoView () {
        this.parentView().scrollSubviewToTop(this)
        return this
    }

    scrollIntoView () {
        const focusedView = WebBrowserWindow.shared().activeDomView()
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
    }

    boundingClientRect () {
        return this.element().getBoundingClientRect()
    }

    viewportX () {
        return this.boundingClientRect().x
    }

    viewportY () {
        return this.boundingClientRect().y
    }

    containsViewportPoint () {
        throw new Error("unimplemented")
    }

    isScrolledIntoView () {
        const r = this.boundingClientRect()
        const isVisible = (r.top >= 0) && (r.bottom <= window.innerHeight);
        return isVisible;
    }

    // helpers

    /*
    mouseUpPos () { 
        return this.viewPosForWindowPos(Mouse.shared().upPos())
    }

    mouseCurrentPos () { 
        return this.viewPosForWindowPos(Mouse.shared().currentPos())
    }
    */

    mouseDownPos () {
        return this.viewPosForWindowPos(Mouse.shared().downPos())
    }

    // view position helpers ----

    setRelativePos (p) {
        // why not a 2d transform?
        this.setLeft(p.x())
        this.setTop(p.y())
        return this
    }

    containsPoint (aPoint) {
        // point must be in document coordinates
        return this.frameInDocument().containsPoint(aPoint)
    }

    // viewport coordinates helpers

    frameInViewport () {
        const origin = this.positionInViewport()
        const size = this.sizeInViewport()
        const frame = Rectangle.clone().setOrigin(origin).setSize(size)
        return frame
    }

    positionInViewport () {
        const box = this.element().getBoundingClientRect();
        return Point.clone().set(Math.round(box.left), Math.round(box.top));
    }

    sizeInViewport () {
        const box = this.element().getBoundingClientRect();
        return Point.clone().set(Math.round(box.width), Math.round(box.height));
    }

    // document coordinates helpers

    frameInDocument () {
        const origin = this.positionInDocument()
        const size = this.size()
        const frame = Rectangle.clone().setOrigin(origin).setSize(size)
        return frame
    }

    positionInDocument () {
        const box = this.element().getBoundingClientRect();

        // return Point.clone().set(Math.round(box.left), Math.round(box.top));

        const body = document.body;
        const docEl = document.documentElement;

        const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        const clientTop = docEl.clientTop || body.clientTop || 0;
        const clientLeft = docEl.clientLeft || body.clientLeft || 0;

        const top = box.top + scrollTop - clientTop;
        const left = box.left + scrollLeft - clientLeft;

        const p = Point.clone().set(Math.round(left), Math.round(top));
        return p
    }

    size () {
        return EventPoint.clone().set(this.clientWidth(), this.clientHeight());
    }

    // ---------------------

    relativePos () {
        const pv = this.parentView()
        if (pv) {
            return this.positionInDocument().subtract(pv.positionInDocument())
            //return pv.positionInDocument().subtract(this.positionInDocument())
        }
        return this.positionInDocument()
    }

    setRelativePos (p) {
        //this.setPosition("absolute")
        this.setLeft(p.x())
        this.setTop(p.y())
        return this
    }

    viewPosForWindowPos (pos) {
        return pos.subtract(this.positionInDocument())
    }

    // --------------

    verticallyAlignAbsoluteNow () {
        const pv = this.parentView()
        if (pv) {
            this.setPosition("absolute")
            const parentHeight = pv.calcHeight() // computedHeight?
            const height = this.computedHeight()

            //console.log("parentHeight: ", parentHeight)
            //console.log("height: ", height)

            this.setTop((parentHeight / 2) - (height / 2))
            /*
            setTimeout(() => {
                //this.setTop(pv.clientHeight() / 2 - this.clientHeight() / 2)
                this.setTop(pv.calcHeight() / 2 - this.calcHeight() / 2)
            }, 0)
            */
        } else {
            throw new Error("missing parentView")
        }
        return this
    }

    horizontallyAlignAbsoluteNow () {
        const pv = this.parentView()
        if (pv) {
            this.setPosition("absolute")
            setTimeout(() => {
                this.setRight(pv.clientWidth() / 2 - this.clientWidth() / 2)
            }, 0)
        }
        return this
    }

    setVerticalAlign (s) {
        this.setCssAttribute("vertical-align", s)
        return this
    }

    // visibility event

    onVisibility () {
        //this.debugLog(".onVisibility()")
        this.unregisterForVisibility()
        return true
    }

    unregisterForVisibility () {
        const obs = this.intersectionObserver()
        if (obs) {
            obs.disconnect()
            this.setIntersectionObserver(null);
            this.setIsRegisteredForVisibility(false)
        }
        return this
    }

    registerForVisibility () {
        if (this.isRegisteredForVisibility()) {
            return this
        }

        let root = document.body

        if (this.parentView()) {
            root = this.parentView().parentView().element() // hack for scroll view - TODO: make more general
            //root = this.parentView().element()
        }

        const intersectionObserverOptions = {
            root: root, // watch for visibility in the viewport 
            rootMargin: "0px",
            threshold: 1.0
        }

        const obs = new IntersectionObserver((entries, observer) => {
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
    }

    // centering

    fillParentView () {
        this.setWidthPercentage(100)
        this.setHeightPercentage(100)
        return this
    }

    centerInParentView () {
        this.setMinAndMaxWidth(null)
        this.setMinAndMaxHeight(null)
        //this.setWidth("100%")
        //this.setHeight("100%")
        this.setOverflow("auto")
        this.setMarginString("auto")
        this.setPosition("absolute")
        this.setTop(0).setLeft(0).setRight(0).setBottom(0)
    }

    /*
    verticallyCenterFromTopNow () {
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
    }

    horiontallyCenterFromLeftNow () {
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
    }
    */

    static rootView () {
        return WebBrowserWindow.shared().documentBody()
    }

    disablePointerEventsUntilTimeout (ms) {
        this.setPointerEvents("none")
        this.debugLog(" disabling pointer events")

        setTimeout(() => {
            this.debugLog(" enabling pointer events")
            this.setPointerEvents("inherit")
        }, ms)

        return this
    }

    containerize () {
        // create a subview of same size as parent and put all other subviews in it
        const container = DomView.clone()
        container.setMinAndMaxHeight(this.clientHeight())
        container.setMinAndMaxWidth(this.clientWidth())
        this.moveAllSubviewsToView(container)
        this.addSubview(container)
        return container
    }

    uncontainerize () {
        assert(this.subviewCount() === 1)
        const container = this.subviews().first()
        this.removeSubview(container)
        container.moveAllSubviewsToView(this)
        return this
    }

    moveAllSubviewsToView (aView) {
        this.subviews().shallowCopy().forEach((sv) => {
            this.remove(sv)
            aView.addSubview(sv)
        })
        return this
    }

    // auto fit 
    // need to be careful about interactions as some of these change 
    // display and position attributes
    // NOTE: when we ask parent to fit child, should we make sure child position attribute allows this?

    hasAbsolutePositionChild () {
        const match = this.subviews().detect(sv => sv.position() === "absolute")
        return !Type.isNullOrUndefined(match)
    }

    // auto fit width

    autoFitParentWidth () {
        this.setDisplay("block")
        this.setWidth("auto")
        return this
    }

    autoFitChildWidth () {
        assert(!this.hasAbsolutePositionChild()) // won't be able to autofit!
        this.setDisplay("inline-block")
        this.setWidth("auto")
        this.setOverflow("auto")
        return this
    }

    // auto fit height

    autoFitParentHeight () {
        this.setPosition("absolute")
        this.setHeightPercentage(100)
        return this
    }

    autoFitChildHeight () {
        assert(!this.hasAbsolutePositionChild()) // won't be able to autofit!

        this.setPosition("relative") // or static? but can't be absolute
        this.setHeight("fit-content")
        return this
    }

}.initThisClass()
