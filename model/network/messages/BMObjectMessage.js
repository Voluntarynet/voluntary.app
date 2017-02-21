/*
    
    // msgDict structure:
    
        ObjectMessage = {
            msgType: "object"
            packedContent: packedContent,
        }
 
    // sending
 
        var m = BMObjectMessage.clone()
        m.setFromId(senderId)
        m.setToId(receiverId)
        m.setContent(content) // content assumed to be a dict
        m.send()
    
    // receiving (m is a BMObjectMessage)
    // will get keys from localIdentities to attempt decryption
    // returns null is failed
    
        var content = m.content()     
        
*/

/*
var stableStringify = require('json-stable-stringify');
var bitcore = require("bitcore-lib")
var ECIES = require("bitcore-ecies")
*/

BMObjectMessage = BMMessage.extend().newSlots({
    type: "BMObjectMessage",
    
    msgType: "object",
    
    
    senderId: null,
    receiverId: null,

    content: null, 
    packedContent: null, 
    
    msgHash: null, // hash of packedContent - computed and cached as needed
    
    senderPublicKey: null,
    receiverPublicKey: null,
    
}).setSlots({
    init: function () {
        BMMessage.init.apply(this)
        this.setMsgType("object")
        this.addStoredSlots(["msgType", "content", "packedContent", "msgHash"])
        //this.setViewClassName("BMMessageView")
        this.addAction("delete")

        this.setupFields()
    },
    
    setNode: function(aNode) {
        BMMessage.setNode.apply(this, [aNode])
        console.log("BMObjectMessage setNode " + aNode ? aNode.type() : aNode)
        return this
    },
    
    setupFields: function() {
        this.setNodeRowViewClassName("BrowserFieldRow")
        this.addFieldNamed("from").setNodeTitleIsEditable(false).setNodeFieldProperty("fromValue")
        this.addFieldNamed("to").setNodeTitleIsEditable(false).setNodeFieldProperty("toValue")
        this.addFieldNamed("subject").setNodeTitleIsEditable(false).setNodeFieldProperty("subjectValue")
        var body = this.addFieldNamed("body").setNodeTitleIsEditable(false).setNodeFieldProperty("bodyValue")       
        body.setNodeMinHeight(-1).setNodeRowViewClassName("BrowserAreaRow")   
    },
    
    setContent: function(v) {
        this._content = v
        this.syncFields()
        return this
    },
    
    setNodeDict: function(dict) {
        BMStorableNode.setNodeDict.apply(this, [dict])
        //console.log("BMMessageObject.setNodeDict ", this)
        //this.syncFields()
        return this
    },
    
    nodeDict: function() {
        var dict = BMStorableNode.nodeDict.apply(this)
        //console.log("BMObjectMessage nodeDict " + JSON.stringify(dict, null, 2) )
        return dict
    },
    
    
    
    fromValue: function() {
        console.log("this._content = " + JSON.stringify(this._content, null, 2))
        //console.log("this.content() = " + JSON.stringify(this.content(), null, 2))
        return this._content ? this._content.from : "?"
    },

    toValue: function() {
        return this._content ? this._content.to : "?"
    },

    subjectValue: function() {
        return this._content ? this._content.subject : "?"
    },
        
    bodyValue: function() {
        return this._content ? this._content.body : null
    },
    
                

    network: function() {
        return window.app.network()
    },
    
    title: function () {
        var h = this.msgHash() ? this.msgHash().slice(0, 4) : "null"
        return this.msgType() + " " + h
    },
    
    // dict 
    
    setMsgDict: function(dict) {
        console.log("setMsgDict ", dict)
        this.setMsgType(dict.msgType)
        this.setPackedContent(dict.data)
        return this
    },
    
    msgDict: function() {
        return {
            msgType: this.msgType(),
            data: this.packedContent(),
            msgHash: this.msgHash(),
        }
    },
    
    // hash
    
    msgHash: function() {
        if (!this._msgHash && this._packedContent) {
            this._msgHash = this.packedContent().payload.toJsonStableString().sha256String();
        }
        
        if (this._msgHash == null) {
            throw "null this._msgHash"
        }
        
        return this._msgHash
    },
    
    // send
 
    packedContent: function() {
        if (!this._packedContent) {
            this._packedContent = this.packContent()
        }
        
        return this._packedContent
    },
 
     packContent: function() {
        var payload = BMPayload.clone()
        payload.setData(this.content())
        payload.encrypt(this.senderId().privateKey(), this.receiverId().publicKey())
        payload.pow()
        var wrappedMsgDict = payload.data()
        return wrappedMsgDict
    },

    unpackContentWithReceiverId: function(receiverId) {
        try {
            var receiverPrivateKey = receiverId.privateKey()
            
            var payload = BMPayload.clone()
            payload.setData(this.packedContent())  
            payload.unpow()
            payload.unencrypt(receiverPrivateKey)
            if (payload.data()) {
                //this.setReceiverPublicKey(receiverPrivateKey.publicKey())
                this.setContent(payload.data())
                
                var spk = payload.senderPublicKey().toString()
                var senderId = this.network().localIdentities().idWithPubKeyString(spk)
                this.setSenderId(senderId)
                this.setReceiverId(receiverId)
                //receiverId.inbox().addItemIfAbsent(this)
            }
             
        } catch(error) {
            return false
        }
        
        return true
    },
        
    unpackContent: function() {
        var self = this        
        var succeeded = this.network().localIdentities().items().detect(function(localId) {
            var result = self.unpackContentWithReceiverId(localId)
            if (result) {
                self.place()
            }
            return result
        })
        
        return succeeded
    },
    
    attemptToUnpackIfNeeded: function() {
        // only returns true if we unpacked it now, 
        // returns false if we couldn't unpack or already had the content
        if (!this._content && this._packedContent) {
            return this.unpackContent()
        }        
        return false
    },
    
    place: function() {
        if (this.receiverId()) {
            //var id = this.network().localIdentities().idWithPubKeyString(rec())
            this.receiverId().inbox().addItemIfAbsent(this.clone())
            this.senderId().sent().addItemIfAbsent(this.clone())
            return true
        }
        
        return false
    },
    
    content: function() {
        // this.attemptToUnpackIfNeeded()
        return this._content
    },
       
    send: function() {
        // this would change out parentNode - so make a copy
        this.network().messages().addMessage(this.clone()) 
        return this
    },
    
    hasValidPow: function() {        
        var payload = BMPayload.clone()
        payload.setData(this.packedContent())  
        return payload.unpow()
    },
})
