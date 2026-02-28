import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import Shepherd from 'shepherd.js';
import type { Tour } from 'shepherd.js';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private router = inject(Router);
  private tour: Tour | null = null;
  private readonly TOUR_SEEN_KEY = 'has_seen_dashboard_tour';

  initTour(): void {
    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'bg-card border border-border shadow-2xl rounded-xl max-w-[320px] z-[60]',
        scrollTo: { behavior: 'smooth', block: 'center' }
      }
    });

    this.tour.on('complete', () => this.markAsSeen());
    this.tour.on('cancel', () => this.markAsSeen());

    this.tour.addSteps([
      {
        id: 'welcome',
        title: 'Welcome to "Meetings"! 👋',
        text: 'Let\'s take a quick tour to show you the core features.',
        classes: 'bg-card border border-border shadow-2xl rounded-xl max-w-md z-[60]',
        beforeShowPromise: () => this.navigateAndWait('/home'),
        buttons: this.getNavigationButtons('Start Tour', true)
      },
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        text: 'Here you\'ll find analytics about your meeting structure and emotional impact.',
        attachTo: { element: '#tour-nav-dashboard', on: 'bottom' },
        beforeShowPromise: () => this.navigateAndWait('/home'),
        buttons: this.getNavigationButtons('Next')
      },
      {
        id: 'nav-calendar',
        title: 'Calendar',
        text: 'Once your calendar is connected, you\'ll see all your events here. Categorize them and review past meetings.',
        attachTo: { element: '#tour-nav-calendar', on: 'bottom' },
        buttons: this.getNavigationButtons('Next')
      },
      {
        id: 'nav-inbox',
        title: 'Feedback Inbox',
        text: 'Your to-do list: This is where pending meeting feedback and end-of-day reviews are collected.',
        attachTo: { element: '#tour-nav-inbox', on: 'bottom' },
        buttons: this.getNavigationButtons('Next')
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        text: 'Access your setup and preferences anytime through your profile icon.',
        attachTo: { element: '#tour-nav-user-menu', on: 'bottom-end' },
        buttons: this.getNavigationButtons('Show me Settings')
      },
      {
        id: 'settings-provider',
        title: '1. Connect Calendar',
        text: 'Link your calendar here so the app can import and analyze your meetings.',
        attachTo: { element: '#tour-settings-provider', on: 'bottom' },
        classes: 'bg-card border border-border shadow-2xl rounded-xl max-w-md z-[60]',
        beforeShowPromise: () => this.navigateAndWait('/settings'),
        buttons: this.getNavigationButtons('Next to Working Hours')
      },
      {
        id: 'settings-hours',
        title: '2. Working Hours',
        text: 'Enter your regular working hours to accurately calculate your focus time and meeting density.',
        attachTo: { element: '#tour-settings-hours', on: 'top' },
        classes: 'bg-card border border-border shadow-2xl rounded-xl max-w-md z-[60]',
        buttons: this.getNavigationButtons('Next to Calendar')
      },
      {
        id: 'calendar-view',
        title: 'Manage Events',
        text: 'Your events will appear here. Click an event to quickly provide feedback, or ignore unimportant blockers by clicking "Dismiss".',
        attachTo: { element: 'app-calendar-grid', on: 'top' },
        classes: 'bg-card border border-border shadow-2xl rounded-xl max-w-md z-[60]',
        beforeShowPromise: () => this.navigateAndWait('/calendar'),
        buttons: this.getNavigationButtons('Back to Dashboard')
      },
      {
        id: 'finish',
        title: 'Let\'s go! 🚀',
        text: 'You\'re all set! All your data comes together on the dashboard. Have fun optimizing your meeting culture!',
        classes: 'bg-card border border-border shadow-2xl rounded-xl max-w-md z-[60]',
        beforeShowPromise: () => this.navigateAndWait('/home'),
        buttons: [
          {
            text: 'Back',
            action: () => this.tour?.back(),
            classes: 'py-2 px-3 text-sm text-muted-foreground hover:bg-layer-hover rounded-lg'
          },
          {
            text: 'Finish Tour',
            action: () => this.tour?.complete(),
            classes: 'py-2 px-3 text-sm bg-primary text-white rounded-lg ml-2 hover:bg-primary-hover'
          }
        ]
      }
    ]);
  }

  public start(): void {
    this.startTourInstance();
  }

  public startIfFirstTime(): void {
    const hasSeenTour = localStorage.getItem(this.TOUR_SEEN_KEY);
    if (!hasSeenTour) {
      this.startTourInstance();
    }
  }

  private startTourInstance(): void {
    if (this.router.url !== '/home') {
      this.navigateAndWait('/home').then(() => this.runTour());
    } else {
      this.runTour();
    }
  }

  private runTour(): void {
    if (!this.tour) {
      this.initTour();
    }
    this.tour?.start();
  }

  private markAsSeen(): void {
    localStorage.setItem(this.TOUR_SEEN_KEY, 'true');
  }

  private navigateAndWait(route: string): Promise<void> {
    return this.router.navigate([route]).then(() => {
      return new Promise((resolve) => setTimeout(resolve, 150));
    });
  }

  private getNavigationButtons(nextText: string, isFirst: boolean = false) {
    const buttons = [];
    if (!isFirst) {
      buttons.push({
        text: 'Back',
        action: () => this.tour?.back(),
        classes: 'py-2 px-3 text-sm text-muted-foreground hover:bg-layer-hover rounded-lg'
      });
    }
    buttons.push({
      text: nextText,
      action: () => this.tour?.next(),
      classes: 'py-2 px-3 text-sm bg-primary text-white rounded-lg ml-2 hover:bg-primary-hover'
    });
    return buttons;
  }
}
