"use strict"

window.BMNodeStyles = ideal.Proto.extend().newSlots({
    type: "BMNodeStyles",
    name: "",

	unselected: null,
	selected: null,
	hover: null,
	
}).setSlots({
    init: function () {
		this.setSelected(BMNodeStyle.clone())
		this.setUnselected(BMNodeStyle.clone())
		this.setHover(BMNodeStyle.clone())
        return this
    },
    

})
