
BMMarket = BMRegion.extend().newSlots({
    type: "BMMarket",
}).setSlots({
    init: function () {
        BMRegion.init.apply(this)
        //this.setPid("_market")
        //this.setActions(["add"])
        //this.setSubnodeProto(BMPost)
        
        /*
        this.setDigital(BMStorableNode.clone().setTitle("Digital"))
        this.justAddItem(this.digital())
        
        this.setPhysical(BMStorableNode.clone().setTitle("Physical"))
        this.justAddItem(this.physical())
        */

        //console.log("begin BMMarket init")
        //this.setNodeDict(RegionUSCitiesDict)
        this.setNodeDict(RegionCountriesDict)
        this.setTitle("Classifieds")
        //console.log("end BMMarket init")
        
        this.onLeavesAddDictChildren(CategoriesDict)
    },
    
    receivedMsgFrom: function(msg, remotePeer) {
        var postDict = JSON.parse(msg)
        var post = BMPost.clone().setPostDict(postDict)
        this.addItem(post)
        this.didUpdate() 
    }
})

