
WebBrowserScreen = ideal.Proto.extend().newSlots({
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
    
    isRotated: function() {
        var a = this.aspectRatio() > 1 
        var b = WebBrowserWindow.aspectRatio() > 1
        return a != b
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

})

