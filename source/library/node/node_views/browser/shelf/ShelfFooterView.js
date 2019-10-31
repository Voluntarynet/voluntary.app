"use strict"

/* 

    ShelfFooterView

*/

DomView.newSubclassNamed("ShelfFooterView").newSlots({
}).setSlots({
    init: function () {
        DomView.init.apply(this)
        this.turnOffUserSelect()
        this.setTransition("all 0.35s")
		
        const itemSize = 80
        this.setMinAndMaxWidth(itemSize)

        return this
    },
    
    setIsAlwaysSelected: function(aBool) {
        this._isAlwaysSelected = aBool
        if (aBool) {
            this.selectItems()
        }
        return this
    },
    
    // --- items ---
    
    items: function() {
        return this.subviews()
    },
    
    addItem: function(shelfItemView) {
        this.addSubview(shelfItemView)
        return this
    },
    
    firstItem: function() {
        return this.items()[0]
    },
    
    // --------------
    
    shelf: function() {
        return this.parentView()
    },
    
    didClickItem: function(clickedItem) {
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
    },
    
    newShelfItem: function() {
        const item = ShelfItemView.clone()
        this.addItem(item)
        item.showUnselected()
        return item
    },
    
    firstItemHeight: function() {
        const fs = this.firstItem()    
        return fs ? fs.clientHeight() : 0
    },
    
    /*
    selectItems: function() {
        this.items().forEach((item) => { item.select() })
        return this
    },
       
    unselectItems: function() {
        this.items().forEach((item) => { item.unselect() })
        return this
    },
    
    compact: function() {
        if (!this._isCompacted) {
            this._isCompacted = true
            
            this.setMinAndMaxHeight(this.firstItemHeight())
            
            if (!this.isAlwaysSelected()) {
                this.unselectItems()
            }
           // console.log(this.typeId() + ".compact()")
        }
        return this
    },
    
    uncompact: function() {
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
    },
    
    toggleCompact: function() {
        if (this._isCompacted) {
            this.uncompact()
        } else {
            this.compact()
        }
        return this
    },
    */
})
