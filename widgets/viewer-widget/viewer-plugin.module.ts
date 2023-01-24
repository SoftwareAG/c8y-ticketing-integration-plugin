/**
 * /*
 * Copyright (c) 2019 Software AG, Darmstadt, Germany and/or its licensors
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @format
 */

import { CoreModule, FormsModule, HOOK_COMPONENTS } from "@c8y/ngx-components";
import { ViewerPluginComponent } from "./viewer-plugin.component";
import { ViewerPluginConfig } from "./viewer-plugin-config.component";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { TicketCommentModal } from "./modal/ticket-comment-modal.component";
import { ModalModule } from "ngx-bootstrap/modal";
import { DecodeHtmlPipe } from "./pipe/DecodeHtmlPipe";
import { TicketIdReplacementPipe } from "./pipe/TicketIdReplacementPipe";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [
        ViewerPluginComponent,
        ViewerPluginConfig,
        TicketCommentModal,
        DecodeHtmlPipe,
        TicketIdReplacementPipe
    ],
    entryComponents: [
        ViewerPluginComponent,
        ViewerPluginConfig,
        TicketCommentModal
    ],
    imports: [
        CoreModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        PaginationModule,
        ModalModule
    ],
    exports: [
        ViewerPluginComponent,
        ViewerPluginConfig,
        TicketCommentModal
    ],
    providers: [
        {
            provide: HOOK_COMPONENTS,
            multi: true,
            useValue: {
                id: "sag.c8y.gp.ticketing.integration.viewer.plugin",
                label: "Ticketing Integration Viewer",
                description: "To view tickets from ticketing platform using Ticketing Integration microservice.",
                component: ViewerPluginComponent,
                previewImage: require("./assets/img-preview.png"),
                configComponent: ViewerPluginConfig,
                data: {
                    ng1: {
                        options: { 
                            noDeviceTarget: false,
                            deviceTargetNotRequired: true
                        },
                    },
                },
            },
        }
    ],
})
export class TicketingIntegrationViewerPluginModule { }
