import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';
import { inject } from '@angular/core';
import { TourService } from './core/services/tour.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'meetings';

  private authService = inject(AuthService);
  private router = inject(Router);
  private tourService = inject(TourService);

  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          window.HSStaticMethods.autoInit();
        }, 100);
      }
    });
  }

  startTour(): void {
    this.tourService.start();
  }
}
