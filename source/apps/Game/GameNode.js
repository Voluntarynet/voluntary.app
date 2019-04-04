"use strict"

/*

    GameNode
    
    
*/  
        
window.GameNode = BMStorableNode.extend().newSlots({
    type: "GameNode",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("Game")
        this.setSubtitle("test")
        this.setNodeMinWidth(2000)
    },        
    
})
