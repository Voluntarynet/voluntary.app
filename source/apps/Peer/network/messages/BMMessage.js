"use strict"

/*

    BMMessage

       subclasses:
        BMAddrMessage
        BMInvMessage
        BMObjectMessage

*/

window.BMMessage = class BMMessage extends BMFieldSetNode {
    
    initPrototype () {
        this.newSlot("msgType", null)
        this.newSlot("data", null)
        this.newSlot("msgTypes", ["addr", "inv", "object", "ping", "pong", "getData"])
        this.newSlot("remotePeer", null)
    }

    init () {
        super.init()
        this.setShouldStore(true)
        this.setNodeMinWidth(650)
        this.setNodeColumnBackgroundColor("white")
        //this.setViewClassName("BMMessageView")
    }

    title () {
        return this.msgType()
    }

    subtitle () {
        if (this.msgDict()) {
            const ts = this.msgDict().ts
            if (ts) {
                const t = Date.now()/1000
                const dt = t - ts
                return TimePeriodFormatter.clone().setValueInSeconds(dt).formattedValue()
            }
        }
        return null
    }

    prepareForFirstAccess () {
	    // as this field is only needed when viewing the Message in the browser,
	    // so create it as needed here instead of in the init method
        this.addField(BMTextAreaField.clone().setKey("dict").setValueMethod("msgDictString").setValueIsEditable(false).setIsMono(true))
    }
    
    // dict
    
    msgDictString () {
        return JSON.stringify(this.msgDict(), null, 2)
    }

    msgDict () {
        return {
            msgType: this.msgType(),
            data: this.data()
        }
    }

    setMsgDict (dict) {
        this._msgType = dict.msgType
        this._data = dict.data
        return this
    }
    
    messageForString (aString) {
        const dict = JSON.parse(aString)
        const msgType = dict.msgType
        
        if (this.msgTypes().contains(msgType)) {
            const className = "BM" + msgType.capitalized() + "Message"
            //this.log("className '" + className + "'")
            const proto = window[className]
            return proto.clone().setMsgDict(dict)
        }
        
        throw new Error("no message type '" + msgType + "'")
        return null
    }
    
    duplicate () {
        return this
    }

}.initThisClass()
