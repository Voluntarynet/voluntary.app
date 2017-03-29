
LocalStorageFolder = ideal.Proto.extend().newSlots({
    type: "LocalStorageFolder",
    path: "/", // path should end with pathSeparator
    pathSeparator: "/",
    //debug: true,
}).setSlots({
    init: function () {

    },
    
    root: function() {
        if (!LocalStorageFolder._root) {
            LocalStorageFolder._root = LocalStorageFolder.clone()
            LocalStorageFolder._root.rootShow()
        }
        return LocalStorageFolder._root
    },
    
    // paths
    
    folderAt: function(pathComponent) { 
        assert(!pathComponent.contains(this.pathSeparator())) 
        var db = LocalStorageFolder.clone().setPath(this.path() + pathComponent + this.pathSeparator())
        return db
    },
    
    pathForKey: function(key) {
        assert(!key.contains(this.pathSeparator()))
        return this.path() + key
    },
            
    // writing
    
    atPut: function(key, object) {
        var k = this.pathForKey(key)
        var v = JSON.stringify(object)
        localStorage.setItem(k, v)    
        return this
    },
    
    // reading
    
    hasKey: function(key) {
        return localStorage.getItem(this.pathForKey(key)) != null
    },
    
    at: function(key) { // converts value from string to json object before returning
        var k = this.pathForKey(key)
        var v = localStorage.getItem(k)
        if (typeof(v) != "string") {
            return null
        }
        return JSON.parse(v)
    },
 
    keys: function() {
        var self = this
        var keys = []
        var folderPath = this.path()
        var separator = this.pathSeparator()
        
        for (var i = localStorage.length; i > -1; i--)  {
           var pid = localStorage.key(i)
           
           if (pid != null && pid.beginsWith(folderPath)) {
               var key = pid.after(folderPath)
               if (!key.contains(separator)) {
                   keys.push(key)
                }
            }            
        }
        
        return keys
    },
    
    values: function() {
        var values = []
        
        var self = this
        this.keys().forEach(function (key) {
            values.push(self.at(key))
        })
        
        return values
    },
    
    asJson: function() {
        var dict = {}
        
        var self = this
        this.keys().forEach(function (key) {
            dict[key] = self.at(key)
        })
        
        return dict
    },
    
    show: function() {
        console.log(this.type() + " " + this.path() + " = ", this.asJson())
    },
    
    // removing

    removeAt: function(key) {
        var k = this.pathForKey(key)
        localStorage.removeItem(k)
        return this
    },
    
    clear: function() {
        var self = this
        this.keys().forEach(function (key) {
            self.removeAt(key)
        })
        return this
    },
    
    // root
    
    rootShow: function() {
        console.log("LocalStorageFolder.rootShow = ", this.rootJson())
    },
    
    rootJson: function() {
        var dict = {}
        
        for (var i = localStorage.length; i > -1; i--)  {
           var pid = localStorage.key(i)
           dict[pid] = localStorage.getItem(pid)    
        }
        
        return dict
    },
    
    rootClear: function() {
        console.log("LocalStorageFolder: localStorage clearing all data!")
        localStorage.clear();
        console.log("LocalStorageFolder: localStorage = ", this.asJson())
    }
})
