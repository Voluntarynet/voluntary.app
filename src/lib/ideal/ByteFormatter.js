
window.ByteFormatter = ideal.Proto.extend().newSlots({
    type: "ByteFormatter",
	value: 0,
}).setSlots({

	formattedValue: function() {
		var b = Math.floor(this.value())

		var v = Math.floor(b / Math.pow(10, 15)) 
		if (v > 1) {
			return v + " PB"
		}
		
		v = Math.floor(b / Math.pow(10, 12)) 
		if (v > 1) {
			return v + " TB"
		}
		
		v = Math.floor(b / Math.pow(10, 9))
		if (v > 1) {
			return v + " GB"
		}
	
		v = Math.floor(b / Math.pow(10, 6))
		if (v > 1) {
			return v + " MB"
		}
		
		v = Math.floor(b / Math.pow(10, 3))
		if (v > 1) {
			return v + " KB"
		}

		return b + " bytes"
	},

})