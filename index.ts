// 1. Tell Vite to scan the /src directory for any index.html files
const pages = import.meta.glob('./src/**/index.html');

const listContainer = document.getElementById('exercise-list');

if (listContainer) {
    // Object.keys(pages) returns an array like:
    // ['./src/01-click-outside/index.html', './src/02-event-delegation/index.html']
    const filePaths = Object.keys(pages);

    if (filePaths.length === 0) {
        listContainer.innerHTML = '<li><em>No exercises found in /src yet!</em></li>';
    }

    filePaths.forEach((path) => {
        // Convert relative file path to a clickable browser URL
        // "./src/01-click-outside/index.html" -> "/src/01-click-outside/"
        const urlPath = path.replace('./', '/').replace('index.html', '');

        // Extract the folder name: "01-click-outside"
        const folderName = path.split('/')[2] || 'Unknown Exercise';

        // Format folder name into a human-readable title: "01 - Click Outside"
        const parts = folderName.split('-');
        const prefix = parts[0];
        const words = parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const displayTitle = words ? `${prefix} — ${words}` : folderName;

        // Create the DOM nodes
        const listItem = document.createElement('li');
        listItem.innerHTML = `
      <a href="${urlPath}">${displayTitle}</a>
      <code>Route: ${urlPath}</code>
    `;

        listContainer.appendChild(listItem);
    });
}