import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
} from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { Organization } from 'jslib-common/models/domain/organization';

@Component({
    selector: '[sponsoring-org-row]',
    templateUrl: 'sponsoring-org-row.component.html',
})
export class SponsoringOrgRowComponent {
    @Input() sponsoringOrg: Organization = null;

    @Output() sponsorshipRemoved = new EventEmitter();

    loading = true;

    revokeSponsorshipPromise: Promise<any>;
    resendEmailPromise: Promise<any>;

    constructor(private toasterService: ToasterService, private apiService: ApiService,
        private i18nService: I18nService, private logService: LogService,
        private platformUtilsService: PlatformUtilsService) { }

    ngOnInit() {
        if (this.sponsoringOrg === null) {
            return;
        }

        this.loading = false;
    }

    async revokeSponsorship() {
        try {
            this.revokeSponsorshipPromise = this.doRevokeSponsorship();
            await this.revokeSponsorshipPromise;
        } catch (e) {
            this.logService.error(e);
        }

        this.revokeSponsorshipPromise = null;
    }

    async resendEmail() {
        this.resendEmailPromise = this.apiService.postResendSponsorshipOffer(this.sponsoringOrg.id);
        await this.resendEmailPromise;
        this.toasterService.popAsync('success', null, this.i18nService.t('emailSent'));
        this.resendEmailPromise = null;
    }

    private async doRevokeSponsorship() {
        const isConfirmed = await this.platformUtilsService.showDialog(
            'You sure?', this.sponsoringOrg.familySponsorshipFriendlyName,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');

        if (!isConfirmed) {
            return;
        }

        await this.apiService.deleteRevokeSponsorship(this.sponsoringOrg.id);
        this.sponsorshipRemoved.emit();
        this.toasterService.popAsync('success', null, this.i18nService.t('reclaimedFreePlan'));
    }
}

