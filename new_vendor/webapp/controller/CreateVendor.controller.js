sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    // "sap/ui/core/Fragment",
    // "sap/ui/core/routing/History",
    // 'sap/m/MessageToast',
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.newvendor.controller.CreateVendor", {
        onInit: function () {
            //jQuery.sap.addUrlWhitelist("blob");
            this.mainModel = this.getOwnerComponent().getModel();
            this.mainModel.setSizeLimit(1000);

            // set message model
            var oMessageManager = sap.ui.getCore().getMessageManager();
            this.getView().setModel(oMessageManager.getMessageModel(), "message");
            oMessageManager.registerObject(this.getView(), true);

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteCreateVendor").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sPath = jQuery.sap.getModulePath("com.agel.mmts.newvendor", "/model/VendorData.json"),
                oVendorViewModel = new JSONModel(sPath);

            this.getView().setModel(oVendorViewModel, "VendorViewModel");

            //To remove error state of Required fields
            this.fnRemoveErrorState();
        },

        onCancelVendorDetails: function () {
            this.fnResetViewAndNavBack();
        },

        onSaveVendorDetails: function () {
            var bVendorCreateUpdateFlag = "Create";
            this.fnValidateFieldsAndSaveVendorData(bVendorCreateUpdateFlag);
        },

        onVendorCodeChange: function (oEvent) {
            var sVendorCode = oEvent.getSource().getValue(),
                oFilter = new Filter("VendorCode", FilterOperator.EQ, sVendorCode);

            this.getView().getModel().read("/VendorSet", {
                filters: [oFilter],
                success: function (oResponse) {
                    if (oResponse.results.length >= 1) {
                        MessageBox.error(this.getResourceBundle().getText("MsgVendorCodeExist"));
                        this.getView().getModel("VendorViewModel").setProperty("/VendorCode","");
                    }
                }.bind(this),
                error: function (oError) {
                    //MessageBox.error(JSON.stringify(oError));
                    // MessageBox.error(this.getResourceBundle().getText("Error"));
                    this.getView().setBusy(false);
                }.bind(this),
            });

        }
    });
});