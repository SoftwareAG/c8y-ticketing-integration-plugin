export interface TPConfig {
    name: string;
    username: string;
    password: string;
    tenantUrl: string;
    accountId: string;
    ticketRecordTemplateUrl: string;
    alarmSubscription: boolean;
    autoAcknowledgeAlarm: boolean;
}