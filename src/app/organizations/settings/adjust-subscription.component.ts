import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { OrganizationSubscriptionUpdateRequest } from 'jslib-common/models/request/organizationSubscriptionUpdateRequest';

@Component({
    selector: 'app-adjust-subscription',
    templateUrl: 'adjust-subscription.component.html',
})
export class AdjustSubscription {
    @Input() organizationId: string;
    @Input() maxAutoscaleSeats: number;
    @Input() currentSeatCount: number;
    @Input() seatPrice = 0;
    @Input() interval = 'year';
    @Output() onAdjusted = new EventEmitter();

    formPromise: Promise<any>;
    limitSubscription: boolean;
    newSeatCount: number;
    newMaxSeats: number;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService) { }

    ngOnInit() {
        this.limitSubscription = this.maxAutoscaleSeats != null;
        this.newSeatCount = this.currentSeatCount;
        this.newMaxSeats = this.maxAutoscaleSeats;
    }

    async submit() {
        try {
            const seatAdjustment = this.newSeatCount - this.currentSeatCount;
            const request = new OrganizationSubscriptionUpdateRequest(seatAdjustment, this.newMaxSeats);
            this.formPromise = this.apiService.postOrganizationUpdateSubscription(this.organizationId, request);

            await this.formPromise;

            this.toasterService.popAsync('success', null, this.successNotificationMessage);
        } catch { }
        this.onAdjusted.emit();
    }

    limitSubscriptionChanged() {
        if (!this.limitSubscription) {
            this.newMaxSeats = null;
        }
    }

    get adjustedSeatTotal(): number {
        return this.newSeatCount * this.seatPrice;
    }

    get maxSeatTotal(): number {
        return this.newMaxSeats * this.seatPrice;
    }

    private get seatAdjustment() {
        return this.newSeatCount - this.currentSeatCount;
    }
    private get seatsChanged() {
        return this.seatAdjustment != 0;
    }

    private get seatLimitChanged() {
        return this.newMaxSeats != this.maxAutoscaleSeats;
    }

    private get seatsNotLimited() {
        return this.newMaxSeats == null;
    }

    private get successNotificationMessage() {
        let message = this.i18nService.t('subscriptionUpdated');

        const seatAdjustmentString = (this.seatAdjustment > 0 ? '+' : '') + this.seatAdjustment.toString();

        if (this.seatsChanged && !this.seatLimitChanged) {
            message = this.i18nService.t('adjustedSeats', seatAdjustmentString);
        } else if (this.seatsChanged && this.seatLimitChanged && this.seatsNotLimited) {
            message = this.i18nService.t('adjustedSeatsAndUnlimitedAutoscaling', seatAdjustmentString);
        } else if (this.seatsChanged && this.seatLimitChanged && !this.seatsNotLimited) {
            message = this.i18nService.t('adjustedSeatsAndLimitedAutoscaling', seatAdjustmentString,
                this.newMaxSeats.toString());
        } else if (!this.seatsChanged && this.seatLimitChanged && this.seatsNotLimited) {
            message = this.i18nService.t('enabledUnlimitedAutoscaling');
        } else if (!this.seatsChanged && this.seatLimitChanged && !this.seatsNotLimited) {
            message = this.i18nService.t('enabledLimitedAutoscaling', this.newMaxSeats.toString());
        }

        return message;
    }
}
