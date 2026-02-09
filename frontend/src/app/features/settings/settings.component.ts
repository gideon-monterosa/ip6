import { Component, signal, effect } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { InputComponent } from "../../shared/components/input/input.component";

@Component({
  selector: "app-settings",
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.css",
})
export class SettingsComponent {
  placeholder = signal("");
  placeholderControl = new FormControl("");

  constructor() {
    // Sync FormControl value to signal
    effect(() => {
      const value = this.placeholderControl.value;
      if (value !== null) {
        this.placeholder.set(value);
      }
    });
  }
}
