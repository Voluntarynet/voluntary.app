
/*
    for fixed navigation use 
    
    doesn't replace subitems on read 
    instead matches with item titles and sends appropriate setNodeDict to them
    
    * have to make sure we set a "title" property when saving so we can do this

*/

BMNavNode = BMStorableNode.extend().newSlots({
    type: "BMNavNode",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
        //this.setLoadsUnionOfChildren(true)
    },
    
    /*
    nodeChildrenDict: function () {
        // makes sure we add a title filed on the child dicts
        
        var self = this
        return this.items().map(function (child) { 
            if (!child.nodeDict) {
                var s = self.type() + " nodeChildrenDict can't serialize " + child.type()
                console.log("WARNING: " + s)
                //throw s
            }
            var dict =  child.nodeDict()
            dict.title = child.title()
            return dict
         })
    },

    setNodeDictForChildren: function (aDict) {
        // instead of creating new children, map dicts to currenct children with 
        // same title
        
        var self = this
        
        if (aDict.children) {
            var items = aDict.children.map(function (childDict) {
                var title = childDict.title
                var item = self.itemWithTitle(title)
                if (item) {
                    item.setNodeDict(childDict)
                }
                return item
            })            
        }
    },
    
    */
    
    itemWithTitle: function(aTitle) {
        return this.items().detect(function(item) {
            return item.title() == aTitle
        })
    },
    
})
