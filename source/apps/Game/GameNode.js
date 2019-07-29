"use strict"

/*

    GameNode
    
    
*/  
        
BMStorableNode.newSubclassNamed("GameNode").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("Game")
        this.setSubtitle("test")
        this.setNodeMinWidth(2000)
    },        
    
})
