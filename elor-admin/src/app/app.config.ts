import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withRouterConfig, RouteReuseStrategy } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { NoReuseStrategy } from './core/no-reuse.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),

    provideHttpClient(),

    { provide: RouteReuseStrategy, useClass: NoReuseStrategy }
  ]
};
