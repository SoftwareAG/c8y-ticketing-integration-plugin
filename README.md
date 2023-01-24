# Ticketing Integration Plugin for Cumulocity IoT

This plugin consists of three widgets that allows to configure Ticketing Integration microservice, create tickets and view tickets.

This plugin is supported for Cumulocity IoT UI version >= 1016.x.x and Application Builder version >= 2.0.0.

## Ticketing Integration Setup widget
This widget allows to configure the Ticketing Integration microservice, list the tickets and draw related charts for analysis.

![Preview](https://raw.githubusercontent.com/SoftwareAG/c8y-ticketing-integration-plugin/master/widgets/setup-widget/assets/img-preview.png)

### Configuration - to add the widget on dashboard
1. Make sure you have successfully installed the plugin.
2. Go to an application's dashbord and click on `Add widget`.
3. Choose `Ticketing Integration Setup` widget.
4. `Title` is the title of widget. Provide a relevant name. You may choose to hide this. Go to `Appearance` tab and choose `Hidden` under `Widget header style`.
5. `Platform` is ticketing platform. 
    - Choose `webMethods AgileApps` to integrate with webMethods AgileApps directly.
        - `Tenant url` is base url of ticketing platform. It must not end on '/'. Example: https://testtenant.agileappslive.com
        - `Username` is username of AgileApps tenant account.
        - `Password` is password of AgileApps tenant account.
        - `Account id` is customer account record id to which all the tickets created will be related to.
    - Choose `External REST APIs` to integrate with any ticketing platform using custom integration.
        - `Tenant url` is base url of custom APIs. It must not end with '/'.
        - `Username` is username of user account to access the APIs using basic authentication.
        - `Password` is password of user account to access the APIs using basic authentication.
        - `Download Swagger` to download the swagger file. Swagger file define the APIs that are expected by Ticketing Integration Microservice.
6. `Ticket record template url` is the template url for ticket record in the ticketing platform. Ticket id is defined by '{id}' placeholder which gets replaced by actual ticket id. Example: https://testticketingplatform.com/records/{id}.
7. `Create tickets automatically on device alarm mapping matched` controls whether tickets should be created automatically on alarm creation or not.
8. `Change alarm status to ACKNOWLEDGE automcatically after creating ticket` controls whether to change alarm status to 'Acknowledge' automatically after ticket creation or not.
9. Click `Save configuration` to save ticketing platform configuration.
10. Add or remove `Device Alarm Mappings` and click Save Mappings buttons. Mappings means for which device id and alarm type ticket needs to be created.
11. `Maximum total tickets` is how many total tickets need to be fetched from the ticketing platform.
12. `Tickets page size` is how many tickets need to be shown in the table at once.
13. Add and remove `Chart colors` for tickets by priority, tickets by status and tickets by device charts. 
14. Click `Save` to add the widget on the dashboard.
15. In case you see unexpected results on the widget, refer to browser console to see if there are error logs.

## Ticketing Integration Viewer widget
This widget allows to view tickets from the configured Ticketing Platform using Ticketing Integration microservice.

![Preview](https://raw.githubusercontent.com/SoftwareAG/c8y-ticketing-integration-plugin/master/widgets/viewer-widget/assets/img-preview.png)

### Configuration - to add the widget on dashboard
1. Make sure you have successfully installed the plugin.
2. Go to an application's dashbord and click on `Add widget`.
3. Choose `Ticketing Integration Viewer` widget.
4. `Title` is the title of widget. Provide a relevant name. You may choose to hide this. Go to `Appearance` tab and choose `Hidden` under `Widget header style`.
5. Choose `Target assets or devices` to view tickets for that specific device or leave unselected to view all tickets.
6. Select or unselect respective table columns in `Show columns` to be shown in table.
7. `Max total tickets` is total number of tickets to be retrieved from ticketing platform.
8. `Page size` is total number of tickets to shown at once in a table.
9. Click `Save` to add the widget on the dashboard.
10. In case you see unexpected results on the widget, refer to browser console to see if there are error logs.

## Ticketing Integration Alarms widget
This widget shows active alarms related to a device and allows to create tickets using the Ticketing Integration microservice.

![Preview](https://raw.githubusercontent.com/SoftwareAG/c8y-ticketing-integration-plugin/master/widgets/alarms-widget/assets/img-preview.png)

### Configuration - to add the widget on dashboard
1. Make sure you have successfully installed the plugin.
2. Go to an application's dashbord and click on `Add widget`.
3. Choose `Ticket Integration Alarms` widget.
4. `Title` is the title of widget. Provide a relevant name. You may choose to hide this. Go to `Appearance` tab and choose `Hidden` under `Widget header style`.
5. Choose a device using `Target assets or devices` for which you want to see the active alarms. It shows maximum 50 alarms at the moment.
6. Click `Save` to add the widget on the dashboard.
7. In case you see unexpected results on the widget, refer to browser console to see if there are error logs.

### Usage - to use the widget
1. Once widget is added to the dashboard, it lists all the active alarms related to a device.
2. On hovering an alarm, there can be 3 buttons
    1. Green button to CLEAR an alarm.
    2. Orange button to ACKNOWLDGE an alarm.
    3. Blue button to CREATE A TICKET for an alarm.
        1. It is only available if there is no ticket already created for an alarm.
        2. Clicking this button will show a pop-up which allows you to write an additional description about an alarm before you create a ticket.
3. If there is already a ticket related to an alarm, ticket id is shown. Clicking the ticket id will redirect you to the ticket record in Ticketing platform in a new browser tab.

## Development - to do the enhancements and testing locally
1. Clone the repository on local machine using `git clone https://github.com/SoftwareAG/c8y-ticketing-integration-plugin.git`.
2. Run `npm install` to download the module dependencies.
3. Install c8ycli `npm install -g @c8y/cli` if not already.
4. Run `npm start` to start the server.
5. Open the URL in the logs to view and test your changes.
6. (Optional) push the changes back to this repository.

## Build - to create a package to be installed
1. Finish the development and testing on your local machine.
2. Run `npm install -g gulp` to install gulp if not already.
3. Run `npm run build` to start the build process.
3. Use `c8y-ticketing-integration-plugin-{version}.zip` file in the `dist` folder as a distribution.

------------------------------

These tools are provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.

------------------------------

For more information you can Ask a Question in the [TECHcommunity Forums](https://tech.forums.softwareag.com/tags/c/forum/1/Cumulocity-IoT).
  
  
You can find additional information in the [Software AG TECHcommunity](https://tech.forums.softwareag.com/tag/Cumulocity-IoT).