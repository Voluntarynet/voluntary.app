"use strict"

window.ShelfView = DivView.extend().newSlots({
    type: "ShelfView",
    rows: null,
    selectionColor: "#aaa",
    allowsCursorNavigation: true,
	debug: true,
	browser: null,
	defaultWidth: 80,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForKeyboard(true)
        this.setMinAndMaxWidth(0)
        return this
    },
        
    appDidInit: function() {
        this.syncWithLocalIdentities()
        this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentities").setObserver(this).watch()
        var firstGroup = this.groups()[0]
        if (firstGroup) {
            firstGroup.uncompact()
        }
        return this      
    },
    
    didChangeIdentities: function() {
        this.syncWithLocalIdentities()
    },

    syncWithLocalIdentities: function() {
        this.removeAllSubviews()
        
        App.shared().localIdentities().subnodes().forEach((lid) => {
            this.addGroupForLid(lid)
        })
        
        this.addCreateIdentityGroup()
        this.addSettingsGroup()
    },
    
    addCreateIdentityGroup: function() {
        var group = this.newShelfGroup()
        group.newShelfItem().setIconName("home3-white").setTarget(this).setAction("createIdentity").setToolTip("Create New Identity")
    },
    
    createIdentity: function() {
        console.log("createIdentity")
    },
    
    addSettingsGroup: function() {
        var group = this.newShelfGroup()
        group.newShelfItem().setIconName("gear-filled-white").setDestinationNode(App.shared().about()).setToolTip("Settings")   
        group.setIsAlwaysSelected(true)     
    },
    
    addGroupForLid: function(lid) {
        var group = this.newShelfGroup()
        var image = lid.profile().profileImageDataUrl()
        //console.log("image = ", image)
        
        var feedNode = lid.apps().appNamed("Chat").feedPosts()
        var myPostsNode = lid.apps().appNamed("Chat").myPosts()
        
        group.newShelfItem().setImageDataUrl(image).setDestinationNode(myPostsNode).setToolTip(lid.title())
        group.newShelfItem().setIconName("home3-white").setDestinationNode(feedNode).setToolTip("Feed")
        //group.newShelfItem().setIconName("lightning3-white")
        //group.newShelfItem().setIconName("bell-white")
        group.newShelfItem().setIconName("mail-white").setDestinationNode(lid.apps().appNamed("Chat").threads())

        group.newShelfItem().setIconName("user-white").setDestinationNode(lid.profile())
        group.newShelfItem().setIconName("users-white").setDestinationNode(lid.remoteIdentities())
        group.newShelfItem().setIconName("write-white").setDestinationNode(lid.apps().appNamed("Chat").drafts())
/*
        group.newShelfItem().setIconName("search-white")
        group.newShelfItem().setIconName("gear-white")
        */      
        group.compact()
        return this  
    },
    

    
    browser: function() {
        return App.shared().browser()
    },
    
    isHidden: function() {
        return this.parentView() == null
    },
    
    unhide: function() {
        if (this.subviews().length) {
            this.setMinAndMaxWidth(this.defaultWidth())
            this.browser().setLeft(this.defaultWidth())
        }
    },
    
    hide: function() {
        this.setMinAndMaxWidth(0)
        this.browser().setLeft(0)
    },
    
    didClickGroup: function(clickedGroup) {

        this.groups().forEach((group) => {
            if (group != clickedGroup) {
                group.compact()
            }
        })
        
        clickedGroup.uncompact()
    },
    
	// --- groups ---

    groups: function() {
        return this.subviews()
    },
    
    newShelfGroup: function() {
        var group = ShelfItemGroupView.clone()
        this.addSubview(group)
        return group
    },

	// --- selection ---
	
	setIsSelected: function(aBool) {
		if (this._isSelected != aBool) {		
			this._isSelected = aBool
		
			if (aBool) {
				this.focus()
			} else {
				this.blur()
			}
		}
		
		return this
	},
    
    selectedItems: function() {
        return this.subviews().filter((item) => { return item.isSelected(); })
    },

    selectedItem: function() {
        return this.selectedItems()[0]
    },
    
    unselectAllItems: function() {
		this.groups().forEach((row) => { row.unselect() })
		return this
	},
	
})

