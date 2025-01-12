import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Shape {
  type: string;
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
  shapeLibrary: string[] = ['star', 'diamond', 'oval', 'octagon', 'square', 'triangle'];
  shapeCount = 3;
  shapes: Shape[] = [];
  placeholders: (Shape | null)[] = [];
  timeLeft = 5;
  timer: any;
  canSeePattern = false;
  canPlaceShapes = false;
  showEasterEgg = false;
  crackedEffect = false;
  showDialog = false;
  dialogTitle = '';
  dialogMessage = '';
  correctArrangement: string[] = [];

  startGame(): void {
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
    this.generateShapes(this.shapeCount);

    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timer);
        this.canSeePattern = false;
        this.canPlaceShapes = true;
        this.placeholders = Array(this.shapes.length).fill(null);
      }
    }, 1000);
  }

  generateShapes(count: number): void {
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.shapeLibrary.length);
      this.shapes.push({ type: this.shapeLibrary[randomIndex], id: i });
    }
  }

  dragStart(event: DragEvent, shape: Shape): void {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData('text/plain', JSON.stringify(shape));
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault(); // Prevent the default behavior to allow dropping
  }

  drop(event: DragEvent, index: number): void {
    event.preventDefault();
    if (!event.dataTransfer) return;
    const data = event.dataTransfer.getData('text/plain');
    if (!data) return;
    const shape: Shape = JSON.parse(data);
    this.placeholders[index] = shape;
  }

  selectShape(shape: Shape): void {
    const firstEmptyIndex = this.placeholders.findIndex((p) => !p);
    if (firstEmptyIndex !== -1) {
      this.placeholders[firstEmptyIndex] = shape;
    }
  }

  clearPlaceholder(index: number): void {
    this.placeholders[index] = null;
  }

  checkPattern(): void {
    const allStars = this.placeholders.every((p) => p?.type === 'star');
    if (allStars) {
      this.triggerCrackEffect();
      return;
    }

    let correctCount = 0;
    for (let i = 0; i < this.shapes.length; i++) {
      if (this.placeholders[i]?.type === this.shapes[i].type) {
        correctCount++;
      }
    }

    const accuracy = (correctCount / this.shapes.length) * 100;
    if (accuracy === 100) {
      this.dialogTitle = 'You Won!';
      this.dialogMessage = 'Great job! You matched the entire pattern.';
    } else {
      this.correctArrangement = this.shapes.map((s) => s.type);
      this.dialogTitle = 'Not Quite!';
      this.dialogMessage = `You matched ${accuracy.toFixed(0)}%. Here’s the correct arrangement:`;
    }
    this.showDialog = true;
  }

  triggerCrackEffect(): void {
    this.crackedEffect = true;
    setTimeout(() => {
      this.showEasterEgg = true;
    }, 1000);
  }

  closeDialog(): void {
    this.showDialog = false;
  }

  returnToGame(): void {
    this.showEasterEgg = false;
    this.crackedEffect = false;
  }
}
