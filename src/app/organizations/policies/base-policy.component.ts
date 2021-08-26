import {
    Directive,
    Input,
    OnInit,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Organization } from 'jslib-common/models/domain/organization';

import { PolicyType } from 'jslib-common/enums/policyType';

import { PolicyRequest } from 'jslib-common/models/request/policyRequest';

import { PolicyResponse } from 'jslib-common/models/response/policyResponse';

export abstract class BasePolicy {
    abstract name: string;
    abstract description: string;
    abstract type: PolicyType;
    abstract component: any;

    display(organization: Organization) {
        return true;
    }
}

@Directive()
export abstract class BasePolicyComponent implements OnInit {
    @Input() policyResponse: PolicyResponse;
    @Input() policy: BasePolicy;

    enabled = new FormControl(false);
    data: FormGroup = null;

    ngOnInit(): void {
        this.enabled.setValue(this.policyResponse.enabled);

        if (this.data != null) {
            this.data.patchValue(this.policyResponse.data ?? {});
        }
    }

    buildRequest(policiesEnabledMap: Map<PolicyType, boolean>) {
        const request = new PolicyRequest();
        request.enabled = this.enabled.value;
        request.type = this.policy.type;

        if (this.data != null) {
            request.data = this.data.value;
        }

        return Promise.resolve(request);
    }
}
