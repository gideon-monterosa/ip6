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
  selector: "app-login",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = "";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = "";

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log("Login successful", response);
        this.router.navigate(["/home"]);
      },
      error: (error) => {
        console.error("Login error", error);
        this.error = "Invalid username or password";
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
