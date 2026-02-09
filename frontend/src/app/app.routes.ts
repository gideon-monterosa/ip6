import { Routes } from "@angular/router";
import { LoginComponent } from "./features/auth/login/login.component";
import { RegisterComponent } from "./features/auth/register/register.component";
import { DashboardComponent } from "./features/dashboard/dashboard.component";
import { CalendarCallbackComponent } from "./features/calendar/calendar-callback/calendar-callback.component";
import { SettingsComponent } from "./features/settings/settings.component";
import { CalendarViewComponent } from "./features/calendar/calendar-view/calendar-view.component";
import { authGuard } from "./core/guards/auth.guard";
import { guestGuard } from "./core/guards/guest.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [guestGuard] },
  { path: "register", component: RegisterComponent, canActivate: [guestGuard] },
  { path: "home", component: DashboardComponent, canActivate: [authGuard] },
  { path: "settings", component: SettingsComponent, canActivate: [authGuard] },
  { path: "calendar", component: CalendarViewComponent, canActivate: [authGuard] },
  {
    path: "calendar-callback",
    component: CalendarCallbackComponent,
    canActivate: [authGuard],
  },
  { path: "", redirectTo: "/home", pathMatch: "full" },
];
