var bitcore = require("bitcore-lib")

BMRemoteIdentity = BMNavNode.extend().newSlots({
    type: "BMRemoteIdentity",
    address: null,
    name: null,
    publicKey: null,
}).setSlots({
    init: function () {
        BMNavNode.init.apply(this)
        this.setName("Untitled")
        this.setNodeTitleIsEditable(true)
        //this.setNodeSubtitleIsEditable(true)
        this.setAddress("no address")
        this.addStoredSlots(["name", "publickKeyString"])
        this.actions().push("delete")
        this.setViewClassName("GenericView")
        this.setNodeTitleIsEditable(true)
        this.setNodeSubtitleIsEditable(true)
        this.setNodeMinWidth(120)
    },
    
    title: function () {
        return this.name()
    },
    
    setTitle: function (s) {
        return this.setName(s)
    },
 
    subtitle: function () {
        return this.address()
    },  
    
    setSubtitle: function (s) {
        return this.setAddress(s)
    }, 
    
    publickKeyString: function () {
        if (!this.publicKey()) { return null }
        return this.publicKey().toString()
    },
    
    setPublickKeyString: function(s) {
        if (s) {
            console.log("set pubkey '" + s + "'")
            var pk = new bitcore.PublicKey(s)
            this.setPublicKey(pk)
        }
        return this
    },
    
    idWithPubKeyString: function(pubkeyString) {
        return this.items().detect(function (id) {
            return id.publicKey().toString() == pubkeyString
        })
    },
})
