/*
    App is a singleton that represents the application
*/

App = BaseApp.extend().newSlots({
    type: "App",
    
    // market
    marketMode: true,    
    market: null,
    buys: null,
    sells: null,
    
    wallet: null,
    
    network: null,    
}).setSlots({
    init: function () {
        BaseApp.init.apply(this)
        this.setNodeMinWidth(170)        
    },

    setup: function () {       
        BaseApp.setup.apply(this)
        
        window.app = this
        
        this.setName("Bitmarkets")
        this.setTitle("App")
                    
        // setup child nodes
        if (this.marketMode()) {
            
            // market
            this.setMarket(BMMarket.clone())
            this.addItem(this.market())
            
            // market
            //this.setSells(BMSells.clone())
			this.setSells(NodeStore.shared().rootInstanceWithPidForProto("_sells", BMSells))

            //this.setMyPosts(BMClassifiedPosts.clone())
            this.addItem(this.sells())
            //this.sells().asyncLoadItemSoup()
            
            
            /*
            //this.initStoredSlotWithProto("myPosts", BMClassifiedPosts)
            this.initStoredSlotWithProto("market", BMMarket)
            //this.initStoredSlotWithProto("buys", BMBuys)
            //this.initStoredSlotWithProto("sells", BMSells)
            this.initStoredSlotWithProto("myPosts", BMClassifiedPosts)
            //this.initStoredSlotWithProto("wallet", BMWallet)
            */
        }

        if (true) {
            this.initStoredSlotWithProto("network", BMNetwork)
        }

        //this.initStoredSlotWithProto("about", BMInfoNode)

        /*
        this.initStoredSlotWithProto("Posts", BMInfoNode)
        this.initStoredSlotWithProto("My Publications", BMInfoNode)
        this.initStoredSlotWithProto("My Purchases", BMInfoNode)
        this.initStoredSlotWithProto("wallet", BMInfoNode)
        */

        this.setAbout(BMInfoNode.clone().setTitle("About")).setSubtitle(null)
        this.about() //.setPidSymbol("_about")     
        this.addItem(this.about())
        this.addStoredSlots(["about"])
        
        this.load()
        
        if (this.network()) {
            this.network().servers().connect()
        }
        return this
    },
    
    
    load: function() {
        //NodeStore.clear();
        //NodeStore.shared().setRootObject(this)
        return this
    },

})

/*
//netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserWrite');

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

window.requestFileSystem(
  PERSISTENT,        // persistent vs. temporary storage
  1024 * 1024,      // 1MB. Size (bytes) of needed space
  initFs,           // success callback
  opt_errorHandler  // opt. error callback, denial of access
);

function opt_errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('>>>> Error: ' + msg);
}
function initFs(fs) {
	console.log(">>>> initFs ")
  	fs.root.getFile('logFile.txt', {create: true}, GetFileWriter, errorHandler);
}


function GetFileWriter (fileEntry) {
	
	console.log(">>>> GetFileWriter ")
	
    fileEntry.createWriter(function(writer) {  // FileWriter

		writer.onwrite = function(e) {
			console.log('>>>> Write completed.');
		};

		writer.onerror = function(e) {
			console.log('>>>>  Write failed: ' + e.toString());
		};

		var bb = new BlobBuilder();
		bb.append('Lorem ipsum');
		writer.write(bb.getBlob('text/plain'));
    })
}
*/
