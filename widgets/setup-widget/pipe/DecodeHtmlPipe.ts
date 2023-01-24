import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'DecodeHtml',
    pure: true // This allows the pipe to only run once
})
export class DecodeHtmlPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) {
    }

    transform(pUnsafe: string) {
        let decoded = pUnsafe.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        return this.sanitizer.bypassSecurityTrustHtml(decoded);
    }
}