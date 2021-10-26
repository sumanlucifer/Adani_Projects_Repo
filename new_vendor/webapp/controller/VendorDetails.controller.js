sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.newvendor.controller.VendorDetails", {
        onInit: function () {

            //jQuery.sap.addUrlWhitelist("blob");
            this.mainModel = this.getOwnerComponent().getModel();
            this.mainModel.setSizeLimit(1000);

            // set message model
            var oMessageManager = sap.ui.getCore().getMessageManager();
            this.getView().setModel(oMessageManager.getMessageModel(), "message");
            oMessageManager.registerObject(this.getView(), true);

            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteVendorDetails").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sVendorId = oEvent.getParameter("arguments").VendorDetails,
                sObjectPath = "/VendorSet" + sVendorId;

            this.getView().getModel("objectViewModel").setProperty("/EditMode", false);
            this.getView().getModel("objectViewModel").setProperty("/VendorId", sVendorId);

            var sPath = jQuery.sap.getModulePath("com.agel.mmts.newvendor", "/model/VendorData.json"),
                oVendorViewModel = new JSONModel(sPath);

            this.getView().setModel(oVendorViewModel, "VendorViewModel");

            this.fnGetVendorData(sVendorId);

            //To remove error state of Required fields
            this.fnRemoveErrorState();
        },

        fnGetVendorData: function (sVendorId) {
            this.getView().getModel().read("/VendorSet(" + sVendorId + ")", {
                urlParameters: {
                    "$expand": "CompanyPlantMapping"
                },
                success: function (oResponse) {
                    if (oResponse) {
                        var oVendorData = this.fnGetRequiredFielOnly(oResponse);
                        // oVendorData.Mappings = oResponse.CompanyPlantMapping.results;

                        this.getView().getModel("VendorViewModel").setData(oVendorData);
                        this.getView().getModel("VendorViewModel").refresh(true);
                        this.getView().setBusy(false);
                    }
                }.bind(this),
                error: function (oError) {
                    MessageBox.error(JSON.stringify(oError));
                    this.getView().setBusy(false);
                }.bind(this)
            });
        },

        fnGetRequiredFielOnly: function (oResponse) {
            var oVendorData = this.getView().getModel("VendorViewModel").getData(),
                aVendorAllProperties = Object.keys(oResponse);

            for (var i = 0; i < aVendorAllProperties.length; i++) {
                if (oVendorData.hasOwnProperty(aVendorAllProperties[i])) {
                    oVendorData[aVendorAllProperties[i]] = oResponse[aVendorAllProperties[i]]
                }
            }

            if (oResponse.CompanyPlantMapping.results && oResponse.CompanyPlantMapping.results.length > 0) {
                for (var j = 0; j < oResponse.CompanyPlantMapping.results.length; j++) {
                    var oMappingObj = oResponse.CompanyPlantMapping.results[j];
                    oVendorData.Mappings.push({
                        "CompanyPlantMappingId": oMappingObj.ID ? oMappingObj.ID : null,
                        "CompanyCodeId": typeof (oMappingObj.CompanyCodeId) !== "object" ? oMappingObj.CompanyCodeId : null,
                        "CompanyCode": oMappingObj.CompanyCode ? oMappingObj.CompanyCode : null,
                        "PlantId": typeof (oMappingObj.PlantId) !== "object" ? oMappingObj.PlantId : null,
                        "PlantCode": oMappingObj.PlantCode ? oMappingObj.PlantCode : null,
                        "IsActive": oMappingObj.IsActive ? oMappingObj.IsActive : false,
                        "VendorId": this.getView().getModel("objectViewModel").getProperty("/VendorId")
                    });
                }
            }

            oVendorData.VendorId = this.getView().getModel("objectViewModel").getProperty("/VendorId");
            this._oInitialVendorDetailsObj = JSON.stringify(oVendorData);
            return oVendorData;
        },

        onVendorEditPress: function () {
            this.getView().getModel("objectViewModel").setProperty("/EditMode", true);
            this.getView().getModel("objectViewModel").refresh(true);
        },

        onCancelVendorDetails: function () {
            this.getView().getModel("objectViewModel").setProperty("/EditMode", false);
            this.getView().getModel("objectViewModel").refresh(true);

            var oVendorData = JSON.parse(this._oInitialVendorDetailsObj);
            this.getView().getModel("VendorViewModel").setData(oVendorData);
            this.getView().getModel("VendorViewModel").refresh(true);
        },

        onSaveVendorDetails: function () {
            var bVendorCreateUpdateFlag = "Update";
            this.fnValidateFieldsAndSaveVendorData(bVendorCreateUpdateFlag);
        }
    });
});