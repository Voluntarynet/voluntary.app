"use strict"

/*

    BMRegions

*/

window.BMRegions = BMRegion.extend().newSlots({
    type: "BMRegions",
}).setSlots({
    init: function () {
        BMRegion.init.apply(this)
        //this.setPid("_market")
        //this.setActions(["add"])
        //this.setSubnodeProto(BMPost)
        
        /*
        this.setDigital(BMStorableNode.clone().setTitle("Digital"))
        this.justAddSubnode(this.digital())
        
        this.setPhysical(BMStorableNode.clone().setTitle("Physical"))
        this.justAddSubnode(this.physical())
        */

        //console.log("begin BMClassifieds init")
        this.setNodeDict(RegionCountriesDict)
        this.setTitle("Regions")
        
        this.onLeavesAddDictChildren(CategoriesDict)
    },
    
    /*
    receivedMsgFrom: function(msg, remotePeer) {
        const postDict = JSON.parse(msg)
        const post = BMPost.clone().setPostDict(postDict)
        this.addSubnode(post)
        this.didUpdateNode() 
    }
    */
})

