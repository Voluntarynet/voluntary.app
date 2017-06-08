var bitcore = require("bitcore-lib")

BMPublicKey = BMNode.extend().newSlots({
    type: "BMPublicKey",
	publicKeyString: "",
}).setSlots({
	
    _nodeVisibleClassName: "Public Key",

    init: function () {
        BMNode.init.apply(this)
		this.setShouldStore(true)

        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(false)
        this.setNodeMinWidth(120)

        this.addAction("delete")
    },
    
    title: function () {
		return "Public Key"
    },
    
    subtitle: function () {
		if (this.publicKeyString()) {
        	return this.publicKeyString().toString().slice(0, 5) + "..."
		}
		
		return ""
    },  

    isValid: function() {
		var s = this.publicKeyString()
		return bitcore.PublicKey.isValid(s)
	},
	
    publicKey: function() {
		if (this.isValid()) {
			var s = this.publicKeyString()
            return new bitcore.PublicKey(s)
        }
        return null
    },

    verifySignatureForMessage: function(signature, msgString) {
        var address = this.publicKey().toAddress()
        var verified = Message(msgString).verify(address, signature);
        return verified
    },
})
