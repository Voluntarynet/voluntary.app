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
    checkView: null,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        //this.setDisplay("inline-block")
        this.turnOffUserSelect()
        this.setWhiteSpace("nowrap")
        this.setOverflow("visible")
        this.setSpellCheck(false)
        this.setContentEditable(false)

        const size = this.checkboxSize()
        this.setMinAndMaxWidth(size)
        this.setMinAndMaxHeight(size)

        this.setOverflow("hidden")
        this.setInnerHTML(this.checkboxSVG())
        this.setIsEditable(this.isEditable())

        return this
    },

    checkboxSize: function() {
        return 16
    },
    
    checkboxSVG: function() {
        const size = this.checkboxSize()
        const r = Math.floor((size - 2)/2)-1
        const f = r+1
        const color = this.getComputedCssAttribute("color") //"white"
        const gap = 2
        let s =  "<svg height='" + size + "' width='" + size + "' "
        s += "style='background-color:transparent;'>\n"
        s += "<circle cx=" + f + " cy=" + f + " r=" + r + " stroke='" + color + "' stroke-width=1 fill='transparent' />\n"
        if (this.value()) {
            s += "<circle cx=" + f + " cy=" + f + " r=" + (r-gap) + " stroke=" + color + " stroke-width=1 fill='" + color + "' />\n"
        }
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
        //this.scheduleSyncToNode()
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
        this.setInnerHTML(this.checkboxSVG())
        return this
    },


    onTapComplete: function (aGesture) {
        //console.log(this.typeId() + ".onTapComplete()")
        DomView.sendActionToTarget.apply(this)
        this.toggle()
        return false
    },

    // clicks
    /*
    onClick: function(event) {
        DomStyledView.onClick.apply(this, [event])
        this.toggle()
        return this
    },
    */
})
