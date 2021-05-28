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
<<<<<<< HEAD
=======
                showFooter:false,
>>>>>>> 91dc7ae775773b8a8cf094c0835a9af971a26401
                idBtnDelete: true,
                idBtnEdit: true,
                idBtnSave: false,
                idBtnCancel: false
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

<<<<<<< HEAD
=======
                this.getViewModel("objectViewModel").setProperty("/showFooter", true);
>>>>>>> 91dc7ae775773b8a8cf094c0835a9af971a26401
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
<<<<<<< HEAD
=======
                this.getViewModel("objectViewModel").setProperty("/showFooter", false);
>>>>>>> 91dc7ae775773b8a8cf094c0835a9af971a26401
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", true);
                this._bindView("/MasterPackagingTypeSet" + this.sPackingListID);
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
<<<<<<< HEAD
=======
            this.getViewModel("objectViewModel").setProperty("/showFooter", true);
>>>>>>> 91dc7ae775773b8a8cf094c0835a9af971a26401
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);
        },

        // On Save Press Button
        onSave: function () {
<<<<<<< HEAD
                var that = this;
                var oPayload = {};
                oPayload.Name = this.byId("nameEdit").getValue();
                oPayload.ID = this.byId("idEdit").getValue();

            if (this.sPackingListID === "new") {
                this.mainModel.create("/MasterPackagingTypeSet", oPayload, {
=======
            
            var that = this;
            var Name = this.byId("nameEdit").getValue();
            if ( Name == "" ){
                MessageBox.error("Please enter name ");
                return;
            }
            var oPayload = {};
            oPayload.Name = Name;
            if (this.sPackingListID === "new") {
                MessageBox.confirm("Do you want crate new packing list type ?",{
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
            else
            {   
                var sPath = this.getView().getBindingContext().getPath();
                that.getComponentModel("app").setProperty("/busy", true);
                 this.mainModel.update(sPath, oPayload, {
>>>>>>> 91dc7ae775773b8a8cf094c0835a9af971a26401
                    success: function (oData, oResponse) {
                       // MessageBox.success(oData.Message);
                        that.getComponentModel("app").setProperty("/busy", false);
                        MessageBox.success("Packing list updated successfully");
                        that.getView().getModel().refresh();
                        that.onCancel();
                    }.bind(this),
                    error: function (oError) {
                        that.getComponentModel("app").setProperty("/busy", false);
                        MessageBox.error(JSON.stringify(oError));
                    }
                });
            }
<<<<<<< HEAD
            else
            {   
                               //        /scarrEntitySet('" + oCust1 + "')", 
                               //"/MasterPackagingTypeSet('" + oCust1 + "')"
                var sPath = this.getView().getBindingContext().getPath();
                 this.mainModel.update(sPath, oPayload, {
                    success: function (oData, oResponse) {
                       // sap.m.MessageBox.success(oData.Message);
                        sap.m.MessageBox.success("Packing List Updated Successfully");
                        // this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
                        this.getView().getModel().refresh();
                        that.onCancel();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            }
=======
>>>>>>> 91dc7ae775773b8a8cf094c0835a9af971a26401
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
<<<<<<< HEAD
            this.mainModel.remove(sPath, {
                    success: function (oData, oResponse) {
                       // sap.m.MessageBox.success(oData.Message);
                        sap.m.MessageBox.success("Packing List Type Deleted Successfully");
                        // this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
                        this.getView().getModel().refresh();
                        that.onCancel();
                        that.onNavigateToMaster();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
=======
            MessageBox.confirm("Do you want delete packing list type ?",{
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
                                MessageBox.error(JSON.stringify(oError));
                            }
                            });
                        }
                    }
            });
>>>>>>> 91dc7ae775773b8a8cf094c0835a9af971a26401
        },
         onNavigateToMaster : function(){
                this.oRouter.navTo("RouteMaster", {
                },
                false
                );
        }
    });
});            
