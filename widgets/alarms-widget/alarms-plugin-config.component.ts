/*
* Copyright (c) 2019 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License. 
 */
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: "ticketing-integration-alarms-plugin-config",
    templateUrl: "./alarms-plugin-config.component.html",
    styleUrls: ["./alarms-plugin-config.component.css"]
})
export class AlarmsPluginConfig implements OnInit, OnDestroy {

    @Input() config: any = {};

    public widgetConfig = {
    };

    constructor() {}

    ngOnInit(): void {
        try {
            // Editing an existing widget
            if(_.has(this.config, 'customwidgetdata')) {
                this.widgetConfig = _.get(this.config, 'customwidgetdata');
            } else { // Adding a new widget
                _.set(this.config, 'customwidgetdata', this.widgetConfig);
            }
        } catch(e) {
           console.log("Ticketing Integration Alarms Widget Config - ngOnInit(): " + e);
        }
    }
    
    public updateConfig() {
        _.set(this.config, 'customwidgetdata', this.widgetConfig);
    }

    ngOnDestroy(): void {
        //unsubscribe from observables here
    }

}