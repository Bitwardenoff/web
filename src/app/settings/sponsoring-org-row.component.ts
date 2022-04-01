import { formatDate } from "@angular/common";
import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Organization } from "jslib-common/models/domain/organization";

/*
 *
 */

@Component({
  selector: "[sponsoring-org-row]",
  templateUrl: "sponsoring-org-row.component.html",
})
export class SponsoringOrgRowComponent implements OnInit {
  @Input() sponsoringOrg: Organization = null;
  @Input() isSelfHosted = false;

  @Output() sponsorshipRemoved = new EventEmitter();

  statusMessage = "loading";

  revokeSponsorshipPromise: Promise<any>;
  resendEmailPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private logService: LogService,
    private platformUtilsService: PlatformUtilsService
  ) {}

  ngOnInit(): void {
    /*
     * Possible Statuses:
     * Requested (self-hosted only)
     * Sent
     * Active
     * RequestRevoke
     * RevokeWhenExpired
     */

    if (
      this.sponsoringOrg.familySponsorshipToDelete &&
      this.sponsoringOrg.familySponsorshipValidUntil
    ) {
      // They want to delete but there is a valid until date which means there is an active sponsorship
      // TODO: Display valid until date
      this.statusMessage = this.i18nService.t(
        "revokeWhenExpired",
        formatDate(
          this.sponsoringOrg.familySponsorshipValidUntil,
          "mediumDate",
          this.i18nService.locale
        )
      );
    } else if (this.sponsoringOrg.familySponsorshipToDelete) {
      // They want to delete and we don't have a valid until date so we can
      // this should only happen on a self-hosted install
      this.statusMessage = this.i18nService.t("requestRevoke");
    } else if (this.sponsoringOrg.familySponsorshipValidUntil) {
      // They don't want to delete and they have a valid until date
      // that means they are actively sponsoring someone
      this.statusMessage = this.i18nService.t("active");
    } else if (this.isSelfHosted && this.sponsoringOrg.familySponsorshipLastSyncDate) {
      // We are on a self-hosted install and it has been synced but we have not gotten
      // a valid until date so we can't know if they are actively sponsoring someone

      // QUESTION: This has the same status as the cloud version, do we want to show something
      // different and show next sync time?
      this.statusMessage = this.i18nService.t("sent");
    } else if (!this.isSelfHosted) {
      // We are in cloud and all other status checks have been false therefore we have
      // sent the request but it hasn't been accepted yet
      this.statusMessage = this.i18nService.t("sent");
    } else {
      // We are on a self-hosted install and we have not synced yet
      this.statusMessage = this.i18nService.t("requested");
    }
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
    this.platformUtilsService.showToast("success", null, this.i18nService.t("emailSent"));
    this.resendEmailPromise = null;
  }

  get isSentAwaitingSync() {
    return this.isSelfHosted && !this.sponsoringOrg.familySponsorshipLastSyncDate;
  }

  private async doRevokeSponsorship() {
    const isConfirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("revokeSponsorshipConfirmation"),
      `${this.i18nService.t("remove")} ${this.sponsoringOrg.familySponsorshipFriendlyName}?`,
      this.i18nService.t("remove"),
      this.i18nService.t("cancel"),
      "warning"
    );

    if (!isConfirmed) {
      return;
    }

    await this.apiService.deleteRevokeSponsorship(this.sponsoringOrg.id);
    this.platformUtilsService.showToast("success", null, this.i18nService.t("reclaimedFreePlan"));
    this.sponsorshipRemoved.emit();
  }
}
