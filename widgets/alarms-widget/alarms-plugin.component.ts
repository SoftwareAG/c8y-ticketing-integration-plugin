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
import { AlarmStatus, IFetchResponse, IAlarm, IResult } from '@c8y/client';
import { AlertService } from '@c8y/ngx-components';
import { AlarmService, FetchClient, Realtime } from '@c8y/ngx-components/api';
import * as _ from 'lodash';
import { BsModalService, BsModalRef  } from 'ngx-bootstrap/modal';
import { TicketCommentModal  } from './modal/ticket-comment-modal.component';


export interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    owner: string;
    creationDate: string;
    lastUpdateDate: string;
    alarmId: string;
    deviceId: string;
}

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
    selector: "ticketing-integration-alarms-plugin",
    templateUrl: "./alarms-plugin.component.html",
    styleUrls: ["./alarms-plugin.component.css"],
})
export class AlarmsPluginComponent implements OnInit {

    @Input() config;

    private deviceId: string = "";

    public isCollapsed = false;

    public collapsedArray: boolean[] = [];
    public alarms: IAlarm[] = [];
    public ticketsMap = new Map<string, Ticket>();
    public tpConfig: TPConfig;

    private ticketModalRef: BsModalRef;

    constructor(private realtime: Realtime, private alarmService: AlarmService, private fetchClient: FetchClient, private alertService: AlertService, private modalService: BsModalService) {
    }

    async ngOnInit(): Promise<void> {
        try {
           this.deviceId = this.config.device.id;

           await this.getAlarms(); // get all active alarms for a device
           await this.getTickets(); // get all tickets for a device
           await this.getTPConfig(); // get ticketing platform config

           this.alarms.forEach((alarm, index) => {
            this.collapsedArray[index] = true;
           })

           // subscribe realtime alarms notifications
           this.realtime.subscribe('/alarms/'+this.deviceId, (resp) => {
            if(resp.data.realtimeAction === "CREATE" && resp.data.data.status === AlarmStatus.ACTIVE) {
                this.alarms.unshift(resp.data.data);
            } 
           });
        } catch(e) {
            this.alertService.danger("Ticketing Integration Alarms Widget - ngOnInit()", e);
        }
    }

    private async getAlarms(): Promise<void> {
        let filter: object = {
            source: this.deviceId,
            status: AlarmStatus.ACTIVE,
            pageSize: 50
        };
        this.alarms = (await this.alarmService.list(filter)).data;
    }

    private async getTickets(): Promise<void> {
        let fetchResp: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/tickets?deviceId="+this.deviceId);
        fetchResp.then((resp) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    let tickets: Ticket[] = jsonResp.records;
                    tickets.forEach((ticket) => {
                        this.ticketsMap.set(ticket.alarmId, ticket);
                    });
                });
            } else {
                this.alertService.danger("Unable to fetch tickets for device.", resp.status.toString());
            }
        }).catch((e) => {
            this.alertService.danger("Unable to fetch tickets for device.", e);
        });
    }

    private async getTPConfig(): Promise<void> {
        let fetchResp: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/tpconfig");
        fetchResp.then((resp) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.tpConfig = jsonResp.record;
                }).catch((err) => {
                    this.alertService.danger("Unable to get Ticketing Platform Configuration.", err);        
                });
            } else {
                this.alertService.danger("Unable to get Ticketing Platform Configuration.", resp.status.toString());    
            }
        }).catch((err) => {
            this.alertService.danger("Unable to get Ticketing Platform Configuration.", err);
        });
    }

    public createTicket(alarmId: string) {
        let message = {
            'alarmId': alarmId
        };
        this.ticketModalRef = this.modalService.show(TicketCommentModal, { class: 'c8y-wizard', initialState: {message} });
        
        // On modal hidden
        this.ticketModalRef.onHidden.subscribe(() => {
            this.getAlarms();
            this.getTickets();
        });
    }

    public acknowledgeAlarm(alarm: IAlarm): void {
        let updatedAlarm: Partial<IAlarm> = {
            id: alarm.id,
            status: AlarmStatus.ACKNOWLEDGED
        };
        let updatedAlarmResult: Promise<IResult<IAlarm>> = this.alarmService.update(updatedAlarm);
        updatedAlarmResult.then((result) => {
           this.alertService.success("Alarm acknowledged."); 
           this.getAlarms();
        }).catch((err) => {
            this.alertService.danger("Failed to acknowledge alarm.", err);
        });
    }

    public clearAlarm(alarm: IAlarm): void {
        let updatedAlarm: Partial<IAlarm> = {
            id: alarm.id,
            status: AlarmStatus.CLEARED
        };
        let updatedAlarmResult: Promise<IResult<IAlarm>> = this.alarmService.update(updatedAlarm);
        updatedAlarmResult.then((result) => {
           this.alertService.success("Alarm cleared."); 
           this.getAlarms();
        }).catch((err) => {
            this.alertService.danger("Failed to clear alarm.", err);
        });
    }

    

}
