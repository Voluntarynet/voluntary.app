
"use strict"

/*

    BMTwitter

*/

window.BMTwitter = class BMTwitter extends BMApplet {
    
    initPrototype () {
        this.newSlot("feed", null)
        this.newSlot("notifications", null)
        this.newSlot("messages", null)
        this.newSlot("profile", null)
        this.newSlot("following", null)
        this.newSlot("followers", null)
    }

    init () {
        super.init()
        this.setTitle("Twitter")
        
        this.setFeed(BMNode.clone())
        this.addSubnode(this.feed().setTitle("feed"))
                
        this.setNotifications(BMNode.clone().setTitle("notifications"))
        this.addSubnode(this.notifications())

        this.setMessages(BMNode.clone().setTitle("direct messages"))
        this.addSubnode(this.messages())
        
        this.setProfile(BMNode.clone().setTitle("profile"))
        this.addSubnode(this.profile())

        this.setFollowing(BMNode.clone().setTitle("following"))
        this.addSubnode(this.following())
        
        this.setFollowers(BMNode.clone().setTitle("followers"))
        this.addSubnode(this.followers())
    }
    
    handleMessage (twitterMessage) {
        
        
    }
    
}.initThisClass()

