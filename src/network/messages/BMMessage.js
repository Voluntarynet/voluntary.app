/*
    subclasses:
        BMAddrMessage
        BMInvMessage
        BMObjectMessage

*/

BMMessage = BMFieldSetNode.extend().newSlots({
    type: "BMMessage",
    msgType: null,
    data: null,
    msgTypes: ["addr", "inv", "object", "ping", "pong", "getData"],
    remotePeer: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
        this.setNodeMinWidth(650)
		this.setNodeBackgroundColor("white")
        //this.setViewClassName("BMMessageView")
    },

    title: function() {
        return "Message " + this.msgType()
    },

	prepareToAccess: function() {
	    // as this field is only needed when viewing the Message in the browser,
	    // so create it as needed here instead of in the init method
		if (!this._didSetupFields) {
			this.justAddField(BMTextAreaField.clone().setKey("dict").setValueMethod("msgDictString").setValueIsEditable(false).setIsMono(true))
			this._didSetupFields = true
		}
	},
    
    // dict
    
    msgDictString: function() {
        return JSON.stringify(this.msgDict(), null, 2)
    },

    msgDict: function() {
        return {
            msgType: this.msgType(),
            data: this.data()
        }
    },

    setMsgDict: function(dict) {
        this._msgType = dict.msgType
        this._data = dict.data
        return this
    },
    
    messageForString: function(aString) {
        var dict = JSON.parse(aString)
        var msgType = dict.msgType
        
        if (this.msgTypes().contains(msgType)) {
            var className = "BM" + msgType.capitalized() + "Message"
            //this.log("className '" + className + "'")
            var proto = window[className]
            return proto.clone().setMsgDict(dict)
        }
        
        throw new Error("no message type '" + msgType + "'")
        return null
    },
    

})
