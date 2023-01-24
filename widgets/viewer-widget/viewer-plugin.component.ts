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

import { Component, Input, OnInit } from '@angular/core';
import { IFetchResponse } from '@c8y/client';
import { AlertService } from '@c8y/ngx-components';
import { FetchClient } from '@c8y/ngx-components/api';
import * as _ from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { TicketCommentModal } from './modal/ticket-comment-modal.component';
import { Ticket } from './ticket';

export interface TPConfig {
    name: string;
    username: string;
    password: string;
    tenantUrl: string;
    accountId: string;
    ticketRecordTemplateUrl: string;
    alarmSubscription: boolean;
    autoAcknowledgeAlarm: boolean;
}

@Component({
    selector: "ticketing-integration-viewer-plugin",
    templateUrl: "./viewer-plugin.component.html",
    styleUrls: ["./viewer-plugin.component.css"],
})
export class ViewerPluginComponent implements OnInit {

    @Input() config;

    public tickets: Ticket[] = [];
    public paginatedTickets: Ticket[] = [];
    public totalTicketsPerPage: number = 1;

    public maxTickets: number = 100;

    public tpConfig: TPConfig;

    constructor(private fetchClient: FetchClient, private alertService: AlertService, public modalService: BsModalService) {
    }

    ngOnInit() {
        try {
            let deviceId = "";
            if(this.config.device !== undefined) {
                deviceId = this.config.device.id;
            }
            this.totalTicketsPerPage = this.config.customwidgetdata.table.pageSize;
            this.maxTickets = this.config.customwidgetdata.maxTickets;
            this.fetchTickets(deviceId);
            this.getTPConfig();
        } catch(e) {
            this.alertService.danger("Ticketing Integration Viewer Widget - ngOnInit()", e);
        }
    }

    private fetchTickets(deviceId?: string): void {
        let url: string = "/service/ticketing/tickets?pageSize="+this.maxTickets;
        if(deviceId !== undefined && deviceId !== null && deviceId !== "") {
            url = url + "&deviceId="+deviceId;
        }
        let fetchResp: Promise<IFetchResponse> = this.fetchClient.fetch(url);
        fetchResp.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.tickets = jsonResp.records;
                    this.paginatedTickets = this.tickets.slice(0, this.totalTicketsPerPage);
                }).catch((err) => {
                    this.alertService.danger("Ticketing Integration Viewer Widget - Unable to get tickets.", err);
                });
            } else {
                this.alertService.danger("Ticketing Integration Viewer Widget - Unable to get tickets.", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Viewer Widget - Unable to get tickets.", err);
        });
    }

    public ticketsPageChanged(event: PageChangedEvent): void {
        const startItem = (event.page - 1) * this.totalTicketsPerPage;
        const endItem = event.page * this.totalTicketsPerPage;
        this.paginatedTickets = this.tickets.slice(startItem, endItem);
    }

    public showTicketComments(ticket: Ticket) {
        let url = "/service/ticketing/tickets/"+ticket.id+"/comments";
        let fetchResp: Promise<IFetchResponse> = this.fetchClient.fetch(url);
        fetchResp.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    let message = {
                        comments: jsonResp.records
                    };
                    this.modalService.show(TicketCommentModal, { class: 'c8y-wizard', initialState: {message} });
                }).catch((err) => {
                    this.alertService.danger("Ticketing Integration Viewer Widget - Unable to fetch ticket comments JSON response", err);
                });
            } else {
                this.alertService.danger("Ticketing Integration Viewer Widget - Unable to fetch ticket comments.", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Viewer Widget - Unable to fetch ticket comments.", err);
        });
    }

    private getTPConfig(): void {
        let fetchResp: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/tpconfig");
        fetchResp.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.tpConfig = jsonResp.record;
                }).catch((err) => {
                    this.alertService.danger("Ticketing Integration Viewer Widget - Unable to fetch Ticketing Platform Configuration.", err);
                });
            } else {
                this.alertService.danger("Ticketing Integration Viewer Widget - Unable to fetch Ticketing Platform Configuration." + resp.status.toString());    
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Viewer Widget - Unable to fetch Ticketing Platform Configuration.", err);
        });
    }

    public redirectToDevicePage(deviceId: string): void {
        window.open("/apps/devicemanagement/index.html#/device/"+deviceId+"/device-info", "_blank");
    }

    public refreshTickets() {
        let deviceId = "";
        if(this.config.device !== undefined) {
            deviceId = this.config.device.id;
        }
        this.fetchTickets(deviceId);
    }

}
