sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    // 'sap/m/Token',
    // 'sap/m/ColumnListItem',
    // 'sap/m/Label',
    'sap/m/MessageBox',
    '../utils/formatter',
    // 'sap/m/MessageToast'
],
    function (BaseController, Fragment, Device, JSONModel, MessageBox, formatter) {
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
                this.fnSetValueStatesNone();
            },
            createInitialModel: function () {
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    isHeaderFieldsVisible: false,
                    isItemFieldsVisible: false,
                    isButtonVisible: true,
                    popupSaveEnable: true,
                    popupEditable: false
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
                    CostCenter: '',
                    GLAccount: '',
                    ProfitCenter: null,
                    ContractorId: null,
                    CompanyCode: null
                    // UnloadPoint: null
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
                    // UnloadPoint: "",
                    AvailableQty: null,
                    PopupItems: null,
                    IsBOQApplicable: ""
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
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true);

                var reservationListObj = oEvent.getParameter("selectedItem").getBindingContext("suggestionModel").getObject();
                if (!this._validateItemSelected(reservationListObj)) {
                    return;
                }
                var sItemPath = oEvent.getSource().getParent().getBindingContextPath();
                var oReservationModel = this.getView().getModel("reservationTableModel");
                oReservationModel.setProperty(sItemPath + "/BaseUnit", reservationListObj.UOM);
                oReservationModel.setProperty(sItemPath + "/Description", reservationListObj.Description);
                // oReservationModel.setProperty(sItemPath + "/UnloadPoint", reservationListObj.UnloadPoint);
                oReservationModel.setProperty(sItemPath + "/Material", reservationListObj.MaterialCode);
                oReservationModel.setProperty(sItemPath + "/StorageLocation", reservationListObj.StorageLocation);
                oReservationModel.setProperty(sItemPath + "/AvailableQty", reservationListObj.AvailableQty);
                oReservationModel.setProperty(sItemPath + "/IsBOQApplicable", reservationListObj.IsBOQApplicable);

                var oMaterialCodeFilter = new sap.ui.model.Filter("MaterialCode", "EQ", reservationListObj.MaterialCode);
                // var oMaterialCodeFilter = new sap.ui.model.Filter("MaterialCode", "EQ", '6781438673');

                this.mainModel.read("/MasterMaterialSet", {
                    urlParameters: {
                        "$expand": "MasterBOQs/MasterBOQItem/StoreStockBOQs",
                    },
                    filters: [oMaterialCodeFilter],
                    success: function (oData, Res) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false);
                        var aItems = [];
                        for (var i = 0; i < oData.results[0].MasterBOQs.results.length; i++) {
                            var oBoq = oData.results[0].MasterBOQs.results[i].MasterBOQItem;
                            oBoq.BaseQty = oData.results[0].MasterBOQs.results[i].BaseQty;
                            if (oData.results[0].MasterBOQs.results[i].MasterBOQItem.StoreStockBOQs.results.length === 0)
                                oBoq.StockAvailable = false;
                            else
                                oBoq.StockAvailable = true;
                            oBoq.AvailableQty = 0;
                            oBoq.Quantity = 0;
                            oBoq.SelectedWpp = null;
                            aItems.push(oBoq);
                        }
                        oReservationModel.setProperty(sItemPath + "/PopupItems", aItems);
                    }.bind(this),
                    error: function (oError) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false);
                        // sap.m.MessageBox.error(JSON.stringify(oError));
                    }.bind(this),
                })
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
                var oBindingObject = oEvent.getSource().getBindingContext("reservationTableModel").getObject();
                // var balanceQty = oEvent.getSource().getParent().getCells()[3].getText();
                var balanceQty = oBindingObject.AvailableQty;
                var flag = 0;
                if (parseFloat(oValue) > parseFloat(balanceQty) || balanceQty == "") {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Please enter return quantity lesser than or equal to available quantity");
                    this.getView().byId("idBtnSubmit").setEnabled(false);
                    flag = 1;
                }
                if (parseFloat(oValue) < 0 || oValue == "") {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Please enter return quantity");
                    this.getView().byId("idBtnSubmit").setEnabled(false);
                } else if (flag != 1) {
                    oEvent.getSource().setValueState("None");
                    this.getView().byId("idBtnSubmit").setEnabled(true);
                    if (oBindingObject.UOM !== 'MT' && oBindingObject.PopupItems.length > 0) {
                        for (var i = 0; i < oBindingObject.PopupItems.length; i++) {
                            oBindingObject.PopupItems[i].Quantity = parseFloat(oBindingObject.PopupItems[i].BaseQty) * parseFloat(oValue);
                            oBindingObject.PopupItems[i].StoreStockBOQId = oBindingObject.PopupItems[i].StoreStockBOQs.results[0].ID;
                        }
                    }
                }
            },
            onPressGo: function () {
                var oHeaderData = this.getViewModel("HeaderDetailsModel").getData();

                if (this.byId("idStorageLocation").getEnabled())
                    this._validateHeaderForm1Data(oHeaderData);
                else
                    var bErrorMandatoryFields = this._validateHeaderForm2Data(oHeaderData);

                if (!bErrorMandatoryFields) {
                    return;
                }
                this.getViewModel("objectViewModel").setProperty("/isItemFieldsVisible", true);
                var Plant = this.byId("idPlant").getSelectedKey();
                var StorageLocation = this.byId("idStorageLocation").getValue();
                // var UnloadPoint = this.byId("idUnloadPoint").getValue();
                this.getMaterialSuggestionData(Plant, StorageLocation);
            },

            getMaterialSuggestionData: function (Plant, StorageLocation) {
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true);
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
                // var UnloadPointFilter = new sap.ui.model.Filter({
                //     path: "UnloadPoint",
                //     operator: sap.ui.model.FilterOperator.EQ,
                //     value1: UnloadPoint
                // });
                var filter = [];
                filter.push(PlantFilter, StorageLocationFilter);
                // filter.push(StorageLocationFilter);
                this.getOwnerComponent().getModel().read("/MaterialAvailabilityViewSet", {
                    filters: [filter],
                    // urlParameters: {
                    //     "$expand": "PackingList"
                    // },
                    success: function (oData, oResponse) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false);
                        var suggestionModel = new JSONModel(oData.results);
                        this.getView().setModel(suggestionModel, "suggestionModel");
                        this.getViewModel("objectViewModel").setProperty("/isButtonVisible", false);

                    }.bind(this),
                    error: function (oError) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false);
                        // sap.m.MessageBox.error(JSON.stringify(oError));
                    }.bind(this),
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
                            that.fnSetValueStatesNone();
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
                    // this.byId("idUnloadPoint").setEnabled(false);
                }
                // if (!data.CostCenter) {
                //     this.byId("idCostCenter").setValueState("Error");
                //     this.byId("idCostCenter").setValueStateText("Please enter cost value");
                //     bValid = false;
                // } else {
                //     this.byId("idCostCenter").setValueState("None");
                //     this.byId("idCostCenter").setValueStateText(null);
                // }
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
                // if (!data.GLAccount) {
                //     this.byId("idGLAccount").setValueState("Error");
                //     this.byId("idGLAccount").setValueStateText("Please enter GL Account recipient");
                //     bValid = false;
                // } else {
                //     this.byId("idGLAccount").setValueState("None");
                //     this.byId("idGLAccount").setValueStateText(null);
                // }
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

            _validateHeaderForm1Data: function (data) {
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
                    // this.byId("idUnloadPoint").setEnabled(false);
                }
                return bValid;
            },

            _validateHeaderForm2Data: function (data) {
                var bValid = true;

                // if (!data.CostCenter) {
                //     this.byId("idCostCenter").setValueState("Error");
                //     this.byId("idCostCenter").setValueStateText("Please enter cost value");
                //     bValid = false;
                // } else {
                //     this.byId("idCostCenter").setValueState("None");
                //     this.byId("idCostCenter").setValueStateText(null);
                // }
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
                // if (!data.GLAccount) {
                //     this.byId("idGLAccount").setValueState("Error");
                //     this.byId("idGLAccount").setValueStateText("Please enter GL Account recipient");
                //     bValid = false;
                // } else {
                //     this.byId("idGLAccount").setValueState("None");
                //     this.byId("idGLAccount").setValueStateText(null);
                // }
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

            fnSetValueStatesNone: function () {
                var aFieldIds = ["idSelCompanyCode", "idGoodReciept", "idRecievingLocation", "idCostCenter", "idGLAccount", "idContractor"];
                for (var i = 0; i < aFieldIds.length; i++) {
                    this.getView().byId(aFieldIds[i]).setValueState("None");
                }
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
                    var aBoqStock = [];
                    for (var i = 0; i < item.PopupItems.length; i++) {
                        if (item.PopupItems[i].Quantity > 0)
                            aBoqStock.push(item.PopupItems[i]);
                    }
                    return {
                        Name: item.Description,
                        Material: item.Material,
                        Description: item.Description,
                        StorageLocation: item.StorageLocation,
                        Quantity: parseInt(item.Quantity),
                        BaseUnit: item.BaseUnit,
                        // UnloadPoint: item.UnloadPoint,
                        Batch: item.Batch,
                        IsChildItem: false,
                        SpecialStockIndicator: item.M,
                        IsBOQApplicable: item.IsBOQApplicable,
                        IssueMaterialReservedBOQItems: aBoqStock
                    };
                });
                this.getViewModel("objectViewModel").setProperty(
                    "/busy",
                    true);
                var oPayload = {
                    "Plant": oAdditionalData.Plant,
                    "MovementType": "311",
                    "GoodsRecipient": oAdditionalData.GoodsRecipient,
                    "CostCenter": oAdditionalData.CostCenter,
                    "WBS": oAdditionalData.WBS,
                    "ProfitCenter": oAdditionalData.ProfitCenter,
                    "ReceivingLocation": oAdditionalData.ReceivingLocation,
                    "GLAccount": oAdditionalData.GLAccount,
                    "ContractorName": oAdditionalData.ContractorId,
                    "CompanyCode": oAdditionalData.CompanyCode,
                    "UserName": "AGEL",
                    "IssueMaterialReservationItems": aReservationItems
                };
                this.mainModel.create("/IssueMaterialReservationEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false);
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
                        this.getViewModel("objectViewModel").setProperty(
                            "/busy",
                            false);
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
                // this.byId("idUnloadPoint").setEnabled(true);
            },

            onManageBOQQtyPress: function (oEvent) {
                var sParentItemPath = oEvent.getSource().getBindingContext("reservationTableModel").getPath();
                var sMatCode = oEvent.getSource().getBindingContext("reservationTableModel").getObject().Material;
                var sDescription = oEvent.getSource().getBindingContext("reservationTableModel").getObject().Description;
                var sBaseUnit = oEvent.getSource().getBindingContext("reservationTableModel").getObject().BaseUnit;
                if (sBaseUnit === 'MT')
                    this.getViewModel("objectViewModel").setProperty("/popupEditable", true);
                else
                    this.getViewModel("objectViewModel").setProperty("/popupEditable", false);
                // var sDialogTitleObject = oEvent.getSource().getBindingContext("reservationTableModel").getProperty();
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = "Manage BOQ Quantity - " + sDescription;
                if (!this.manageBoqDailog) {
                    this.manageBoqDailog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.materialreservation.view.fragments.common.manageBoq",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        // oDialog.bindElement({
                        //     path: oDetails.sParentItemPath,
                        //     model: 'reservationTableModel'
                        // });
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        oDialog.setTitle(oDetails.title);
                        return oDialog;
                    });
                }
                this.manageBoqDailog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        model: 'reservationTableModel'
                    });
                    oDialog.setTitle(oDetails.title);
                    oDialog.open();
                });
            },

            onManageBoqDialogClosePress: function (oEvent) {
                this.manageBoqDailog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onWPPChange: function (oEvent) {
                var oSelectedItemQty = oEvent.getSource().getSelectedItem().getAdditionalText();
                var sSelectedItemID = oEvent.getSource().getSelectedItem().getBindingContext("reservationTableModel").getObject().ID;
                var oParentBindingPath = oEvent.getSource().getBindingContext("reservationTableModel").getPath();
                var oModel = this.getViewModel("reservationTableModel");
                oModel.setProperty(oParentBindingPath + '/AvailableQty', parseFloat(oSelectedItemQty));
                oModel.setProperty(oParentBindingPath + '/StoreStockBOQId', sSelectedItemID);

            },

            onIssueQtyLiveChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var iIssueQty = oInput.getValue();
                if (iIssueQty)
                    iIssueQty = parseFloat(iIssueQty);
                else
                    iIssueQty = 0;
                var iAvailableQty = oInput.getBindingContext("reservationTableModel").getObject().AvailableQty;
                iAvailableQty = parseFloat(iAvailableQty);
                if (iIssueQty > iAvailableQty) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Issue Quantity should not be more than Available Quantity.");
                    this.getViewModel("objectViewModel").getProperty("/popupSaveEnable", false)
                }
                else {
                    oInput.setValueState("None");
                    this.getViewModel("objectViewModel").getProperty("/popupSaveEnable", true)
                }
            },

            onBoqQtySavePress: function (oEvent) {
                var oParent = oEvent.getSource().getParent();
                var oParentBindingObject = oParent.getBindingContext("reservationTableModel").getObject();
                var oParentBindingPath = oParent.getBindingContext("reservationTableModel").getPath();
                var iTotalQty = 0;
                for (var i = 0; i < oParentBindingObject.PopupItems.length; i++) {
                    if (oParentBindingObject.PopupItems[i].SelectedWpp)
                        iTotalQty += (parseFloat(oParentBindingObject.PopupItems[i].Quantity) * parseFloat(oParentBindingObject.PopupItems[i].SelectedWpp));
                }
                this.getViewModel("reservationTableModel").setProperty(oParentBindingPath + "/Quantity", iTotalQty);
                if (iTotalQty > 0)
                    this.getView().byId("idBtnSubmit").setEnabled(true);
                else
                    this.getView().byId("idBtnSubmit").setEnabled(false);
                this.onManageBoqDialogClosePress();
            }
        });
    });
