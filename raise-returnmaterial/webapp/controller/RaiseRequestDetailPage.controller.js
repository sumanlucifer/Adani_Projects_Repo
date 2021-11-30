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

    return BaseController.extend("com.agel.mmts.raisereturnmaterial.controller.RaiseRequestDetailPage", {
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
            this.oRouter.getRoute("RaiseRequestDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var that = this;
            var sObjectId = oEvent.getParameter("arguments").SOId;
            that.sObjectId = sObjectId;
            this._bindView("/SONumberDetailsSet(" + sObjectId + ")");
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
                        that.onReadDataIssueMaterialParents();
                    }
                }
            });
        },

        onReadDataIssueMaterialParents: function () {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            var that = this;
           

            that.oIssueMaterialModel = new JSONModel();
            this.MainModel.read("/SONumberDetailsSet(" + that.sObjectId + ")", {
                urlParameters: { "$expand": "IssuedMaterialParent/IssuedMaterialBOQ" },
                success: function (oData, oResponse) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    //   debugger;
                    that.dataBuilding(oData.IssuedMaterialParent.results);
                    //   that.oIssueMaterialModel.setData({ "Items": oData.results });
                    //   oTable.setModel(that.oIssueMaterialModel, "oIssueMaterialModel");
                    // that.onReadDataIssueMaterialChild(oData.results);
                }.bind(this),
                error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                   // sap.m.MessageBox.error("Data Not Found");
                }.bind(this),
            });
        },

        dataBuilding: function (ParentData) {
            this.ParentDataView = ParentData;
            for (var i = 0; i < ParentData.length; i++) {
                ParentData[i].ReturnedQty = null;

                if (ParentData[i].IssuedMaterialBOQ.results.length) {
                    this.ParentDataView[i].isStandAlone = false;
                    this.ParentDataView[i].ChildItemsView = ParentData[i].IssuedMaterialBOQ.results;
                }
                else {
                    this.ParentDataView[i].isStandAlone = true;
                    this.ParentDataView[i].ChildItemsView = [];
                }
                for (var j = 0; j < ParentData[i].IssuedMaterialBOQ.results.length; j++) {
                    ParentData[i].IssuedMaterialBOQ.results[j].ReturnedQty = null;
                }

            }
            this.arrangeDataView(this.ParentDataView);
        },

        // Arrange Data For View / Model Set
        arrangeDataView: function (ParentDataView) {
            var that = this;
            var oModel = new JSONModel({ "ChildItemsView": this.ParentDataView });
            this.getView().setModel(oModel, "TreeTableModelView");
            var oTable = this.byId("TreeTable");
            oTable.setModel(oModel);
            oTable.getModel("TreeTableModelView").refresh();
        },
   handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },
        /*   onPressRetrunAsset: function (oEvent) {
               //  debugger;
               //  var sObjectId = oEvent.getSource();
               oEvent.getSource().getParent().getCells()[6].getItems()[0].setEditable(true);
               oEvent.getSource().getParent().getCells()[6].getItems()[1].setVisible(true);
           },
   
           onPressSave: function (oEvent) {
               oEvent.getSource().getParent().getParent().getCells()[6].getItems()[0].setEditable(false);
               oEvent.getSource().getParent().getParent().getCells()[6].getItems()[1].setVisible(false);
           }, */

        onLiveChangeReturnQty: function (oEvent) {
            oEvent.getSource().setValueState("None");
            this.getView().byId("idBtnSubmit").setEnabled(true);
            var oValue = oEvent.getSource().getValue();
            var balanceQty = oEvent.getSource().getParent().getParent().getCells()[4].getText();
            var flag = 0;
            if (parseInt(oValue) > parseInt(balanceQty) || balanceQty == "") {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter return quantity lesser than or equal to balance quantity");
                this.getView().byId("idBtnSubmit").setEnabled(false);
                flag = 1;
            }

            if (parseInt(oValue) < 0 || oValue == "") {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter return quantity");
                this.getView().byId("idBtnSubmit").setEnabled(false);
            } else if (flag != 1) {
                oEvent.getSource().setValueState("None");
                this.getView().byId("idBtnSubmit").setEnabled(true);
            }
        },
        onEditQuantityPressed: function (oEvent) {

            var isPressed = oEvent.getParameter("pressed");
            if (isPressed) oEvent.getSource().getParent().getItems()[0].setEditable(true);
            else oEvent.getSource().getParent().getItems()[0].setEditable(false);
        },
        onCancelAssistanceRequestPress: function (oEvent) {
            this._oQRAssistantDialog.close();
        },

        onLiveChangeComment  : function(oEvent){
            var that = this;
            var inputModel = this.getView().getModel("qrAssistantModel");
            var oValue = oEvent.getSource().getValue();
            if ( oValue.length < 0 )
            {              
                inputModel.setProperty("/commentValueState","Error");
            }else{
                inputModel.setProperty("/commentValueState","None");
            }
            inputModel.refresh();   
        },

        onReasonSelectionChange : function(oEvent){
            var that = this;
            var inputModel = this.getView().getModel("qrAssistantModel");
            inputModel.setProperty("/reasonValueState","None");
            inputModel.refresh();
        },

        onPressSubmitRequest: function (oEvent) {
            //initialize the action
            var oModel = new JSONModel({
                "reason": null,
                "reasonValueState" : "None",
                "comment": null,
                "commentValueState" : "None"
            });
            this.getView().setModel(oModel, "qrAssistantModel")
            if (!this._oQRAssistantDialog) {
                this._oQRAssistantDialog = sap.ui.xmlfragment("com.agel.mmts.raisereturnmaterial.view.fragments.Reason", this);
                this.getView().addDependent(this._oQRAssistantDialog);
            }
            this._oQRAssistantDialog.open();
        },

        onSendAssistanceRequestPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            var that = this;
           
            var inputModel = this.getView().getModel("qrAssistantModel");
            var flag = 0;
            if (inputModel.getProperty("/comment") == null || inputModel.getProperty("/comment") == "") {
                flag = 1;
                inputModel.setProperty("/commentValueState","Error");                
            }

            if (inputModel.getProperty("/reason") == null || inputModel.getProperty("/reason") == "") {
                flag = 1;
                inputModel.setProperty("/reasonValueState","Error");
            }

            if (flag == 1) {
                sap.m.MessageBox.error("Please fill mandatory fields");
                return 0;
            }

            var oParentData = this.byId("TreeTable").getModel().getData().ChildItemsView;
            //  var aItems = oTable.getModel("oIssueMaterialModel").getData().Items;

            debugger;
            var ParentItem = [];
            // var BOQItem = [];
            for (var i = 0; i < oParentData.length; i++) {
                var obj = {
                    "BOQItem": []
                };

                obj["IssuedMaterialParentId"] = oParentData[i].ID;
                if (oParentData[i].IssuedMaterialBOQ.results.length < 1) {
                    obj["IsBOQPresent"] = false;
                    obj["ReturnQty"] = 0;
                } else {
                    obj["IsBOQPresent"] = true;
                    obj["ReturnQty"] = parseInt(oParentData[i].ReturnedQty);
                }
                for (var j = 0; j < oParentData[i].IssuedMaterialBOQ.results.length; j++) {
                    var childObj = {};
                    childObj["IssuedMaterialBOQId"] = oParentData[i].IssuedMaterialBOQ.results[j].ID;
                    childObj["ReturnQty"] = parseInt(oParentData[i].IssuedMaterialBOQ.results[j].ReturnedQty);
                }
                obj["BOQItem"].push(childObj);
                ParentItem.push(obj);
            }

            var ContractorId = that.getView().byId("idSimpleForm").getBindingContext().getObject().ID;
            var oPayload = {
                "SONumber": that.sObjectId,
                "UserName": "Test",
                "ContractorId": ContractorId,
                "ReasonToReturnMaterialId": 1,
                //inputModel.getProperty("/reason")
                "Comment": inputModel.getProperty("/comment"),
                //"Materials": aNewItems,
                "ParentItem": ParentItem
            };

            this.MainModel.create("/RaiseReturnMaterialRequestSet", oPayload, {
                success: function (oData, oResponse) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    that._oQRAssistantDialog.close();
                    sap.m.MessageBox.success(oData.Message);
                }.bind(this),
                error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                   // sap.m.MessageBox.error(oError.Message);
                }.bind(this),
            });
        },
        onReadDataIssueMaterials: function () {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            var that = this;
            
            var oTable = this.byId("idTblIssueMaterialItems");
            that.oIssueMaterialModel = new JSONModel();
            this.MainModel.read("/SONumberDetailsSet(" + that.sObjectId + ")/IssuedMaterials", {
                success: function (oData, oResponse) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    that.oIssueMaterialModel.setData({ "Items": oData.results });
                    oTable.setModel(that.oIssueMaterialModel, "oIssueMaterialModel");
                }.bind(this),
                error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                   // sap.m.MessageBox.error("Data Not Found");
                }.bind(this),
            });
        },
    });
});