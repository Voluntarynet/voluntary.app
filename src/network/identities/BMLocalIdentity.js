var bitcore = require("bitcore-lib")
var BitcoreMessage = require('bitcore-message');
var ECIES = require('bitcore-ecies');
var Buffer = bitcore.deps.Buffer;

"use strict"

window.BMLocalIdentity = BMKeyPair.extend().newSlots({
    type: "BMLocalIdentity",
    name: "",
	privateKeyString: "",
}).setSlots({
    
    init: function () {
        BMKeyPair.init.apply(this)
		this.setShouldStore(true)
		//this.setShouldStoreSubnodes(false)
        this.setNodeTitleIsEditable(true)
 
        this.initStoredSubnodeSlotWithProto("apps", BMApps)
        this.initStoredSubnodeSlotWithProto("profile", BMProfile)
        this.initStoredSubnodeSlotWithProto("remoteIdentities", BMRemoteIdentities)
        
		this.addStoredSlots(["name", "privateKeyString"])
		
        this.setName("Untitled")

		this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
		//console.log("is editable = ", this.profile().fieldNamed("publicKeyString").valueIsEditable())
		this.generatePrivateKey()
        this.addAction("delete")

    },

	finalize: function() {
		//console.log(this.typeId() + ".finalize()")
		NotificationCenter.shared().newNotification().setSender(this.uniqueId()).setName("didChangeIdentity").setInfo(this).post()
	},
	
	didLoadFromStore: function() {
		//console.log(this.typeId() + " didLoadFromStore")
		BMKeyPair.didLoadFromStore.apply(this)
		this.profile().fieldNamed("publicKeyString").setValueIsEditable(false)
	},
    
    title: function () {
        return this.name()
    },
    
    setTitle: function (s) {
        this.setName(s)
        return this
    }, 
 
    handleObjMsg: function(objMsg) {
        //console.log(this.typeId() + " " + this.name() + " handleObjMsg ", objMsg)
        var senderId = this.remoteIdentities().idWithPublicKeyString(objMsg.senderPublicKeyString()) 
        if (senderId) {
            // give the remote id a chance to decrypt it with local private key + remote pubkey
            return senderId.handleObjMsg(objMsg)
        }
        
        if (objMsg.data()) {
            // it's a clear text message
            return this.handleCleartextObjMsg(objMsg)
        }
        
        return false
    },
    
	handleCleartextObjMsg: function(objMsg) {
		console.log(this.title() + " >>>>>> " + this.typeId() + ".handleCleartextObjMsg(" + objMsg.type() + ") encryptedData:", objMsg.encryptedData(), " data:", objMsg.data())
		
		var dict = objMsg.data()
		if (dict) {
			var appMsg = BMAppMessage.fromDataDict(dict)
			//console.log("created ", appMsg.typeId())
			
			if (appMsg) {
			    var senderId = this.idForPublicKeyString(objMsg.senderPublicKeyString())
				appMsg.setSenderId(senderId)
				appMsg.setObjMsg(objMsg)
				this.handleAppMsg(appMsg)
				return true
			}
		}
		return false
	},
	

	handleAppMsg: function(appMsg) {	
		return this.apps().handleAppMsg(appMsg)
	},
	
	idForPublicKeyString: function(pk) {
	    return this.allIdentitiesMap().at(pk)
	},
	
	allIdentitiesMap: function() { // only uses valid remote identities
		var ids = ideal.Map.clone()
		ids.atPut(this.publicKeyString(), this)
		
		this.remoteIdentities().subnodes().forEach((rid) => { 
		    ids.merge(rid.allIdentitiesMap())
		})
		
		this.apps().subnodes().forEach((app) => { 
		    ids.merge(app.allIdentitiesMap())
		})
		
		return ids
	},
	
})	