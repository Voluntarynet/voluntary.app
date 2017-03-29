
function DomElement_atInsert(el, index, child) {
    var children = el.children
    
    if (index < children.length) {
        el.insertBefore(children[index])
        return
    }
    
    if (index == children.length) {
        el.appendChild(child)
        return
    }
    
    throw new Error("invalid dom child index")
}

Div = ideal.Proto.extend().newSlots({
    type: "Div",
    divClassName: "",
    items: null,
    element: null,
    parentItem: null,
    itemProto: null,
    
    // target / action
    target: null,
    action: null,
    showsHaloWhenEditable: false,
    tabCount: 0,
    validColor: null,
    invalidColor: null
}).setSlots({
    init: function () {
        this._items = []
        var e = document.createElement("div");
        e._item = this
        e.setAttribute('class', this.divClassName());
        this._element = e
        this.element().style.transition = "all .2s"
        this.setItemProto(Div)
        return this
    },
    
    applyCSS: function(ruleName) {
        if (ruleName == null) { 
            ruleName = this.divClassName()
        }
        CSS.ruleAt(ruleName).applyToElement(this.element())
        return this
    },
    
    setBackgroundColor: function(s) {
        this.element().style.backgroundColor = s
        return this
    },
    
    width: function() {
        return this.element().style.clientWidth
    },
    
    minWidth: function() {
        var s = this.element().style.minWidth
        var w = Number(s.replace("px", ""))
        return w
    },

    setMinAndMaxWidth: function(w) {
        this.element().style.minWidth = w + "px"
        this.element().style.maxWidth = w + "px"
        return this        
    },

    setDivClassName: function (aName) {
        this._divClassName = aName
        if (this._element) {
            this._element.setAttribute('class', aName);
        }
        return this
    },

    divClassName: function (aName) {
        if (this._element) {
            var className = this._element.getAttribute('class');
            this._divClassName = className
            return className
        }
        return this._divClassName
    },
    
    newItemFromProto: function () {
        var anItem = this.itemProto().clone()
        if (anItem == null) {
            throw new Error("null anItem")
        }
        return anItem
    },

    addItem: function(anItem) {
        if (anItem == null) {
            anItem = this.newItemFromProto()
        }
        
        this._items.append(anItem)
        
        if ( anItem.element() == null) {
                console.log("anItem = ", anItem)
                throw new Error("null anItem.element()")
        }
        this._element.appendChild(anItem.element());
        anItem.setParentItem(this)
        return anItem
    },
    
    addItems: function(someItems) {
        var self = this
        someItems.forEach(function (item) { self.addItem(item) })
        return this
    },
 
    newItemForNode: function(aNode) {
        if (!this.itemProto()) {
            throw new Error("missing itemProto to create newItemForNode")
        }
        return this.itemProto().clone().setNode(aNode)
    },
    
    atInsert: function (anIndex, anItem) {
        this.items().atInsert(anIndex, anItem)
        DomElement_atInsert(this.element(), anIndex, anItem.element())
        return anItem
    },
    
    itemForNode: function(aNode) {
        //this.log("itemForNode " + aNode.type())
        
        var items = this.items()
        for (var i = 0; i < items.length; i++) {
            var item = items[i]
            
            if (!item.node) {
                //console.log(item + " missing node method")
                //console.log("items = ", items)
            }
            
            if (item.node() == aNode) {
                return item
            }
        }
        return null
    },
    
    removeAfterFadeDelay: function(delayInSeconds) {
        // call removeItem for a direct actions
        // use justRemoteItem for internal changes

        var self = this
        
        this.element().style.transition = "all " + delayInSeconds + "s"
        setTimeout(function () { 
            self.element().style.opacity = 0
        }, 0)
        
        setTimeout(function () { 
            self.parentItem().removeItem(self)
        }, delayInSeconds*1000)        
        
        return this
    },
    
    willRemove: function() {
    },
    
    removeItem: function (anItem) {
        anItem.willRemove()
        this._items.remove(anItem)
        this._element.removeChild(anItem.element());
        anItem.setParentItem(null)
        return anItem
    },
    
    removeAllItems: function() {
        var self = this
        this.items().copy().forEach(function(item) { self.removeItem(item) })
        return this
    },

    indexOfItem: function(anItem) {
        return this.items().indexOf(anItem)
    },

    itemAfter: function(anItem) {
        var index = this.indexOfItem(anItem)
        var nextIndex = index + 1
        if (nextIndex < this.items().length) {
            return this.items()[nextIndex]
        }
        return null
    },

    setInnerHTML: function (v) {
        if (v == null) { v = "" }
        v = "" + v //escape(v)
        var a = this._element.innerHTML
        var b = v
        //a = a.replaceAll("&nbsp;", " ")
        //b = b.replaceAll("&nbsp;", " ")

        if (a != b) {

            if (document.activeElement == this._element) {
                console.log("WARNING: attempt to setInnerHTML on active element. ")
                // Can't do this until we can properly set the cursor.
                // there also seems to be some inconsistency problem
                // maybe with DOM update sync?
                return 
            }
        

            //console.log("e[" + a + "] -> e[" + b + "]")
            //console.log("setInnerHTML [" + this._element.innerHTML  + "] -> [" + v + "]")
            //console.log("[" + this._element.innerHTML + "] -> [" + v + "]")
            //NotificationCenter.showCurrentNoteStack()
            //ShowStack()
            
            this._element.innerHTML = v
        }
        return this
    },

    innerHTML: function() {
        return this._element.innerHTML
    },

    setString: function (v) {
        return this.setInnerHTML(v)
    },
    
    loremIpsum: function (maxWordCount) {
        if (!maxWordCount) { maxWordCount = 40; }

        
    	var loremIpsumWordBank = new Array("lorem","ipsum","dolor","sit","amet,","consectetur","adipisicing","elit,","sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua.","enim","ad","minim","veniam,","quis","nostrud","exercitation","ullamco","laboris","nisi","ut","aliquip","ex","ea","commodo","consequat.","duis","aute","irure","dolor","in","reprehenderit","in","voluptate","velit","esse","cillum","dolore","eu","fugiat","nulla","pariatur.","excepteur","sint","occaecat","cupidatat","non","proident,","sunt","in","culpa","qui","officia","deserunt","mollit","anim","id","est","laborum.","sed","ut","perspiciatis,","unde","omnis","iste","natus","error","sit","voluptatem","accusantium","doloremque","laudantium,","totam","rem","aperiam","eaque","ipsa,","quae","ab","illo","inventore","veritatis","et","quasi","architecto","beatae","vitae","dicta","sunt,","explicabo.","nemo","enim","ipsam","voluptatem,","quia","voluptas","sit,","aspernatur","aut","odit","aut","fugit,","sed","quia","consequuntur","magni","dolores","eos,","qui","ratione","voluptatem","sequi","nesciunt,","neque","porro","quisquam","est,","qui","dolorem","ipsum,","quia","dolor","sit,","amet,","consectetur,","adipisci","velit,","sed","quia","non","numquam","eius","modi","tempora","incidunt,","ut","labore","et","dolore","magnam","aliquam","quaerat","voluptatem.","ut","enim","ad","minima","veniam,","quis","nostrum","exercitationem","ullam","corporis","suscipit","laboriosam,","nisi","ut","aliquid","ex","ea","commodi","consequatur?","quis","autem","vel","eum","iure","reprehenderit,","qui","in","ea","voluptate","velit","esse,","quam","nihil","molestiae","consequatur,","vel","illum,","qui","dolorem","eum","fugiat,","quo","voluptas","nulla","pariatur?","at","vero","eos","et","accusamus","et","iusto","odio","dignissimos","ducimus,","qui","blanditiis","praesentium","voluptatum","deleniti","atque","corrupti,","quos","dolores","et","quas","molestias","excepturi","sint,","obcaecati","cupiditate","non","provident,","similique","sunt","in","culpa,","qui","officia","deserunt","mollitia","animi,","id","est","laborum","et","dolorum","fuga.","harum","quidem","rerum","facilis","est","et","expedita","distinctio.","Nam","libero","tempore,","cum","soluta","nobis","est","eligendi","optio,","cumque","nihil","impedit,","quo","minus","id,","quod","maxime","placeat,","facere","possimus,","omnis","voluptas","assumenda","est,","omnis","dolor","repellendus.","temporibus","autem","quibusdam","aut","officiis","debitis","aut","rerum","necessitatibus","saepe","eveniet,","ut","et","voluptates","repudiandae","sint","molestiae","non","recusandae.","itaque","earum","rerum","hic","tenetur","a","sapiente","delectus,","aut","reiciendis","voluptatibus","maiores","alias","consequatur","aut","perferendis","doloribus","asperiores","repellat");
    	var minWordCount = 15;
    	//var maxWordCount = 100;

    	var randy = Math.floor(Math.random()*(maxWordCount - minWordCount)) + minWordCount;
    	var ret = "";
    	for(i = 0; i < randy; i++) {
    		var newTxt = loremIpsumWordBank[Math.floor(Math.random() * (loremIpsumWordBank.length - 1))];
    		if (ret.substring(ret.length-1,ret.length) == "." || ret.substring(ret.length-1,ret.length) == "?") {
    			newTxt = newTxt.substring(0,1).toUpperCase() + newTxt.substring(1, newTxt.length);
    		}
    		ret += " " + newTxt;
    	}

        this.setInnerHTML(ret)
        
        return this
    },

    tellParents: function(msg, item) {
        var f = this[msg]
        if (f && f.apply(this, [item])) {
            return
        }

        var p = this.parentItem()
        if (p) {
            p.tellParents(msg, item)
        }
    },
    
    // onclick target & action
    
    registerForClicks: function (aBool) {
        if (aBool) {
            var self = this
            this.element().onclick = function (event) { self.onClick(event) }
            //this.element().ondblclick = function (event) { self.onDoubleClick(event) }
        } else {
            this.element().onclick = null
            this.element().ondbclick = null
        }
        return this
    },
    
    setAction: function (anAction) {
        this._action = anAction
        this.registerForClicks(anAction != null)
        return this       
    },
    
    onClick: function(event) {
        var t = this.target()
        if (t) {
            t[this.action()].apply(t)
        } else {
            throw new Error("no target for action " + this.action())
        }
        return this
    },
    
    onDoubleClick: function (event) {
        
        return this
    },
    
    // drag & drop
    
    registerForDrop: function (aBool) {
        if (aBool) {
            var self = this
            this.element().ondragover  = function (event) { return self.onDragOver(event) }
            this.element().ondragleave = function (event) { return self.onDragLeave(event) }
            this.element().ondragend   = function (event) { return self.onDragEnd(event) }
            this.element().ondrop      = function (event) { return self.onDrop(event) }
        } else {
            this.element().ondragover  = null
            this.element().ondragleave = null
            this.element().ondragend   = null
            this.element().ondrop     = null
        }
        return this
    },   
    
    acceptsDrop: function() {
        return true
    },    
         
    onDragOver: function (event) {
        //console.log("onDragOver ");

        if (this.acceptsDrop()) {
            this.onDragOverAccept(event)
            event.preventDefault()
            return true
        }

        return false;
    },
    
    onDragOverAccept: function(event) {
        //console.log("onDragOverAccept ");
        this.dragHighlight()
    },
    
    onDragLeave: function (event) {
        //console.log("onDragLeave ", this.acceptsDrop());
        this.dragUnhighlight()
        return this.acceptsDrop();
    },
    
    dragHighlight: function() {
        
    },
    
    dragUnhighlight: function() {
        
    },
    
    onDragEnd: function (event) {
        this.dragUnhighlight();
        //console.log("onDragEnd");
    },

    onDrop: function (event) {
        //var file = event.dataTransfer.files[0];
        //console.log('onDrop ' + file.path);
        this.onDataTransfer(event.dataTransfer)
        this.dragUnhighlight()
        event.preventDefault();
        return true;
    },
    
    /*
    onDataTransfer: function(dataTransfer) {     
        console.log('onDataTransfer ', dataTransfer);
        
        //var file = event.dataTransfer.files[0];
        //console.log('onDataTransfer file[0]: ' + file.path);
        
        for (var i = 0; i < dataTransfer.files.length; i ++) {
            var file = files[i];
            var reader = new FileReader();

            //var fileIsImage = /\.(jpe?g|png|gif)$/i.test(file.name);

             var self = this
             reader.addEventListener("load", function () {
                    console.log('onDataTransfer load ');
                   var image = new Image();
                    image.height = 100;
                    image.title = file.name;
                    image.src = reader.result;
                    self.element().appendChild( image );
              }, false);

              if (file) {
                reader.readAsDataURL(file);
              }
        }        
    },
    */
   
      onDataTransfer: function(dataTransfer) {     
        
        console.log('onDataTransfer ', dataTransfer);
        
        if (dataTransfer.files.length) {   
            var dataUrls = []
            for (var i = 0; i < dataTransfer.files.length; i ++) {
                var file = dataTransfer.files[i]
                console.log("file: ", file)
                
                if (!file.type.match('image.*')) {
                    continue;
                }

                var reader = new FileReader();
                var self = this;
                reader.onload = (function(event) {
                    self.onDropImageDataUrl(event.target.result)
                })
                reader.readAsDataURL(file);

            }
        }

    },
    
    /* 
    onDataTransfer: function(dataTransfer) {     
        console.log('onDataTransfer ', dataTransfer);
        if (dataTransfer.files.length) {   
            var filePaths = []
            var dataUrls = []
            for (var i = 0; i < dataTransfer.files.length; i ++) {
                var file = dataTransfer.files[i]
                console.log("file: ", file)
                var path = file.path
                filePaths.push(path)
                var dataUrl = FileReader.readAsDataURL(file) 
                filePaths.push(dataUrl)
            }
            console.log('onDataTransfer filePaths: ', filePaths);
            assert(filePaths.length == dataTransfer.files.length)
            this.onDropFiles(filePaths)
        }
    },
    */
    
    onDropImageDataUrl: function(dataUrl) {
        console.log('onDropImageDataUrl: ', dataUrl);
        //this.node().onDropFiles(filePaths)
    },
    
    onDropFiles: function(filePaths) {
        console.log('onDropFiles ' + filePaths);
        //this.node().onDropFiles(filePaths)
    },
    
    // editing
    
    setContentEditable: function (aBool) {
        
        this.element().contentEditable = aBool ? 'true' : 'false'
        
        if (this.showsHaloWhenEditable()) {
            this.element().style.boxShadow = aBool ? "0px 0px 5px #ddd" : "none"
        }
        this.registerForKeyboard(aBool)
        
        if (aBool) {
            this.turnOnUserSelect()
            this.registerForPaste()
        } else {
            this.unregisterForPaste()
        }
        
        return this
    },
    
    // mouse 
    
    registerForMouse: function (aBool) {
        if (aBool) {
            var self = this
            this.element().onmousedown = function (event) { return self.onMouseDown(event) }
            this.element().onmousemove = function (event) { return self.onMouseMove(event) }
            this.element().onmouseout  = function (event) { return self.onMouseOut(event) }
            this.element().onmouseover = function (event) { return self.onMouseOver(event) }
            this.element().onmouseup   = function (event) { return self.onMouseUp(event) }
        } else {
            this.element().onmousedown  = null
            this.element().onmousemove  = null
            this.element().onmouseout   = null
            this.element().onmouseover  = null
            this.element().onmouseup    = null
        }
        return this
    },    
    
    onMouseDown: function (event) {
    },
    
    onMouseMove: function (event) {
    },
    
    onMouseOut: function (event) {
    },
    
    onMouseOver: function (event) {
    },

    onMouseUp: function (event) {
    },
        
    // keyboard 
    
    registerForKeyboard: function (aBool) {
        if (aBool) {
            var self = this
            /*
            this.element().onkeydown  = function (event) {       
                return self.onKeyDown(event) 
            }

            this.element().onkeypress = function (event) { return self.onKeyPress(event) }
            */
            this.element().onkeyup    = function (event) { 
                //self._onkeyupInnerHTML = self._element.innerHTML // THIS NEEDS TO BE HERE OR DOM innerHTML ISN'T CONSISTENT?
                //console.log("onkeyup [" + self._element.innerHTML  + "]")
                return self.onKeyUp(event) 
            }
            Div._tabCount ++
            this.element().tabIndex   = Div._tabCount
            this.element().style.outline = "none"
        } else {
            this.element().onkeydown  = null
            this.element().onkeypress = null
            this.element().onkeyup    = null
            delete this.element().tabindex 
        }
        return this
    },    
    
    onKeyDown: function (event) {
        
        //console.log("onKeyDown")
        //this._lastInnerHTML = this.innerHTML()
     /*   
        var cursorPos = document.selection.createRange().duplicate();
        this._clickx = cursorPos.getBoundingClientRect().left; 
        this._clicky = cursorPos.getBoundingClientRect().top;
    */
        /*
        var tabCode = 9
        if (event.keyCode == tabCode) {
            this.onTabKeyDown()
            console.log("onTabKeyDown")
        }
        */
    },
    
    onKeyPress: function (event) {
       // console.log("onKeyPress")
    },
    
    onKeyUp: function (event) {
        /*
        var tabCode = 9
        console.log(this.type() + " onKeyUp " + event.keyCode)
        if (event.keyCode == tabCode) {
            event.preventDefault() 
        }
        */
        
        //console.log("event: ", event)
        
        //event.preventDefault()
        
        if ((!this.isValid()) && (this.invalidColor() != null)) {
             this.setColor(this.invalidColor())
        } else {
            if (this.color() == this.invalidColor()) {
                this.setColor(null)
            }
        }
        
        this.tellParents("onDidEdit", this)
    },
    
    onTabKeyDown: function() {
        /*
        var nkv = this.nextKeyView()
        if (nkv) {
            event.preventDefault()
            if (nkv.initialFirstResponder()) {
                nkv.focus()
            }
        }
        */
    },
    
    isValid: function() {
        return true
    },
    
    registerForFocus: function(aBool) {
        if (aBool) {
            var self = this
            this.element().onfocus = function() { self.onFocus() };
        } else {
            this.element().onfocus = null
        }
        return this
    },
    
    onFocus: function () {
        
    },
    
    blur: function () {
        this.element().blur()
        return this
    },
    
    focus: function() {
        var self = this
        setTimeout(function () {
            self.element().focus()
        }, 0)
        return this
    },
    
    setTop: function (y) {
        var v = y + "px"
        this.element().style.top = v;
        //console.log("setTop " + v)
        return this
    },

    setLeft: function (x) {
        var v = x + "px"
        this.element().style.left = v;
        //console.log("setLeft " + v)
        return this
    },
    
    setColor: function(c) {
        this.element().style.color = c;
        return this
    },
    
    color: function() {
        return this.element().style.color 
    },
    
    setVisible: function(aBool) {
        this.element().style.visibility = aBool ? "visible" : "hidden";
        return this
    },
    
    setDisplay: function(s) {
        //assert(s in { "none", ...} );
        this.element().style.display = s;
        return this
    },
    
    
    turnOffUserSelect: function() {
        this.element().style.userSelect = "none";
        this.element().style.webkitUserSelect = "none";
        this.element().style.MozUserSelect = "none";
        return this
    },

    turnOnUserSelect: function() {
        this.element().style.userSelect = "text";
        this.element().style.webkitUserSelect = "text";
        this.element().style.MozUserSelect = "text";
        return this
    },
    
    
    // ---------------------
    
    paste: function (e) {
        // prevent pasting text by default after event
        e.preventDefault(); 

        var clipboardData = {},
        rDataText,
        rDataHTML;

        clipboardData = e.clipboardData;
        rDataHTML = clipboardData.getData('text/html');
        rDataPText = clipboardData.getData('text/plain');

        var htmlToPlainText = function (html)
        {
           var tmp = document.createElement("DIV");
           tmp.innerHTML = html;
           return tmp.textContent || tmp.innerText || "";
        }

        if (rDataHTML && rDataHTML.trim().length != 0) {
            this.replaceSelectedText(htmlToPlainText(rDataHTML))
            return false; // prevent returning text in clipboard
        }

        if (rDataPText && rDataPText.trim().length != 0) {
            this.replaceSelectedText(htmlToPlainText(rDataPText))
            return false; // prevent returning text in clipboard
        }
    },
    
    pasteListenerFunc: function () {
        if (!this._pasteListenerFunc) {
            var self = this
            this._pasteListenerFunc = function(e) { self.paste(e) }
        }
        return this._pasteListenerFunc
    },
    
    unregisterForPaste: function () {
        this.element().removeEventListener('paste', this.pasteListenerFunc());
    },
    
    registerForPaste: function() {
        this.element().addEventListener('paste', this.pasteListenerFunc(), false);
        return this
    },

    replaceSelectedText: function(replacementText) {
        var sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(replacementText));
            }
        } else if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            range.text = replacementText;
        }
    },
    
 
    setContentAfterOrBeforeString: function(aString, afterOrBefore) {
        var uniqueClassName = "UniqueClass_" + this._uniqueId
        var e = this.element()
        if (e.className.indexOf(uniqueClassName) == -1) {
            var newRuleKey = "div." + uniqueClassName + ':' + afterOrBefore
            var newRuleValue = 'content: "'+ aString + '";'
            //console.log("newRule '" + newRuleKey + "', '" + newRuleValue + "'")
            document.styleSheets[0].addRule(newRuleKey, newRuleValue);
            e.className += " " + uniqueClassName
        }
        return this
    },
       
    setContentAfterString: function(aString) {
        this.setContentAfterOrBeforeString(aString, "after")
        return this
    },
    
    setContentBeforeString: function(aString) {
        this.setContentAfterOrBeforeString(aString, "before")
        return this
    },
    
    makeUnselectable: function() {
        var s = this._element.style
        s.userSelect = "none";
        s["-moz-user-select"] = "none";
        s["-khtml-user-select"] = "none";
        s["-webkit-user-select"] = "none";
        s["-o-user-select"] = "none";
        return this
    },

})
