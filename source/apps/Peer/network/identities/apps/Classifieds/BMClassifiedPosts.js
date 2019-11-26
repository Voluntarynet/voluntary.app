"use strict"

/*

    BMClassifiedPosts

*/

BMStorableNode.newSubclassNamed("BMClassifiedPosts").newSlots({
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setTitle("My Posts")
        this.setSubnodeProto(BMClassifiedPost)
        this.setNoteIsSubnodeCount(true)
    },

}).initThisProto()
