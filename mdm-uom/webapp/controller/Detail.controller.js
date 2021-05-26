sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.mdmuom.controller.Detail", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                idSFDisplay: true,
                idSFEdit: false,
                idBtnEdit: true,
                idBtnSave: false,
                idBtnCancel: false
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            this.mainModel = this.getComponentModel();
        },

        _onObjectMatched: function (oEvent) {
            this.sParentID = oEvent.getParameter("arguments").parentMaterial;
            var sLayout = oEvent.getParameter("arguments").layout;            

            this.getView().getModel().setProperty("/busy", false);
            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);

            if (this.sParentID === "new") {

                this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
                this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);

                this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
                this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);
                this.mainModel.setDeferredBatchGroups(["createGroup"]);

                this._oNewContext = this.mainModel.createEntry("/MasterUOMSet", {
                    groupId: "createGroup",
                    properties: {
                        ID: "",
                        Name: "",
                        Description: ""
                    }
                });
                this._oObjectPath = this._oNewContext.sPath;
                //this.getView().setBindingContext(this._oNewContext);
                this.getView().bindElement({
                    path: this._oObjectPath
                });
            } else {
                this._bindView("/MasterUOMSet" + this.sParentID);
            }
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        onEdit: function () {

            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);
        },

        onSave: function () {
                var that = this;
                var oPayload = {};
                oPayload.Name = this.byId("nameEdit").getValue();
                oPayload.Description = this.byId("nameDesc").getValue();

                this.mainModel.create("/MasterUOMSet", oPayload, {
                    success: function (oData, oResponse) {
                        sap.m.MessageBox.success("UOM Created Successfully");
                      //  sap.m.MessageBox.success(oData.Message);
                        // this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
                        this.getView().getModel().refresh();
                        that.onCancel();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
        },

        onCancel: function () {
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", false);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", true);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", false);

            if (this.sParentID === "new") {
                this.oRouter.navTo("LandingPage", {
                },
                false
                );
            }
        },

    });
});            
