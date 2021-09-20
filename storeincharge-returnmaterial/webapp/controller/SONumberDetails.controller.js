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

    return BaseController.extend("com.agel.mmts.storeinchargereturnmaterial.controller.SONumberDetails", {
        onInit: function () {
            jquery.sap.addUrlWhitelist("blob");
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0,
                partialApproval: false,
                enableDone: false,
                returnMode: null
            });
            this.getView().setModel(oViewModel, "objectViewModel");

            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);

            // var oModel = new JSONModel({ "IssueData": null, "ReturnData": null });
            // this.getOwnerComponent().setModel(oModel, "TreeTableModelView");

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
                        objectViewModel.setProperty("/partialApproval", false);
                        that.onReadDataIssueMaterialParents();
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

        onReadDataIssueMaterialParents: function () {
            this.MainModel.read("/SONumberDetailsSet(" + this.SOId + ")", {
                urlParameters: { "$expand": "IssuedMaterialParent,IssuedMaterialParent/IssuedMaterialBOQ" },
                success: function (oData, oResponse) {
                    // //debugger;
                    this.dataBuildingIssue(oData.IssuedMaterialParent.results);
                    //   that.oIssueMaterialModel.setData({ "Items": oData.results });
                    //   oTable.setModel(that.oIssueMaterialModel, "oIssueMaterialModel");
                    // that.onReadDataIssueMaterialChild(oData.results);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error("Data Not Found");
                }
            });
        },

        dataBuildingIssue: function (ParentData) {
            var ParentDataView = ParentData;
            for (var i = 0; i < ParentData.length; i++) {
                if (ParentData[i].IssuedMaterialBOQ.results.length) {
                    ParentDataView[i].isStandAlone = false;
                    ParentDataView[i].ChildItemsView = ParentData[i].IssuedMaterialBOQ.results;
                }
                else {
                    ParentDataView[i].isStandAlone = true;
                    ParentDataView[i].ChildItemsView = [];
                }
            }
            //debugger;
            var oModel = this.getOwnerComponent().getModel("TreeTableModelView");
            var oMOdelData = oModel.getData();
            oMOdelData.IssueData = { "ChildItemsView": ParentDataView };
            oModel.setData(oMOdelData);
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

        onViewLineItemPress: function (oEvent) {
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.title = "Line Items";
            if (!this.lineItemsDialog) {
                this.lineItemsDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.storeinchargereturnmaterial.view.fragments.viewLineItems",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    oDialog.setTitle(oDetails.title);
                    return oDialog;
                });
            }
            this.lineItemsDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onViewLineItemsClosePress: function (oEvent) {
            this.lineItemsDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        onApproveAllPress: function (oEvent) {
            // var oModel = this.getViewModel("TreeTableModelView");
            // var oReturnData = oModel.getData().ReturnData;
            // var oPayload = this._constructPayload(oReturnData.ChildItemsView, "Approved");
            // this._fireApproveRequest(oPayload);
            var oObjectModelData = this.getViewModel("objectViewModel").getData();
            oObjectModelData.returnMode = "Approved";
            oObjectModelData.enableDone = true;
            this.getViewModel("objectViewModel").setData(oObjectModelData);
        },

        onRejectAllPress: function (oEvent) {
            // var oModel = this.getViewModel("TreeTableModelView");
            // var oReturnData = oModel.getData().ReturnData;
            // var oPayload = this._constructPayload(oReturnData.ChildItemsView, "Rejected");
            // this._fireApproveRequest(oPayload);
            var oObjectModelData = this.getViewModel("objectViewModel").getData();
            oObjectModelData.returnMode = "Rejected";
            oObjectModelData.enableDone = true;
            this.getViewModel("objectViewModel").setData(oObjectModelData);
        },

        onPartialApprovePress: function (oEvent) {
            // var oModel = this.getViewModel("TreeTableModelView");
            // var oReturnData = oModel.getData().ReturnData;
            // var oPayload = this._constructPayload(oReturnData.ChildItemsView, "Partially Approved");
            // if (!oPayload.ReturnMaterialRequestParent.length && !oPayload.ReturnMaterialRequestBOQ.length)
            //     MessageBox.error("No valid item found return");
            // else
            //     this._fireApproveRequest(oPayload);
            var oObjectModelData = this.getViewModel("objectViewModel").getData();
            oObjectModelData.returnMode = "Partially Approved";
            oObjectModelData.enableDone = true;
            this.getViewModel("objectViewModel").setData(oObjectModelData);
        },

        onDonePress: function (oEvent) {
            debugger;
            var oModel = this.getOwnerComponent().getModel("TreeTableModelView");
            var sReturnMode = this.getViewModel("objectViewModel").getProperty("/returnMode");
            var oReturnData = oModel.getData().ReturnData;
            var sStatus = this.getView().byId("idStatus").getText();
            if (sStatus === "PENDING") {
                var oPayload = this._constructPayload(oReturnData.ChildItemsView, sReturnMode);
                if (!oPayload.ReturnMaterialRequestParent.length && !oPayload.ReturnMaterialRequestBOQ.length)
                    MessageBox.error("No valid item found return");
                else
                    this._fireApproveRequest(oPayload);
            }
            else {
                this.getOwnerComponent().getRouter().navTo("Summary", { id: this.ReturnId });
            }
        },

        _constructPayload: function (oData, sStatus) {
            var oPayload = {
                "ID": this.ReturnId,
                "Status": sStatus,
                "ReturnMaterialRequestParent": [],
                "ReturnMaterialRequestBOQ": []
            };
            for (var i = 0; i < oData.length; i++) {
                var oRet = {
                    "ID": oData[i].ID,
                    "ApprovedQty": oData[i].ApprovedRetQuantity
                };
                if (sStatus === "Partially Approved") {
                    if (oData[i].isSelected && oData[i].ApprovedRetQuantity > 0 && oData[i].ApprovedRetQuantity <= oData[i].RequirementQuantity)
                        oPayload.ReturnMaterialRequestParent.push(oRet);
                }
                else
                    oPayload.ReturnMaterialRequestParent.push(oRet);
                for (var j = 0; j < oData[i].ChildItemsView.length; j++) {
                    var oRetBoq = {
                        "ID": oData[i].ChildItemsView[j].ID,
                        "ApprovedQty": oData[i].ChildItemsView[j].ApprovedRetQuantity
                    }
                    if (sStatus === "Partially Approved") {
                        if (oData[i].ChildItemsView[j].isSelected && oData[i].ChildItemsView[j].ApprovedRetQuantity > 0 && oData[i].ChildItemsView[j].ApprovedRetQuantity <= oData[i].ChildItemsView[j].RequirementQuantity)
                            oPayload.ReturnMaterialRequestBOQ.push(oRetBoq);
                    }
                    else
                        oPayload.ReturnMaterialRequestBOQ.push(oRetBoq);

                }
            }

            return oPayload;
        },

        _fireApproveRequest: function (oPayload) {
            var oModel = this.getViewModel();
            oModel.create("/ReturnMaterialRequestSet", oPayload, {
                success: function (oRes) {
                    if (oRes.Success) {
                        this.getOwnerComponent().getRouter().navTo("Summary", { id: oRes.ID });
                    }
                }.bind(this),
                error: (oErr) => { debugger }
            })
        },

        onReturnItemSelect: function (oEvent) {
            //debugger;
            var oModel = this.getOwnerComponent().getModel("TreeTableModelView");
            var oData = oModel.getData().ReturnData.ChildItemsView;
            var bCheck = false;
            for (var i = 0; i < oData.length; i++) {
                if (oData[i].isSelected && !bCheck)
                    bCheck = true;
                for (var j = 0; j < oData[i].ChildItemsView.length; j++) {
                    if (oData[i].ChildItemsView[j].isSelected && !bCheck)
                        bCheck = true;
                }
            }
            this.getViewModel("objectViewModel").setProperty("/partialApproval", bCheck);
        },

    });
});