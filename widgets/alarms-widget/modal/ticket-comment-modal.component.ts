import { Component } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { IFetchOptions, IFetchResponse } from '@c8y/client';
import { AlertService } from '@c8y/ngx-components';
import { FetchClient } from '@c8y/ngx-components/api';

@Component({
    selector: "lib-ticket-comment-modal",
    templateUrl: "./ticket-comment-modal.component.html",
})
export class TicketCommentModal {

    message: any;
    comments: string;
    constructor(public bsModalRef: BsModalRef, private fetchClient: FetchClient, private alertService: AlertService) {}

    public dismiss() {
        this.bsModalRef.hide();
    }

    public createTicket() {
        const fetchOptions: IFetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'alarmId': this.message.alarmId,
                'comments': this.comments
            })
        };
        let fetchResp: Promise<IFetchResponse> = this.fetchClient.fetch("/service/ticketing/tickets", fetchOptions);
        fetchResp.then((resp: IFetchResponse) => {
            if(resp.status === 201) {
                resp.json().then((jsonResp) => {
                    this.alertService.success("Ticket created successfully!");
                    this.dismiss();
                }).catch((err) => {
                    this.alertService.danger("Ticketing Integration Alarms Widget - Error processing create ticket json response", err);
                });
            } else {
                this.alertService.danger("Ticketing Integration Alarms Widget - Unable to create ticket",resp.status.toString());
            }
        }).catch((err) => {
            this.alertService.danger("Ticketing Integration Alarms Widget - Unable to create ticket",err);
        });
    }
}