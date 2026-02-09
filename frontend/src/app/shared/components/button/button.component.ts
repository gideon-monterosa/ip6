import { Component, Input } from "@angular/core";

@Component({
  selector: "app-button",
  imports: [],
  templateUrl: "./button.component.html",
})
export class ButtonComponent {
  @Input() type: "button" | "submit" | "reset" = "button";
  @Input() variant: "primary" | "secondary" | "destructive" = "primary";
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  get buttonClasses(): string {
    const baseClasses =
      "px-4 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const widthClass = this.fullWidth ? "w-full" : "";

    let variantClasses = "";
    switch (this.variant) {
      case "primary":
        variantClasses =
          "bg-primary text-primary-foreground hover:bg-primary-hover disabled:hover:bg-primary";
        break;
      case "secondary":
        variantClasses =
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary-hover disabled:hover:bg-secondary";
        break;
      case "destructive":
        variantClasses =
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:hover:bg-destructive";
        break;
    }

    return `${baseClasses} ${variantClasses} ${widthClass}`.trim();
  }
}
