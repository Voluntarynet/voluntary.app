"use strict"

window.BMViewStyles = ideal.Proto.extend().newSlots({
    type: "BMViewStyles",
    name: "",

	unselected: null,
	selected: null,
	//hover: null,
	//enabled: null,
	//disabled: null,
	
}).setSlots({
    init: function () {
		this.setSelected(BMViewStyle.clone())
		this.setUnselected(BMViewStyle.clone())
		//this.setHover(BMViewStyle.clone())
        return this
    },
    
    setToBlackOnWhite: function() {
        this.unselected().setColor("black")
        this.unselected().setBackgroundColor("white")
        
        this.selected().setColor("black")
        this.selected().setBackgroundColor("#eee")
        return this
    },
    
    setToGrayOnTransparent: function() {        
        this.unselected().setColor("#aaa")
        this.unselected().setBackgroundColor("transparent")
        
        this.selected().setColor("white")
        this.selected().setBackgroundColor("transparent")        
        return this
    },
    
    copyFrom: function(styles) {
        this.selected().copyFrom(styles.selected())
        this.unselected().copyFrom(styles.unselected())
        return this
    },
    
    setBackgroundColor: function(c) {
        this.selected().setBackgroundColor(c)
        this.unselected().setBackgroundColor(c)
        return this        
    },
    
    setColor: function(c) {
        this.selected().setColor(c)
        this.unselected().setColor(c)
        return this        
    },
})
