import { Component } from "@angular/core";
import { Router, RouterModule, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { inject } from "@angular/core";

@Component({
  selector: "app-navbar",
  imports: [RouterModule, RouterLinkActive],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.css",
})
export class NavbarComponent {
  // Use inject() for dependency injection
  private authService = inject(AuthService);
  private router = inject(Router);

  // Consume signal directly from AuthService
  currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
