"use strict"

window.BMViewStyles = ideal.Proto.extend().newSlots({
    type: "BMViewStyles",
    name: "",

	unselected: null,
	selected: null,
	hover: null,
	
}).setSlots({
    init: function () {
		this.setSelected(BMViewStyle.clone())
		this.setUnselected(BMViewStyle.clone())
		this.setHover(BMViewStyle.clone())
        return this
    },
    

})
