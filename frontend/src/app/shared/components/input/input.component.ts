import { Component, Input, forwardRef } from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  AbstractControl,
  ReactiveFormsModule,
} from "@angular/forms";

@Component({
  selector: "app-input",
  imports: [ReactiveFormsModule],
  templateUrl: "./input.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() type: "text" | "email" | "password" | "number" = "text";
  @Input() placeholder = "";
  @Input() hint?: string;
  @Input() id?: string;
  @Input() control?: AbstractControl;
  @Input() required = false;

  value = "";
  disabled = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get inputId(): string {
    return this.id || `input-${Math.random().toString(36).substring(2, 9)}`;
  }

  get showError(): boolean {
    if (this.control) {
      return !!(
        this.control.invalid &&
        (this.control.touched || this.control.dirty)
      );
    }
    return false;
  }

  get errorMessages(): string[] {
    if (!this.control || !this.control.errors) {
      return [];
    }

    const errors: string[] = [];
    const errorObj = this.control.errors;

    if (errorObj["required"]) {
      errors.push(`${this.label || "This field"} is required`);
    }
    if (errorObj["email"]) {
      errors.push("Email must be valid");
    }
    if (errorObj["minlength"]) {
      const minLength = errorObj["minlength"].requiredLength;
      errors.push(`Must be at least ${minLength} characters`);
    }
    if (errorObj["maxlength"]) {
      const maxLength = errorObj["maxlength"].requiredLength;
      errors.push(`Must not exceed ${maxLength} characters`);
    }
    if (errorObj["min"]) {
      errors.push(`Must be at least ${errorObj["min"].min}`);
    }
    if (errorObj["max"]) {
      errors.push(`Must not exceed ${errorObj["max"].max}`);
    }
    if (errorObj["pattern"]) {
      errors.push("Invalid format");
    }

    return errors;
  }

  writeValue(value: string): void {
    this.value = value || "";
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Handle input changes
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
