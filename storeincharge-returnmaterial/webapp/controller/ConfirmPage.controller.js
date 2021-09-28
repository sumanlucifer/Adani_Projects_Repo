sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState',
    "jquery.sap.global",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState, jquery, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.storeinchargereturnmaterial.controller.ConfirmPage", {
        onInit: function () {
            jquery.sap.addUrlWhitelist("blob");
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0,
            });
            this.getView().setModel(oViewModel, "objectViewModel");

            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("Summary").attachPatternMatched(this._onObjectMatched, this);
        },

        // On Object Matched 
        _onObjectMatched: function (oEvent) {
            this.ReturnId = oEvent.getParameter("arguments").id;
            this.onReadDataReturnMaterialParents();
        },

        onReadDataReturnMaterialParents: function () {
            this.MainModel.read("/ReturnMaterialReserveSet(" + this.ReturnId + ")", {
                urlParameters: { "$expand": "ReturnedMaterialParent,ReturnedMaterialParent/ReturnedMaterialBOQ" },
                success: function (oData, oResponse) {
                    //debugger;
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
            var ParentDataView = ParentData;
            for (var i = 0; i < ParentData.length; i++) {
                ParentDataView[i].selectable = true;
                ParentDataView[i].isSelected = false;
                ParentDataView[i].ApprovedRetQuantity = null;
                if (ParentData[i].ReturnedMaterialBOQ.results.length) {
                    ParentDataView[i].isStandAlone = false;
                    ParentDataView[i].ChildItemsView = ParentData[i].ReturnedMaterialBOQ.results;
                    for (var j = 0; j < ParentData[i].ChildItemsView.length; j++) {
                        ParentData[i].ChildItemsView[j].selectable = true;
                        ParentDataView[i].ChildItemsView[j].isSelected = false;
                    }
                }
                else {
                    ParentDataView[i].isStandAlone = true;
                    ParentDataView[i].ChildItemsView = [];
                }
            }
            //debugger;
            var oModel = this.getOwnerComponent().getModel("TreeTableModelView");
            var oMOdelData = oModel.getData();
            oMOdelData.ReturnData = { "ChildItemsView": ParentDataView };
            oModel.setData(oMOdelData);
        },

        onReturnConfirm: function () {
            var oModel = this.getViewModel();
            oModel.create("/ReturnMaterialPostingEdmSet", { "ID": this.ReturnId }, {
                success: function (oRes) {
                    if (oRes.Success) {
                        sap.m.MessageBox.success("Return request action is submitted successfully.");
                        this.getOwnerComponent().getModel().refresh();
                        this.getOwnerComponent().getRouter().navTo("RouteApp");
                    }
                }.bind(this),
                error: (oErr) => { debugger }
            })
        }

    });
});