"use strict"


/* 

    ShelfItemGroupView

*/

window.ShelfItemGroupView = class ShelfItemGroupView extends NodeView {
    
    initPrototype () {
        this.newSlot("isCompacted", true)
        this.newSlot("isAlwaysSelected", false)
    }

    init () {
        super.init()
        this.turnOffUserSelect()
        this.setTransition("all 0.35s")
		
        const itemSize = 80
        this.setMinAndMaxWidth(itemSize)
        this.setOverrideSubviewProto(ShelfItemView)
        return this
    }

    visibleSubnodes () {
        return this.node().shelfSubnodes() 
    }
    /*
    newSubviewForSubnode (aSubnode) {
        const newSubview = NodeView.newSubviewForSubnode(aSubnode)
        newSubview.setOverrideSubviewProto(ShelfItemView)
        return newSubview
    }
*/
    
    syncFromNode () {
        super.syncFromNode()
        this.showCompaction()
        return this
    }
	

    
    // --------------
    
    shelf () {
        return this.parentView().parentView()
    }
    
    didClickItem (clickedItem) {
        //this.debugLog(".didClickItem(" + clickedItem.typeId() + ")")
        
        //this.scrollView().performOnSubviewsExcept("unselect", clickedItem)

        this.items().forEach((item) => {
            if (item !== clickedItem) {
                if (item !== this.firstItem()) {
                    item.unselect()
                }
            }
        })

        this.shelf().didClickGroup(this)
    }
    

    // --- items ---
    
    items () {
        return this.subviews()
    }
    
    addItem (shelfItemView) {
        this.addSubview(shelfItemView)
        return this
    }
    
    firstItem () {
        return this.items()[0]
    }

    firstItemHeight () {
        const fs = this.firstItem()    
        return fs ? fs.clientHeight() : 0
    }
    
    setIsAlwaysSelected (aBool) {
        this._isAlwaysSelected = aBool
        if (aBool) {
            this.selectItems()
        }
        return this
    }

    // --- selection ---

    selectItems () {
        this.items().forEach(item => item.select() )
        return this
    }
       
    unselectItems () {
        this.items().forEach(item => item.unselect() )
        return this
    }

    showCompaction () {
        if (this.isCompacted()) {
        	this.setMinAndMaxHeight(this.firstItemHeight())
        } else {
            const newHeight = this.sumOfSubviewHeights()
            this.setMinAndMaxHeight(newHeight)			
        }
        return this
    }
    
    compact () {
        if (!this._isCompacted) {
            this._isCompacted = true
            
            this.showCompaction()
            
            if (!this.isAlwaysSelected()) {
                this.unselectItems()
            }
            // this.debugLog(".compact()")
        }
        return this
    }
    
    uncompact () {
        if (this._isCompacted) {
            this._isCompacted = false

            this.showCompaction()

            const fs = this.firstItem()
            if (fs) {
                fs.select()
            }
            
        }        
        return this
    }
    
    toggleCompact () {
        if (this._isCompacted) {
            this.uncompact()
        } else {
            this.compact()
        }
        return this
    }

}.initThisClass()
