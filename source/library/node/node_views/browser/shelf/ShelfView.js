"use strict"

/* 

    ShelfView

*/

NodeView.newSubclassNamed("ShelfView").newSlots({
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
        
        const lids = PeerApp.shared().localIdentities()
        this.setNode(lids)
        this.scrollView().setNode(lids)

        this.setupFooter()
        
        this.unhide()
        return this      
    },
    
    browser: function() {
        return App.shared().browser() // TODO: fix this hack
    },

    // --- hide ----------------------
    
    isHidden: function() {
        return this.parentView() === null
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

    // --- sync -----------------------
    
    didChangeIdentity: function() {
	    this.scheduleSyncFromNode()
    },
    
    didChangeIdentities: function() {
	    this.scheduleSyncFromNode()
    },
    
    syncFromNode: function () {
        this.scrollView().syncFromNode()

        if (this.needsToSelectLastItem()) {
            this.setNeedsToSelectLastItem(false)
            this.clickLastGroupProfile()
	    }
        
        return this
    },
    
    // --- clicks -----------------------
    
    didClickGroup: function(clickedGroup) {
        //this.debugLog(".didClickGroup(" + clickedGroup.typeId() + ")")

        this.scrollView().performOnSubviewsExcept("compact", clickedGroup)
        clickedGroup.uncompact()
        this.scrollView().scrollSubviewToTop(clickedGroup)

        return this
    },

    /*
    selectFirstGroup: function() {
        const firstGroup = this.groups()[0]
        if (firstGroup) {
            firstGroup.uncompact()
        }        
    },
    */


    // --- footer -----------------------


    setupFooter: function() {
	    this.addCreateIdentityGroup()
	    this.addSettingsGroup()        
    },

    newFooterItem: function() {
        return this.footerView().addSubview(ShelfItemView.clone())
    },

    // create identity 

    addCreateIdentityGroup: function() {
        const item = this.newFooterItem()
        //item.setIconName("add-user-white")
        item.setIconName("chat/new_identity")
        item.setTarget(this).setAction("createIdentity").setToolTip("Create New Identity")
        item.setIsSelectable(false)
        //item.setIsAlwaysSelected(true)     
    },

    createIdentity: function() {     
        const newLid = App.shared().localIdentities().add()
        this.scheduleSyncFromNode()
        this.setNeedsToSelectLastItem(true)
    },

    clickLastGroupProfile: function() {
        const group = this.scrollView().subviews().last()
        const item = group.items()[0]
        item.onClick(null)
    },

    // settings 

    addSettingsGroup: function() {
        const item = this.newFooterItem()
        const settings = App.shared().about()
        //item.setIconName("gear-filled-white")
        item.setIconName("chat/system")
        item.setDestinationNode(settings).setToolTip("Settings")   
        item.setIsSelectable(false)
    },
})

