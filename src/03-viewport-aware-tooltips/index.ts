/**
 * Function that attaches an event listener to a parent. Parent becomes a delegator for the events emitted by it's
 * children via bubbling. The events of the children are delegated to it's parent.
 *
 * Returns a closure that can be called for handler cleanup.
 * @param parent
 * @param eventType
 * @param selector
 * @param handler
 * @param options
 */
const delegateEvent = function<
    K extends keyof HTMLElementEventMap,
    E extends Element = HTMLElement
>(
    parent : Element | Document | null,
    eventType : K,
    selector : string,
    handler : ($event : HTMLElementEventMap[K], matchedTarget : E) => void,
    options? : boolean | AddEventListenerOptions
){
    if(!parent){
        throw Error("parent not in DOM!")
    }

    const internalHandler = ($event : HTMLElementEventMap[K]) => {

        // Check if event target is defined and invoke type guard
        // instanceof not just a boolean expression, also tells TS compiler at compile time that event.target is of
        // type Element from here on out
        if($event.target && $event.target instanceof Element){
            // checks if the targeted element (like a button, in case of view encapsulation) is an ancestor
            // of the element with the selector.
            // if no element with given selector is ancestor, do nothing, as it's not the proper target (i think?)
            const matchedElement = $event.target.closest(selector)
            // if a match is found and the match is contained by the parent element, invoke the passed handler
            if(matchedElement && parent.contains(matchedElement)){
                handler($event, matchedElement as E)
            }
        }
    }

    // Attach the internal handler to the parent
    parent.addEventListener(eventType, internalHandler as EventListener, options)

    // Closure for handler removal (cleanup)
    return () => {
        parent.removeEventListener(eventType, internalHandler as EventListener, options)
    }
}

const getCoordinates = function (element : Element | Document | null){
    if(!element){
        throw Error("getCoordinates: element not present in DOM")
    } else if(element instanceof Element){
        return element.getBoundingClientRect()
    } else {
        throw Error("getCoordinates: can't get DOMRect for document!")
    }
}

const arenaEl = document.getElementById('arena')
const tooltipEl = document.getElementById('tooltip')
if(!tooltipEl){
    throw Error("tooltipEl not present in DOM")
}
const tooltipDefaultPosition = tooltipEl.getBoundingClientRect()

const handlerOptions: AddEventListenerOptions = {
    capture: true
}
//Interesting: the query selector is enough to select all buttons for which we want to delegate events
const removeMoveEnterListener = delegateEvent(arenaEl, 'mouseenter', 'button[data-tooltip]', ($event, matchedTarget) => {
    const targetEl = matchedTarget
    tooltipEl.textContent = targetEl.attributes['data-tooltip'].textContent
    const tooltipCoordinates = getTooltipCoordinates(targetEl, tooltipEl)
    console.log(tooltipCoordinates)

    tooltipEl.style.left = `${tooltipCoordinates.x}px`
    tooltipEl.style.top = `${tooltipCoordinates.y}px`
    tooltipEl.classList.add("visible")

},handlerOptions)
const removeMouseLeaveListener = delegateEvent(arenaEl, 'mouseleave', 'button[data-tooltip]', () => {
    tooltipEl.classList.remove("visible")
},handlerOptions)


const getTooltipCoordinates = function (targetEl : Element, tooltipEl : Element){
    const coordinates = {
        x : 0,
        y : 0

    }
    const targetRect = getCoordinates(targetEl)
    const tooltipRect = getCoordinates(tooltipEl)
    console.log(targetRect, tooltipRect)

    coordinates.x = targetRect.left
    if(targetRect.left + tooltipRect.width >= window.innerWidth){
        coordinates.x = targetRect.right - tooltipRect.width
    }
    coordinates.y = targetRect.bottom
    if(targetRect.top + tooltipRect.height >= window.innerHeight){
        coordinates.y = targetRect.top - tooltipRect.height
    }

    return coordinates

}