"use strict"

/* 

    ShelfFooterView

*/

window.ShelfFooterView = class ShelfFooterView extends DomView {
    
    initPrototype () {

    }

    init () {
        super.init()
        this.turnOffUserSelect()
        this.setTransition("all 0.35s")
		
        const itemSize = 80
        this.setMinAndMaxWidth(itemSize)

        return this
    }
    
    setIsAlwaysSelected (aBool) {
        this._isAlwaysSelected = aBool
        if (aBool) {
            this.selectItems()
        }
        return this
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
    
    // --------------
    
    shelf () {
        return this.parentView()
    }
    
    didClickItem (clickedItem) {
        this.items().forEach((item) => {
            if (item !== clickedItem) {
                if (item !== this.firstItem()) {
                    item.unselect()
                }
            }
        })
        
        const node = clickedItem.destinationNode()
        if (node) {
            //App.shared().browser().selectNode(node)
            App.shared().browser().setNode(node).scheduleSyncFromNode() // this.browser().syncFromNode()

        }
        this.shelf().didClickGroup(this)
    }
    
    newShelfItem () {
        const item = ShelfItemView.clone()
        this.addItem(item)
        item.showUnselected()
        return item
    }
    
    firstItemHeight () {
        const fs = this.firstItem()    
        return fs ? fs.clientHeight() : 0
    }
    
    /*
    selectItems () {
        this.items().forEach(item => item.select() )
        return this
    }
       
    unselectItems () {
        this.items().forEach(item => item.unselect() )
        return this
    }
    
    compact () {
        if (!this._isCompacted) {
            this._isCompacted = true
            
            this.setMinAndMaxHeight(this.firstItemHeight())
            
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
            const fs = this.firstItem()
            if (fs) {
                const newHeight = this.sumOfSubviewHeights()
                this.setMinAndMaxHeight(newHeight)
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
    */
   
}.initThisClass()
