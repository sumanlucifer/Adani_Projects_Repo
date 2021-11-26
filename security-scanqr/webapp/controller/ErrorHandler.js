sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (UI5Object, MessageBox, Filter, FilterOperator) {
    "use strict";

    return UI5Object.extend("com.agel.mmts.securityscanqr.controller.ErrorHandler", {

        /**
         * Handles application errors by automatically attaching to the model events and displaying errors when needed.
         * @class
         * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
         * @public
         * @alias com.cap.manage-ideas.controller.ErrorHandler
         */
        constructor: function (oComponent) {
            var oMessageManager = sap.ui.getCore().getMessageManager(),
                oMessageModel = oMessageManager.getMessageModel(),
                // @ts-ignore
                oResourceBundle = oComponent.getModel("i18n").getResourceBundle(),
                sErrorText = oResourceBundle.getText("errorText"),
                sMultipleErrors = oResourceBundle.getText("multipleErrorsText");
            oComponent.setModel(oMessageModel, "message");

            this._oComponent = oComponent;
            this._bMessageOpen = false;

            this.oMessageModelBinding = oMessageModel.bindList("/", undefined,
                // @ts-ignore
                [], new Filter("technical", FilterOperator.EQ, true));

            this.oMessageModelBinding.attachChange(function (oEvent) {
                var aContexts = oEvent.getSource().getContexts(),
                    aMessages = [],
                    sErrorTitle;

                if (this._bMessageOpen || !aContexts.length) {
                    return;
                }

                // Extract and remove the technical messages
                aContexts.forEach(function (oContext) {
                    aMessages.push(oContext.getObject());
                });
                oMessageManager.removeMessages(aMessages);

                // Due to batching there can be more than one technical message. However the UX
                // guidelines say "display a single message in a message box" assuming that there
                // will be only one at a time.
                sErrorTitle = aMessages.length === 1 ? sErrorText : sMultipleErrors;

                var httpStatusCode = aMessages[0].getTechnicalDetails().httpStatus;
                if (httpStatusCode === 400) {
                    var oMessage = new sap.ui.core.message.Message({
                        message: aMessages[0].message,
                        type: aMessages[0].type,
                        target: "/Dummy"
                        //processor: this.getView().getModel()
                    });
                    sap.ui.getCore().getMessageManager().addMessages(oMessage);
                }
                else {
                    this._showServiceError(sErrorTitle, aMessages[0].message);
                }
            }, this);


        },

        /**
         * Shows a {@link sap.m.MessageBox} when a service call has failed.
            * Only the first error message will be displayed.
            * @param {string} sErrorTitle A title for the error message
            * @param {string} sDetails A technical error to be displayed on request
            * @private
        */
        _showServiceError: function (sErrorTitle, sDetails) {
            this._bMessageOpen = true;
            MessageBox.error(
                sErrorTitle,
                {
                    id: "serviceErrorMessageBox",
                    details: sDetails.message,
                    styleClass: this._oComponent.getContentDensityClass(),
                    actions: [MessageBox.Action.CLOSE],
                    onClose: function () {
                        this._bMessageOpen = false;
                    }.bind(this)
                }
            );
        }
    });
}
);