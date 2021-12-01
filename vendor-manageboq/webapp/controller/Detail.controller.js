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
    "com/agel/mmts/vendormanageboq/utils/formatter"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, MessageToast, MessageBox, Formatter) {
    "use strict";
    return BaseController.extend("com.agel.mmts.vendormanageboq.controller.Detail", {
        formatter: Formatter,
        onInit: function () {
            //get logged in User
            try {
                this.UserEmail = sap.ushell.Container.getService("UserInfo").getEmail();
            }
            catch (e) {
                this.UserEmail = 'suraj.gavane@extentia.com';
            }
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                noParentChildRelationFlag: false,
                isCreatingPCList: false,
                isPCListSelected: false,
                sViewBOQButtonName: "View BOQ List",
                hasPClist: false,
                BOQQtyType: 'F'
            });
            this.setModel(oViewModel, "objectViewModel");
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
            var oManageBOQModel = new JSONModel({
                boqItems: [{
                    Name: "",
                    MaterialCode: "",
                    Description: "",
                    Qty: "",
                    Remarks: "",
                    UOM: "",
                    WeightPerPiece: "",
                    TotalItemWeight: "",
                    MasterBOQItemId: "",
                    masterUOMItemId: "",
                    isQtyEditable: false,
                    isWeightEditable: false,
                    UOMSuggestions: null
                }]
            });
            this.setModel(oManageBOQModel, "ManageBOQModel");
            this.mainModel = this.getComponentModel();
        },
        _onObjectMatched: function (oEvent) {
            this.sParentID = oEvent.getParameter("arguments").parentMaterial;
            var sLayout = oEvent.getParameter("arguments").layout;
            if (sLayout == 'TwoColumnsMidExpanded') {
                this.byId("idViewBOQListButton").setPressed(false);
                this.getViewModel("objectViewModel").setProperty("/sViewBOQButtonName", "View BOQ List");
            }
            this.getView().getModel().setProperty("/busy", false);
            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
            this._bindView("/ParentLineItemSet" + this.sParentID);
            this._filterPCListTable(this.UserEmail);
        },
        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;
            this.getView().unbindElement();
            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function (oData, oResponse) {
                        objectViewModel.setProperty("/busy", false);
                        objectViewModel.setProperty("/MaterialCode", oData.getParameter("data").MaterialCode);
                        that.setStandalone();
                    },
                    change: function(oData){
                        var sMatCode= that.getView().getBindingContext().getObject().MaterialCode;
                        that.getViewModel("objectViewModel").setProperty("/MaterialCode", sMatCode);
                        that.setStandalone();
                    }
                }
            });
        },
        setStandalone: function () {
            try {
                var bIsBOQAppicable = this.getViewModel().getProperty("/ParentLineItemSet" + this.sParentID).IsBOQApplicable;
            }
            catch (e) {
                bIsBOQAppicable = null;
            }
            if (bIsBOQAppicable === false)
                this.getViewModel("objectViewModel").setProperty("/noParentChildRelationFlag", true);
            else
                this.getViewModel("objectViewModel").setProperty("/noParentChildRelationFlag", false);

            // try {
            //     var sMatCode = this.getViewModel("objectViewModel").getProperty("/MaterialCode");
            //     if (!sMatCode) {
            //         sMatCode = this.getView().getBindingContext().getObject().MaterialCode;
            //         this.getViewModel("objectViewModel").setProperty("/MaterialCode", sMatCode);
            //     }
            // }
            // catch (e) {
            //     sMatCode = null;
            // }
        },
        setCreatePCListVisiblity: function (oEvent) {
            var iPCListCount = oEvent.getSource().getBinding("items").getLength();
            if (iPCListCount > 0)
                this.getViewModel("objectViewModel").setProperty("/hasPClist", true);
            else
                this.getViewModel("objectViewModel").setProperty("/hasPClist", false);
            this.getViewModel("objectViewModel").refresh();
        },
        _filterPCListTable: function (sEmail) {
            var PCListTable = this.getView().byId("idPCListTable");
            var oUserFilter = new Filter("Email", sap.ui.model.FilterOperator.EQ, sEmail);
            PCListTable.getBinding("items").filter(oUserFilter);
        },
        onUOMSelected: function (oEvent) {
            var sItemPath = oEvent.getSource().getBindingContext("ManageBOQModel").getPath();
            var sText = oEvent.getParameter("selectedItem").getText();
            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOM", sText);
        },
        onBOQItemSelected: function (oEvent) {
            //this.getViewModel("UOMSuggestionModel").setData(null);
            var userObj = oEvent.getParameter("selectedItem").getBindingContext().getObject(),
                oBindingContext = oEvent.getParameter("selectedItem").getBindingContext(),
                oBindingContextPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath(),
                aRowCells = oEvent.getSource().getParent().getCells(),
                sItemPath = oEvent.getSource().getBindingContext("ManageBOQModel").getPath();
            var sText = oEvent.getParameter("selectedItem").getText();
            var sBaseQty = oEvent.getParameter("selectedItem").getBindingContext("MasterMaterialModel").getObject().BaseQty;
            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/Name", sText);
            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/Qty", sBaseQty);
            var sKey = oEvent.getParameter("selectedItem").getKey();
            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/MasterBOQItemId", sKey);
            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/isQtyEditable", true);
            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/isWeightEditable", true);
            for (var i = 1; i < aRowCells.length; i++) {
                if (aRowCells[i] instanceof sap.m.Text) {
                    var cellContextPath = aRowCells[i].data("p");
                    var val = userObj[cellContextPath];
                    aRowCells[i].setText(val);
                }
            }
            this._prepareSuggestionItemsForUOM(oBindingContextPath, sItemPath);
        },
        // _prepareSuggestionItemsForUOM: function (oBindingContextPath, sItemPath) {
        //     var that = this;
        //     oBindingContextPath = oBindingContextPath + "/UOMs"
        //     var oModel = this.getView().getModel();
        //     oModel.read(oBindingContextPath, {
        //         success: function (oData, oResponse) {
        //             if (oData.results.length)
        //                 this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOMSuggestions", oData.results);
        //             else
        //                 this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOMSuggestions", null);
        //         }.bind(this),
        //         error: function (oError) {
        //             sap.m.MessageBox.error("Error fetching UOMs");
        //         }
        //     });
        // },

        _prepareSuggestionItemsForUOM: function (oBindingContextPath, sItemPath) {
            var iMasterBOQItemId = this.getView().getModel("ManageBOQModel").getProperty(sItemPath + "/MasterBOQItemId"),
                sMaterialCode = this.getView().getModel("objectViewModel").getProperty("/MaterialCode"),
                oFilter = new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.EQ, sMaterialCode);
            // oFilter = new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.EQ, "6781438673");

            this.getOwnerComponent().getModel().read("/MasterMaterialSet", {
                filters: [oFilter],
                urlParameters: {
                    $expand: "MasterBOQs/MasterBOQItem/UOMs"
                },
                success: function (oResponse) {
                    if (oResponse.results.length > 0) {
                        if (oResponse.results[0].MasterBOQs.results.length > 0) {

                            var iMasterBOQIndex = oResponse.results[0].MasterBOQs.results.findIndex(function (oitem) {
                                return oitem.MasterBOQItem.ID === iMasterBOQItemId;
                            });
                            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOMSuggestions", oResponse.results[0].MasterBOQs.results[iMasterBOQIndex].MasterBOQItem.UOMs.results);
                        } else
                            this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOMSuggestions", null);
                    }
                    else
                        this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/UOMSuggestions", null);
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            });
        },
        onAddItemPress: function (oEvent) {
            if (!this._validateProceedData()) {
                return;
            }
            var oModel = this.getViewModel("ManageBOQModel");
            var oItems = oModel.getProperty("/boqItems").map(function (oItem) {
                return Object.assign({}, oItem);
            });
            oItems.push({
                Name: "",
                MaterialCode: "",
                Description: "",
                Qty: "",
                Remarks: "",
                UOM: "",
                MasterBOQItemId: "",
                masterUOMItemId: "",
                isQtyEditable: false,
                isWeightEditable: false,
                UOMSuggestions: null
            });
            oModel.setProperty("/boqItems", oItems);
            this.weightValueFlag = false;
        },
        onLiveChangeQty: function (oEvent) {
            var oValue = oEvent.getSource().getValue();
            var sItemPath = oEvent.getSource().getBindingContext("ManageBOQModel").getPath();
            if (oValue !== "") {
                this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/isWeightEditable", true);
                if (this.weightValueFlag) {
                    var sQty = parseFloat(oValue);
                    var sWeight = parseFloat(oEvent.getSource().getBindingContext("ManageBOQModel").getObject().WeightPerPiece);
                    var sText = sQty * sWeight;
                    this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/TotalItemWeight", sText);
                }
            }
            if (parseFloat(oValue) <= 0 || parseFloat(oValue) === 0) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter Positive and Non Zero Number");
                this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/WeightPerPiece", "");
                this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/TotalItemWeight", "");
                this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/isWeightEditable", false);
                this.weightValueFlag = false;
            }
            else {
                oEvent.getSource().setValueState("None");

            }
        },
        onLiveChangeWeight: function (oEvent) {
            var oValue = oEvent.getSource().getValue();
            var sItemPath = oEvent.getSource().getBindingContext("ManageBOQModel").getPath();
            if (oValue !== "") {
                this.weightValueFlag = true;
                var sQty = parseFloat(oEvent.getSource().getBindingContext("ManageBOQModel").getObject().Qty);
                var sWeight = parseFloat(oValue);
                var sText = sQty * sWeight;
                this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/TotalItemWeight", sText);
            }
            else {
                this.weightValueFlag = false;
                this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/TotalItemWeight", "");
            }
            if (parseFloat(oValue) <= 0 || parseFloat(oValue) === 0) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter Positive and Non Zero Number");
                this.getView().getModel("ManageBOQModel").setProperty(sItemPath + "/TotalItemWeight", "");
                this.weightValueFlag = false;
            }

            else
                oEvent.getSource().setValueState("None");

        },
        openAddRemarksPopupPress: function (oEvent) {
            var sItemPath = oEvent.getSource().getBindingContext("ManageBOQModel").getPath();
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sItemPath = sItemPath;
            if (!this.addRemarksDialog) {
                this.addRemarksDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendormanageboq.view.fragments.manageBOQ.AddRemarks",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sItemPath
                    });
                    oDialog.setModel(oDetails.view.getModel("ManageBOQModel"));
                    return oDialog;
                });
            }
            this.addRemarksDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sItemPath
                });
                oDialog.setModel(oDetails.view.getModel("ManageBOQModel"));
                oDialog.open();
            });
        },
        onAddRemarksPress: function (oEvent) {
            var sItemPath = oEvent.getSource().getParent().getBindingContext().getPath();
            var sPropertyName = sItemPath + "/Remarks";
            var sRemarksAdded = this.byId("idRemarksTextArea").getValue();
            var oModel = oEvent.getSource().getModel();
            oModel.setProperty(sPropertyName, sRemarksAdded);
            this.onCloseRemarkPopupPress();
        },
        onCloseRemarkPopupPress: function (oEvent) {
            var that = this;
            this.addRemarksDialog.then(function (oDialog) {
                //that.byId("idRemarksTextArea").setValue(null);
                oDialog.close();
            });
        },
        onDeleteBOQItemPress: function (oEvent) {
            var iRowNumberToDelete = parseInt(oEvent.getSource().getBindingContext("ManageBOQModel").getPath().slice("/boqItems/".length));
            var sChildName = oEvent.getSource().getBindingContext("ManageBOQModel").getObject().Name;
            if (sChildName.length)
                var sMessage = "Are you sure you want to delete this entry with child name - " + sChildName + " ?";
            else
                var sMessage = "Are you sure you want to delete this entry?";
            this._handleMessageBoxOpen(sMessage, "warning", iRowNumberToDelete);
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
        _deleteBOQRow: function (iRowNumberToDelete) {
            var aTableData = this.getViewModel("ManageBOQModel").getProperty("/boqItems");
            aTableData.splice(iRowNumberToDelete, 1);
            this.getView().getModel("ManageBOQModel").refresh();
        },
        _validateProceedData: function () {
            var bValid = true;
            if (this.getView().getModel("ManageBOQModel")) {
                var aBoqItemData = this.getView().getModel("ManageBOQModel").getData().boqItems;
                for (let i = 0; i < aBoqItemData.length; i++) {
                    if (!aBoqItemData[i].Qty || !aBoqItemData[i].MasterBOQItemId || !aBoqItemData[i].masterUOMItemId || !aBoqItemData[i].WeightPerPiece) {
                        bValid = false;
                        sap.m.MessageBox.alert("Please fill all the required fields before saving.");
                        return;
                    }
                }
            }
            return bValid;
        },
        onSaveManagedBOQItemsPress: function (oEvent) {
            if (!this._validateProceedData()) {
                return;
            }
            this._handleMessageBoxForPCListCreationProcess("Do you want to Save these BOQ items?");
        },
        _handleMessageBoxForPCListCreationProcess: function (sMessage) {
            var that = this;
            sap.m.MessageBox.confirm(sMessage, {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that._createPCList();
                    }
                }
            });
        },
        _createPCList: function () {
            var oPayload = {};
            var aTableData = this.getViewModel("ManageBOQModel").getProperty("/boqItems");
            var aPayloadSelectedItem = aTableData;
            aPayloadSelectedItem.forEach(element => {
                delete element.UOMSuggestions;
                element.MasterUOMItemId = element.masterUOMItemId;
                delete element.masterUOMItemId;
            });
            var sVendorEmail = this.UserEmail;
            var sParentID = this.getView().getBindingContext().getObject().ID;
            oPayload.ParentLineItemID = sParentID;
            oPayload.PCGroupItems = aPayloadSelectedItem;
            oPayload.VendorEmail = sVendorEmail;
            this.mainModel.create("/PCGroupItemListSet", oPayload, {
                success: function (oData, oResponse) {
                    sap.m.MessageBox.success(oData.Message);
                    this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
                    this.getViewModel("ManageBOQModel").setProperty("/boqItems", [])
                    this.getView().getModel().refresh();
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });
        },
        onCreateNewPCListPress: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", true)
            this.fnGetMasterMaterialData();
        },
        onCancelPCListCreationPress: function (oEvent) {
            //   this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
            var that = this;
            sap.m.MessageBox.confirm("Added BOQ item details will be discarded. Do you really want to Cancel the PC List?", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
                        that.getViewModel("ManageBOQModel").setProperty("/boqItems", []);
                    }
                }
            });
        },
        onPCListSelectionChange: function (oEvent) {
            var isSelected = oEvent.getParameter("selected");
            this.getViewModel("objectViewModel").setProperty("/isPCListSelected", isSelected);
        },
        onCreateBOQPress: function (oEvent) {
            var isMaterialStandAlone = this.getViewModel("objectViewModel").getProperty("/noParentChildRelationFlag");
            var boqCreationModel = new JSONModel({
                IsOne2OneLineItem: isMaterialStandAlone,
                dialogTitle: isMaterialStandAlone ? this.getView().getBindingContext().getObject().Name : this.byId("idPCListTable").getSelectedItem().getBindingContext().getObject().Name,
                selectedItemData: isMaterialStandAlone ? null : this.byId("idPCListTable").getSelectedItem().getBindingContext().getObject(),
                quantity: null,
                isConfirmButtonEnabled: false,
                valueState: null,
                valueStateText: "",
                CalculatedBOQItems: [],
                PCGroupId: 1,
                ParentLineItemId: 1,
                CalculatedParentWeight: 10,
                UOM: this.getView().getBindingContext().getObject().UoM
            });
            if (!isMaterialStandAlone) {
                var sGroupItemsPath = this.byId("idPCListTable").getSelectedItem().getBindingContext().sPath + "/PCGroupItems"
                this.mainModel.read(sGroupItemsPath, {
                    success: function (oData, oResponse) {
                        if (oData.results.length) {
                            oData.results.forEach(element => {
                                element.selected = false;
                                element.PCGroupItemId = element.ID;
                                element.BOQQuantity = null;
                                element.TotalItemWeight = null;
                            });
                            boqCreationModel.oData.CalculatedBOQItems = oData.results;
                            this._setBoqCreationModel(this, boqCreationModel);
                        }
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error("Error fetching PC List Items");
                    }
                });
            }
            else
                this._setBoqCreationModel(this, boqCreationModel);
        },

        _setBoqCreationModel: function (oController, boqCreationModel) {
            oController.getView().setModel(boqCreationModel, "boqCreationModel");
            if (!oController._oBOQCreationDialog) {
                oController._oBOQCreationDialog = sap.ui.xmlfragment("com.agel.mmts.vendormanageboq.view.fragments.detailPage.BOQQuantityGetter", oController);
                oController.getView().addDependent(oController._oBOQCreationDialog);
            }
            oController.getViewModel("objectViewModel").setProperty("/BOQQtyType", "F");
            oController._oBOQCreationDialog.open();
        },

        onSelectAllBoq: function (oEvent) {
            var bState = oEvent.getSource().getSelected();
            var boqGroupItemData = this.getViewModel("boqCreationModel").getData().CalculatedBOQItems;
            boqGroupItemData.forEach(item => {
                item.selected = bState;
                if (!bState) {
                    item.BOQQuantity = null;
                    item.TotalItemWeight = null;
                }
            });
            if (!bState) {
                this.getViewModel("boqCreationModel").setProperty("/quantity", null);
                this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", false);
            }
            this.getViewModel("boqCreationModel").refresh();
        },

        onQuantityLiveChange: function (oEvent) {
            var oPOData = this.getView().getBindingContext().getObject();
            var bStandaloneMat = this.getViewModel("objectViewModel").getProperty("/noParentChildRelationFlag");
            if (oEvent.getSource().getValue().length && parseFloat(oEvent.getSource().getValue()) > 0) {
                if (bStandaloneMat) {
                    if (parseFloat(oEvent.getSource().getValue()) > parseFloat(oPOData.PendingQty)) {
                        this.getViewModel("boqCreationModel").setProperty("/valueState", "Error");
                        this.getViewModel("boqCreationModel").setProperty("/valueStateText", "BOQ quantity should not exceed PO's pending quantity.");
                        this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", false);
                    }
                    else {
                        this.getViewModel("boqCreationModel").setProperty("/valueState", null);
                        this.getViewModel("boqCreationModel").setProperty("/valueStateText", "");
                        this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", true);
                    }
                }
                else {
                    this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", true);
                    var sValue = parseFloat(oEvent.getSource().getValue());
                    var aGroupItems = this.getViewModel("boqCreationModel").getProperty("/CalculatedBOQItems");
                    aGroupItems.forEach(item => {
                        item.BOQQuantity = sValue * parseFloat(item.Qty);
                        item.TotalItemWeight = item.BOQQuantity * parseFloat(item.WeightPerPiece);
                        if (parseFloat(item.BOQQuantity) > parseFloat(item.RemainingQty)) {
                            this.getViewModel("boqCreationModel").setProperty("/valueState", "Error");
                            this.getViewModel("boqCreationModel").setProperty("/valueStateText", "BOQ quantity should not exceed PO's pending quantity.");
                            this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", false);
                            return;
                        }
                        else {
                            this.getViewModel("boqCreationModel").setProperty("/valueState", null);
                            this.getViewModel("boqCreationModel").setProperty("/valueStateText", "");
                            this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", true);
                        }
                    });
                    this.getViewModel("boqCreationModel").setProperty("/CalculatedBOQItems", aGroupItems);
                }
            }
            else {
                this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", false);
                this.getViewModel("boqCreationModel").setProperty("/valueState", "Error");
                this.getViewModel("boqCreationModel").setProperty("/valueStateText", "Please enter the correct value for Quantity.");
            }
        },

        onLiveChangeBoqQty: function (oEvent) {
            // var oPOData = this.getView().getBindingContext().getObject();
            var oValue = oEvent.getSource().getValue();
            var sBindingPath = oEvent.getSource().getBindingContext("boqCreationModel").sPath;
            // var aGroupItems = this.getViewModel("boqCreationModel").getProperty("/CalculatedBOQItems");
            var sUOM = this.getViewModel("boqCreationModel").getProperty("/UOM");
            var iTotalQuantity = this.getViewModel("boqCreationModel").getProperty("/quantity");
            if (iTotalQuantity)
                iTotalQuantity = parseFloat(iTotalQuantity);
            var iWeightPerPiece = this.getViewModel("boqCreationModel").getProperty(sBindingPath + "/WeightPerPiece");
            var iTotalItemWeight = this.getViewModel("boqCreationModel").getProperty(sBindingPath + "/TotalItemWeight");
            var iRemainingQty = this.getViewModel("boqCreationModel").getProperty(sBindingPath + "/RemainingQty");
            if (iTotalItemWeight) {
                iTotalQuantity -= iTotalItemWeight
                if (sUOM === 'MT')
                    this.getViewModel("boqCreationModel").setProperty("/quantity", iTotalQuantity);
            }
            this.getViewModel("boqCreationModel").setProperty(sBindingPath + "/TotalItemWeight", null);
            if (parseFloat(oValue) > 0) {
                var iTotalWeight = parseFloat(oValue) * (parseFloat(iWeightPerPiece) / 1000);
                this.getViewModel("boqCreationModel").setProperty(sBindingPath + "/TotalItemWeight", iTotalWeight);
                iTotalQuantity += iTotalWeight;
                iTotalQuantity = iTotalQuantity.toFixed(4);
                if (iTotalQuantity < 0)
                    iTotalQuantity = 0;
                if (sUOM === 'MT')
                    this.getViewModel("boqCreationModel").setProperty("/quantity", iTotalQuantity);
                // if (parseFloat(oValue) > parseFloat(oPOData.PendingQty)) {
                //     this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", false);
                //     oEvent.getSource().setValueState("Error");
                //     oEvent.getSource().setValueStateText("Enter valid quantity");
                // }
            }
            // this.getViewModel("boqCreationModel").setProperty("/CalculatedBOQItems", aGroupItems);
            if (parseFloat(oValue) > 0 && parseFloat(oValue) <= parseFloat(iRemainingQty)) {
                this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", true);
                oEvent.getSource().setValueState("None");
                oEvent.getSource().setValueStateText("");
            }
            else {
                this.getViewModel("boqCreationModel").setProperty("/isConfirmButtonEnabled", false);
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Enter valid quantity");
            }
        },

        onBoqSelectChange: function (oEvent) {
            var bState = oEvent.getSource().getSelected();
            if (!bState) {
                var oBindingObject = oEvent.getSource().getBindingContext("boqCreationModel").getObject();
                var oBoqModel = this.getViewModel("boqCreationModel");
                if (oBindingObject.BOQQuantity) {
                    var iTotalQuantity = oBoqModel.getProperty("/quantity");
                    iTotalQuantity -= oBindingObject.TotalItemWeight;
                    oBindingObject.BOQQuantity = null;
                    oBindingObject.TotalItemWeight = null;
                    oBoqModel.setProperty(oEvent.getSource().getBindingContext("boqCreationModel").sPath, oBindingObject);
                    oBoqModel.setProperty("/quantity", iTotalQuantity);
                }
            }
        },

        onCancelBOQCreationProcess: function (oEvent) {
            this._oBOQCreationDialog.close();
        },
        onConfirmCreateBOQPress: function (oEvent) {
            this._oBOQCreationDialog.close();
            var isMaterialStandAlone = this.getViewModel("objectViewModel").getProperty("/noParentChildRelationFlag");
            var sQuantity = this.getViewModel("boqCreationModel").getProperty("/quantity");
            var aCalculatedBOQItems = this.getViewModel("boqCreationModel").getProperty("/CalculatedBOQItems");
            var sUOM = this.getViewModel("boqCreationModel").getProperty("/UOM");
            var sBOQQtyType = this.getViewModel("objectViewModel").getProperty("/BOQQtyType");
            if (sUOM === 'MT' || sBOQQtyType === 'P') {
                for (var i = 0; i < aCalculatedBOQItems.length; i++) {
                    if (!aCalculatedBOQItems[i].selected || aCalculatedBOQItems[i].BOQQuantity === null) {
                        aCalculatedBOQItems.splice(i, 1);
                        i--;
                    }
                }
            }
            var oModel = this.getComponentModel();
            if (sQuantity !== "0" || (sQuantity === '0' && sBOQQtyType === 'P')) {
                if (isMaterialStandAlone) {
                    var oPayload = {
                        "QTY": parseFloat(sQuantity),
                        "PCGroupId": 0,
                        "ParentLineItemId": this.getView().getBindingContext().getObject().ID,
                        "IsOne2OneLineItem": true,
                        "CalculatedBOQItems": aCalculatedBOQItems
                    };
                } else {
                    var oSelectedItemData = this.byId("idPCListTable").getSelectedItem().getBindingContext().getObject();
                    var oPayload = {
                        "QTY": parseFloat(sQuantity),
                        "PCGroupId": parseInt(oSelectedItemData.ID),
                        "ParentLineItemId": parseInt(oSelectedItemData.ParentLineItemID),
                        "CalculatedBOQItems": aCalculatedBOQItems
                    };
                }
                if (oPayload) {
                    oModel.create("/BOQCalculationSet", oPayload, {
                        success: function (oData) {
                            if (oData.Success) {
                                sap.m.MessageBox.success(oData.Message);
                                this.getComponentModel().refresh();
                            }
                            else
                                sap.m.MessageBox.error("Error while creating BOQ List.");
                        }.bind(this),
                        error: function (oError) {
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });
                }
            } else {
                sap.m.MessageBox.error("Please enter non zero number.")
            }
        },
        onViewBOQRequests: function (oEvent) {
            if (oEvent.getParameter("pressed")) {
                this.getViewModel("objectViewModel").setProperty("/sViewBOQButtonName", "Close BOQ List");
                this.oRouter.navTo("detailDetail", {
                    parentMaterial: this.sParentID,
                    pcList: "pc",
                    layout: "ThreeColumnsMidExpanded"
                },
                    false);
            } else {
                this.getViewModel("objectViewModel").setProperty("/sViewBOQButtonName", "View BOQ List");
                this.oRouter.navTo("detail", {
                    parentMaterial: this.sParentID,
                    layout: "TwoColumnsMidExpanded"
                },
                    false
                );
            }
        },
        onUseSelectedPress: function (oEvent) {
            var sSelectedItemPath = this.byId("idPCListTable").getSelectedItem().getBindingContextPath();
            var sItemPath = sSelectedItemPath + "/PCGroupItems";
            var oModel = this.getComponentModel();
            oModel.read(sItemPath, {
                success: function (oData, oResponse) {
                    if (oData.results.length) {
                        var boqData = oData.results;
                        this._setDataInTable(boqData);
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            });
        },
        _setDataInTable: function (data) {
            var aBOQItems = [];
            for (var i = 0; i < data.length; i++) {
                var boqItem = {};
                boqItem.MaterialCode = data[i].MaterialCode;
                boqItem.Name = data[i].Name;
                boqItem.Qty = data[i].Qty;
                boqItem.Description = data[i].Description;
                boqItem.Remarks = data[i].Remarks;
                boqItem.UOM = data[i].UOM;
                boqItem.WeightPerPiece = data[i].WeightPerPiece;
                boqItem.TotalItemWeight = data[i].TotalItemWeight;
                boqItem.MasterBOQItemId = data[i].MasterBOQItemId,
                    boqItem.masterUOMItemId = data[i].MasterUOMItemId,
                    boqItem.UOMSuggestions = null;
                aBOQItems.push(boqItem);
                this._getUOMSuggestions(aBOQItems, data, i);
            }
            this.getViewModel("ManageBOQModel").setProperty("/boqItems", aBOQItems);
            this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", true);
        },
        _getUOMSuggestions: function (aBOQItems, data, path) {
            var oModel = this.getView().getModel();
            //this.suggestions = [];
            var details = {};
            details.path = path;
            details.aBOQItems = aBOQItems;
            var oBindingContextPath = "/MasterBoQItemSet(" + data[path].MasterBOQItemId + ")/UOMs";
            oModel.read(oBindingContextPath, {
                success: function (details, oData, oResponse) {
                    details.aBOQItems[details.path].UOMSuggestions = oData.results;
                    this.getViewModel("ManageBOQModel").refresh();
                }.bind(this, details),
                error: function (oError) {
                    sap.m.MessageBox.error("Error fetching UOMs");
                }
            });
        },
        onViewChildItemsPress: function (oEvent) {
            var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
            var sDialogTitle = "BOQ Items for " + oEvent.getSource().getBindingContext().getObject().Name;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            oDetails.title = sDialogTitle;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendormanageboq.view.fragments.detailPage.ViewLineItemsDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "expand": 'PCGroupItems'
                        }
                    });
                    oDialog.setTitle(oDetails.title)
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sParentItemPath,
                    parameters: {
                        'expand': 'PCGroupItems'
                    }
                });
                oDialog.open();
            });
        },
        onViewChildDialogClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        onBOQQtyTypeSelect: function (oEvent) {
            var sSelectedText = oEvent.getSource().getSelectedButton().getText();
            if (sSelectedText === "Full BOQ")
                this.getViewModel("objectViewModel").setProperty("/BOQQtyType", "F");
            else if (sSelectedText === "Partial BOQ") {
                this.getViewModel("objectViewModel").setProperty("/BOQQtyType", "P");
                this.getViewModel("boqCreationModel").setProperty("/quantity", 0);
            }
        },

        fnGetMasterMaterialData: function () {
            var sMaterialCode = this.getView().getModel("objectViewModel").getProperty("/MaterialCode"),
                oFilter = new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.EQ, sMaterialCode);
            // oFilter = new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.EQ, "6781438673");

            this.getOwnerComponent().getModel().read("/MasterMaterialSet", {
                filters: [oFilter],
                urlParameters: {
                    $expand: "MasterBOQs/MasterBOQItem"
                },
                success: function (oResponse) {
                    if (oResponse.results.length > 0) {
                        var oMasterMaterialModel = new JSONModel(oResponse.results[0].MasterBOQs.results);
                        this.getView().setModel(oMasterMaterialModel, "MasterMaterialModel");
                    }
                }.bind(this),
                error: function (oError) {

                }.bind(this)
            });
        }

    });
});            
