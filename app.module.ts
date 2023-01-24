import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as ngRouterModule } from '@angular/router';
import { BootstrapComponent, CoreModule, RouterModule } from '@c8y/ngx-components';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TicketingIntegrationSetupPluginModule } from './widgets/setup-widget';
import { TicketingIntegrationViewerPluginModule } from './widgets/viewer-widget';
import { TicketingIntegrationAlarmsPluginModule } from './widgets/alarms-widget';

// Translations
import './locales/de.po'; // <- adding additional strings to the german translation.

@NgModule({
  imports: [
    BrowserAnimationsModule,
    ngRouterModule.forRoot([], { enableTracing: false, useHash: true }),
    RouterModule.forRoot(),
    CoreModule.forRoot(),
    TicketingIntegrationSetupPluginModule,
    TicketingIntegrationViewerPluginModule,
    TicketingIntegrationAlarmsPluginModule
  ],
  providers: [BsModalRef],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
