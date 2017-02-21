

function DeepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
    
var categories = [
    { name: "housing", items: [
        { name: "apts / housing", items: [], canPost: true }
    ]},
    { name: "for sale", items: [
        { name: "cars+trucks", items: [], canPost: true }
    ]}
]

window.menuData = { name: "Declassifieds", items:[
    { name: "US", items: [
        { name: "California", items: [
            { name: "San Francisco", items: DeepCopy(categories) },
            { name: "Los Angeles", items: DeepCopy(categories) },
            
        ] },
        { name: "Maryland", items: [] },
    ]},
    { name: "EU", items: []},
    { name: "Japan", items: []},
    { name: "China", items: []},
    { name: "Australia", items: []},
    { name: "New Zealand", items: []},
]}


// --------------------------------------------------------------------

function Dom_removeChildren(node) {
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }            
}

function Table_addRow(table) {
    var row = document.createElement("tr");
    table.appendChild(row)
    return row
}

function TableRow_addColumn(row) {
    var column = document.createElement("td");
    row.appendChild(column)
    return column
}

    
function Div_setTarget_Method_Label_(e, target, method, label) {
    if (label) {
        e.innerHTML = label
        e._target = target
        e._method = method
        e.onclick = function() { e._target[e._method].call(e._target) }
    } else {
        e.innerHTML = ""
        e._target = null
        e._method = null
        e.onclick = null                   
    }
}

// ----------------------------------------------------------------

var Browser = {
    _item: null,
    
    init: function() {
        this._item = window.menuData    
        NavBar.addPath(this._item)
        this.update()    
    },
    
    element: function() {
         return document.getElementById("itemsTable")
    },
    
    clearRows: function() {
        Dom_removeChildren(this.element())
    },
    
    update: function() {
        this.clearRows()

        var items = this._item.items
        for (var index = 0; index < items.length; index ++) {
            var item = items[index]
            var key = item.name
            this.addItem(item);
        }
        
        NavBar.update()
        
        if (this._item.canPost) {
            Div_setTarget_Method_Label_(NavBar.button1(), PostForm, "open", "Post")
        } else {
            Div_setTarget_Method_Label_(NavBar.button1())
            Div_setTarget_Method_Label_(NavBar.button2())
            PostForm.hide()
        }
    },
    
    addItem: function(item) {
        var row = Table_addRow(this.element())
        row._item = item
        row.onclick = function () { Browser.selectItem(this._item) }
        
        var col = TableRow_addColumn(row)
        col.innerHTML = item.name
    },
    
    selectItem: function(item) {
        NavBar.addPath(item)
        this.setItem(item)
    },
    
    setItem: function(anItem) {
        this._item = anItem
        this.update()                    
    },
    
    back: function() {
        NavBar.pop()
        this.setItem(NavBar.lastPathItem())
    },
}



// -----------------------------------------------------------------


var NavBar = {
   _path: [],

   element: function() {
        return document.getElementById("navBar")
   },
   
   addPath: function(anItem) {
       this._path.push(anItem)
       this.update()
   },
   
   lastPathItem: function() {
       return this._path[this._path.length - 1]
   },
   
   pop: function() {
       if (this._path.length > 1) {
           this._path.pop()
           this.update()
       }
   },
  
   fullPathString: function() {
       return this._path.map(function (item) { return item.name }).join(" / ")                   
   },
   
   update: function() {
       var path = this._path.slice(0);
       var currentItem = path.pop()
       var previousItem = path.pop()
       var s = ""
       
       if (previousItem) {
           //s += previousItem.name + " / "
           s += " &lt; "
           s += " &nbsp;&nbsp;" 
       }
       
       if (currentItem) {
           s += currentItem.name
       }
       
       this.element().innerHTML = s      
       
       this.element().onclick = function () { Browser.back() }          
    },    
    
    button1: function() {
        return document.getElementById("navAction1")
    },

    button2: function() {
        return document.getElementById("navAction2")
    },    
    
    setAction: function(label, method) {
        Div_setTarget_Method_Label_(this.button1(), this, method, label)
    },
}

// -----------------------------------------------------------------

PostForm = {
    form: function() {
        return document.getElementById("PostForm")
    },
    
    show: function() {
        this.form().style.visibility = "visible"
    },
    
    hide: function() {
        this.form().style.visibility = "hidden"
    },
    
    open: function() {
        this.show()
        var h = document.getElementById("PostForm").offsetHeight - 100;
        document.getElementById("PostTextArea").style.height = h + "px"
        document.getElementById("PostTextArea").focus();
        
        Div_setTarget_Method_Label_(NavBar.button1(), this, "send", "Send")
        Div_setTarget_Method_Label_(NavBar.button2(), this, "cancel", "Cancel")
    },
    
    close: function() {
        this.hide()
        Div_setTarget_Method_Label_(NavBar.button1())
        Div_setTarget_Method_Label_(NavBar.button2())
        Browser.update()
    },

    cancel: function() {
        this.close()
    },
    
    send: function() {
        this.close()
    }
}

// -----------------------------------------------------------------


