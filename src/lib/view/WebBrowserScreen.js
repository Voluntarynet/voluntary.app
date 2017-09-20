"use strict"

window.WebBrowserScreen = ideal.Proto.extend().newSlots({
    type: "WebBrowserScreen",
}).setSlots({
    init: function () {
        throw new Error("this class is meant to be used as singleton, for now")
        return this
    },
    
    width: function () {
        return screen.width
    },

    height: function () {
        return screen.height
    },
    
    aspectRatio: function() {
        return this.width() / this.height()
    },
    
    isRotated: function() { // screen aspect doesn't match window (only works on mobile)
        var a = this.aspectRatio() > 1 
        var b = WebBrowserWindow.aspectRatio() > 1
        return a != b && WebBrowserWindow.isOnMobile()
    },
    
    orientedWidth: function() {
        return this.isRotated() ? this.height() : this.width()
    },
    
    orientedHeight: function() {
        return this.isRotated() ? this.width() : this.height()
    },
        
    show: function() {
        console.log(this.type() + " size " + this.width() + "x" + this.height())
    },

	lesserOrientedSize: function() {
		// lesser of window and oriented screen size
		var w = Math.min(this.orientedWidth(), WebBrowserWindow.width())
		var h = Math.min(this.orientedHeight(), WebBrowserWindow.height())
		return { width: w, height: h }
	},

})

