
BMStunServers = BMStorableNode.extend().newSlots({
    type: "BMStunServers",
}).setSlots({
    init: function () {
        BMStorableNode.init.apply(this)
		this.setShouldStore(true)
        this.setTitle("STUN Servers")
        this.setNoteIsItemCount(true)
        this.setNodeMinWidth(270)

		this.addItemsIfAbsent(this.bootStrapServers())
    },
    
    addServer: function (aServer) {
        return this.addItem(aServer)
    },
    
    servers: function () {
        return this.items()
    }, 

	defaultOptions: function() {
		return {'iceServers': [
		    { host:'stun:stun01.sipphone.com' },
		    { host:'stun:stun.ekiga.net' },
		    { host:'stun:stun.fwdnet.net' },
		    { host:'stun:stun.ideasip.com' },
		    { host:'stun:stun.iptel.org' },
		    { host:'stun:stun.rixtelecom.se' },
		    { host:'stun:stun.schlund.de' },
		    { host:'stun:stun.l.google.com', port:'19302' },
		    { host:'stun:stun1.l.google.com', port:'19302' },
		    { host:'stun:stun2.l.google.com', port:'19302' },
		    { host:'stun:stun3.l.google.com', port:'19302' },
		    { host:'stun:stun4.l.google.com', port:'19302' },
		    { host:'stun:stunserver.org' },
		    { host:'stun:stun.softjoys.com' },
		    { host:'stun:stun.voiparound.com' },
		    { host:'stun:stun.voipbuster.com' },
		    { host:'stun:stun.voipstunt.com' },
		    { host:'stun:stun.voxgratia.org' },
		    { host:'stun:stun.xten.com' },
		]}	
	},

    bootStrapServers: function (dict) {
		var dicts = this.defaultOptions().iceServers
		return dicts.map((dict) => {
        	return BMStunServer.clone().setIceEntry(dict) 
		})


	iceEntries: function() {
		return this.servers().map((server) => { return server.asIceEntry() })
	},
	
	peerOptionsDict: function() {
		return { 'iceServers': this.iceEntries() }
	},
    
})
