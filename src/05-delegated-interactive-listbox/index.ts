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

type EventHandlerTuple<E> = {
    [P in keyof HTMLElementEventMap] :
        [P,
            ($event : HTMLElementEventMap[P], matchedTarget : E) => void,
            (boolean | AddEventListenerOptions)?
        ]
}[keyof HTMLElementEventMap]

const delegateEventHandlers = function<
    E extends Element = HTMLElement
>(
    parent : Element | Document | null,
    selector: string,
    handlers : EventHandlerTuple<E>[],
){
    const cleanupHandlers : ReturnType<typeof delegateEvent>[] = []
    for (const handler of handlers) {
        // we are allowed to cast to any here, because of the correlated Unions Problem
        // todo: Can we find another way to make this generic and typesafe, without hitting the correlated unions problem?
        // although apparently it seems that React and Angular CDK authors use this internally as well, seems to be a
        // hard limit
        // todo: find examples in react and angular / angular cdk codebase for this behavior
        cleanupHandlers.push( delegateEvent(parent, handler[0] as any, selector, handler[1] as any, handler[2] ))
    }
    return cleanupHandlers
}

const listboxEl = document.getElementById('listbox')
if(!listboxEl){
    throw Error('listbox not present in DOM!')
}

const listOptionClickHandler = ($event : MouseEvent, matchedTarget : Element) => {

    const listElements = document.getElementsByClassName('list-option')
    if(matchedTarget instanceof Element){
            for (const listElement of listElements) {
                listElement.classList.remove('selected')
            }
            matchedTarget.classList.add('selected')

    }
}

const listOptionFocusInHandler = ($event : FocusEvent, matchedTarget : Element) => {
    if(matchedTarget instanceof HTMLElement){
        matchedTarget.classList.add('focused-ring')
    }
}

const listOptionFocusOutHandler = ($event : FocusEvent, matchedTarget : Element) => {
    if(matchedTarget instanceof HTMLElement){
        matchedTarget.classList.remove('focused-ring')
    }
}

const listOptionEnterSpaceSelectionHandler = ($event : KeyboardEvent, matchedTarget : Element) => {
    if(matchedTarget instanceof HTMLElement){
            if($event.key === "Enter" || $event.key === " "){
                $event.preventDefault()
                const listElements = document.getElementsByClassName('list-option')
                for (const listElement of listElements) {
                    listElement.classList.remove('selected');
                }
                matchedTarget.classList.add('selected')
                matchedTarget.focus()
            }
    }
}


delegateEventHandlers(listboxEl, '.list-option',
    [
        ["click", listOptionClickHandler],
        ["focusin", listOptionFocusInHandler],
        ["focusout", listOptionFocusOutHandler],
        ["keydown", listOptionEnterSpaceSelectionHandler]
    ]
    )

