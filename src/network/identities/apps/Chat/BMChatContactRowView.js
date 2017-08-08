
BMChatContactRowView = BrowserTitledRow.extend().newSlots({
    type: "BMChatContactRowView",
}).setSlots({
  
/*  
    init: function () {
        BrowserTitledRow.init.apply(this)        
    },
*/

	select: function() {
		BrowserTitledRow.select.apply(this)
		var rid = this.node().remoteIdentity()
		console.log("select remote id ", rid.title(), " this.node() = ", this.node().type())
		this.node().chatApp().threads().openThreadForRemoteIdentity(rid)
		return this
	},

})

