
/* 

    CrossTabLock
    uses local storage to acquire and release locks across tabs
    
    currently unused 

*/

class CrossTabLock extends ProtoClass {
    init() {
        super.init()
        this.newSlots({
            "lockName": "cross-tab-lock",
            "lockNumber": null,
        })

        window.addEventListener("storage", 
            () => { this.localStorageChanged() }
        )
    }

    currentLockNumber() {
        return localStorage.get(this.lockName());
    }

    iHaveLock () {

    }

    someoneElseHasLock() {

    }

    isLocked() {
        return this.lockNumber() == this.currentLockNumber
    }

    lock() {
        if (!this.isLocked()) {
            localStorage.set(this.lockName(), new Date());
        }
    }

    unlock() {
        if (this.isLocked()) {
            this.setLockNumber(null)
        }
    }

    localStorageChanged(event) {
        if (event.key === this.lockName()) {

            if (this.isLocked()) {
                // does this occur if we change it?
            }
        }
    }
}

CrossTabLock.registerThisClass()