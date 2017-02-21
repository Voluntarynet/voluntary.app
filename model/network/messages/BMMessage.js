/*

    subclasses:
    
        BMAddrMessage
        BMInvMessage
        BMObjectMessage

*/

BMMessage = BMFormNode.extend().newSlots({
    type: "BMMessage",
    msgType: null,
    data: null,
    dictFields: null,
    msgTypes: ["addr", "inv", "object", "ping", "pong", "getData"],
    remotePeer: null,
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        this.setNodeMinWidth(650)
        this.setViewClassName("BMMessageView")
    },

    title: function () {
        return "Message " + this.msgType()
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
    

    messageForString: function(dictString) {
        var dict = JSON.parse(dictString)
        var msgType = dict.msgType
        
        if (this.msgTypes().contains(msgType)) {
            var className = "BM" + msgType.capitalized() + "Message"
            //this.log("className '" + className + "'")
            //var proto = window[className]
            var proto = window[className]
            //var proto = classes[className]
            return proto.clone().setMsgDict(dict)
        }
        
        throw "no message type '" + msgType + "'"
        return null
    },
})
