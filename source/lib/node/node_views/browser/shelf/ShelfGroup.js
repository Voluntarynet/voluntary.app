"use strict"

/* 

    ShelfGroup

*/

BMNode.newSubclassNamed("ShelfGroup").newSlots({
    refNode: null,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        return this
    },
    
    iconImageUrl: function() {
        return this.refNode().shelfIconImageUrl()
    },
    
    subnodes: function() {
        return this.refNode().shelfSubnodes()
    },
    
    setRefNode: function(lid) {
        this._lid = lid
        this.setupSubnodes()
        return this
    },
    
    setupSubnodes: function() {
        
        let posts = this.addSubnode(BMNode.clone().setTitle(lid.title()))
        
        // my posts
        let imageUrl = lid.profile().profileImageDataUrl()
        let feedNode = lid.apps().appNamed("Chat").feedPosts()
        group.newShelfItem().setImageDataUrl(imageUrl).setDestinationNode(feedNode).setToolTip(lid.title())
        
        // feed
        let myPostsNode = lid.apps().appNamed("Chat").myPosts()
        group.newShelfItem().setIconName("home3-white").setDestinationNode(myPostsNode).setToolTip("My Posts")
        
        // notifications
        //group.newShelfItem().setIconName("bell-white") 
        
        // direct messages
        group.newShelfItem().setIconName("mail-white").setDestinationNode(lid.apps().appNamed("Chat").threads())
        
        // profile
        group.newShelfItem().setIconName("user-white").setDestinationNode(lid.profile())
        
        // contacts
        group.newShelfItem().setIconName("users-white").setDestinationNode(lid.remoteIdentities())
        
        // drafts
        group.newShelfItem().setIconName("write-white").setDestinationNode(lid.apps().appNamed("Chat").drafts()) 
        
        group.compact()
        return this  
    },
        
})

