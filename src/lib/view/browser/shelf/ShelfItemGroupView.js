"use strict"

window.ShelfItemGroupView = NodeView.extend().newSlots({
    type: "ShelfItemGroupView",
    isCompacted: false,
    isAlwaysSelected: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.turnOffUserSelect()
		this.setTransition("all 0.35s")
		
		var itemSize = 80
		this.setMinAndMaxWidth(itemSize)

        return this
    },

    visibleSubnodes: function() {
        return this.node().shelfSubnodes() 
    },

    newSubviewForSubnode: function(aSubnode) {
        var newSubview = NodeView.newSubviewForSubnode(aSubnode)
        newSubview.setOverrideSubviewProto(ShelfItemView)
        return newSubview
    },
        
    /*
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
        return this.parentView().parentView()
    },
    
    didClickItem: function(clickedItem) {
        console.log(this.typeId() + ".didClickItem(" + clickedItem.typeId() + ")")
        
        this.items().forEach((item) => {
            if (item != clickedItem) {
                if (item != this.firstItem()) {
                    item.unselect()
                }
            }
        })

        this.shelf().didClickGroup(this)
    },
    
    newShelfItem: function() {
        var item = ShelfItemView.clone()
        this.addItem(item)
        item.showUnselected()
        return item
    },
    
    firstItemHeight: function() {
        var fs = this.firstItem()    
        return fs ? fs.clientHeight() : 0
    },
    
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
            var fs = this.firstItem()
            if (fs) {
                var newHeight = this.sumOfSubviewHeights()
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
