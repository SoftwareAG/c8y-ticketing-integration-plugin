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
import { IApplication, IFetchResponse, IResultList, IFetchOptions, UserService } from '@c8y/client';
import { AlertService, AppStateService } from '@c8y/ngx-components';
import { FetchClient, ApplicationService } from '@c8y/ngx-components/api';
import * as _ from 'lodash';
import { DAMapping } from './da-mapping';
import { MicroserviceHealth } from './microservice-health';
import { Ticket } from './ticket';
import { TPConfig } from './tp-config';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TicketCommentModal } from './modal/ticket-comment-modal.component';
import * as Chart from 'chart.js';

@Component({
    selector: "ticketing-integration-setup-plugin",
    templateUrl: "./setup-plugin.component.html",
    styleUrls: ["./setup-plugin.component.css"],
})
export class SetupPluginComponent implements OnInit {

    @Input() config;

    public microserviceAppId: string = "";

    public ticketFilter = {
        searchText: "",
        status: [],
        priority: [],
        creationDate: null
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

    public daMappings: DAMapping[] = [];
    public paginatedDAMappings: DAMapping[] = [];
    public totalDAMappingsPerPage: number = 1;

    public tickets: Ticket[] = [];
    public searchedTickets: Ticket[] = [];
    public paginatedTickets: Ticket[] = [];
    public totalTicketsPerPage: number = 1;

    private countByStatusLabels: string[] = [];
    private countByStatusDatapoints: number[] = [];

    private countByPriorityLabels: string[] = [];
    private countByPriorityDatapoints: number[]= [];

    private countByDeviceIdLabels: string[] = [];
    private countByDeviceIdDatapoints: number[]= [];

    public averageCycleTime = 0;

    private chartColors = [];
    private maxTickets: number = 100;

    public dashboardTheme = "regular";

    public microserviceHealth: MicroserviceHealth = {
        status: "Checking..."
    };
    userHasAdminRights: boolean;
    constructor(
        private fetchClient: FetchClient,
        private alertService: AlertService,
        private modalService: BsModalService, 
        private appService: ApplicationService,
        private appStateService: AppStateService,
        private userService: UserService) {

        this.userHasAdminRights = userService.hasRole(appStateService.currentUser.value, "ROLE_APPLICATION_MANAGEMENT_ADMIN")
    }

    ngOnInit(): void {
        this.determineWidgetTheme();
        this.initialise();
    }

    private determineWidgetTheme(): void {
        let dashboard: NodeListOf<Element> = document.querySelectorAll("c8y-context-dashboard");
        if(dashboard.length === 0) {
            dashboard = document.querySelectorAll("dashboard-by-id");
        }
        if(dashboard.length === 0) {
            console.log("Failed to find dashboard element.");
        } else {
            dashboard.forEach((d: Element) => {
                console.log(d.classList);
                if(d.classList.contains("dashboard-theme-dark")) {
                    this.dashboardTheme = "dark"
                    console.log("Dark");
                } else if(d.classList.contains("dashboard-theme-transparent")) {
                    this.dashboardTheme = "transparent";
                } else if(d.classList.contains("dashboard-theme-branded")) {
                    this.dashboardTheme = "branded";
                } else {
                    this.dashboardTheme = "regular";
                }
            });
        }
    }

    private initialise(): void {
        try {
            if(this.config.customwidgetdata !== undefined) {
                this.totalTicketsPerPage = this.config.customwidgetdata.ticketsPageSize;
                this.totalDAMappingsPerPage = this.config.customwidgetdata.daMappingsPageSize;
                this.chartColors = this.config.customwidgetdata.chartColors;
                this.maxTickets = this.config.customwidgetdata.maxTickets;
            }
            if(this.userHasAdminRights) {
                this.getApplication();
            }
            this.getMicroserviceHealth();
            this.initialiseTPConfig();
        } catch(err) {
            this.alertService.danger("Ticketing Integration Setup Widget - initialise()", err);
        }
    }

    private initialiseTPConfig(): void {
        let tpConfigFetchClient: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/tpconfig");
        tpConfigFetchClient.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.tpConfig = jsonResp.record;
                    if(this.tpConfig.alarmSubscription) {
                        this.initialiseDAMappings();
                    }
                    this.getAllTickets();
                }).catch((err)=> {
                    this.alertService.danger("Ticketing Integration Setup Widget - Error accessing tpConfig response body as JSON", err);
                });
            } else if(resp.status === 400) {
                this.alertService.danger("Ticketing Integration Setup Widget - tpConfig doesn't exist.");
            } else if(resp.status === 404) {
                this.alertService.danger("Ticketing Integration Setup Widget - Microservice or API is unavailable.");
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget - Unable to fetch tpConfig", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget - Error accessing tpConfig fetchClient: "+ err);
        });
    }

    private initialiseDAMappings(): void {
        let daMappingsFetchClient: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/damappings");
        daMappingsFetchClient.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.daMappings = jsonResp.records;
                    this.paginatedDAMappings = this.daMappings.slice(0, this.totalDAMappingsPerPage);
                }).catch((err) => {
                    this.alertService.danger("Ticketing Integration Setup Widget - Error accessing daMappings response body as JSON", err);
                });
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget - Unable to fetch daMappings.", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget - Error accessing dpMappings fetchClient", err);
        });
        
    }

    private getApplication(): void {
        let appResp: Promise<IResultList<IApplication>> = this.appService.listByName("ticketing");
        appResp.then((resp: IResultList<IApplication>) => {
            if(resp.res.status === 200) {
                if(resp.data === undefined || resp.data.length === 0) {
                    this.alertService.danger("Ticketing Integration Setup Widget - Error fetching Ticketing application", "Ticketing Integration microservice application doesn't exist.");    
                } else {
                    this.microserviceAppId = resp.data[0].id.toString();
                }
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget - Error fetching Ticketing application", resp.res.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget - Error fetching Ticketing application: "+err);
        });
    }
   
    
    private getAllTickets(): void {
        let ticketsFetchClient: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/tickets?pageSize="+this.maxTickets);
        ticketsFetchClient.then((resp) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp: any) => {

                    this.tickets = jsonResp.records;
                    this.searchedTickets = this.tickets;
                    this.paginatedTickets = this.searchedTickets.slice(0, this.totalTicketsPerPage);

                    let differenceSum = 0;
                    let closedTicketsCount = 0;

                    this.tickets.forEach((ticket) => {
                        let statusFoundIndex = this.findEntryInStatus(ticket.status);
                        if(statusFoundIndex === -1) {
                            this.ticketFilter.status.push({
                                label: ticket.status,
                                selected: true
                            });
                            this.countByStatusLabels.push(ticket.status);
                            this.countByStatusDatapoints.push(1);
                        } else {
                            this.countByStatusDatapoints[statusFoundIndex] = this.countByStatusDatapoints[statusFoundIndex] + 1;
                        }

                        let priorityFoundIndex = this.findEntryInPriority(ticket.priority);
                        if(priorityFoundIndex === -1) {
                            this.ticketFilter.priority.push({
                                label: ticket.priority,
                                selected: true
                            });
                            this.countByPriorityLabels.push(ticket.priority);
                            this.countByPriorityDatapoints.push(1);
                        } else {
                            this.countByPriorityDatapoints[priorityFoundIndex] = this.countByPriorityDatapoints[priorityFoundIndex] + 1;
                        }

                        let deviceIdFoundIndex = this.findEntryInDevice(ticket.deviceId);
                        if(deviceIdFoundIndex === -1) {
                            this.countByDeviceIdLabels.push(ticket.deviceId);
                            this.countByDeviceIdDatapoints.push(1);
                        } else {
                            this.countByDeviceIdDatapoints[deviceIdFoundIndex] = this.countByDeviceIdDatapoints[deviceIdFoundIndex] + 1;
                        }
                        
                        // Calculate average cycle time
                        if(ticket.status === "Closed") {
                            let creationDate: Date = new Date(ticket.creationDate);
                            let closedDate: Date = new Date(ticket.lastUpdateDate);
                            let difference = (closedDate.getTime() - creationDate.getTime()) / 3600000; // converting milliseconds into hours
                            differenceSum = differenceSum + difference;
                            closedTicketsCount = closedTicketsCount + 1;
                        }

                    });

                    this.averageCycleTime = differenceSum / closedTicketsCount;
                    if(this.averageCycleTime === undefined || this.averageCycleTime === null || Number.isNaN(this.averageCycleTime)) {
                        this.averageCycleTime = 0;
                    }
                   
                    this.showPriorityChart();
                    this.showStatusChart();
                    this.showDeviceChart();
                }).catch((err) => {
                    this.alertService.danger("Ticketing Integration Setup Widget - Error fetching all tickets", err);
                });
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget - Error fetching all tickets", err);
        });
    }

    private findEntryInStatus(status: string): number {
        let foundIndex: number = -1;
        for(let i=0; i<this.countByStatusLabels.length; i++) {
            if(status === this.countByStatusLabels[i]) {
                foundIndex = i;
                break;
            }
        }
        return foundIndex;
    }

    private findEntryInPriority(priority: string): number {
        let foundIndex: number = -1;
        for(let i=0; i<this.countByPriorityLabels.length; i++) {
            if(priority === this.countByPriorityLabels[i]) {
                foundIndex = i;
                break;
            }
        }
        return foundIndex;
    }

    private findEntryInDevice(deviceId: string): number {
        let foundIndex: number = -1;
        for(let i=0; i<this.countByDeviceIdLabels.length; i++) {
            if(deviceId === this.countByDeviceIdLabels[i]) {
                foundIndex = i;
                break;
            }
        }
        return foundIndex;
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
                    this.alertService.danger("Ticketing Integration Setup Widget - Unable to fetch ticket comments JSON response", err);
                });
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget - Unable to fetch ticket comments", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget - Unable to fetch ticket comments", err);
        });
    }

    public getMicroserviceHealth(): void {
        let healthFetchClient: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/health");
        healthFetchClient.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.microserviceHealth = jsonResp;
                });
            } else if(resp.status === 404) {
                this.microserviceHealth.status = "Unavailable";
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget - Error fetching microservice health", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget - Error fetching microservice health", err);
        });
    }
    
    private showPriorityChart() {
        new Chart("priorityChart", {
            type: "pie",
            data: {
                labels: this.countByPriorityLabels,
                datasets: [{
                    data: this.countByPriorityDatapoints,
                    backgroundColor: this.chartColors
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltips: {
                    enabled: true
                }
            }
        });
    }

    private showStatusChart() {
        new Chart("statusChart", {
            type: "pie",
            data: {
                labels: this.countByStatusLabels,
                datasets: [{
                    data: this.countByStatusDatapoints,
                    backgroundColor: this.chartColors
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltips: {
                    enabled: true
                }
            },
        });
    }

    private showDeviceChart() {
        new Chart("deviceChart", {
            type: "pie",
            data: {
                labels: this.countByDeviceIdLabels,
                datasets: [{
                    data: this.countByDeviceIdDatapoints,
                    backgroundColor: this.chartColors
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltips: {
                    enabled: true
                }
            },
        });
    }

    public ticketsPageChanged(event: PageChangedEvent): void {
        const startItem = (event.page - 1) * this.totalTicketsPerPage;
        const endItem = event.page * this.totalTicketsPerPage;
        this.paginatedTickets = this.searchedTickets.slice(startItem, endItem);
    }

    public daMappingsPageChanged(event: PageChangedEvent): void {
        const startItem = (event.page - 1) * this.totalDAMappingsPerPage;
        const endItem = event.page * this.totalDAMappingsPerPage;
        this.paginatedDAMappings = this.daMappings.slice(startItem, endItem);
    }

    public toggleStatusFilter(index) {
        if(this.ticketFilter.status[index].selected) {
            this.ticketFilter.status[index].selected = false;
        } else {
            this.ticketFilter.status[index].selected = true;
        }
        this.filterTickets();
    }

    public togglePriorityFilter(index) {
        if(this.ticketFilter.priority[index].selected) {
            this.ticketFilter.priority[index].selected = false;
        } else {
            this.ticketFilter.priority[index].selected = true;
        }
        this.filterTickets();
    }

    public searchTextChanged() {
        this.filterTickets();
    }

    public creationDateFilterChanged() {
        this.filterTickets();
    }

    private filterTickets() {
        let statusMatched = false;
        let priorityMatched = false;
        let searchTextMatched = false;
        let creationDateMatched = false;

        this.searchedTickets = [];

        this.tickets.forEach(t => {
            for(let i=0; i<this.ticketFilter.status.length; i++) {
                if(this.ticketFilter.status[i].selected && this.ticketFilter.status[i].label === t.status) {
                    statusMatched = true;
                }
            }

            for(let i=0; i<this.ticketFilter.priority.length; i++) {
                if(this.ticketFilter.priority[i].selected && this.ticketFilter.priority[i].label === t.priority) {
                    priorityMatched = true;
                }
            }

            if(this.ticketFilter.searchText === undefined || this.ticketFilter.searchText === null || this.ticketFilter.searchText === "" ) {
                searchTextMatched = true;
            } else {
                if(t.subject.includes(this.ticketFilter.searchText) || t.description.includes(this.ticketFilter.searchText)) {
                    searchTextMatched = true;
                }
            }

            if(this.ticketFilter.creationDate === undefined || this.ticketFilter.creationDate === null) {
                creationDateMatched = true;
            } else {
                if(new Date(t.creationDate) >= this.ticketFilter.creationDate) {
                    creationDateMatched = true;
                }
            }

            if(statusMatched && priorityMatched && searchTextMatched && creationDateMatched) {
                this.searchedTickets.push(t);
            }

            statusMatched = priorityMatched = searchTextMatched = creationDateMatched = false;
        });

        this.paginatedTickets = this.searchedTickets.slice(0, this.totalTicketsPerPage);
    }

    public redirectToMicroserviceLogs() {
        window.open("/apps/administration/index.html#/microservices/"+this.microserviceAppId+"/logs", "_blank");
    }

    public redirectToDevicePage(deviceId: string) {
        window.open("/apps/devicemanagement/index.html#/device/"+deviceId+"/device-info", "_blank");
    }

    public deleteTicketCreationRecords(): void {
        const fetchOptions: IFetchOptions = {
            method: 'DELETE'
        };
        let fetchResp: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/admin/ticketCreationRecords", fetchOptions);
        fetchResp.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.alertService.success("Ticket Creation Records deleted successfully.");
                });
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget - Error deleting Ticket Creation Records", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget - Error fetching microservice health", err);
        });
    }

    public deleteConfigManagedObject(): void {
        const fetchOptions: IFetchOptions = {
            method: 'DELETE'
        };
        let fetchResp: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/admin/configManagedObject", fetchOptions);
        fetchResp.then((resp: IFetchResponse) => {
            if(resp.status === 200) {
                resp.json().then((jsonResp) => {
                    this.alertService.success("Config Managed Object successfully.");
                });
            } else {
                this.alertService.danger("Ticketing Integration Setup Widget - Error deleting Config Managed Object", resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Setup Widget - Error deleting Config Managed Object", err);
        });
    }

    public refreshTickets() {
        this.countByDeviceIdDatapoints = [];
        this.countByDeviceIdLabels = [];
        this.countByPriorityDatapoints = [];
        this.countByPriorityLabels = [];
        this.ticketFilter.priority = [];
        this.countByStatusDatapoints = [];
        this.countByStatusLabels = [];
        this.ticketFilter.status = [];
        this.ticketFilter.creationDate = null;
        this.ticketFilter.searchText = "";
        this.getAllTickets();
    }

}
