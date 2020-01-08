"use strict"

/*

    GameNode
    
    
*/  
        
window.GameNode = class GameNode extends BMStorableNode {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.setTitle("Game")
        this.setSubtitle("test")
        this.setNodeMinWidth(2000)
    }    
    
}.initThisClass()
