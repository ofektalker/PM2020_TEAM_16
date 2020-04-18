import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../../admin-dashboard/admin-dashboard.component';
import { DogParksComponent } from '../../dog-parks/dog-parks.component';
import { DogParksResolver } from '../../resolvers/dogParksResolver.resolver';
import { InterestingPointComponent } from '../../interesting-point/interesting-point.component';
import { InterestingPointResolver } from '../../resolvers/interestingPointResolver.resolver';
import { UserMainComponent } from '../../../layouts/userLayout/user-main/user-main.component';
import { UserProfilePageComponent } from '../../../user/user-profile/user-profile-page.component';

export const USER_FULL_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: UserMainComponent },
  { path: 'profile', component: UserProfilePageComponent }
];