sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState',
    "jquery.sap.global"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState, jquery) {
    "use strict";

    return BaseController.extend("com.agel.mmts.storeinchargereturnmaterial.controller.LandingPage", {
        onInit: function () {
            jquery.sap.addUrlWhitelist("blob");
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteDetailsPage").attachPatternMatched(this._onObjectMatched, this);
        },

        // On Object Matched 
        _onObjectMatched: function (oEvent) {
            this.ReturnId = oEvent.getParameter("arguments").ReturnId;
            this.SOId = oEvent.getParameter("arguments").SOId
            this._bindView("/ReturnMaterialReserveSet(" + this.ReturnId + ")");
        },

        // View Level Binding
        _bindView: function (sObjectPath) {
            var that = this;
            var objectViewModel = this.getViewModel("objectViewModel");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                        // that.onReadDataIssueMaterialParents();
                        that.onReadDataReturnMaterialParents();
                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oViewModel = this.getViewModel("objectViewModel"),
                oElementBinding = oView.getElementBinding();
            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("notFound");
                return;
            }
        },

        handleToAllReturnMaterialBreadcrumPress: function (oEvent) {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteApp")
        },

        // onReadDataIssueMaterialParents: function() {
        //     this.MainModel.read("/SONumberDetailsSet(" + this.SOId + ")", {
        //         urlParameters: { "$expand": "IssuedMaterialParent,IssuedMaterialParent/IssuedMaterialBOQ" },
        //         success: function (oData, oResponse) {
        //             debugger;
        //             this.dataBuildingIssue(oData.ReturnedMaterialParent.results);
        //             //   that.oIssueMaterialModel.setData({ "Items": oData.results });
        //             //   oTable.setModel(that.oIssueMaterialModel, "oIssueMaterialModel");
        //             // that.onReadDataIssueMaterialChild(oData.results);
        //         }.bind(this),
        //         error: function (oError) {
        //             sap.m.MessageBox.error("Data Not Found");
        //         }
        //     });
        // },

        // dataBuildingIssue: function() {

        // },

        onReadDataReturnMaterialParents: function () {
            this.MainModel.read("/ReturnMaterialReserveSet(" + this.ReturnId + ")", {
                urlParameters: { "$expand": "ReturnedMaterialParent,ReturnedMaterialParent/ReturnedMaterialBOQ" },
                success: function (oData, oResponse) {
                    debugger;
                    this.dataBuildingReturn(oData.ReturnedMaterialParent.results);
                    //   that.oIssueMaterialModel.setData({ "Items": oData.results });
                    //   oTable.setModel(that.oIssueMaterialModel, "oIssueMaterialModel");
                    // that.onReadDataIssueMaterialChild(oData.results);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error("Data Not Found");
                }
            });
        },

        dataBuildingReturn: function (ParentData) {
            this.ParentDataView = ParentData;
            for (var i = 0; i < ParentData.length; i++) {
                this.ParentDataView[i].selectable = true;
                this.ParentDataView[i].isSelected = false;
                this.ParentDataView[i].ApprovedRetQuantity = null;
                if (ParentData[i].ReturnedMaterialBOQ.results.length) {
                    this.ParentDataView[i].isStandAlone = false;
                    this.ParentDataView[i].ChildItemsView = ParentData[i].ReturnedMaterialBOQ.results;
                    for (var j = 0; j < ParentData[i].ChildItemsView.length; j++) {
                        ParentData[i].ChildItemsView[j].selectable = false;
                    }
                }
                else {
                    this.ParentDataView[i].isStandAlone = true;
                    this.ParentDataView[i].ChildItemsView = [];
                }
            }
            this.arrangeDataView();
        },

        // Model Data Set To Table
        arrangeDataView: function () {
            var oModel = new JSONModel({ "ChildItemsView": this.ParentDataView });
            this.getView().setModel(oModel, "TreeTableModelView");
        },


    });
});