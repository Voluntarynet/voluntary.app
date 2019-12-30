"use strict"

/*

    BMActorNode

    Async messages don't ensure processing order, so we need actors with 
    message queues in order to sequence inbound messages.
 
    NOTES

    - auto runs if any messages are in inbox (the asyncMessageQueue)
  

*/

window.BMActorNode = class BMActorNode extends BMNode {
    
    initPrototype () {
        this.newSlot("inbox", null).setInitProto(Array) // asyncMessageQueue
        this.newSlot("timeout", null) 
    }

    init () {
        super.init()
        return this
    }

    composeAndSendMessage (messageName, args, callback) {
        const msg = this.composeMessage(messageName, args, callback)
        this.receiveMessage(msg)
        return msg.future()
    }

    composeMessage (messageName, args, callback) {
        const msg = InboxMessage.clone().setName(messageName).setArgs(args).setCallback(callback)
        this.inbox().push(msg)
        return msg
    }

    receiveMessage (aMessage) {
        this.inbox().push(aMessage)
        if (this.inbox().length === 1) {
            this.runViaTimeout()
        }
        return this
    }

    runViaTimeout () {
        const timeout = setTimeout(() => { this.run() }, 0)
        this.setTimeout(timeout)
        return this
    }

    run () {
        if (this.inbox().length) {
            const aMessage = this.inbox().removeFirst()
            this.processMessage(aMessage)
        }

        if (this.inbox().length) {
            this.runViaTimeout()
        }
    }

    processMessage (aMessage) {
        if (!this.respondsTo(aMessage.name())) {
            this.onErrorProcessingMessage(aMessage, new Error("missing method " + aMessage.name()))
        }

        try {
            const f = this[aMessage.name()]
            const result = f.apply(this, aMessage.args())
            this.onSuccessProcessingMessage(aMessage, result)
        } catch (anError) {
            this.onErrorProcessingMessage(aMessage, anError)
        }
        aMessage.future().futureCompleted()
    }

    onSuccessProcessingMessage (aMessage, aResult) {
        aMessage.future().future_setResult(aResult)
    }

    onErrorProcessingMessage (aMessage, anError) {
        aMessage.future().future_setError(anError)
    }
    

}.initThisClass()
