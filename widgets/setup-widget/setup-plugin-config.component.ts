/*
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
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { IFetchOptions, IFetchResponse } from '@c8y/client';
import { AlertService } from '@c8y/ngx-components';
import { FetchClient } from '@c8y/ngx-components/api';
import * as _ from 'lodash';
import { DAMapping } from './da-mapping';
import { TPConfig } from './tp-config';

@Component({
    selector: "ticketing-integration-setup-plugin-config",
    templateUrl: "./setup-plugin-config.component.html",
    styleUrls: ["./setup-plugin-config.component.css"]
})
export class SetupPluginConfig implements OnInit, OnDestroy {

    @Input() config: any = {};

    public widgetConfig = {
        ticketsPageSize: 5,
        daMappingsPageSize: 5,
        chartColors: ["#1776bf"],
        maxTickets: 100,
        showComments: false
    };

    public tpConfig: TPConfig = {
        name: '',
        tenantUrl: '',
        username: '',
        password: '',
        accountId: '',
        ticketRecordTemplateUrl: '',
        alarmSubscription: false,
        autoAcknowledgeAlarm: false
    };

    public tpConfigSaved: boolean = false;
    
    public daMappings: DAMapping[] = [];

    constructor(private fetchClient: FetchClient, private alertService: AlertService, private httpClient: HttpClient) {}

    ngOnInit(): void {
        try {
             // Editing an existing widget
            if(_.has(this.config, 'customwidgetdata')) {
                this.widgetConfig = _.get(this.config, 'customwidgetdata');
            } else { // Adding a new widget
                _.set(this.config, 'customwidgetdata', this.widgetConfig);
            }
            this.initialiseTPConfig();
        } catch(e) {
            this.alertService.danger("Ticketing Integration Setup Widget Config - ngOnInit()", e);
        }
    }

    private initialiseTPConfig(): void {
        let tpConfigFetchClient: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/tpconfig");
        tpConfigFetchClient.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.tpConfig = jsonResp.record;

                    this.tpConfigSaved = true;

                    // only fetch device alarm mappings if alarmSubscription is true
                    if(this.tpConfig.alarmSubscription === true) {
                        this.initialiseDAMappings();
                    }

                }).catch((err)=> {
                    this.alertService.danger("Ticketing Integration Setup Widget Config - Error accessing tpConfig response body as JSON", err);
                });
            } else if(resp.status === 400) {
                this.alertService.danger("Ticketing Integration Setup Widget Config - tpConfig doesn't exist.");
            } else if(resp.status === 404) {
                this.alertService.danger("Ticketing Integration Setup Widget Config - Microservice or API is unavailable.");
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget Config - Unable to fetch tpConfig.", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget Config - Error accessing tpConfig fetchClient.", err);
        });
    }

    private initialiseDAMappings(): void {
        let daMappingsFetchClient: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/damappings");
        daMappingsFetchClient.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.daMappings = jsonResp.records;
                }).catch((err) => {
                    this.alertService.danger("Ticketing Integration Setup Widget Config - Error accessing daMappings response body as JSON", err)
                });
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget Config - Unable to fetch daMappings", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget Config - Error accessing dpMappings fetchClient", err);
        });
    }

    public isTPConfigValid(): boolean {
        if (this.tpConfig.name !== undefined && this.tpConfig.name !== null && this.tpConfig.name !== ""
        && this.tpConfig.password !== undefined && this.tpConfig.password !== null && this.tpConfig.password !== ""
        && this.tpConfig.username !== undefined && this.tpConfig.username !== null && this.tpConfig.username !== ""
        && this.tpConfig.tenantUrl !== undefined && this.tpConfig.tenantUrl !== null && this.tpConfig.tenantUrl !== "") {
            if(this.tpConfig.name === "AGILEAPPS") {
                if(this.tpConfig.accountId !== undefined && this.tpConfig.accountId !== null && this.tpConfig.accountId !== "") {
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }

    public addDAMapping() {
        this.daMappings.push({
            deviceId: '',
            alarmType: ''
        });
    }

    public removeDAMapping(index: number) {
        this.daMappings.splice(index, 1);
    }

    public saveTPConfig(): void {
        if(this.tpConfigSaved) {
            this.updateTPConfig();
        } else {
            this.createTPConfig();
        }
    }

    private createTPConfig(): void {
        const fetchOptions: IFetchOptions = {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(this.tpConfig)
        };

        let tpConfigFetchClient: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/tpconfig", fetchOptions);
        tpConfigFetchClient.then((resp: IFetchResponse) => {
            if(resp.status === 201) {
                this.tpConfigSaved = true;
                this.alertService.success("Configuration saved successfully.");
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget Config - Error saving configuration.", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget Config - Error saving configuration.", err);
        });
    }

    private updateTPConfig(): void {
        const fetchOptions: IFetchOptions = {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(this.tpConfig)
        };

        let tpConfigFetchClient: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/tpconfig", fetchOptions);
        tpConfigFetchClient.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                this.alertService.success("Configuration updated successfully.");
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget Config - Error updating configuration.", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget Config - Error updating configuration.", err);
        });
    }

    public saveDAMappings() {
        const fetchOptions: IFetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.daMappings)
        };
        let daMappingsFetchClient: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/damappings", fetchOptions);
        daMappingsFetchClient.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                this.alertService.success("Mappings saved successfully.");
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget Config - Error saving mappings.", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget Config - Error saving mappings.", err.toString());
        });
    }

    public addChartColor(): void {
        this.widgetConfig.chartColors.push("#1776BF");
        this.updateConfig();
    }

    public removeChartColor(): void {
        this.widgetConfig.chartColors.pop();
        this.updateConfig();
    }

    public updateConfig() {
        _.set(this.config, 'customwidgetdata', this.widgetConfig);
    }

    trackByFn(index, item) {
        return index;  
    }

    ngOnDestroy(): void {
        //unsubscribe from observables here
    }

}