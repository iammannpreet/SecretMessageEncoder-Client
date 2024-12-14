import { gsap } from 'gsap';

export default function renderPage1(container) {
    // Clear the container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Create heading element
    const heading = document.createElement('h1');
    heading.textContent = 'Enter the secret link:';
    heading.style.color = 'white';
    heading.style.fontFamily = 'Copperplate';
    heading.style.opacity = '0'; // Start invisible for animation
    heading.style.position = 'relative';

    // Create input field
    const inputField = document.createElement('input');
    inputField.id = 'input';
    inputField.type = 'text';
    inputField.placeholder = 'Enter your link here...';
    inputField.style.padding = '10px';
    inputField.style.fontFamily = 'Copperplate';
    inputField.style.fontSize = '16px';
    inputField.style.width = '80%';
    inputField.style.marginTop = '20px';
    inputField.style.border = '1px solid white';
    inputField.style.borderRadius = '4px';
    inputField.style.backgroundColor = 'transparent';
    inputField.style.color = 'white';
    inputField.style.caretColor = 'white';
    inputField.style.opacity = '0';
    inputField.style.position = 'relative';
    inputField.style.zIndex = '10';
    inputField.style.pointerEvents = 'auto';

    // Create button
    const button = document.createElement('button');
    button.textContent = 'Submit';
    button.style.padding = '10px 20px';
    button.style.fontFamily = 'Copperplate';
    button.style.fontSize = '16px';
    button.style.marginTop = '20px';
    button.style.border = '1px solid white';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = 'white';
    button.style.color = 'black';
    button.style.cursor = 'pointer';
    button.style.opacity = '0';
    button.style.position = 'relative';
    button.style.zIndex = '10';
    button.style.pointerEvents = 'auto';

    // Create terminal-like output container
    const terminalBox = document.createElement('div');
    terminalBox.style.backgroundColor = '#000';
    terminalBox.style.color = '#0f0';
    terminalBox.style.fontFamily = 'Copperplate';
    terminalBox.style.fontFamily = 'Courier, monospace';
    terminalBox.style.padding = '20px';
    terminalBox.style.marginTop = '20px';
    terminalBox.style.borderRadius = '8px';
    terminalBox.style.border = '1px solid #333';
    terminalBox.style.minHeight = '200px';
    terminalBox.style.width = '100%';
    terminalBox.style.overflow = 'auto';
    terminalBox.style.whiteSpace = 'pre';

    button.addEventListener('click', async () => {
        const inputText = inputField.value.trim();

        if (!inputText) {
            alert('Please enter some text!');
            return;
        }

        try {
            // Try fetching from the database
            const response = await fetch(`http://localhost:3000/retrieve-coordinates?input=${encodeURIComponent(inputText)}`, {
                method: 'GET',
            });

            // Clear the terminal box
            terminalBox.textContent = '';

            if (response.ok) {
                const { coordinates } = await response.json();
                console.log('Coordinates retrieved:', coordinates);

                // Convert coordinates to rendered text
                const rows = Array(6).fill('');
                coordinates.forEach(({ x, y, character }) => {
                    while (rows[y].length < x) {
                        rows[y] += ' '; // Fill spaces
                    }
                    rows[y] += character;
                });

                // Sequentially render lines with a fade-in effect
                rows.forEach((line, index) => {
                    const lineElement = document.createElement('div');
                    lineElement.textContent = line;
                    lineElement.style.opacity = '0'; // Start invisible
                    terminalBox.appendChild(lineElement);

                    gsap.to(lineElement, {
                        opacity: 1,
                        duration: 0.5,
                        delay: index * 0.3, // Stagger animation
                        ease: 'power3.out',
                    });
                });
            } else {
                console.log(`Key '${inputText}' not found in the database.`);
                const notFoundMessage = document.createElement('div');
                notFoundMessage.textContent = 'NOTHING FOUND!';
                notFoundMessage.style.opacity = '0'; // Start invisible
                terminalBox.appendChild(notFoundMessage);

                // Fade in "NOTHING FOUND!"
                gsap.to(notFoundMessage, {
                    opacity: 1,
                    duration: 0.5,
                    ease: 'power3.out',
                });
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);

            // Handle unexpected errors
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'An error occurred. Please try again later.';
            errorMessage.style.color = 'red';
            terminalBox.appendChild(errorMessage);
        }
    });


    container.appendChild(heading);
    container.appendChild(inputField);
    container.appendChild(button);
    container.appendChild(terminalBox);

    gsap.timeline()
        .to(heading, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to(inputField, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '<')
        .to(button, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '<');
}
