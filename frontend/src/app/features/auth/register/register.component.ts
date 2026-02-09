import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { AuthLayoutComponent } from "../../../shared/components/auth-layout/auth-layout.component";
import { ButtonComponent } from "../../../shared/components/button/button.component";
import { InputComponent } from "../../../shared/components/input/input.component";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: "./register.component.html",
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = "";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.formBuilder.group({
      username: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = "";

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        console.log("Registration successful", response);
        this.router.navigate(["/home"]);
      },
      error: (error) => {
        console.error("Registration error", error);
        this.error = error.error || "Registration failed. Please try again.";
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
