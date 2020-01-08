"use strict"

/*

    BMRegions

*/

window.BMRegions = class BMRegions extends BMRegion {
    
    initPrototype () {

    }

    init () {
        super.init()
        //this.setActions(["add"])
        //this.setSubnodeProto(BMPost)
        
        /*
        this.setDigital(BMStorableNode.clone().setTitle("Digital"))
        this.justAddSubnode(this.digital())
        
        this.setPhysical(BMStorableNode.clone().setTitle("Physical"))
        this.justAddSubnode(this.physical())
        */

        //console.log("begin BMClassifieds init")
        //this.setNodeDict(RegionCountriesDict)
        this.setTitle("Regions")
        
        this.onLeavesAddDictChildren(CategoriesDict)
    }
    
    /*
    receivedMsgFrom (msg, remotePeer) {
        const postDict = JSON.parse(msg)
        const post = BMPost.clone().setPostDict(postDict)
        this.addSubnode(post)
        this.didUpdateNode() 
    }
    */
   
}.initThisClass()

