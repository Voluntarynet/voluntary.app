"use strict"

/* 

    ShelfView

*/

window.ShelfView = class ShelfView extends NodeView {
    
    initPrototype () {
        this.newSlot("browser", null)
        this.newSlot("defaultWidth", 80)
        this.newSlot("scrollView", null)
        this.newSlot("footerView", null)
        this.newSlot("needsToSelectLastItem", false)
    }

    init () {
        super.init()
        this.setIsRegisteredForKeyboard(true)
        this.setMinAndMaxWidth(0)
        
        this.setScrollView(this.addSubview(NodeView.clone().setDivClassName("ShelfScrollView")))
        this.scrollView().setOverrideSubviewProto(window.ShelfItemGroupView)
        this.setFooterView(this.addSubview(ShelfFooterView.clone()))        
		
        return this
    }
        
    appDidInit () {    
        this._idsObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentities").setObserver(this).watch()
        this._idObservation = NotificationCenter.shared().newObservation().setName("didChangeIdentity").setObserver(this).watch()
        
        const lids = PeerApp.shared().localIdentities()
        this.setNode(lids)
        this.scrollView().setNode(lids)

        this.setupFooter()
        
        this.unhide()
        return this      
    }
    
    browser () {
        return App.shared().browser() // TODO: fix this hack
    }

    // --- hide ----------------------
    
    isHidden () {
        return this.parentView() === null
    }

    unhide () {
        if (this.subviews().length) {
            this.setMinAndMaxWidth(this.defaultWidth())
            this.browser().setLeft(this.defaultWidth())
        }
    }
    
    hide () {
        this.setMinAndMaxWidth(0)
        this.browser().setLeft(0)
    }

    // --- sync -----------------------
    
    didChangeIdentity () {
	    this.scheduleSyncFromNode()
    }
    
    didChangeIdentities () {
	    this.scheduleSyncFromNode()
    }
    
    syncFromNode () {
        this.scrollView().syncFromNode()

        if (this.needsToSelectLastItem()) {
            this.setNeedsToSelectLastItem(false)
            this.clickLastGroupProfile()
	    }
        
        return this
    }
    
    // --- clicks -----------------------
    
    didClickGroup (clickedGroup) {
        //this.debugLog(".didClickGroup(" + clickedGroup.typeId() + ")")

        this.scrollView().performOnSubviewsExcept("compact", clickedGroup)
        clickedGroup.uncompact()
        this.scrollView().scrollSubviewToTop(clickedGroup)

        return this
    }

    /*
    selectFirstGroup () {
        const firstGroup = this.groups()[0]
        if (firstGroup) {
            firstGroup.uncompact()
        }        
    }
    */


    // --- footer -----------------------


    setupFooter () {
	    this.addCreateIdentityGroup()
	    this.addSettingsGroup()        
    }

    newFooterItem () {
        return this.footerView().addSubview(ShelfItemView.clone())
    }

    // create identity 

    addCreateIdentityGroup () {
        const item = this.newFooterItem()
        //item.setIconName("add-user-white")
        item.setIconName("chat/new_identity")
        item.setTarget(this).setAction("createIdentity").setToolTip("Create New Identity")
        item.setIsSelectable(false)
        //item.setIsAlwaysSelected(true)     
    }

    createIdentity () {     
        const newLid = App.shared().localIdentities().add()
        this.scheduleSyncFromNode()
        this.setNeedsToSelectLastItem(true)
    }

    clickLastGroupProfile () {
        const group = this.scrollView().subviews().last()
        const item = group.items()[0]
        item.onClick(null)
    }

    // settings 

    addSettingsGroup () {
        const item = this.newFooterItem()
        const settings = App.shared().about()
        //item.setIconName("gear-filled-white")
        item.setIconName("chat/system")
        item.setDestinationNode(settings).setToolTip("Settings")   
        item.setIsSelectable(false)
    }
    
}.initThisClass()

