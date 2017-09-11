/*
	unused
*/


BMObjMsgRecord = BMStorableNode.extend().newSlots({
    type: "BMObjMsgRecord",
    objMsg: null,
	receivedTime: null,
    placed: false,
	deleted: false,	
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStoreSubnodes(false)
        this.setMsgType("object")
        this.addStoredSlots(["objMsg", "receivedTime", "placed", "deleted"])
        this.addAction("delete")
    },

})
