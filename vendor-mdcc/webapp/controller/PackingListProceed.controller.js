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
                this._getMDCCData();
                this._getParentDataViewMDCC();
                //   that.dataForSave = [];
                //  this._getParentData();
                this._bindView("/MDCCSet(" + this.sObjectId + ")");
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
                this.MainModel.read(sPath, {
                    success: function (oData, oResponse) {
                        if (oData) {
                            that.MDCCData = oData;
                        } else {
                            that.MDCCData = [];
                        }
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            },


            onEditQuantity: function (oEvent) {

            },

            onSelectionOfRow: function (oEvent) {
                var bSelected = oEvent.getParameter("selected");

                if (bSelected) {
                    oEvent.getSource().getParent().getCells()[7].setEditable(true);
                } else {
                    oEvent.getSource().getParent().getCells()[7].setEditable(false);
                    oEvent.getSource().getParent().getCells()[7].setValue(null);
                }

                /*  var that = this;
                  that.dataForSave = [];
               //   var isIndexSelected = oEvent.getSource().isIndexSelected();
                  var selectedRows = oEvent.getSource().getSelectedIndices();
               //   var selectedObj = this.ParentDataView[rowIndex];
                  var tableData = this.getView().getModel("TreeTableModel").oData.ChildItems;
  
                  if(selectedRows.length){
                      for(var i = 0 ; i < selectedRows.length ; i++ ){                
                          that.dataForSave.push(tableData[selectedRows[i]]);
                      }
                  }
              */
            },

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
                        if (ParentData[i].ChildItems[j].DispatchQty != null && ParentData[i].ChildItems[j].DispatchQty != "") {
                            childObj = {
                                "BOQItemID": ParentData[i].ChildItems[j].ID,
                                "MDCCApprovedQty": ParentData[i].ChildItems[j].MDCCApprovedQty,
                                "DispatchQty": ParentData[i].ChildItems[j].DispatchQty
                            };
                            parentObj.MDCCBOQItem.push(childObj)
                            flag = 1;
                            // break;
                        }
                    }  // j end 
                    if (flag == 1) {
                        saveData.MDCCParentItems.push(parentObj);
                    }
                    // Only Parent Object Insert - No Child Present
                    if (ParentData[i].DispatchQty != null && ParentData[i].DispatchQty != "") {
                        saveData.MDCCParentItems.push(parentObj);
                    }
                } // i end

                var oPayload = {
                    "ID": that.MDCCData.ID,
                    "MDCCParentItems": saveData.MDCCParentItems
                };

                // Create Call 
                that.MainModel.create("/MDCCEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        //  that.getComponentModel("app").setProperty("/busy", false);

                        MessageBox.success("selected items processed successfully");

        
                        var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                        var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                            target: {
                                semanticObject: "PackingList",
                                action: "manage"
                            },
                            params: {
                                "packingListID": 11
                            }
                        })) || ""; // generate the Hash to display a MDCC Number
                        oCrossAppNavigator.toExternal({
                            target: {
                                shellHash: hash
                            }
                        }); // navigate to Manage MDCC application - Initiate Dispatch Screen


                        //  that.onCancel();
                    }.bind(this),
                    error: function (oError) {

                        // that.getComponentModel("app").setProperty("/busy", false);
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

            onViewPress: function (oEvent) {
                //  var oItem = oEvent.getSource();
                var that = this;
                // this._getParentDataViewMDCC();
                //that.sPath = oEvent.getSource().getParent().getBindingContextPath();
                // that.handleViewDialogOpen();
            },

            // Arrange Data For View / Model Set
            _arrangeDataView: function () {
                var that = this;
                var oModel = new JSONModel({ "ChildItems": this.ParentDataView });
                this.getView().setModel(oModel, "TreeTableModel");
                // var sPath = oEvent.getSource().getParent().getBindingContextPath();
                // sPath=  ;
                //   that.handleViewDialogOpen();
                //debugger;
            },

            // Parent Data View Fetch / Model Set
            _getParentDataViewMDCC: function () {
                this.ParentDataView = [];
                var sPath = "/MDCCSet(" + this.sObjectId + ")/MDCCParentLineItems";
                this.MainModel.read(sPath, {
                    success: function (oData, oResponse) {
                        if (oData.results.length) {
                            this._getChildItemsViewMDCC(oData.results);
                        }
                    }.bind(this),
                    error: function (oError) {
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
                                this.ParentDataView[i].isSelected = false;
                                this.ParentDataView[i].ChildItems = oData.results;
                            }
                            else {
                                this.ParentDataView[i].isStandAlone = false;
                                this.ParentDataView[i].isSelected = false;
                                this.ParentDataView[i].ChildItems = [];
                            }
                            if (i == this.ParentDataView.length - 1)
                                this._arrangeDataView();
                        }.bind(this, i),
                        error: function (oError) {
                            sap.m.MessageBox.Error(JSON.stringify(oError));
                        }
                    });
                }
            }

        });
    });
