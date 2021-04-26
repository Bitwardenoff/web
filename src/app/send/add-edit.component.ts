import { DatePipe } from '@angular/common';

import { Component } from '@angular/core';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SendService } from 'jslib/abstractions/send.service';
import { UserService } from 'jslib/abstractions/user.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/send/add-edit.component';

import { SendType } from 'jslib/enums/sendType';

@Component({
    selector: 'app-send-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent {
    constructor(i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        environmentService: EnvironmentService, datePipe: DatePipe,
        sendService: SendService, userService: UserService,
        messagingService: MessagingService, policyService: PolicyService) {
        super(i18nService, platformUtilsService, environmentService, datePipe, sendService, userService,
            messagingService, policyService);
    }

    async showSuccessMessage(inactive: boolean) {
        if (inactive && this.copyLink && this.send.type === SendType.File) {
            await this.platformUtilsService.showDialog(this.i18nService.t('createdSend'), null,
                this.i18nService.t('ok'), null, 'success', null);
        } else {
            await super.showSuccessMessage(inactive);
        }
    }

    copyLinkToClipboard(link: string) {
        // Copy function on web depends on the modal being open or not. Since this event occurs during a transition
        // of the modal closing we need to add a small delay to make sure state of the DOM is consistent.
        window.setTimeout(() => super.copyLinkToClipboard(link), 500);
    }
}
