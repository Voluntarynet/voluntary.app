"use strict"

/*

    BMDataStore

    A visible representation of the NodeStore
    
*/


BMNode.newSubclassNamed("BMDataStore").newSlots({
    lastSyncTime: 0,
}).setSlots({
    init: function () {
        BMNode.init.apply(this)
        this.setTitle("Storage")
        this.setNodeMinWidth(300)
    },

    subtitle: function () {
        return this.store().shortStatsString()
    },

    store: function () {
        return NodeStore.shared()
    },

    storeHasChanged: function() {
        return NodeStore.shared().lastSyncTime() !== this.lastSyncTime()
    },

    prepareToSyncToView: function () {
        //console.log("this.storeHasChanged() = ", this.storeHasChanged())

        if (this.subnodes().length === 0 || this.storeHasChanged()) {
            NodeStore.shared().collect()
            this.setLastSyncTime(NodeStore.shared().lastSyncTime())
            this.refreshSubnodes()
        }
    },

    refreshSubnodes: function () {
        //console.log(this.typeId() + " refreshSubnodes")
        this.removeAllSubnodes()
        this.store().sdb().keys().sort().forEach((key) => {
            const subnode = BMDataStoreRecord.clone().setTitle(key)
            const size = this.store().sdb().at(key).length
            const sizeDescription = ByteFormatter.clone().setValue(size).formattedValue()
            subnode.setSubtitle(sizeDescription)
            this.addRecord(subnode)
        })
    },

    subnodeForClassName: function (aClassName) {
        let subnode = this.firstSubnodeWithTitle(aClassName)
        if (!subnode) {
            subnode = BMNode.clone().setTitle(aClassName).setNoteIsSubnodeCount(true)
            this.justAddSubnode(subnode)
        }
        return subnode
    },

    addRecord: function (aRecord) {
        let className = aRecord.title().split("_").first()

        if (className === "") {
            className = "roots"
        }

        let classNode = this.subnodeForClassName(className)
        classNode.setNodeMinWidth(300)
        classNode.justAddSubnode(aRecord)
        return this
    },
})
