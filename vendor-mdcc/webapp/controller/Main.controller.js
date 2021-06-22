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

        return BaseController.extend("com.agel.mmts.vendormdcc.controller.Main", {
            onInit: function () {

                var oAppModel,
                fnSetAppNotBusy,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
 
                oAppModel = new JSONModel({
                    busy : false,
                    delay : 1000
                });
                this.oAppModel = oAppModel;
                this.getOwnerComponent().setModel(oAppModel, "app");
 
                fnSetAppNotBusy = function() {
                    oAppModel.setProperty("/busy", false);
                    oAppModel.setProperty("/delay", iOriginalBusyDelay);
                };
 
                // disable busy indication when the metadata is loaded and in case of errors
                this.getOwnerComponent().getModel().metadataLoaded().
                    then(fnSetAppNotBusy);
                this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

                this.MainModel = this.getOwnerComponent().getModel();
                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("RouteMain").attachPatternMatched(this._onObjectMatched, this);

                this.getView().setModel(this.getOwnerComponent().getModel("i18n").getResourceBundle());
            },

            _onObjectMatched: function (oEvent) {

               // debugger;
                var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                //var startupParams={MDCCId:35,manage:"false"};

                // startupParams.manage=false;
                // get Startup params from Owner Component
                if (startupParams.manage[0] === "true") {
                    this.oRouter.navTo("RouteInitiateDispatchPage", {
                        MDCCId: parseInt(startupParams.MDCCId[0])
                    }, false);
                }
                else {
                    //   this.sObjectId = oEvent.getParameter("arguments").MDCCId;
                    this.sObjectId = startupParams.MDCCId;
                    // this.sObjectId = this.sObjectId;
                    this._getMDCCData();
                    this._getParentData();
                }
                //   this._bindView("/PurchaseOrderSet" + sObjectId);
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

            // Read Inspected Parent Items
            _getParentData: function () {
                var that = this;
                var sPath = "/MDCCSet(" + this.sObjectId + ")/InspectionCall/InspectedParentItems";
                that.getComponentModel("app").setProperty("/busy", true);
                this.MainModel.read(sPath, {
                    success: function (oData, oResponse) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        if (oData.results.length) {
                            this._getChildItems(oData.results);
                        }
                    }.bind(this),
                    error: function (oError) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            },

            // Read Child Items -- Inspected BOQ Items
            _getChildItems: function (ParentData) {
                this.ParentData = ParentData;
                for (var i = 0; i < ParentData.length; i++) {

                    var sPath = "/MDCCSet(" + this.sObjectId + ")/InspectionCall/InspectedParentItems(" + ParentData[i].ID + ")/InspectedBOQItems";
                    this.MainModel.read(sPath, {
                        success: function (i, oData, oResponse) {

                            // Is Deleted - Check based on quantity is present or not then push it.
                            if (ParentData[i].MDCCApprovedQty != null && ParentData[i].MDCCApprovedQty != ""
                                && ParentData[i].MDCCApprovedQty != "0.0") {
                                this.ParentData[i].isSelected = true;
                                this.ParentData[i].isPreviouslySelected = true;
                            } else {
                                this.ParentData[i].isSelected = false;
                                this.ParentData[i].isPreviouslySelected = false;
                            }

                            if (oData.results.length) {
                                this.ParentData[i].isStandAlone = true;
                                this.ParentData[i].ChildItems = oData.results;
                                this.ParentData[i].IsDeleted = false;

                                for (var j = 0; j < ParentData[i].ChildItems.length; j++) {
                                    if (ParentData[i].ChildItems[j].MDCCApprovedQty != null && ParentData[i].ChildItems[j].MDCCApprovedQty != ""
                                        && ParentData[i].ChildItems[j].MDCCApprovedQty != "0.0") {
                                        this.ParentData[i].ChildItems[j].isSelected = true;
                                        this.ParentData[i].ChildItems[j].isPreviouslySelected = true;
                                        this.ParentData[i].ChildItems[j].IsDeleted = false;
                                    } else {
                                        this.ParentData[i].ChildItems[j].isSelected = false;
                                        this.ParentData[i].ChildItems[j].isPreviouslySelected = false;
                                        this.ParentData[i].ChildItems[j].IsDeleted = false;
                                    }
                                }
                            }
                            else {
                                this.ParentData[i].isStandAlone = false;
                                this.ParentData[i].IsDeleted = false;
                                this.ParentData[i].ChildItems = [];
                            }
                            if (i == this.ParentData.length - 1)
                                this._arrangeData();
                        }.bind(this, i),
                        error: function (oError) {
                            sap.m.MessageBox.Error(JSON.stringify(oError));
                        }
                    });
                }
            },

            onLiveChangeApprovedQty: function (oEvent) {
                var rowObj = oEvent.getSource().getParent().getRowBindingContext().getObject();
                var MDCCApprovedQty = oEvent.getSource().getParent().getCells()[6].getValue();
                var aCell = oEvent.getSource().getParent().getCells()[6];
                if (parseInt(MDCCApprovedQty) > parseInt(rowObj.Qty)) {
                    aCell.setValueState("Error");
                    aCell.setValueStateText("Please do not enter more quantity than total quantity")
                    this.getView().byId("idBtnSave").setEnabled(false);
                } else {
                    aCell.setValueState("None");
                    this.getView().byId("idBtnSave").setEnabled(true);
                }
            },

            onSelectionOfRow: function (oEvent) {
                var bSelected = oEvent.getParameter("selected");

                if (bSelected) {
                    oEvent.getSource().getParent().getCells()[6].setEditable(true);
                    if (oEvent.getSource().getParent().getRowBindingContext().getObject().isPreviouslySelected) {
                        oEvent.getSource().getParent().getRowBindingContext().getObject().IsDeleted = false;
                    }
                } else {
                    oEvent.getSource().getParent().getCells()[6].setEditable(false);
                    oEvent.getSource().getParent().getCells()[6].setValue(null);

                    // Is Deleted - If User unselect the previous saved item
                    if (oEvent.getSource().getParent().getRowBindingContext().getObject().isPreviouslySelected) {
                        oEvent.getSource().getParent().getRowBindingContext().getObject().IsDeleted = true;
                    }
                }
            },

            onSave: function (oEvent) {
                var that = this;
                var flag = 0;
                var oPayload = {
                    "MDCCId": that.MDCCData.ID,
                    "MDCCName": "",
                    "CreatedAt": that.MDCCData.CreatedAt,
                    "CreatedBy": that.MDCCData.CreatedBy,
                    "UpdatedAt": that.MDCCData.UpdatedAt,
                    "UpdatedBy": that.MDCCData.UpdatedBy,
                };
                oPayload.MDCCParentLineItem = [];
                var data = this.getView().getModel("TreeTableModel").getData().ChildItems;
                for (var i = 0; i < data.length; i++) {
                    flag = 0;
                    var obj = {};
                    obj.ParentLineItemID = data[i].ID;
                    obj.MDCCApprovedQty = parseInt(data[i].MDCCApprovedQty);
                    obj.RemainingQty = parseInt(data[i].RemainingQty);
                    obj.IsDeleted = data[i].IsDeleted;
                    obj.MDCCBOQItem = [];

                    for (var j = 0; j < data[i].ChildItems.length; j++) {
                        var childObj = {};
                        childObj.BOQItemID = data[i].ChildItems[j].ID;
                        childObj.MDCCApprovedQty = parseInt(data[i].ChildItems[j].MDCCApprovedQty);
                        childObj.RemainingQty = parseInt(data[i].ChildItems[j].RemainingQty);
                        childObj.IsDeleted = data[i].ChildItems[j].IsDeleted;

                        if ( childObj.IsDeleted == true ){
                            childObj.MDCCApprovedQty = 0;
                        }
                        if (childObj.MDCCApprovedQty || childObj.IsDeleted == true) {
                            obj.MDCCBOQItem.push(childObj);
                            flag = 1;
                        }
                    }
                    if (obj.MDCCApprovedQty || flag == 1 || obj.IsDeleted == true){
                        oPayload.MDCCParentLineItem.push(obj);
                    }
                    if ( obj.IsDeleted == true ){
                        obj.MDCCApprovedQty = 0;
                    }
                }
            
                // Create Call 
                that.getComponentModel("app").setProperty("/busy", true);
                that.MainModel.create("/MDCCBOQRequestSet", oPayload, {
                    success: function (oData, oResponse) {
                        //  that.getComponentModel("app").setProperty("/busy", false);
                        // debbuger;
                        that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.success("MDCC items mapped successfully!", {
                            title: "Success",
                            onClose: function (oAction1) {
                                
                                if (oAction1 === sap.m.MessageBox.Action.OK) {
                                    window.history.go(-1);
                                }
                            }.bind(this)
                        });

                        //  that.onCancel();
                    }.bind(this),
                    error: function (oError) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            // Model Data Set To Table
            _arrangeData: function () {
                var oModel = new JSONModel({ "ChildItems": this.ParentData });
                this.getView().setModel(oModel, "TreeTableModel");
            },

            //---------------------- View Data Fragment operation -----------------------//
            // Fragment/Dialog Open

            // Parent Data View Fetch / Model Set
            _getParentDataViewMDCC: function () {
                this.ParentDataView = [];
                var sPath = "/MDCCSet(" + this.sObjectId + ")/MDCCParentLineItems";
                that.getComponentModel("app").setProperty("/busy", true);
                this.MainModel.read(sPath, {
                    success: function (oData, oResponse) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        if (oData.results.length) {
                            this._getChildItemsViewMDCC(oData.results);
                        }
                    }.bind(this),
                    error: function (oError) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            },

            // Child Item View Fetch / Model Set
            _getChildItemsViewMDCC: function (ParentDataView) {
                this.ParentDataView = ParentDataView;
                for (var i = 0; i < ParentDataView.length; i++) {

                    var sPath = "/MDCCSet(" + this.sObjectId + ")/MDCCParentLineItems(" + ParentDataView[i].ID + ")/MDCCBOQItems";
                    this.MainModel.read(sPath, {
                        success: function (i, oData, oResponse) {

                            if (oData.results.length) {
                                this.ParentDataView[i].isStandAlone = true;
                                this.ParentDataView[i].ChildItemsView = oData.results;
                            }
                            else {
                                this.ParentDataView[i].isStandAlone = false;
                                this.ParentDataView[i].ChildItemsView = [];
                            }
                            if (i == this.ParentDataView.length - 1)
                                this._arrangeDataView();
                        }.bind(this, i),
                        error: function (oError) {
                            sap.m.MessageBox.Error(JSON.stringify(oError));
                        }
                    });
                }
            },

            onDispatchViewPress: function (oEvent) {
                var that = this;
                this.oRouter.navTo("RouteInitiateDispatchPage", {
                    MDCCId: 3
                }, false);

            }

        });
    });
