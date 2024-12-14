import { gsap } from 'gsap';

export default function renderPage2(container) {
    // Clear the container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Create heading element
    const heading = document.createElement('h1');
    heading.textContent = 'Generate Secret Message:';
    heading.style.color = 'white';
    heading.style.opacity = '0'; // Start invisible for animation
    heading.style.position = 'relative';
    heading.style.fontFamily = 'Copperplate';

    // Create input field
    const inputField = document.createElement('input');
    inputField.id = 'input';
    inputField.type = 'text';
    inputField.placeholder = 'Enter your word here...';
    inputField.style.padding = '10px';
    inputField.style.fontSize = '16px';
    inputField.style.width = '80%';
    inputField.style.fontFamily = 'Copperplate';
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

    // Create Submit button
    const button = document.createElement('button');
    button.textContent = 'Submit';
    button.style.padding = '10px 20px';
    button.style.fontSize = '16px';
    button.style.marginTop = '20px';
    button.style.fontFamily = 'Copperplate';
    button.style.border = '1px solid white';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = 'white';
    button.style.color = 'black';
    button.style.cursor = 'pointer';
    button.style.opacity = '0';
    button.style.position = 'relative';
    button.style.zIndex = '10';
    button.style.pointerEvents = 'auto';



    // Create clipboard container and button
    const clipboardContainer = document.createElement('div');
    clipboardContainer.style.marginTop = '20px';
    clipboardContainer.style.display = 'flex';
    clipboardContainer.style.justifyContent = 'flex-start';
    clipboardContainer.style.gap = '10px';
    clipboardContainer.style.opacity = '0'; // Initially hidden
    clipboardContainer.style.pointerEvents = 'none'; // Prevent interaction until shown

    const clipboardButton = document.createElement('button');
    clipboardButton.textContent = 'Copy Unique ID';
    clipboardButton.style.padding = '10px 20px';
    clipboardButton.style.fontSize = '16px';
    clipboardButton.style.border = '1px solid white';
    clipboardButton.style.borderRadius = '4px';
    clipboardButton.style.backgroundColor = '#0f0';
    clipboardButton.style.color = '#000';
    clipboardButton.style.cursor = 'not-allowed'; // Indicate the disabled state initially
    clipboardButton.disabled = true; // Disabled by default

    clipboardContainer.appendChild(clipboardButton);
    container.appendChild(clipboardContainer);
    // Enable the clipboard button when unique ID is set
    function enableClipboardButton(uniqueId) {
        clipboardButton.dataset.uniqueId = uniqueId;
        clipboardButton.disabled = false;
        clipboardButton.style.cursor = 'pointer'; // Enable cursor
        clipboardContainer.style.pointerEvents = 'auto'; // Allow interaction
    }

    // Clipboard button click handler
    clipboardButton.addEventListener('click', () => {
        const uniqueId = clipboardButton.dataset.uniqueId;
        if (uniqueId) {
            navigator.clipboard
                .writeText(uniqueId)
                .then(() => {
                    alert('Copied to clipboard!');
                })
                .catch((err) => {
                    console.error('Failed to copy text:', err);
                });
        }
    });
    // Create terminal-like output container
    const terminalBox = document.createElement('div');
    terminalBox.style.backgroundColor = '#000';
    terminalBox.style.color = '#0f0';
    terminalBox.style.fontFamily = 'Courier, monospace';
    terminalBox.style.padding = '20px';
    terminalBox.style.marginTop = '20px';
    terminalBox.style.borderRadius = '8px';
    terminalBox.style.border = '1px solid #333';
    terminalBox.style.minHeight = '50px';
    terminalBox.style.fontSize = '32px';
    terminalBox.style.width = '100%';
    terminalBox.style.overflow = 'auto';
    terminalBox.style.whiteSpace = 'pre';
    container.appendChild(terminalBox);

    // Function to show terminal with animation
    function showTerminal() {
        if (terminalBox.style.display === 'none') {
            terminalBox.style.display = 'block';
            gsap.fromTo(
                terminalBox,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
            );
        }
    }

    // Submit button click event
    button.addEventListener('click', async () => {
        const inputText = inputField.value.trim();

        if (!inputText) {
            alert('Please enter some text!');
            return;
        }

        try {
            const response = await fetch('https://secretmessageencoder-backend.onrender.com/generate-secret-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input: inputText }),
            });


            terminalBox.textContent = ''; // Clear terminal box

            if (response.ok) {
                const { key } = await response.json();
                console.log('Unique ID retrieved:', key);

                terminalBox.textContent = `Unique ID: ${key}`;
                showTerminal();

                enableClipboardButton(key); // Enable clipboard button

                gsap.to(clipboardContainer, {
                    opacity: 1, // Show clipboard container
                    duration: 0.5,
                    ease: 'power3.out',
                });
            } else {
                console.log('Error retrieving unique ID.');
                terminalBox.textContent = 'Error: Unable to generate secret message.';
                showTerminal();
            }
        } catch (error) {
            console.error('Error fetching unique ID:', error);
            terminalBox.textContent = 'An error occurred. Please try again later.';
            terminalBox.style.color = 'red';
            showTerminal();
        }
    });
    // Append elements to the container
    container.appendChild(heading);
    container.appendChild(inputField);
    container.appendChild(button);
    container.appendChild(terminalBox);

    gsap.timeline()
        .to(heading, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to(inputField, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '<')
        .to(button, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '<');
}
