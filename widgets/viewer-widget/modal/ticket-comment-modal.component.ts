import { Component } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";

@Component({
    selector: "lib-ticket-comment-modal",
    templateUrl: "./ticket-comment-modal.component.html",
})
export class TicketCommentModal {

    message: any;
    constructor(public bsModalRef: BsModalRef) {}

    dismiss() {
        this.bsModalRef.hide();
    }
}