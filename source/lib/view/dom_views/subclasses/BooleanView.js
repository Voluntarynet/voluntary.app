"use strict"

/*

    BooleanView


*/

DomStyledView.newSubclassNamed("BooleanView").newSlots({
    isSelected: false,
    selectedColor: null,
    unselectedColor: null,
    doesClearOnReturn: false,
    doesHoldFocusOnReturn: false,
    value: false,
    isEditable: false,
    checkedIcon: null, 
    uncheckedIcon: null,
    innerCheckView: null,
    outerCheckView: null,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        //this.setDisplay("inline-block")
        this.turnOffUserSelect()
        this.setWhiteSpace("nowrap")
        this.setOverflow("visible")
        this.setSpellCheck(false)
        this.setContentEditable(false)

        const size = this.checkboxSize() // size
        this.setMinAndMaxWidth(size)
        this.setMinAndMaxHeight(size)

        this.setOverflow("hidden")

        this.setOuterCheckView(this.newCheckView())
        this.outerCheckView().setInnerHTML(this.outerSVG())
        this.addSubview(this.outerCheckView())

        this.setInnerCheckView(this.newCheckView())
        this.innerCheckView().setInnerHTML(this.innerSVG())
        this.addSubview(this.innerCheckView())

        this.setIsEditable(this.isEditable())

        return this
    },

    newCheckView: function() {
        const size = this.checkboxSize()
        const cv = DomView.clone()
        cv.setDisplay("block")
        cv.setPosition("absolute")
        cv.setLeft(0)
        cv.setTop(0)
        cv.setMinAndMaxWidth(size)
        cv.setMinAndMaxHeight(size)
        cv.setPadding(0)
        cv.setMargin(0)
        return cv
    },

    checkboxSize: function() {
        return 16
    },
    
    outerSVG: function() {
        const size = this.checkboxSize()
        const r = Math.floor((size - 2)/2)-1
        const cx = r + 1

        let s = "<svg height='100%' width='100%' viewBox='0 0 " + size + " " + size + "'>\n"
        s += "<circle stroke-width='1' cx=" + cx + " cy=" + cx + " r=" + r + " fill='transparent' />\n"
        s += "</svg>"
        return s
    },

    innerSVG: function() {
        const size = this.checkboxSize()
        const r = Math.floor((size - 2)/2)-1
        const cx = r + 1
        const gap = 2

        let s =  "<svg height='100%' width='100%' viewBox='0 0 " + size + " " + size + "'>\n"
        s += "<circle cx=" + cx + " cy=" + cx + " r=" + (r-gap) + " />\n"
        s += "</svg>"
        return s
    },

    // editable
    
    setIsEditable: function(aBool) {        
        this._isEditable = aBool
        
        if (this._isEditable) {
            const g = this.addDefaultTapGesture()
            g.setShouldRequestActivation(false) // so the row doesn't block the initial tap
        } else {
            this.removeDefaultTapGesture()
        }
        
        this.updateAppearance()
        
        return this
    },
    
    toggle: function() {
        this.setValue(!this.value())
        this.didEdit()
        return this
    },
    
    activate: function() {
        this.toggle()
        return this
    },
    
    // ------------------
    
    setValue: function(v) {
        if (v === null) {
            v = false;
        }
        
	    this._value = v

        this.updateAppearance()
        return this
    },	
	
    value: function() {
	    return this._value
    },
	
    isChecked: function() {
	    return this.value()
    },
    
    setBackgroundColor: function(s) {

        return this
    },
	
    // svg icon

    updateAppearance: function () {
        const color = this.getComputedCssAttribute("color")

        const ie = this.innerCheckView().element()
        ie.style.fill = this.value() ? color : "transparent"

        const oe = this.outerCheckView().element()
        oe.style.stroke = this.color()

        return this
    },

    onTapComplete: function (aGesture) {
        DomView.sendActionToTarget.apply(this)
        this.toggle()
        return false
    },
})
