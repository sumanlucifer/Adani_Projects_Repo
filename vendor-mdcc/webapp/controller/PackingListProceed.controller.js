sap.ui.define([
    "./BaseController",
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
    "sap/ui/model/json/JSONModel",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} 
	 */
    function (BaseController, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, JSONModel) {
        "use strict";

        return BaseController.extend("com.agel.mmts.vendormdcc.controller.PackingListProceed", {
            onInit: function () {

                this.MainModel = this.getOwnerComponent().getModel();
                this.getView().setModel(this.MainModel);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    boqSelection: null
                });
                this.setModel(oViewModel, "objectViewModel");

                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RoutePackingListProceedPage").attachPatternMatched(this._onObjectMatched, this);

                //   this.getView().setModel(this.getOwnerComponent().getModel("i18n").getResourceBundle());
            },

            _onObjectMatched: function (oEvent) {
                this.sObjectId = oEvent.getParameter("arguments").MDCCId;
                this.sObjectId = this.sObjectId;

                this._bindView("/MDCCSet(" + this.sObjectId + ")");

                this._getMDCCData();
                this.getMDCCData();
                //  this._getParentDataViewMDCC();


            },

            _bindView: function (sObjectPath) {
                var that = this;
                var objectViewModel = this.getViewModel("objectViewModel");

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

            // Get MDCC Set Level Data For Post Operation
            _getMDCCData: function () {
                var that = this;
                var sPath = "/MDCCSet(" + this.sObjectId + ")";
                that.getComponentModel("app").setProperty("/busy", true);
                this.MainModel.read(sPath, {
                    success: function (oData, oResponse) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        if (oData) {
                            that.MDCCData = oData;
                        } else {
                            that.MDCCData = [];
                        }
                    }.bind(this),
                    error: function (oError) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            },

            // Arrange Data For View / Model Set
            _arrangeDataView: function () {
                var that = this;
                var oModel = new JSONModel({ "ChildItems": this.ParentDataView });
                this.getView().setModel(oModel, "TreeTableModel");
            },

            getMDCCData: function () {
                var that = this;
                this.ParentData;
                var sPath = "/MDCCSet(" + this.sObjectId + ")/MDCCParentLineItems";
                that.getComponentModel("app").setProperty("/busy", true);
                this.MainModel.read(sPath, {
                    urlParameters: {
                        "$expand": "MDCCBOQItems"
                    },
                    success: function (oData, oResponse) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        if (oData.results.length) {
                            this.ParentData = oData.results;
                            this.dataBuilding(this.ParentData);
                            // this._getChildItems(oData.results);
                        }
                    }.bind(this),
                    error: function (oError) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            },

            dataBuilding: function (ParentData) {
                this.ParentDataView = ParentData;
                for (var i = 0; i < ParentData.length; i++) {


                    this.ParentDataView[i].isChildItemFreeze = false;



                    //  for (var j = 0; j < ParentData[i].MDCCBOQItems.length; j++) {
                    if (ParentData[i].MDCCBOQItems.results.length) {


                        if (ParentData[i].UOM === "EA") {
                            this.ParentDataView[i].isStandAlone = true;
                            this.ParentDataView[i].ChildItems = ParentData[i].MDCCBOQItems.results;
                            this.ParentDataView[i].isSelected = false;
                            this.ParentDataView[i].isChildItemFreeze = false;



                        } else {
                            this.ParentDataView[i].isStandAlone = true;
                            this.ParentDataView[i].ChildItems = ParentData[i].MDCCBOQItems.results;
                            this.ParentDataView[i].isSelected = false;
                            this.ParentDataView[i].isChildItemFreeze = true;

                        }




                        // this.ParentDataView[i].isStandAlone = true;
                        // this.ParentDataView[i].isSelected = false;
                        // this.ParentDataView[i].ChildItems = ParentData[i].MDCCBOQItems.results;
                    }
                    else {
                        this.ParentDataView[i].isStandAlone = false;
                        this.ParentDataView[i].isSelected = false;
                        this.ParentDataView[i].ChildItems = [];
                    }
                    //   }
                }
                this.onDispatchQuantityNull(this.ParentDataView);
            },

            onDispatchQuantityNull: function (ParentData) {
                for (var i = 0; i < ParentData.length; i++) {
                    this.ParentDataView[i].DispatchQty = "";
                    for (var j = 0; j < ParentData[i].ChildItems.length; j++) {
                        this.ParentDataView[i].ChildItems[j].DispatchQty = "";




                        if (ParentData[i].UOM === "EA") {



                            this.ParentData[i].ChildItems[j].isChildItemFreeze = true;

                        } else {


                            this.ParentData[i].ChildItems[j].isChildItemFreeze = false;

                        }


                    }
                }
                this._arrangeDataView();
            },

            // Live Change On Dispatch Quantity
            onLiveChangeDispatchQty1: function (oEvent) {
                oEvent.getSource().setValueState("None");
                this.getView().byId("idBtnProceed").setEnabled(true);
                var oValue = oEvent.getSource().getValue();
                var remainingQty = oEvent.getSource().getParent().getCells()[7].getText();
                var flag = 0;
                if (parseInt(oValue) > parseInt(remainingQty) || remainingQty == "") {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Please enter dispatch quantity lesser than or equal to the approved remaining quantity");
                    this.getView().byId("idBtnProceed").setEnabled(false);
                    flag = 1;
                }

                if (parseInt(oValue) < 0 || oValue == "") {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Please enter dispatch quantity");
                    this.getView().byId("idBtnProceed").setEnabled(false);
                } else if (flag != 1) {
                    oEvent.getSource().setValueState("None");
                    this.getView().byId("idBtnProceed").setEnabled(true);
                }
            },


            onLiveChangeDispatchQty: function (oEvent) {
                oEvent.getSource().setValueState("None");
                this.getView().byId("idBtnProceed").setEnabled(true);
                var sItemPath = oEvent
                    .getSource()
                    .getBindingContext("TreeTableModel")
                    .getPath();

                var sParentPath = sItemPath.slice(0, 13);

                var iTotalQuantity = this.getViewModel("TreeTableModel").getProperty(
                    sParentPath + "/DispatchQty"
                );
                var iParentIssuedQuantity = this.getViewModel("TreeTableModel").getProperty(
                    sParentPath + "/RemainingQty"
                );

                if (!iTotalQuantity) iTotalQuantity = 0;
                var ReservedQty = parseFloat(oEvent.getSource().getValue());
                var oValue = oEvent.getSource().getValue();
                if (!oValue)
                    oValue = 0;
                var BalanceQty = parseFloat(
                    oEvent.getSource().getParent().getCells()[9].getText()
                );

                var bChildItemFreeze = this.getViewModel("TreeTableModel").getProperty(
                    sParentPath + "/isSelected"
                );
                var aChildItems = this.getViewModel("TreeTableModel").getProperty(
                    sParentPath + "/ChildItems"
                );

                if (bChildItemFreeze) {
                    debugger;
                    aChildItems.forEach((item) => {
                        //    item.Quantity = parseFloat(oValue) * (parseFloat(item.BalanceQty) /parseFloat(iParentIssuedQuantity));
                        item.DispatchQty = parseFloat(oValue) * (parseFloat(item.BaseQty));
                    });
                    this.getViewModel("TreeTableModel").setProperty(
                        sParentPath + "/ChildItems",
                        aChildItems
                    );
                } else {
                    if (parseFloat(oValue) >= 0) {

                        var wpp = oEvent
                            .getSource()
                            .getBindingContext("TreeTableModel")
                            .getObject().WeightPerPiece;
                        var liveQty = oEvent
                            .getSource()
                            .getBindingContext("TreeTableModel")
                            .getObject().DispatchQty;
                        if (!liveQty) liveQty = 0;


                        // iTotalQuantity = iTotalQuantity - parseFloat(liveQty) + parseFloat(oValue);
                        iTotalQuantity = iTotalQuantity + ((parseFloat(oValue) - parseFloat(liveQty)) * parseFloat(wpp));
                        this.getViewModel("TreeTableModel").setProperty(sItemPath + "/DispatchQty", oValue);


                        this.getViewModel("TreeTableModel").setProperty(
                            sParentPath + "/DispatchQty",
                            iTotalQuantity
                        );

                    }
                }

                if (parseInt(oValue) > parseInt(BalanceQty) || BalanceQty == "") {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Please enter dispatch quantity lesser than or equal to the approved remaining quantity");
                    this.getView().byId("idBtnProceed").setEnabled(false);
                    flag = 1;
                }

                if (parseInt(oValue) < 0 || oValue == "") {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Please enter dispatch quantity");
                    this.getView().byId("idBtnProceed").setEnabled(false);
                } else if (flag != 1) {
                    oEvent.getSource().setValueState("None");
                    this.getView().byId("idBtnProceed").setEnabled(true);
                }
            },

            // On Selection Of Row 
            onSelectionOfRow: function (oEvent) {
                var bSelected = oEvent.getParameter("selected");
                var dispatchQty = oEvent.getSource().getParent().getCells()[10].getValue();
                if (bSelected) {
                    if (dispatchQty == "") {
                        this.getView().byId("idBtnProceed").setEnabled(false);
                    } else {
                        this.getView().byId("idBtnProceed").setEnabled(true);
                    }
                    oEvent.getSource().getParent().getCells()[10].setEditable(true);
                    oEvent.getSource().getParent().getRowBindingContext().getObject().isSelected = true;
                } else {
                    oEvent.getSource().getParent().getCells()[10].setEditable(false);
                    oEvent.getSource().getParent().getRowBindingContext().getObject().isSelected = false;
                    oEvent.getSource().getParent().getCells()[10].setValue("");
                }
            },

            // on Save Confirm - Proceed Click
            onConfirmProceedSave: function (oEvent) {
                var that = this;
                MessageBox.confirm("Do you want to proceed ahead for create packing list?", {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            that.onPressProccedSave(oEvent);
                        }
                    }
                });
            },

            // on Save - Proceed Click
            onPressProccedSave: function (oEvent) {
                var that = this;
                var oModel = this.getView().getModel("TreeTableModel");
                var ParentData = oModel.getData().ChildItems;
                var saveData = {};
                saveData.MDCCParentItems = [];
                var flag = 0;
                var parentObj = {};
                var childObj = {};
                parentObj.MDCCBOQItem = [];
                for (var i = 0; i < ParentData.length; i++) {
                    flag = 0;
                    parentObj = {
                        "ParentLineItemID": ParentData[i].ID,
                        "MDCCApprovedQty": ParentData[i].MDCCApprovedQty,
                        "DispatchQty": ParentData[i].DispatchQty,
                        "MDCCBOQItem": []
                    };
                    for (var j = 0; j < ParentData[i].ChildItems.length; j++) {
                        if (ParentData[i].ChildItems[j].DispatchQty != null &&
                            ParentData[i].ChildItems[j].DispatchQty != "" &&
                            ParentData[i].ChildItems[j].isSelected == true) {
                            childObj = {
                                "BOQItemID": ParentData[i].ChildItems[j].ID,
                                "MDCCApprovedQty": ParentData[i].ChildItems[j].MDCCApprovedQty,
                                "DispatchQty": ParentData[i].ChildItems[j].DispatchQty
                            };
                            parentObj.MDCCBOQItem.push(childObj)
                            flag = 1;
                        }
                    }  // j end 
                    if (flag == 1) {
                        saveData.MDCCParentItems.push(parentObj);
                    }
                    // Only Parent Object Insert - No Child Present
                    if (ParentData[i].DispatchQty != null && ParentData[i].DispatchQty != "" &&
                        ParentData[i].isSelected == true) {
                        saveData.MDCCParentItems.push(parentObj);
                    }
                } // i end

                if (saveData.MDCCParentItems.length < 1) {
                    sap.m.MessageBox.error("Please select at least one item and enter dispatch quantity");
                    return 0;
                };

                var oPayload = {
                    "ID": that.MDCCData.ID,
                    "MDCCParentItems": saveData.MDCCParentItems
                };

                // Create Call 
                that.getComponentModel("app").setProperty("/busy", true);
                that.MainModel.create("/MDCCEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        if (oData.Success == true) {
                            sap.m.MessageBox.success(oData.Message, {
                                title: "Success",
                                onClose: function (oAction1) {
                                    if (oAction1 === sap.m.MessageBox.Action.OK) {
                                        that.onNavigateToPackingList(oData.ID);
                                    }
                                }.bind(this)
                            });
                        }
                        else {
                            sap.m.MessageBox.error(oData.Message, {
                                title: "Error"
                            });
                        }
                    }.bind(this),
                    error: function (oError) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            // On Navigate To PackingList Create
            onNavigateToPackingList: function (PackingListId) {
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: "PackingList",
                        action: "manage"
                    },
                    params: {
                        "packingListID": PackingListId,
                        "status": "NOTSAVED"
                    }
                })) || ""; // generate the Hash to display a MDCC Number
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                }); // navigate to Manage MDCC application - Initiate Dispatch Screen
            }
        });
    });
