var bitcore = require("bitcore-lib")
var BitcoreMessage = require('bitcore-message');
var ECIES = require('bitcore-ecies');
var Buffer = bitcore.deps.Buffer;

BMLocalIdentity = BMKeyPair.extend().newSlots({
    type: "BMLocalIdentity",
    name: "",
	privateKeyString: "",
}).setSlots({
    
    init: function () {
        BMKeyPair.init.apply(this)
		this.setShouldStore(true)
		//this.setShouldStoreSubnodes(false)
        this.setNodeTitleIsEditable(true)
 
        this.initStoredSlotWithProto("apps", BMApps)
        this.initStoredSlotWithProto("profile", BMProfile)
        this.initStoredSlotWithProto("remoteIdentities", BMRemoteIdentities)
        
		this.addStoredSlots(["name", "privateKeyString"])
		
        this.setName("Untitled")

		this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
		//console.log("is editable = ", this.profile().fieldNamed("publicKeyString").valueIsEditable())
		this.generatePrivateKey()
        this.addAction("delete")
    },

	didLoadFromStore: function() {
		//console.log(this.type() + " didLoadFromStore")
		BMKeyPair.didLoadFromStore.apply(this)
		this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
		
		setTimeout(() => {
			console.log("id " + this.name() + " remoteIdentities ", this.remoteIdentities().subnodes().length)
		})
	},
    
    title: function () {
        return this.name()
    },
    
    setTitle: function (s) {
        this.setName(s)
        return this
    },
 
	handleMessage: function(msg) {	
		this.apps().handleMessage(msg)
		return this
	},
	
	allOtherIdentities: function() {
		var validRemoteIds = this.remoteIdentities().validSubnodes()		
		var otherLocalIds = App.shared().localIdentities().subnodesSans(this)
		return validRemoteIds.concat(otherLocalIds)
	},
	
})