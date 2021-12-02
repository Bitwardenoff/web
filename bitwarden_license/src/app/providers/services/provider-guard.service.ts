import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
} from '@angular/router';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

@Injectable()
export class ProviderGuardService implements CanActivate {
    constructor(private userService: UserService, private router: Router,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService) { }

    async canActivate(route: ActivatedRouteSnapshot) {
        const provider = await this.userService.getProvider(route.params.providerId);
        if (provider == null) {
            this.router.navigate(['/']);
            return false;
        }
        if (!provider.isProviderAdmin && !provider.enabled) {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('providerIsDisabled'));
            this.router.navigate(['/']);
            return false;
        }

        return true;
    }
}
