const dropdownEl = document.getElementById('dropdown')
const destroyDropdownButtonEl = document.getElementById('destroy-btn')
const dropdownInnerButtonEl : HTMLButtonElement = document.getElementById('inner-btn')

if(!dropdownInnerButtonEl){
    throw Error("inner button element not found!")
}

if(!dropdownEl){
    throw Error("dropdown element not found!")
}

const dropDownOnClickHandler = ($event : PointerEvent) => {
    if($event.target instanceof Node){
        const isInside = dropdownEl.contains($event.target);
        console.log("Did we click inside?", isInside)
    }
    console.log('MouseEvent');
}

const innerButtonClickHandler = ($event) => {
    $event.stopPropagation()
}

document.addEventListener('click', dropDownOnClickHandler)

if(destroyDropdownButtonEl instanceof HTMLButtonElement){
    destroyDropdownButtonEl.addEventListener('click', () => {
        dropdownEl.removeEventListener('click', dropDownOnClickHandler)
        dropdownEl.remove()
    })
}

dropdownInnerButtonEl.addEventListener('click', innerButtonClickHandler)
