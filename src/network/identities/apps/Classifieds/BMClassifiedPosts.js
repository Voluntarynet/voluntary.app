
BMClassifiedPosts = BMStorableNode.extend().newSlots({
    type: "BMClassifiedPosts",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("My Posts")
        //this.setPid("_myPosts")
        this.setSubnodeProto(BMClassifiedPost)
        this.setNnoteIsSubnodeCount(true)
    },
})
