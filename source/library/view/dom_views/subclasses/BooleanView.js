"use strict"

/*

    BooleanView

    The checkbox is composed of 2 overlapping inner views,
    one for the inner check itself, and one for the outer border around.
    The check components are rendered with scalable SVG and 
    are synced to match the color of the parent view's text color by
    getting the computed color and applying it to the fill or stroke of the
    svg views.

    TODO: support disabled/uneditable color style?

*/

DomStyledView.newSubclassNamed("BooleanView").newSlots({
    isSelected: false,
    //selectedColor: null,
    //unselectedColor: null,
    doesClearOnReturn: false, // needed?
    doesHoldFocusOnReturn: false, // needed?
    value: false,
    isEditable: false,
    innerCheckView: null,
    outerCheckView: null,
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        //this.setDisplay("inline-block")
        this.turnOffUserSelect()
        this.setWhiteSpace("nowrap")
        this.setSpellCheck(false)
        this.setContentEditable(false)

        const size = this.checkboxSize() // size
        this.setMinAndMaxWidthAndHeight(size)

        this.setOverflow("hidden")

        const inner = SvgIconView.clone().setIconName("inner-checkbox")
        inner.setMinAndMaxWidthAndHeight(size)
        inner.setStrokeColor("transparent")
        this.setInnerCheckView(inner)
        this.addSubview(inner)

        const outer = SvgIconView.clone().setIconName("outer-checkbox")
        outer.setMinAndMaxWidthAndHeight(size)
        outer.setFillColor("transparent")
        this.setOuterCheckView(outer)
        this.addSubview(outer)

        
        this.setIsEditable(this.isEditable())

        return this
    },

    checkboxSize: function() {
        return 16
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
        if (Type.isNullOrUndefined(v)) {
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
        // needed?
        return this
    },
	
    // svg icon

    updateAppearance: function () {
        // sent by superview when it changes or syncs to a node
        // so we can update our appearance to match changes to the parent view's style

        const color = this.getComputedCssAttribute("color")

        this.outerCheckView().setStrokeColor(color)
        this.innerCheckView().setFillColor(this.value() ? color : "transparent")
        
        return this
    },

    onTapComplete: function (aGesture) {
        DomView.sendActionToTarget.apply(this)
        this.toggle()
        return false
    },
})