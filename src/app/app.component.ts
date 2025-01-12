import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Shape {
  type: string;   // star, diamond, oval, octagon, square, triangle
  id: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Remember the Pattern!';

  // Expand the shape library
  shapeLibrary: string[] = [
    'star',
    'diamond',
    'oval',
    'octagon',
    'square',
    'triangle'
  ];

  // How many shapes to display (user picks from dropdown 3..8)
  shapeCount = 3;

  // The randomly generated pattern the user must memorize
  shapes: Shape[] = [];

  // After we hide the pattern, user must fill these placeholders by drag/drop
  placeholders: (Shape | null)[] = [];

  // For 5-second memorization timer
  timeLeft = 5;
  timer: any;
  canSeePattern = false;
  canPlaceShapes = false;

  // Easter Egg
  showEasterEgg = false;
  crackedEffect = false;

  // Dialog box states
  showDialog = false;          // Whether the result dialog is visible
  dialogTitle = '';            // Title text in the dialog
  dialogMessage = '';          // Message or extra info in the dialog
  correctArrangement: string[] = []; // For displaying the correct pattern if user fails

  startGame(): void {
    // Reset states
    this.shapes = [];
    this.placeholders = [];
    this.timeLeft = 5;
    this.canSeePattern = true;
    this.canPlaceShapes = false;
    this.showEasterEgg = false;
    this.crackedEffect = false;
    this.showDialog = false;
    this.dialogTitle = '';
    this.dialogMessage = '';
    this.correctArrangement = [];

    // Generate random shapes
    this.generateShapes(this.shapeCount);

    // 5-second timer
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timer);
        // Hide the pattern, allow drag & drop
        this.canSeePattern = false;
        this.canPlaceShapes = true;
        // Create placeholders
        this.placeholders = Array(this.shapes.length).fill(null);
      }
    }, 1000);
  }

  generateShapes(count: number): void {
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.shapeLibrary.length);
      this.shapes.push({
        type: this.shapeLibrary[randomIndex],
        id: i
      });
    }
  }
  
  dragStart(event: DragEvent, shape: Shape) {
    if (!event.dataTransfer) return;
  
    // Attach the shape data for the drop event
    event.dataTransfer.setData('text/plain', JSON.stringify(shape));
  
    // Find the DOM element for the dragged shape
    const element = document.querySelector(`.${shape.type}`);
    if (element && event.dataTransfer) {
      // Clone the element
      const clone = element.cloneNode(true) as HTMLElement;
  
      // Copy computed styles, including clip-path, to the clone
      const computedStyles = window.getComputedStyle(element);
      for (const key of computedStyles) {
        clone.style.setProperty(key, computedStyles.getPropertyValue(key));
      }
  
      // Manually copy `clip-path` to ensure it's applied
      clone.style.clipPath = computedStyles.clipPath;
  
      // Manually copy webkitClipPath for compatibility
      const computedStylesAny = computedStyles as any; // Cast to `any`
      if (computedStylesAny.webkitClipPath) {
        clone.style.setProperty('webkitClipPath', computedStylesAny.webkitClipPath);
      }
  
      // Add additional styles for the clone
      const rect = element.getBoundingClientRect();
      clone.style.position = 'absolute';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.transform = 'scale(1.2)'; // Slightly enlarge for visibility
      clone.style.opacity = '0.8'; // Slight transparency
      clone.style.pointerEvents = 'none'; // Prevent interactions with the clone
      document.body.appendChild(clone);
  
      // Use the clone as the drag image
      event.dataTransfer.setDragImage(clone, rect.width / 2, rect.height / 2);
  
      // Clean up the clone after a short delay
      setTimeout(() => {
        document.body.removeChild(clone);
      }, 0);
    }
  }
  
  
  

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  drop(event: DragEvent, index: number) {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const data = event.dataTransfer.getData('text/plain');
    if (!data) return;

    const shape: Shape = JSON.parse(data);
    this.placeholders[index] = shape;
  }

  // Check the user's final arrangement
  checkPattern(): void {
    // Easter Egg condition first: shapeCount == 3 and all are star
    const allStars =
      this.placeholders.every(p => p?.type === 'star');

    if (allStars) {
      // Trigger the crack effect
      this.triggerCrackEffect();
      return;
    }

    let correctCount = 0;

    // Compare each placeholder to the shapes array’s index
    for (let i = 0; i < this.shapes.length; i++) {
      if (this.placeholders[i]?.type === this.shapes[i].type) {
        correctCount++;
      }
    }

    const accuracy = (correctCount / this.shapes.length) * 100;

    // If user is correct, show "You Won!" dialog
    if (accuracy === 100) {
      this.dialogTitle = 'You Won!';
      this.dialogMessage = 'Great job! You matched the entire pattern.';
      this.showDialog = true;
    } else {
      // Show correct pattern in the dialog
      this.correctArrangement = this.shapes.map(s => s.type);
      this.dialogTitle = 'Not Quite!';
      this.dialogMessage = `You matched ${accuracy.toFixed(0)}%. Here’s the correct arrangement:`;
      this.showDialog = true;
    }
  }

  // If the Easter Egg condition is met
  triggerCrackEffect() {
    this.crackedEffect = true;

    // After 1s, show the Easter Egg content
    setTimeout(() => {
      this.showEasterEgg = true;
    }, 1000);
  }

  // Close the dialog
  closeDialog() {
    this.showDialog = false;
  }

  // Return to the game from the Easter Egg page
  returnToGame() {
    this.showEasterEgg = false;
    this.crackedEffect = false;
  }
}
