// DraggableKeyboard.ts
export class DraggableKeyboard {
    private container: HTMLElement;
    private isDragging = false;
    private currentX: number;
    private currentY: number;
    private initialX: number;
    private initialY: number;
    private xOffset = 0;
    private yOffset = 0;
    private onKeyPress: (key: string) => void;

    constructor(container: HTMLElement, onKeyPress: (key: string) => void) {
        this.container = container;
        this.onKeyPress = onKeyPress;
        this.setupDraggable();
        this.setupStyles();
    }

    private setupStyles() {
        this.container.style.position = 'fixed';
        this.container.style.backgroundColor = 'var(--background-primary)';
        this.container.style.border = '1px solid var(--background-modifier-border)';
        this.container.style.borderRadius = '6px';
        this.container.style.padding = '10px';
        this.container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        this.container.style.zIndex = '1000';
        this.container.style.cursor = 'move';
        this.container.style.userSelect = 'none';
        this.container.style.width = '90%';
        this.container.style.maxWidth = '600px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
    }

    private setupDraggable() {
        this.container.addEventListener('mousedown', this.dragStart.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.dragEnd.bind(this));
    }

    private dragStart(e: MouseEvent) {
        if ((e.target as HTMLElement).tagName === 'BUTTON') {
            return; // Don't start drag if clicking a key button
        }

        this.initialX = e.clientX - this.xOffset;
        this.initialY = e.clientY - this.yOffset;

        //if (e.target === this.container) {
            this.isDragging = true;
        //}
    }

    private drag(e: MouseEvent) {
        if (this.isDragging) {
            e.preventDefault();

            this.currentX = e.clientX - this.initialX;
            this.currentY = e.clientY - this.initialY;

            this.xOffset = this.currentX;
            this.yOffset = this.currentY;

            this.setTranslate(this.currentX, this.currentY);
        }
    }

    private dragEnd() {
        this.initialX = this.currentX;
        this.initialY = this.currentY;
        this.isDragging = false;
    }

    private setTranslate(xPos: number, yPos: number) {
        this.container.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    createKeyboard(arabicKeys: Record<string, string[]>, isShiftPressed: boolean = false) {
        this.container.innerHTML = '';
        const rows = isShiftPressed 
            ? ['shiftRow2', 'shiftRow3', 'shiftRow4']
            : ['row2', 'row3', 'row4'];
    
        rows.forEach(rowKey => {
            const keyboardRow = document.createElement('div');
            keyboardRow.style.display = 'flex';
            keyboardRow.style.justifyContent = 'center';
            keyboardRow.style.gap = '4px';
            keyboardRow.style.marginBottom = '4px';
    
            // Add Shift button to the left of row 4
            if (rowKey === 'row4' || rowKey === 'shiftRow4') {
                const leftShiftKey = document.createElement('button');
                leftShiftKey.style.minWidth = '80px';
                leftShiftKey.style.height = '36px';
                leftShiftKey.style.padding = '8px';
                leftShiftKey.style.border = '1px solid var(--background-modifier-border)';
                leftShiftKey.style.borderRadius = '4px';
                leftShiftKey.style.backgroundColor = isShiftPressed ? 'var(--background-modifier-hover)' : 'var(--background-primary)';
                leftShiftKey.style.cursor = 'pointer';
                leftShiftKey.textContent = 'Shift';
    
                leftShiftKey.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.createKeyboard(arabicKeys, !isShiftPressed);
                });
    
                keyboardRow.appendChild(leftShiftKey);
            }
    
            arabicKeys[rowKey].forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.classList.add('quran-arabic');
                keyButton.style.minWidth = '36px';
                keyButton.style.height = '36px';
                keyButton.style.padding = '8px';
                keyButton.style.border = '1px solid var(--background-modifier-border)';
                keyButton.style.borderRadius = '4px';
                keyButton.style.backgroundColor = 'var(--background-primary)';
                keyButton.style.cursor = 'pointer';
                keyButton.textContent = key;
    
                keyButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.onKeyPress(key);
                });
    
                keyboardRow.appendChild(keyButton);
            });

            // Add Backspace button to the right of row 2 and shiftRow2
            if (rowKey === 'row2' || rowKey === 'shiftRow2') {
                const backspaceKey = document.createElement('button');
                backspaceKey.style.minWidth = '36px';
                backspaceKey.style.height = '36px';
                backspaceKey.style.padding = '8px';
                backspaceKey.style.border = '1px solid var(--background-modifier-border)';
                backspaceKey.style.borderRadius = '4px';
                backspaceKey.style.backgroundColor = 'var(--background-primary)';
                backspaceKey.style.cursor = 'pointer';
                backspaceKey.textContent = '⌫';

                backspaceKey.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.onKeyPress('Backspace'); 
                });

                keyboardRow.appendChild(backspaceKey);
            }
    
            // Add Shift button to the right of row 4
            if (rowKey === 'row4' || rowKey === 'shiftRow4') {
                const rightShiftKey = document.createElement('button');
                rightShiftKey.style.minWidth = '80px';
                rightShiftKey.style.height = '36px';
                rightShiftKey.style.padding = '8px';
                rightShiftKey.style.border = '1px solid var(--background-modifier-border)';
                rightShiftKey.style.borderRadius = '4px';
                rightShiftKey.style.backgroundColor = isShiftPressed ? 'var(--background-modifier-hover)' : 'var(--background-primary)';
                rightShiftKey.style.cursor = 'pointer';
                rightShiftKey.textContent = 'Shift';
    
                rightShiftKey.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.createKeyboard(arabicKeys, !isShiftPressed);
                });
    
                keyboardRow.appendChild(rightShiftKey);
            }
    
            this.container.appendChild(keyboardRow);
        });
    
        // Add Spacebar at the bottom
        const spacebarRow = document.createElement('div');
        spacebarRow.style.display = 'flex';
        spacebarRow.style.justifyContent = 'center';
        spacebarRow.style.marginTop = '4px';
    
        const spacebar = document.createElement('button');
        spacebar.style.flexGrow = '0.5';
        spacebar.style.minHeight = '36px';
        spacebar.style.padding = '8px';
        spacebar.style.border = '1px solid var(--background-modifier-border)';
        spacebar.style.borderRadius = '4px';
        spacebar.style.backgroundColor = 'var(--background-primary)';
        spacebar.style.cursor = 'pointer';
        spacebar.textContent = 'Space';
    
        spacebar.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onKeyPress(' '); // Add a space character
        });
    
        spacebarRow.appendChild(spacebar);
        this.container.appendChild(spacebarRow);
    }

    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }

    destroy() {
        document.removeEventListener('mousemove', this.drag.bind(this));
        document.removeEventListener('mouseup', this.dragEnd.bind(this));
    }
}