const containerRootEl = document.getElementById('container-root')
const initiatorEl = document.getElementById('initiator')
if(!containerRootEl){
    throw Error ('containerRootEl not in DOM')
}

const clickHandler = ($event : MouseEvent) => {
    console.log("Target:", $event.target)
    console.log("Current Target:", $event.currentTarget)
    if($event.currentTarget){
        if($event.currentTarget instanceof HTMLElement){
            console.log(`You clicked on a ${$event.currentTarget.id}!`)
        }
    }

}

if(!initiatorEl){
    throw Error('leafNodeEl not in DOM')
}
initiatorEl.addEventListener('click', clickHandler, {capture: true})

const walker : TreeWalker = document.createTreeWalker(
    containerRootEl,
    NodeFilter.SHOW_ELEMENT,
    null
)

let currentNode: Node | null = containerRootEl

while (currentNode){
    const el = currentNode as HTMLElement
    console.log(el.tagName)
    if(!(el instanceof HTMLSpanElement)){
        el.addEventListener('click', clickHandler)
    }
    currentNode = walker.nextNode()
}

