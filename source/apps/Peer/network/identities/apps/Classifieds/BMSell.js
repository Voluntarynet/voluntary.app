"use strict"

/*

    BMSell

*/

window.BMSell = class BMSell extends BMStorableNode {
    
    initPrototype () {
        this.newSlots({
            post: null,
            hasSent: false,
        })
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setShouldStoreSubnodes(true)
		
        this.setTitle("Sell")
        this.setCanDelete(true)
        //this.setSubtitle(Math.floor(Math.random()*10000))
        this.addStoredSlots(["subtitle", "hasSent"])
        
        this.setPost(BMClassifiedPost.clone())
        this.addSubnode(this.post())
        this.post().setIsEditable(true)
    }

    subtitle () {
        return this.post().subtitle()
    }

    didLoadFromStore () {
        console.log("BMSell didLoadFromStore setting post to be editable")
        //this.post().setIsEditable(true)
        //this.post().didUpdateNode()
    }

}.initThisClass()
