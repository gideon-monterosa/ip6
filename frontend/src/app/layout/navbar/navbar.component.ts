import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FeedbackService } from '../../features/feedback-inbox/services/feedback.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private feedbackService = inject(FeedbackService);

  currentUser = this.authService.currentUser;
  pendingCount = this.feedbackService.pendingCount;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.feedbackService.loadPendingMeetings().subscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
