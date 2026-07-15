const delegateEvent = function<
K extends keyof HTMLElementEventMap,
    E extends Element = HTMLElement
>
(
 parent : Element | Document | null,
 eventType: K,
 selector: string,
 handler : ($event : HTMLElementEventMap[K], matchedTarget : E) => void,
 options? : boolean | AddEventListenerOptions
){
    if(!parent){
        throw Error("delegateEvent: Parent not present in DOM!")
    }

    const internalHandler = ($event : HTMLElementEventMap[K]) => {
        if($event.target && $event.target instanceof Element){
           const matchedElement = $event.target.closest(selector)
           if(matchedElement && parent.contains(matchedElement)){
               handler($event, matchedElement as E)
           }
        }
    }

    parent.addEventListener(eventType, internalHandler as EventListener, options)

    return () => {
        parent.removeEventListener(eventType, internalHandler as EventListener)
    }
}

const delegateEventHandlers = function<
    K extends keyof HTMLElementEventMap,
    E extends Element = HTMLElement
>(
    parent : Element | Document | null,
    selector: string,
    handlers : [K, ($event : HTMLElementEventMap[K], matchedTarget : E) => void][],
    options? : boolean | AddEventListenerOptions
){
    const cleanupHandlers : ReturnType<typeof delegateEvent>[] = []
    for (const handler of handlers) {
        cleanupHandlers.push( delegateEvent(parent, handler[0], selector, handler[1], options ))
    }
    return cleanupHandlers
}

//todo: attempt to find valid type for query selector string



const focusTrapEl = document.getElementById('focus-trap')
if(!focusTrapEl){
    throw Error("Element with id 'focus-trap' not present in DOM!")
}

/*
 * Note: it is dumb that CSS has such a rich selector language. This is something beginners would stumble over, as it's
 * also used within Angulars component decorator, within the selectors parameter. I remember when the CSS query selector
 * syntax and language was not well known.
 */
// todo: auto format for selector, indent lines one indentation
const selector = `a[href],button:not([disabled],
[tabindex="-1"]),
input:not([disabled],
[tabindex="-1"]),
textarea:not([disabled],
[tabindex="-1"]),
select`;
const focusableElements = focusTrapEl.querySelectorAll(
    selector
)
if(!(focusableElements instanceof NodeList)){
    throw Error('focusableElements not present in DOM!')
}

//todo: somehow add a 'first()' and 'last()' method for element access in the node list
const tabDownHandler = ($event : KeyboardEvent) => {
    const firstFocusableEl = focusableElements[0]
    const lastFocusableEl = focusableElements[focusableElements.length - 1]
    const activeEl = document.activeElement
    if($event.key == "Tab"){
        if((firstFocusableEl instanceof HTMLElement) &&
            (lastFocusableEl instanceof HTMLElement)){
            if(activeEl == firstFocusableEl && $event.shiftKey){
                $event.preventDefault()
                lastFocusableEl.focus()
            } else if(activeEl == lastFocusableEl && !$event.shiftKey){
                $event.preventDefault()
                firstFocusableEl.focus()
            }
        }

        }
};

const cleanupHandlers = delegateEventHandlers(focusTrapEl, `#focus-trap`,
    [
        ['keydown', tabDownHandler],
    ],
    )