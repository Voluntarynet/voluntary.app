"use strict"

window.ShelfItemGroupView = NodeView.extend().newSlots({
    type: "ShelfItemGroupView",
    isCompacted: true,
    isAlwaysSelected: false,
}).setSlots({
    init: function () {
        NodeView.init.apply(this)
        this.turnOffUserSelect()
		this.setTransition("all 0.35s")
		
		var itemSize = 80
		this.setMinAndMaxWidth(itemSize)
		this.setOverrideSubviewProto(ShelfItemView)
        return this
    },

    visibleSubnodes: function() {
        return this.node().shelfSubnodes() 
    },
/*
    newSubviewForSubnode: function(aSubnode) {
        var newSubview = NodeView.newSubviewForSubnode(aSubnode)
        newSubview.setOverrideSubviewProto(ShelfItemView)
        return newSubview
    },
*/
    
	syncFromNode: function() {
		NodeView.syncFromNode.apply(this)
        this.showCompaction()
		return this
	},
	

    
    // --------------
    
    shelf: function() {
        return this.parentView().parentView()
    },
    
    didClickItem: function(clickedItem) {
        //console.log(this.typeId() + ".didClickItem(" + clickedItem.typeId() + ")")
        
		//this.scrollView().performOnSubviewsExcept("unselect", clickedItem)

        this.items().forEach((item) => {
            if (item != clickedItem) {
                if (item != this.firstItem()) {
                    item.unselect()
                }
            }
        })

        this.shelf().didClickGroup(this)
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

    firstItemHeight: function() {
        var fs = this.firstItem()    
        return fs ? fs.clientHeight() : 0
    },
    
    setIsAlwaysSelected: function(aBool) {
        this._isAlwaysSelected = aBool
        if (aBool) {
            this.selectItems()
        }
        return this
    },

	// --- selection ---

    selectItems: function() {
        this.items().forEach((item) => { item.select() })
        return this
    },
       
    unselectItems: function() {
        this.items().forEach((item) => { item.unselect() })
        return this
    },

	showCompaction: function() {
		if (this.isCompacted()) {
        	this.setMinAndMaxHeight(this.firstItemHeight())
		} else {
            var newHeight = this.sumOfSubviewHeights()
            this.setMinAndMaxHeight(newHeight)			
		}
		return this
	},
    
    compact: function() {
        if (!this._isCompacted) {
            this._isCompacted = true
            
            this.showCompaction()
            
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

            this.showCompaction()

            var fs = this.firstItem()
            if (fs) {
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

})
