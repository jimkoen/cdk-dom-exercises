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

type EventHandlerTupleWithCSSSelector<E> = {
    [P in keyof HTMLElementEventMap] :
    [P,
        ($event : HTMLElementEventMap[P], matchedTarget : E) => void,
        string,
        (boolean | AddEventListenerOptions)?,
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

const delegateEventHandlersWithUniqueSelector = function<
    E extends Element = HTMLElement
>(
    parent : Element | Document | null,
    handlers : EventHandlerTupleWithCSSSelector<E>[],
){
    const cleanupHandlers : ReturnType<typeof delegateEvent>[] = []
    for (const handler of handlers) {
        // we are allowed to cast to any here, because of the correlated Unions Problem
        // todo: Can we find another way to make this generic and typesafe, without hitting the correlated unions problem?
        // although apparently it seems that React and Angular CDK authors use this internally as well, seems to be a
        // hard limit
        // todo: find examples in react and angular / angular cdk codebase for this behavior
        // todo: figure out nicer way than array indices (destructuring?)
        console.log(handler)
        cleanupHandlers.push( delegateEvent(parent, handler[0] as any, handler[2], handler[1] as any, handler[3] ))
    }
    return cleanupHandlers
}

const gridRootEl = document.getElementById('grid-root')
if(!gridRootEl){
    throw Error("Element with ID 'grid-root' not present in DOM!")
}


// Event handlers with a common target (or sibling targets) are generally invoked in the order of registration

const deleteButtonHandler = ($event : PointerEvent, matchedTarget : HTMLElement) => {
    $event.stopImmediatePropagation()
    if(matchedTarget instanceof HTMLElement){
        const tableRowEl = matchedTarget.closest('tr.grid-row')
        if(tableRowEl){
            // i think this doesn't clean up event handlers?
            tableRowEl.remove()
        }
    }
};
/*
delegateEvent(gridRootEl, 'click', '.grid-row button.delete-btn', deleteButtonHandler, {capture: true})
*/


const rowSelectionHandler = ($event : MouseEvent, matchedTarget : HTMLElement) => {
    if(matchedTarget instanceof HTMLTableRowElement){
        const allRowsSelection = gridRootEl.querySelectorAll('.row-selected')
        allRowsSelection.forEach((e) => {
            if(e instanceof HTMLTableRowElement){
                e.classList.remove('row-selected')
            }
        })
        matchedTarget.classList.add('row-selected')
    }
};
/*
delegateEvent(gridRootEl, 'click', '.grid-row ', rowSelectionHandler)
*/

const rowEditHandler = ($event: MouseEvent, matchedTarget : HTMLElement) => {
    console.log("Cell clicked!", matchedTarget)
    if(matchedTarget instanceof HTMLTableCellElement){
        const allCellsSelection = gridRootEl.querySelectorAll('td[data-editable]')
        allCellsSelection.forEach((e) => {
            e.classList.remove('editing')
        })
        matchedTarget.classList.add("editing")
    }
};
/*
delegateEvent(gridRootEl, 'dblclick', '.grid-row td[data-editable]', rowEditHandler)
*/

const cancelEditHandler = ($event : KeyboardEvent, matchedTarget: HTMLElement) => {
    if($event.key === 'Escape'){
        const allCellsSelection = gridRootEl.querySelectorAll('td[data-editable]')
        allCellsSelection.forEach((e) => {
            e.classList.remove('editing')
        })
    }
};
/*
delegateEvent(document, 'keydown', '*', cancelEditHandler)
*/

delegateEventHandlersWithUniqueSelector(
    gridRootEl,
    [
        ['click', deleteButtonHandler, '.grid-row button.delete-btn', {capture: true}],
        ['click', rowSelectionHandler, '.grid-row'],
        ['dblclick', rowEditHandler, '.grid-row td[data-editable]'],

    ]
)

delegateEvent(document, 'keydown', '*', cancelEditHandler)

