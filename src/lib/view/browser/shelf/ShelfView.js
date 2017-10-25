"use strict"

window.ShelfView = DivView.extend().newSlots({
    type: "ShelfView",
    rows: null,
    selectionColor: "#aaa",
    allowsCursorNavigation: true,
	debug: true,
	browser: null,
	defaultWidth: 80,
	scrollView: null,
	footerView: null,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForKeyboard(true)
        this.setMinAndMaxWidth(0)
        
        this.setScrollView(this.addSubview(DivView.clone().setDivClassName("ShelfScrollView")))
        this.setFooterView(this.addSubview(ShelfFooterView.clone()))        

        return this
    },
        
    appDidInit: function() {
        this.syncWithLocalIdentities()
        
        this.addCreateIdentityGroup()
        this.addSettingsGroup()
        
        this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentities").setObserver(this).watch()
        this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        var firstGroup = this.groups()[0]
        if (firstGroup) {
            firstGroup.uncompact()
        }
        return this      
    },
    
    didChangeIdentity: function() {
	    SyncScheduler.scheduleTargetAndMethod(this, "syncWithLocalIdentities")
    },
    
    didChangeIdentities: function() {
	    SyncScheduler.scheduleTargetAndMethod(this, "syncWithLocalIdentities")
    },

    syncWithLocalIdentities: function() {
        this.scrollView().removeAllSubviews()
        App.shared().localIdentities().subnodes().forEach(lid => this.addGroupForLid(lid))
    },
    
    newFooterItem: function() {
        return this.footerView().addSubview(ShelfItemView.clone())
    },
    
    addCreateIdentityGroup: function() {
        var item = this.newFooterItem()
        item.setIconName("add-user-white").setTarget(this).setAction("createIdentity").setToolTip("Create New Identity")
        //item.setIsAlwaysSelected(true)     
    },
    
    createIdentity: function() {
        SyncScheduler.scheduleTargetAndMethod(this, "finishCreateIdentity")
        return this
    },
    
    finishCreateIdentity: function() {        
        var newLid = App.shared().localIdentities().add()
        this.syncWithLocalIdentities()
        SyncScheduler.scheduleTargetAndMethod(this, "clickLastGroupProfile", -1)
    },
    
    clickLastGroupProfile: function() {
        var group = this.groups().last()
        var item = group.items()[3]
        item.onClick(null)
    },
    
    groupWithNode: function(aNode) {
        return this.groups().detect(group => group.node() === aNode )
    },
    
    addSettingsGroup: function() {
        var item = this.newFooterItem()
        item.setIconName("gear-filled-white").setDestinationNode(App.shared().about()).setToolTip("Settings")   
        //item.setIsAlwaysSelected(true)     
    },
    
    addGroupForLid: function(lid) {
        var group = this.newShelfGroup().setNode(lid)
        
        // my posts
        var imageUrl = lid.profile().profileImageDataUrl()
        var myPostsNode = lid.apps().appNamed("Chat").myPosts()
        group.newShelfItem().setImageDataUrl(imageUrl).setDestinationNode(myPostsNode).setToolTip(lid.title())
        
        // feed
        var feedNode = lid.apps().appNamed("Chat").feedPosts()
        group.newShelfItem().setIconName("home3-white").setDestinationNode(feedNode).setToolTip("Feed")
        
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
        console.log(this.typeId() + ".didClickGroup(" + clickedGroup.typeId() + ")")
        if (this.scrollView().hasSubview(clickedGroup)) {

            this.groups().forEach(group => {
                if (group != clickedGroup) {
                    group.compact()
                }
            })
            clickedGroup.uncompact()

            this.scrollView().scrollSubviewToTop(clickedGroup)
        }
    },
    
	// --- groups ---

    groups: function() {
        return this.scrollView().subviews()
    },
    
    newShelfGroup: function() {
        var group = ShelfItemGroupView.clone()
        this.scrollView().addSubview(group)
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
		this.groups().forEach(row => row.unselect())
		return this
	},
	
})

