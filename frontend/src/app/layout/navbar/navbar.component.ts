import { Component, inject, OnInit } from "@angular/core";
import { Router, RouterModule, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { FeedbackUIService } from "../../features/feedback-inbox/services/feedback-ui.service";

@Component({
  selector: "app-navbar",
  imports: [RouterModule, RouterLinkActive],
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private feedbackService = inject(FeedbackUIService);

  currentUser = this.authService.currentUser;
  pendingCount = this.feedbackService.totalPendingCount;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.feedbackService.loadRecentMeetingsForInbox();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  getUserInitial(): string {
    return this.currentUser()?.username?.charAt(0).toUpperCase() || "U";
  }
}
