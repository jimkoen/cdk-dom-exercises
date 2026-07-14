/**
 * A generic, type-safe event delegator.
 *
 * @param parent - The container DOM node listening for bubbling events.
 * @param eventType - The string event name (e.g., 'click', 'input').
 * @param selector - The CSS selector to match target children against.
 * @param handler - The callback receiving the strictly typed event and matched child.
 * @returns A teardown function to remove the listener.
 */
function delegateEvent<
    K extends keyof HTMLElementEventMap,
    E extends Element = HTMLElement
>(
    parent: HTMLElement,
    eventType: K,
    selector: string,
    handler: (event: HTMLElementEventMap[K], matchedTarget: E) => void
): () => void {

    // 1. Create the internal routing function
    const internalHandler = (event: HTMLElementEventMap[K]) => {
        // STEP 1 & 2: Implement your Element.closest() traversal here!
        // Remember: event.target might be an EventTarget | null. You need to verify it is an Element first.
        // If it matches 'selector' AND is contained inside 'parent', trigger handler(event, matchedElement as E).
        if(event.target instanceof Element){
            const matchedElement = event.target.closest(selector)
            if(matchedElement && parent.contains(matchedElement)){
                handler(event, matchedElement as E)

            }
        }
    };

    // 2. Attach the listener to the parent
    parent.addEventListener(eventType, internalHandler as EventListener);

    // STEP 5: Return the teardown function
    return () => {
        parent.removeEventListener(eventType, internalHandler as EventListener)
    };
}

// ==========================================
// TESTING YOUR IMPLEMENTATION
// ==========================================

const container = document.getElementById('container');
if (!container) throw new Error('Container not found');

// Notice how we pass <'click', HTMLButtonElement> to lock in the types!
const removeDelegatedListener = delegateEvent<'click', HTMLButtonElement>(
    container,
    'click',
    '.action-btn',
    (event, btn) => {
        // If your TS generics are working:
        // 1. 'event' should have autocompletion for MouseEvent (try typing event.clientX)
        // 2. 'btn' should have autocompletion for HTMLButtonElement (try typing btn.dataset.action)

        console.log('Button clicked via delegation!', btn.dataset.action);

        // Let's remove the row that was clicked
        const row = btn.closest('.list-item');
        row?.remove();
    }
);

// Dynamically add new rows to prove delegation works without adding new listeners!
document.getElementById('add-btn')?.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'list-item';
    newRow.innerHTML = `
    <span>Dynamic Item ${Date.now().toString().slice(-4)}</span>
    <button class="action-btn" data-action="delete"><strong>X</strong> Delete</button>
  `;
    container.appendChild(newRow);
});

// Wire up the teardown button
document.getElementById('cleanup-btn')?.addEventListener('click', () => {
    removeDelegatedListener();
    console.log('Delegation listener removed!');
});