"use strict"

window.ShelfView = NodeView.extend().newSlots({
    type: "ShelfView",
	browser: null,
	defaultWidth: 80,
	scrollView: null,
	footerView: null,
	needsToSelectLastItem: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.setIsRegisteredForKeyboard(true)
        this.setMinAndMaxWidth(0)
        
        this.setScrollView(this.addSubview(NodeView.clone().setDivClassName("ShelfScrollView")))
        this.scrollView().setOverrideSubviewProto(window.ShelfItemGroupView)
        this.setFooterView(this.addSubview(ShelfFooterView.clone()))        

        return this
    },
        
    appDidInit: function() {    
        this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentities").setObserver(this).watch()
        this._idObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        
        var lids = App.shared().localIdentities()
        this.setNode(lids)
        this.scrollView().setNode(lids)
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
    
    /*
    selectFirstGroup: function() {
        var firstGroup = this.groups()[0]
        if (firstGroup) {
            firstGroup.uncompact()
        }        
    },
    
    setupFooter: function() {
        this.addCreateIdentityGroup()
        this.addSettingsGroup()        
    },
    */
    
    didChangeIdentity: function() {
	    this.scheduleSyncFromNode()
    },
    
    didChangeIdentities: function() {
	    this.scheduleSyncFromNode()
    },

    /*
    syncWithLocalIdentities: function() {
        console.log("--------------- " + this.typeId() + ".syncWithLocalIdentities()")
        this.scrollView().removeAllSubviews()
        var groups = App.shared().localIdentities().subnodes().forEach(lid => this.addGroupForLid(lid))
        
        if (this.needsToSelectLastItem()) {
            this.setNeedsToSelectLastItem(false)
            this.clickLastGroupProfile()
        }
    },
    */
    
    syncFromNode: function () {
        this.scrollView().syncFromNode()
        return this
    },
    
    /*
    newFooterItem: function() {
        return this.footerView().addSubview(ShelfItemView.clone())
    },
    
    addCreateIdentityGroup: function() {
        var item = this.newFooterItem()
        item.setIconName("add-user-white").setTarget(this).setAction("createIdentity").setToolTip("Create New Identity")
        item.setIsSelectable(false)
        //item.setIsAlwaysSelected(true)     
    },
    
    createIdentity: function() {
        //SyncScheduler.scheduleTargetAndMethod(this, "finishCreateIdentity")
        this.finishCreateIdentity()
        return this
    },
    
    finishCreateIdentity: function() {        
        var newLid = App.shared().localIdentities().add()
        this.syncWithLocalIdentities()
            this.setNeedsToSelectLastItem(true)
        //SyncScheduler.scheduleTargetAndMethod(this, "clickLastGroupProfile", -1)
    },
    
    clickLastGroupProfile: function() {
        var group = this.groups().last()
        var item = group.items()[0]
        console.log(this.typeId() + ".clickLastGroupProfile()")
        item.onClick(null)
    },
    
    groupWithNode: function(aNode) {
        return this.groups().detect(group => group.node() === aNode )
    },
    
    addSettingsGroup: function() {
        var item = this.newFooterItem()
        item.setIconName("gear-filled-white").setDestinationNode(App.shared().about()).setToolTip("Settings")   
        item.setIsSelectable(false)
    },
*/

	performOnSubviewsExcept: function(methodName, exceptedSubview) {
        this.subviews().forEach(subview => {
            if (subview != exceptedSubview) {
                subview[methodName].apply(subview)
            }
        })

		return this
	},
    
    didClickGroup: function(clickedGroup) {
        console.log(this.typeId() + ".didClickGroup(" + clickedGroup.typeId() + ")")

		this.scrollView().performOnSubviewsExcept("compact", clickedGroup)
		clickedGroup.uncompact()
        this.scrollView().scrollSubviewToTop(clickedGroup)

		return this
    },

/*
    
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
	*/
})

