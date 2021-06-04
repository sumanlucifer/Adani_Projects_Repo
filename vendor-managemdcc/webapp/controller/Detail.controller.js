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
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendormanagemdcc.controller.Detail", {

        onInit: function () {
            
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                showFooter:false,
                idBtnDelete: true,
                idBtnEdit: true,
                idBtnSave: false,
                idBtnCancel: false,
                idBtnDelete: false
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            this.mainModel = this.getComponentModel();
        },

        // On object matched
        _onObjectMatched: function (oEvent) {
            this.mdccID = oEvent.getParameter("arguments").mdccID;
            this.parentItem = oEvent.getParameter("arguments").parentItem;
            var sLayout = oEvent.getParameter("arguments").layout;

            this.getView().getModel().setProperty("/busy", false);
            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
         //   this.mdccID = 3;
         //   this.parentItem = 1;
            this._bindView("/MDCCSet" + this.mdccID);
            this._getLineItemData("/MDCCSet(" + this.mdccID + ")/InspectionCall/InspectedParentItems" + this.parentItem + "/InspectedBOQItems");
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

        // Line Item Data Read
        _getLineItemData: function (sPath) {
            this.getComponentModel().read(sPath, {
                success: function (oData, oResponse) {
                    var data = oData.results;
                    this._prepareDataForView(data);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            })
        },

        // Preparing The Data View
        _prepareDataForView: function(data){
            if(data.length){
                data.forEach(element => {
                    element.inspectionQuantity= null;
                });
            }
            var oModel = new JSONModel(data);
            this.getView().byId("idParentItemTable").setModel(oModel, "ParentItemModel");
        },

        // On Save Button
        onSaveButtonPress: function (oEvent) {
            //debugger;
            var aTableData = this.byId("idParentItemTable").getModel("ParentItemModel").getData();
            var aSelectedItemsFromTable = aTableData.filter(item => item.inspectionQuantity !== null);
        },
       

        // On Edit Press Button
        onEdit: function () {
            this.getViewModel("objectViewModel").setProperty("/showFooter", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);
        },

        // On Selection Change
        onSelectionChange: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var bSelectAll = oEvent.getParameter("selectAll");
            var aListItems = oEvent.getParameter("listItems");

            if (bSelectAll) {
                for (var i = 0; i < aListItems.length; i++) {
                    aListItems[i].getCells()[4].setEnabled(true);
                }
            } else {
                for (var i = 0; i < aListItems.length; i++) {
                    aListItems[i].getCells()[4].setEnabled(false);
                    aListItems[i].getCells()[4].setValue(null);
                }
            }

            if (bSelected) {
                oEvent.getParameter("listItem").getCells()[4].setEnabled(true);
            } else {
                oEvent.getParameter("listItem").getCells()[4].setEnabled(false);
                oEvent.getParameter("listItem").getCells()[4].setValue(null);
            }
        },

        // on Add Item Press
        onAddItemPress: function (oEvent) {
            var oModel = this.getViewModel("ParentItemModel");
            var oItems = oModel.getProperty("/").map(function (oItem) {
                return Object.assign({}, oItem);
            });

            oItems.push({
                Name: "",
                MaterialCode: "",
                Description: "",
                Qty: "",
                MDCCApprovedQty1:"",
                UOM: "",
            //    Remarks: "",
             //   MasterBOQItemId: "",
              //  MasterUOMItemId:"",
              //  UOMSuggestions: null
            });
            
            oModel.setProperty("/boqItems", oItems);
        },
        // On Save Press Button
        onSave: function () {
            var that = this;
            var Name = this.byId("nameEdit").getValue();
            if ( Name == "" ){
                MessageBox.error("Please enter name");
                return;
            }
            var oPayload = {};
            oPayload.Name = Name;
            if (this.sPackingListID === "new") {
                MessageBox.confirm("Do you want create new packing list type "+Name+"?",{
				    icon: MessageBox.Icon.INFORMATION,
				    title: "Confirm",
				    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				    emphasizedAction: MessageBox.Action.YES,
				    onClose: function (oAction) { 
                        if ( oAction == "YES" ){
                            that.getComponentModel("app").setProperty("/busy", true);
                            that.mainModel.create("/MasterPackagingTypeSet", oPayload, {
                                success: function (oData, oResponse) {
                                    // MessageBox.success(oData.Message);
                                    that.getComponentModel("app").setProperty("/busy", false);
                                    MessageBox.success("Packing list type created successfully");
                                    that.onCancel();
                                    }.bind(this),
                                error: function (oError) {
                                    that.getComponentModel("app").setProperty("/busy", false);
                                    MessageBox.error(JSON.stringify(oError));
                                }
                            });
                        }
                    }
			    });   
            }
        },

        // On Cancel Press Button
        onCancel: function () {
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", false);
            this.getViewModel("objectViewModel").setProperty("/showFooter", false);

            if (this.sPackingListID === "new") {
                this.oRouter.navTo("RouteMaster", {
                },
                false
                );
            }
        },

         onNavigateToMaster : function(){
                this.oRouter.navTo("RouteMaster", {
                },
                false
                );
        }
    });
});            
