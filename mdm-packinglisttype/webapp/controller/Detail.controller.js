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

    return BaseController.extend("com.agel.mmts.mdmpackinglisttype.controller.Detail", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                idSFDisplay: true,
                idSFEdit: false,
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

        _onObjectMatched: function (oEvent) {
            this.sPackingListID = oEvent.getParameter("arguments").packingListType;
            var sLayout = oEvent.getParameter("arguments").layout;

            this.getView().getModel().setProperty("/busy", false);
            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);

            if (this.sPackingListID === "new") {
                this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
                this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);

                this.getViewModel("objectViewModel").setProperty("/showFooter", true);
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
                this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);
                
                this.mainModel.setDeferredBatchGroups(["createGroup"]);

                this._oNewContext = this.mainModel.createEntry("/MasterPackagingTypeSet", {
                    groupId: "createGroup",
                    properties: {
                        ID: "",
                        Name: "",
                    }
                }); 
                this._oObjectPath = this._oNewContext.sPath;
                //this.getView().setBindingContext(this._oNewContext);
                this.getView().bindElement({
                    path: this._oObjectPath
                });
            } else {
                this.getViewModel("objectViewModel").setProperty("/showFooter", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", true);
                this._bindView("/MasterPackagingTypeSet" + this.sPackingListID);
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", true);
            }
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

        // On Edit Press Button
        onEdit: function () {
            this.getViewModel("objectViewModel").setProperty("/showFooter", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);
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
                                 //   MessageBox.error(JSON.stringify(oError));
                                }
                            });
                        }
                    }
			    });
                
            }
            else

            {  
                 MessageBox.confirm("Do you want to update packing list type "+Name+"?",{
				    icon: MessageBox.Icon.INFORMATION,
				    title: "Confirm",
				    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				    emphasizedAction: MessageBox.Action.YES,
				    onClose: function (oAction) { 
                        if ( oAction == "YES" ){
                            var sPath = that.getView().getBindingContext().getPath();
                            that.getComponentModel("app").setProperty("/busy", true);
                            that.mainModel.update(sPath, oPayload, {
                                success: function (oData, oResponse) {
                                    that.getComponentModel("app").setProperty("/busy", false);
                                    MessageBox.success("Packing list updated successfully");
                                    that.getView().getModel().refresh();
                                    that.onCancel();
                                }.bind(this),
                                error: function (oError) {
                                    that.getComponentModel("app").setProperty("/busy", false);
                                   // MessageBox.error(JSON.stringify(oError));
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

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", true);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", false);

            if (this.sPackingListID === "new") {
                this.oRouter.navTo("RouteMaster", {
                },
                false
                );
            }
        },

        // On Delete Press Button
        onDeletePress : function(oEvent){
            var that=this;
            var sPath = this.getView().getBindingContext().getPath();
            var sName = this.getView().getBindingContext().getObject().Name;
            MessageBox.confirm("Do you want delete packing list type "+sName+"?",{
				    icon: MessageBox.Icon.WARNING,
				    title: "Confirm",
				    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				    emphasizedAction: MessageBox.Action.YES,
				    onClose: function (oAction) { 
                        if ( oAction == "YES" ){
                            that.getComponentModel("app").setProperty("/busy", true);
                            that.mainModel.remove(sPath, {
                                success: function (oData, oResponse) {
                                // MessageBox.success(oData.Message);
                                that.getComponentModel("app").setProperty("/busy", false);
                                MessageBox.success("Packing list type deleted successfully");
                                that.onCancel();
                                that.onNavigateToMaster();
                            }.bind(this),
                                error: function (oError) {
                                that.getComponentModel("app").setProperty("/busy", false);
                               // MessageBox.error(JSON.stringify(oError));
                            }
                            });
                        }
                    }
            });
        },
         onNavigateToMaster : function(){
                this.oRouter.navTo("RouteMaster", {
                },
                false
                );
        }
    });
});            
