sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/base/util/deepExtend',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/Dialog",
    '../utils/formatter',
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button, Dialog, formatter) {
    "use strict";
    return BaseController.extend("com.agel.mmts.lognewconsumption.controller.NewConsumptionPage", {
        formatter: formatter,
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null,
                csvFile: "file"
            });
            this.setModel(oViewModel, "objectViewModel");
            //    this._initializeCreationModels();
            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};
            // get Owener Component Model
            // Main Model Set
            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);
            //Router Object
            this.oRouter = this.getRouter();
            this._onObjectMatched();
        },
        _onObjectMatched: function (oEvent) {
            var that = this;
            //var sObjectId = oEvent.getParameter("arguments").SOId;
            var sObjectId = 1;
            that.sObjectId = sObjectId;
            this._bindView("/SONumberDetailsSet(" + sObjectId + ")");
            this.readConsumedItemsTreeData(sObjectId);
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
        readConsumedItemsTreeData: function (SOID) {
            var that = this;
            that.oIssueMaterialModel = new JSONModel();
            this.MainModel.read("/SONumberDetailsSet(" + SOID + ")", {
                urlParameters: { "$expand": "IssuedMaterialParent/IssuedMaterialBOQ" },
                success: function (oData, oResponse) {

                    that.dataBuilding(oData.IssuedMaterialParent.results);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error("Data Not Found");
                }
            });
        },
        dataBuilding: function (ParentData) {
            this.ParentDataView = ParentData;
            for (var i = 0; i < ParentData.length; i++) {
                //  for (var j = 0; j < ParentData[i].MDCCBOQItems.length; j++) {
                if (ParentData[i].IssuedMaterialBOQ.results.length) {
                    this.ParentDataView[i].isStandAlone = false;
                    this.ParentDataView[i].ChildItemsView = ParentData[i].IssuedMaterialBOQ.results;
                }
                else {
                    this.ParentDataView[i].isStandAlone = true;
                    this.ParentDataView[i].ChildItemsView = [];
                }
                //   }
            }
            this.arrangeDataView(this.ParentDataView);
        },
        arrangeDataView: function (ParentDataView) {
            var that = this;
            var oModel = new JSONModel({ "ChildItemsView": this.ParentDataView });
            this.getView().setModel(oModel, "TreeTableModelView");
            var oTable = this.byId("TreeTable");
            oTable.setModel(oModel);
            oTable.getModel("TreeTableModelView").refresh();
        },
        onSendConsumptionRequestPress: function (oEvent) {
            var that = this;


            MessageBox.confirm("Do you want to submit the line items?", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that.onSaveButtonConfirmPress(oEvent);
                    }
                }
            });

        },

        onSaveButtonConfirmPress: function () {
            var oParentData = this.byId("TreeTable").getModel().getData().ChildItemsView;
            var that = this;
            var ParentItem = [];
            // var BOQItem = [];
            for (var i = 0; i < oParentData.length; i++) {
                var obj = {
                    "BOQItem": []
                };
                obj["IssuedMaterialParentId"] = oParentData[i].ID;
                if (oParentData[i].IssuedMaterialBOQ.results.length < 1) {
                    obj["IsChildPresent"] = false;
                    obj["ConsumedQty"] = 0;
                } else {
                    obj["IsChildPresent"] = true;
                    obj["ConsumedQty"] = parseInt(oParentData[i].ReturnedQty);
                }
                for (var j = 0; j < oParentData[i].IssuedMaterialBOQ.results.length; j++) {
                    var childObj = {};
                    childObj["IssuedMaterialBOQId"] = oParentData[i].IssuedMaterialBOQ.results[j].ID;
                    childObj["ConsumedQty"] = parseInt(oParentData[i].IssuedMaterialBOQ.results[j].ReturnedQty);
                }
                obj["BOQItem"].push(childObj);
                ParentItem.push(obj);
            }
            var oPayload = {
                "UserName": "Agel",
                "SONumberId": that.sObjectId,
                "ParentItem": ParentItem
            };
            this.MainModel.create("/ConsumptionPostingReserveEdmSet", oPayload, {
                success: function (oData, oResponse) {
                    if (oData.Success === true) {
                        that.submitConsumptionPostingID(oData.ConsumptionPostingReserveId);
                    }
                     else {
                        sap.m.MessageBox.success("Something went wrong!");
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(oError.Message);
                }
            });
        },
        submitConsumptionPostingID: function (CID) {
            var oPayload = {
                "UserName": "Agel",
                "ConsumptionPostingReserveId": CID
            };
            this.MainModel.create("/ConsumptionPostingEdmSet", oPayload, {
                success: function (oData, oResponse) {
                    if (oData.Success === true) {
                        sap.m.MessageBox.success("Consumption has been posted and reserved successfully!", {
                            title: "Success",
                            onClose: function (oAction1) {
                                if (oAction1 === sap.m.MessageBox.Action.OK) {
                                    this._navToCrossApp();
                                }
                            }.bind(this)
                        });
                    }

                    else {
                        sap.m.MessageBox.success("Something went wrong!");
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(oError.Message);
                }
            });
        },
        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },
        onBeforeRebindTreeTable: function (oEvent) {

            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.parameters["expand"] = "IssuedMaterialBOQ";
            mBindingParams.parameters["navigation"] = { "IssuedMaterialParentSet": "IssuedMaterialBOQ" };
            mBindingParams.filters.push(new sap.ui.model.Filter("SONumberId/ID", sap.ui.model.FilterOperator.EQ, this.sObjectId));
        },
        onBeforeRebindRestTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("SONumberId/ID", sap.ui.model.FilterOperator.EQ, this.sObjectId));
        },
        onConsumedItemsTablePress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },
        _showObject: function (oItem) {
            var that = this;
            var sObjectPath = oItem.getBindingContext().sPath;
            this.oRouter.navTo("RouteConsumptionItemsDetailPage", {
                POId: sObjectPath.slice("/ConsumptionPostingReserveSet".length),// /StockParentItemSet(123)->(123)
                SOId: this.sObjectId
            },
                false
            );
        },
        onLiveChangeReturnQty: function (oEvent) {
            var iIssuedQuantity = parseInt(oEvent.getSource().getParent().getParent().getCells()[3].getText());
            var iReturnQuantity = parseInt(oEvent.getSource().getParent().getItems()[0].getValue());
            var oValue = oEvent.getSource().getValue();

            if (oValue == "") {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter some value");
                this.getView().byId("btnSubmit").setEnabled(false);
                return 0;
            }
            if (iReturnQuantity < 0) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter positive value");
                this.getView().byId("btnSubmit").setEnabled(false);
                return 0;
            }
            if (iReturnQuantity < iIssuedQuantity) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter less inspected quantity than quantity");
                 this.getView().byId("btnSubmit").setEnabled(false);
            }
            else {
                oEvent.getSource().setValueState("None");
                 this.getView().byId("btnSubmit").setEnabled(true);
            }
        },
        onEditQuantityPressed: function (oEvent) {

            var isPressed = oEvent.getParameter("pressed");
            if (isPressed) oEvent.getSource().getParent().getItems()[0].setEditable(true);
            else oEvent.getSource().getParent().getItems()[0].setEditable(false);
        },
        _navToCrossApp1: function (oItem) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RoutePackingDeatilsPage", {
                    packingListID: sObjectPath.slice("/PackingLists".length) // /PurchaseOrders(123)->(123)
                });
            });
            console.log(oItem.getBindingContext().getObject().ID)
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: "PackingList",
                    action: "manage"
                },
                params: {
                    "packingListID": oItem.getBindingContext().getObject().ID,
                    "status": "SAVED"
                }
            })) || "";
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            });
        }
    });
});