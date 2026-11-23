import { Routes } from '@angular/router';
import { Dashboard } from '../pages/dashboard/dashboard';
import { AdminPage } from '../pages/admin-page/admin-page';

export const routes: Routes = [
    {
        path: '',
        component: Dashboard
    },
    {
        path: 'admin',
        component: AdminPage
    }
];
