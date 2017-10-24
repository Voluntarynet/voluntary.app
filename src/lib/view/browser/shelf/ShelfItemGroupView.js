"use strict"

window.ShelfItemGroupView = DivView.extend().newSlots({
    type: "ShelfItemGroupView",
    isCompacted: false,
}).setSlots({
    init: function () {
        DivView.init.apply(this)
        this.turnOffUserSelect()
		this.setTransition("all 0.35s")
		
		var itemSize = 80
		this.setMinAndMaxWidth(itemSize)
		//this.setMinAndMaxHeight(itemSize)

        return this
    },
    
    items: function() {
        return this.subviews()
    },
    
    shelf: function() {
        return this.parentView()
    },
    
    didClickItem: function(clickedItem) {
        this.items().forEach((item) => {
            if (item != clickedItem) {
                item.unselect()
            }
        })
        
        var node = clickedItem.destinationNode()
        if (node) {
            //App.shared().browser().selectNode(node)
            App.shared().browser().setNode(node).scheduleSyncFromNode() // this.browser().syncFromNode()

        }
        this.shelf().didClickGroup(this)
    },
    
    newShelfItem: function() {
        var item = ShelfItemView.clone()
        this.addSubview(item)
        item.showUnselected()
        return item
    },
    
    compact: function() {
        if (!this._isCompacted) {
            this._isCompacted = true

            var fs = this.firstSubview()
            if (fs) {
                this.setMinAndMaxHeight(fs.clientHeight())
            }
            
            this.subviews().forEach((subview) => { subview.unselect() })
           // console.log(this.typeId() + ".compact()")
        }
        return this
    },
    
    firstSubview: function() {
        return this.subviews()[0]
    },
    
    uncompact: function() {
        if (this._isCompacted) {
            this._isCompacted = false
            //console.log(this.typeId() + ".uncompact()")
            //this.setMinAndMaxWidth(null)
            var fs = this.firstSubview()
            if (fs) {
                // TODO: figure out this 6px issue
//                var newHeight = (fs.clientHeight())*this.subviews().length
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

})
