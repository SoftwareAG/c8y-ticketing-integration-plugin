import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'ReplaceTicketId',
    pure: true // This allows the pipe to only run once
})
export class TicketIdReplacementPipe implements PipeTransform {

    constructor() {
    }

    transform(url: string, ticketId: string) {
        return url.replace(/{id}/g, ticketId);
    }
}