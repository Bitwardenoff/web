import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CipherString } from 'jslib/models/domain/cipherString';
import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';

import { KeysRequest } from 'jslib/models/request/keysRequest';
import { SetPasswordRequest } from 'jslib/models/request/setPasswordRequest';

import {
    ChangePasswordComponent as BaseChangePasswordComponent,
} from 'jslib/angular/components/change-password.component';

import { KdfType } from 'jslib/enums/kdfType';

@Component({
    selector: 'app-accounts-change-password',
    templateUrl: 'change-password.component.html',
})
export class ChangePasswordComponent extends BaseChangePasswordComponent {
    showPassword: boolean = false;
    hint: string = '';

    onSuccessfulChangePassword: () => Promise<any>;
    successRoute = 'vault';

    constructor(apiService: ApiService, i18nService: I18nService,
        cryptoService: CryptoService, messagingService: MessagingService,
        userService: UserService, passwordGenerationService: PasswordGenerationService,
        platformUtilsService: PlatformUtilsService, folderService: FolderService,
        cipherService: CipherService, syncService: SyncService,
        policyService: PolicyService, router: Router, private route: ActivatedRoute) {
        super(apiService, i18nService, cryptoService, messagingService, userService, passwordGenerationService,
            platformUtilsService, folderService, cipherService, syncService, policyService, router);
    }

    async setupSubmitActions() {
        this.kdf = KdfType.PBKDF2_SHA256;
        const useLowerKdf = this.platformUtilsService.isEdge() || this.platformUtilsService.isIE();
        this.kdfIterations = useLowerKdf ? 10000 : 100000;
        return true;
    }

    async performSubmitActions(masterPasswordHash: string, key: SymmetricCryptoKey,
        encKey: [SymmetricCryptoKey, CipherString]) {
        const request = new SetPasswordRequest();
        request.masterPasswordHash = masterPasswordHash;
        request.key = encKey[1].encryptedString;
        request.masterPasswordHint = this.hint;
        request.kdf = this.kdf;
        request.kdfIterations = this.kdfIterations;

        const keys = await this.cryptoService.makeKeyPair(encKey[0]);
        request.keys = new KeysRequest(keys[0], keys[1].encryptedString);

        try {
            this.formPromise = this.apiService.setPassword(request);
            await this.formPromise;

            await this.userService.setInformation(await this.userService.getUserId(), await this.userService.getEmail(),
                this.kdf, this.kdfIterations);
            await this.cryptoService.setKey(key);
            await this.cryptoService.setKeyHash(masterPasswordHash);
            await this.cryptoService.setEncKey(encKey[1].encryptedString);
            await this.cryptoService.setEncPrivateKey(keys[1].encryptedString);

            if (this.onSuccessfulChangePassword != null) {
                this.onSuccessfulChangePassword();
            } else {
                this.router.navigate([this.successRoute]);
            }
        } catch {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('errorOccurred'));
        }
    }

    togglePassword(confirmField: boolean) {
        this.platformUtilsService.eventTrack('Toggled Master Password on Set Password');
        this.showPassword = !this.showPassword;
        document.getElementById(confirmField ? 'masterPasswordRetype' : 'masterPassword').focus();
    }
}
