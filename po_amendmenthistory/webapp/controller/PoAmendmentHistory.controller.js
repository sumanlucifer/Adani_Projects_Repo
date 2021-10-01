sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/core/routing/History",
    'sap/m/MessageToast',
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, History, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.poamendmenthistory.controller.PoAmendmentHistory", {
        onInit: function () {

            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                POId: null
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("PoAmendmentHistory").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sPOId = oEvent.getParameter("arguments").PODetails,
                sObjectPath = "/PurchaseOrderSet" + sPOId;

            this.getView().getModel("objectViewModel").setProperty("/POId", sPOId);
            this.fnGetPOData(sObjectPath);
        },

        fnGetPOData: function (sPath) {
            var sShowAmendedItems = this.getResourceBundle().getText("ShowAmendedItems");

            this.getView().byId("idShowAmendedBTN").setText(sShowAmendedItems);
            this.getView().setBusy(true);
            this.getView().getModel().read(sPath, {
                urlParameters: {
                    "$expand": "ParentLineItems"
                },
                success: function (oData) {
                    if (oData) {
                        this.fnSetVersionValues(oData.Version);
                        oData.ParentLineItems = oData.ParentLineItems.results;
                        var oHistoryModel = new JSONModel(oData);
                        this.getView().setModel(oHistoryModel, "AmendmentHistoryModel");
                        this.getView().getModel().refresh(true);
                        this.getView().setBusy(false);
                    }
                }.bind(this),
                error: function (oError) {
                    MessageBox.success(JSON.stringify(oError));
                    this.getView().setBusy(false);
                }
            });
        },

        fnSetVersionValues: function (sVersionNo) {
            var aVersionValues = [],
                // sVersion = this.getResourceBundle().getText("Version"),
                sCurrentVersion = this.getResourceBundle().getText("CurrentVersion");

            for (var i = 1; i < sVersionNo; i++) {
                var oVersionData = {
                    versionKey: i,
                    // versionText: i
                    versionText: i
                }
                aVersionValues.push(oVersionData);
            }
            var oCurrentVesionData = {
                versionKey: sVersionNo,
                versionText: sCurrentVersion + " " + sVersionNo
            }
            aVersionValues.unshift(oCurrentVesionData);

            this.getView().getModel("objectViewModel").setProperty("/Versions", aVersionValues);
            this.getView().getModel("objectViewModel").setProperty("/ActiveVersion", sVersionNo);
            this.getView().getModel("objectViewModel").setProperty("/SelectedVersion", sVersionNo);
        },

        onHistoryVersionChange: function (oEvent) {
            var iSelectedVersion = oEvent.getSource().getProperty("selectedKey"),
                iPoNumber = this.getView().getModel("AmendmentHistoryModel").getProperty("/PONumber"),
                iActiveVersion = this.getView().getModel("objectViewModel").getProperty("/ActiveVersion"),
                sVersion = this.getResourceBundle().getText("Version");

            MessageToast.show(sVersion + " " + iSelectedVersion + " is selected");
            this.getView().getModel("objectViewModel").setProperty("/SelectedVersion", iSelectedVersion);

            this.getView().setBusy(true);

            // if user selects current version 
            if (iSelectedVersion == iActiveVersion) {
                var sPOId = this.getView().getModel("objectViewModel").getProperty("/POId"),
                    sObjectPath = "/PurchaseOrderSet" + sPOId;

                this.fnGetPOData(sObjectPath);
            }
            else {
                this.fnGetAmendmentHistoryData(iSelectedVersion, iPoNumber);
            }
        },

        fnGetAmendmentHistoryData: function (iSelectedVersion, iPoNumber) {
            var oVersionFilter = new sap.ui.model.Filter("Version", FilterOperator.EQ, iSelectedVersion);
            var oPONumberFilter = new sap.ui.model.Filter("PONumber", FilterOperator.EQ, iPoNumber);

            this.getView().getModel().read("/PoAmendmentHistorySet", {
                filters: [oVersionFilter, oPONumberFilter],
                urlParameters: {
                    "$expand": "ParentLineItems"
                },
                success: function (oData) {
                    if (oData && oData.results && oData.results.length > 0) {
                        oData.results[0].ParentLineItems = oData.results[0].ParentLineItems.results;
                        this.getView().getModel("AmendmentHistoryModel").setData(oData.results[0]);
                        this.getView().getModel().refresh(true);
                        this.getView().setBusy(false);
                    }
                }.bind(this),
                error: function (oError) {
                    MessageBox.success(JSON.stringify(oError));
                    this.getView().setBusy(false);
                }
            });
        },

        onToggleShowAmendedItems: function (oEvent) {
            this.getView().setBusy(true);
            var sShowAmendedItems = this.getResourceBundle().getText("ShowAmendedItems"),
                sShowAllItems = this.getResourceBundle().getText("ShowAllItems"),
                bIsShowAmendedOnly = oEvent.getSource().getProperty("text") === sShowAmendedItems ? true : false,
                oAmendmentHistoryTableBinding = this.getView().byId("idAmendmentHistoryTBL").getBinding("items");

            if (bIsShowAmendedOnly) {
                var oAmendedFilter = new Filter("IsAmended", FilterOperator.EQ, true);
                oAmendmentHistoryTableBinding.filter([oAmendedFilter]);
                oEvent.getSource().setText(sShowAllItems);
            } else {
                oAmendmentHistoryTableBinding.filter([]);
                oEvent.getSource().setText(sShowAmendedItems);
            }
            this.getView().setBusy(false);
        }
    });
});