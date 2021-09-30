sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    'sap/m/Token',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    'sap/m/MessageBox',
    '../utils/formatter',
    'sap/m/MessageToast'
],
    function (BaseController, Fragment, Device, JSONModel, Token, ColumnListItem, Label, MessageBox, formatter, MessageToast) {
        "use strict";
        return BaseController.extend("com.agel.mmts.materialreservation.controller.MaterialReservationPage", {
            formatter: formatter,
            onInit: function () {
                //jQuery.sap.addUrlWhitelist("blob");
                this.mainModel = this.getOwnerComponent().getModel();
                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                //view model instatiation
                this.createInitialModel();
                this._createHeaderDetailsModel();
                this._createItemDataModel();
                var suggestionModel = new JSONModel([]);
                this.getView().setModel(suggestionModel, "suggestionModel");
                this.mainModel.setSizeLimit(1000);
            },
            createInitialModel: function () {
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    isHeaderFieldsVisible: false,
                    isItemFieldsVisible: false,
                    isButtonVisible: true
                });
                this.setModel(oViewModel, "objectViewModel");
                this.getView().byId("idBtnSubmit").setEnabled(false);
            },
            _createHeaderDetailsModel: function () {
                var oModel = new JSONModel({
                    movementTypeVal: [{
                        value: "311",
                        Text: "311 - Issue Reservation"
                    }
                    ],
                    MovementType: "311",
                    WBS: null,
                    GoodsRecipient: null,
                    Plant: null,
                    ReceivingLocation: null,
                    CostCenter: null,
                    GLAccount: null,
                    ProfitCenter: null,
                    ContractorId: null,
                    CompanyCode: null,
                    UnloadPoint: null
                });
                this.getView().setModel(oModel, "HeaderDetailsModel")
            },
            _createItemDataModel: function () {
                var oModel = new JSONModel([]);
                this.getView().setModel(oModel, "reservationTableModel");
            },
            onAddReservationItemsPress: function (oEvent) {
                var oModel = this.getViewModel("reservationTableModel");
                var oItems = oModel.getData().map(function (oItem) {
                    return Object.assign({}, oItem);
                });
                oItems.push({
                    Material: "",
                    Description: "",
                    StorageLocation: "",
                    Quantity: "",
                    BaseUnit: "",
                    Batch: "",
                    M: true,
                    UnloadPoint: "",
                    AvailableQty: null
                });
                oModel.setData(oItems);
            },
            onDeleteReservationItemPress: function (oEvent) {
                this.packingListObj = oEvent.getSource().getBindingContext("reservationTableModel").getObject();
                var iRowNumberToDelete = parseInt(oEvent.getSource().getBindingContext("reservationTableModel").getPath().slice("/".length));
                var aTableData = this.getViewModel("reservationTableModel").getProperty("/");
                aTableData.splice(iRowNumberToDelete, 1);
                this.getView().getModel("reservationTableModel").refresh();
            },
            _handleMessageBoxOpen: function (sMessage, sMessageBoxType, iRowNumberToDelete) {
                MessageBox[sMessageBoxType](sMessage, {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (iRowNumberToDelete, oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this._deleteBOQRow(iRowNumberToDelete);
                        }
                    }.bind(this, iRowNumberToDelete)
                });
            },

            onMaterialCodeChange: function (oEvent) {

                var reservationListObj = oEvent.getParameter("selectedRow").getBindingContext("suggestionModel").getObject();
                if (!this._validateItemSelected(reservationListObj)) {
                    return;
                }
                var sItemPath = oEvent.getSource().getParent().getBindingContextPath();
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/Description", reservationListObj.Description);
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/BaseUnit", reservationListObj.UOM);
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/UnloadPoint", reservationListObj.UnloadPoint);
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/Material", reservationListObj.MaterialCode);
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/StorageLocation", reservationListObj.StorageLocation);
                this.getView().getModel("reservationTableModel").setProperty(sItemPath + "/AvailableQty", reservationListObj.AvailableQty);

            },

            _validateItemSelected: function (obj) {
                var MaterialCode = obj.MaterialCode;
                var isbValid = true;
                var ItemData = this.getView().getModel("reservationTableModel").getData();
                for (var i = 0; i < ItemData.length; i++) {
                    if (ItemData[i].Material === MaterialCode) {
                        isbValid = false;
                        sap.m.MessageBox.alert("Please select different material code");
                        return;
                    }
                }
                return isbValid;
            },
            
            onLiveChangeQty: function (oEvent) {
                oEvent.getSource().setValueState("None");
                this.getView().byId("idBtnSubmit").setEnabled(true);
                var oValue = oEvent.getSource().getValue();
                var balanceQty = oEvent.getSource().getParent().getCells()[3].getText();
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
            onPressGo: function () {
                var oHeaderData = this.getViewModel("HeaderDetailsModel").getData();
                if (!this._validateHeaderData(oHeaderData)) {
                    return;
                }
                this.getViewModel("objectViewModel").setProperty("/isItemFieldsVisible", true);
                var Plant = this.byId("idPlant").getSelectedKey();
                var StorageLocation = this.byId("idStorageLocation").getValue();
                var UnloadPoint = this.byId("idUnloadPoint").getValue();
                this.getMaterialSuggestionData(Plant, StorageLocation, UnloadPoint);
            },
            getMaterialSuggestionData: function (Plant, StorageLocation, UnloadPoint) {
                var PlantFilter = new sap.ui.model.Filter({
                    path: "PlantCode",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: Plant
                });
                var StorageLocationFilter = new sap.ui.model.Filter({
                    path: "StorageLocation",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: StorageLocation
                });
                var UnloadPointFilter = new sap.ui.model.Filter({
                    path: "UnloadPoint",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: UnloadPoint
                });
                var filter = [];
                filter.push(PlantFilter,StorageLocationFilter,UnloadPointFilter);
                // filter.push(StorageLocationFilter);
                this.getOwnerComponent().getModel().read("/MaterialAvailabilityViewSet", {
                    filters: [filter],
                    // urlParameters: {
                    //     "$expand": "PackingList"
                    // },
                    success: function (oData, oResponse) {
                        var suggestionModel = new JSONModel(oData.results);
                        this.getView().setModel(suggestionModel, "suggestionModel");
                        this.getViewModel("objectViewModel").setProperty("/isButtonVisible", false);

                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },
            onSubmitReservation: function (oEvent) {
                var oHeaderData = this.getViewModel("HeaderDetailsModel").getData();
                var aReservationItems = this.getViewModel("reservationTableModel").getData();
                if (!this._validateHeaderData(oHeaderData)) {
                    return;
                }
                this._handleMessageBoxForReservationList("Do you want to submit these Reservation items?");
            },
            onCancelReservation: function () {
                this._handleMessageBoxForCancelReservation("Do you want to cancel these Reservation items?");
            },
            _handleMessageBoxForReservationList: function (sMessage) {
                var that = this;
                sap.m.MessageBox.confirm(sMessage, {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            that._createReservationList();
                        }
                    }
                });
            },
            _handleMessageBoxForCancelReservation: function (sMessage) {
                var that = this;
                sap.m.MessageBox.confirm(sMessage, {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            that.setInitialModel();
                        }
                    }
                });
            },
            _validateHeaderData: function (data) {
                var bValid = true;
                if (!data.Plant) {
                    this.byId("idPlant").setValueState("Error");
                    this.byId("idPlant").setValueStateText("Please enter plant value");
                    bValid = false;
                } else {
                    this.byId("idPlant").setValueState("None");
                    this.byId("idPlant").setValueStateText(null);
                }
                if (!data.StorageLocation) {
                    this.byId("idStorageLocation").setValueState("Error");
                    this.byId("idStorageLocation").setValueStateText("Please enter storage value");
                    bValid = false;
                } else {
                    this.byId("idStorageLocation").setValueState("None");
                    this.byId("idStorageLocation").setValueStateText(null);
                    this.getViewModel("objectViewModel").setProperty("/isHeaderFieldsVisible", true);
                    this.byId("idPlant").setEnabled(false);
                    this.byId("idStorageLocation").setEnabled(false);
                    this.byId("idUnloadPoint").setEnabled(false);

                }
                if (!data.CostCenter) {
                    this.byId("idCostCenter").setValueState("Error");
                    this.byId("idCostCenter").setValueStateText("Please enter cost value");
                    bValid = false;
                } else {
                    this.byId("idCostCenter").setValueState("None");
                    this.byId("idCostCenter").setValueStateText(null);
                }
                if (!data.ReceivingLocation) {
                    this.byId("idRecievingLocation").setValueState("Error");
                    this.byId("idRecievingLocation").setValueStateText("Please enter reveiving location value");
                    bValid = false;
                } else {
                    this.byId("idRecievingLocation").setValueState("None");
                    this.byId("idRecievingLocation").setValueStateText(null);
                }
                if (!data.GoodsRecipient) {
                    this.byId("idGoodReciept").setValueState("Error");
                    this.byId("idGoodReciept").setValueStateText("Please enter goods recipient");
                    bValid = false;
                } else {
                    this.byId("idGoodReciept").setValueState("None");
                    this.byId("idGoodReciept").setValueStateText(null);
                }
                if (!data.GLAccount) {
                    this.byId("idGLAccount").setValueState("Error");
                    this.byId("idGLAccount").setValueStateText("Please enter GL Account recipient");
                    bValid = false;
                } else {
                    this.byId("idGLAccount").setValueState("None");
                    this.byId("idGLAccount").setValueStateText(null);
                }
                if (!data.CompanyCode) {
                    this.byId("idSelCompanyCode").setValueState("Error");
                    this.byId("idSelCompanyCode").setValueStateText("Please enter company code recipient");
                    bValid = false;
                } else {
                    this.byId("idSelCompanyCode").setValueState("None");
                    this.byId("idSelCompanyCode").setValueStateText(null);
                }
                if (!data.ContractorId) {
                    this.byId("idContractor").setValueState("Error");
                    this.byId("idContractor").setValueStateText("Please enter contractor id recipient");
                    bValid = false;
                } else {
                    this.byId("idContractor").setValueState("None");
                    this.byId("idContractor").setValueStateText(null);
                }
                return bValid;
            },
            _validateItemData: function (itemData) {
                var bValid = true;
                if (itemData.length > 0) {
                    var aReservationItems = this.getView().getModel("reservationTableModel").getData();
                    for (let i = 0; i < aReservationItems.length; i++) {
                        if (!aReservationItems[i].MaterialCode) {
                            bValid = false;
                            sap.m.MessageBox.alert("Please select Material Code.");
                            return;
                        }
                        if (!aReservationItems[i].Qty) {
                            bValid = false;
                            sap.m.MessageBox.alert("Please select quanity for the material " + aReservationItems[i].MaterialCode);
                            return;
                        }
                    }
                }
                else {
                    bValid = false;
                    sap.m.MessageBox.alert("Please add atleast one item");
                }
                return bValid;
            },
            _createReservationList: function () {
                var oAdditionalData = this.getViewModel("HeaderDetailsModel").getData();
                var aReservationItems = this.getViewModel("reservationTableModel").getData();
                this.callIssueReservationService(oAdditionalData, aReservationItems);
            },
            callIssueReservationService: function (oAdditionalData, aReservationItems) {
                aReservationItems = aReservationItems.map(function (item) {
                    return {
                        Name: item.Description,
                        Material: item.Material,
                        Description: item.Description,
                        StorageLocation: item.StorageLocation,
                        Quantity: parseInt(item.Quantity),
                        BaseUnit: item.BaseUnit,
                        UnloadPoint: item.UnloadPoint,
                        Batch: item.Batch,
                        IsChildItem: false,
                        SpecialStockIndicator: item.M
                    };
                });
                var oPayload = {
                    "Plant": oAdditionalData.Plant,
                    "MovementType": "311",
                    "GoodsRecipient": oAdditionalData.GoodsRecipient,
                    "CostCenter": oAdditionalData.CostCenter,
                    "WBS": oAdditionalData.WBS,
                    "ProfitCenter": oAdditionalData.ProfitCenter,
                    "ReceivingLocation": oAdditionalData.ReceivingLocation,
                    "GLAccount": oAdditionalData.GLAccount,
                    "ContractorId": oAdditionalData.ContractorId,
                    "CompanyCode": oAdditionalData.CompanyCode,
                    "UserName": "AGEL",
                    "IssueMaterialReservationItems": aReservationItems
                };
                this.mainModel.create("/IssueMaterialReservationEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        if (oData.Success === true) {
                            sap.m.MessageBox.success(oData.Message);
                            this.setInitialModel();
                            var objectViewModel = this.getViewModel("objectViewModel");
                        }
                        else {
                            sap.m.MessageBox.error(oData.Message);
                        }
                    }.bind(this),
                    error: function (oError) {
                        // sap.m.MessageBox.success("Something went Wrong!");
                        var objectViewModel = this.getViewModel("objectViewModel");
                        // objectViewModel.setProperty("/isViewQRMode", false);
                    }.bind(this)
                })
            },
          
            setInitialModel: function () {
                this._createHeaderDetailsModel();
                this._createItemDataModel();
                this.createInitialModel();
                this.getView().byId("idPlant").setEnabled(true);
                this.getView().byId("idStorageLocation").setEnabled(true);
                this.byId("idUnloadPoint").setEnabled(true);
            }
        });
    });
