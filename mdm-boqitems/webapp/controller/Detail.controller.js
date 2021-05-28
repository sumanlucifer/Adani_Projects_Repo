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

    return BaseController.extend("com.agel.mmts.mdmboqitems.controller.Detail", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                idSFDisplay: true,
                idSFEdit: false,
                idBtnEdit: true,
                idBtnSave: false,
                idBtnCancel: false,
                idBtnDelete:true,
                showFooter:false
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

            this.mainModel = this.getComponentModel();
        },

        _onObjectMatched: function (oEvent) {
            this.sParentID = oEvent.getParameter("arguments").parentMaterial;
            var sLayout = oEvent.getParameter("arguments").layout;

            this.getView().getModel().setProperty("/busy", false);

            this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
            var oSelectedKeyModel = new JSONModel();
            this.getView().setModel(oSelectedKeyModel, "oSelectedKeyModel");

            if (this.sParentID === "new") {
                this.getView().getModel("oSelectedKeyModel").setData([]);

                this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
                this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);

                this.getViewModel("objectViewModel").setProperty("/showFooter", true);
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
                this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);
                this.mainModel.setDeferredBatchGroups(["createGroup"]);


                this._oNewContext = this.mainModel.createEntry("/MasterBoQItemSet", {
                    groupId: "createGroup",
                    properties: {
                        ID: "",
                        Name: "",
                        Description: "",
                        UOMs:[]
                    }
                });
                this._oObjectPath = this._oNewContext.sPath;
                //this.getView().setBindingContext(this._oNewContext);
                this.getView().bindElement({
                    path: this._oObjectPath
                });
            } else {
                this.getView().getModel("oSelectedKeyModel").setData([{key: "49"}]);
                this.getViewModel("objectViewModel").setProperty("/showFooter", false);
                this.getViewModel("objectViewModel").setProperty("/idBtnDelete", true);
                this._bindView("/MasterBoQItemSet" + this.sParentID);
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

        onEdit: function () {
            this.getViewModel("objectViewModel").setProperty("/showFooter", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", true);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", false);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", true);

        },

        onSave: function () {
                var that = this;
                var oPayload = {};
                var arr =[];
                oPayload.Name = this.byId("nameEdit").getValue();
                oPayload.Description = this.byId("nameDesc").getValue();
                // oPayload.MaterialCode = "123";
                var selectedData = this.byId("uomEdit").getSelectedItems();
                if (this.sParentID === "new") {
                for(var i=0; i < selectedData.length; i++){
                    var obj ={};
                    obj.Name = selectedData[i].getProperty("text");
                    obj.MasterUOM ={
                        "__metadata":{
                            "uri": "MasterUOMSet(" + selectedData[i].getProperty("key") + ")"
                        }
                    }; 
                    arr.push(obj) ;   
                }
                oPayload.UOMs=arr; 
                this.getComponentModel("app").setProperty("/busy", true);
                this.mainModel.create("/MasterBoQItemSet", oPayload, {
                    success: function (oData, oResponse) {
                        sap.m.MessageBox.success("BOQ Item Created Successfully");
                        // sap.m.MessageBox.success(oData.Message);
                        // this.getViewModel("objectViewModel").setProperty("/isCreatingPCList", false);
                        // this.getView().getModel().refresh();
                        that.onCancel();
                        this.getComponentModel("app").setProperty("/busy", false);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                        this.getComponentModel("app").setProperty("/busy", false);
                    }
                });
                }
                else
                {   
                var sPath = this.getView().getBindingContext().getPath();
                this.getComponentModel("app").setProperty("/busy", true);
                 this.mainModel.update(sPath, oPayload, {
                    success: function (oData, oResponse) {
                        
                       // sap.m.MessageBox.success(oData.Message);
                        sap.m.MessageBox.success("UOM Updated Successfully");
                        this.getView().getModel().refresh();
                        that.onCancel();
                        this.getComponentModel("app").setProperty("/busy", false);
                    }.bind(this),
                    error: function (oError) {
                        this.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            }
        },

        onCancel: function () {
            this.getViewModel("objectViewModel").setProperty("/idBtnEdit", true);
            this.getViewModel("objectViewModel").setProperty("/idBtnSave", false);
            this.getViewModel("objectViewModel").setProperty("/idBtnCancel", false);
            this.getViewModel("objectViewModel").setProperty("/showFooter", false);

            this.getViewModel("objectViewModel").setProperty("/idSFDisplay", true);
            this.getViewModel("objectViewModel").setProperty("/idSFEdit", false);

            if (this.sParentID === "new") {
                    this.oRouter.navTo("LandingPage", {
                },
                    false
                );
            }
        },
        
        // On Delete Press Button
        onDelete : function(oEvent){
            var that=this;
            var sPath = this.getView().getBindingContext().getPath();
            this.getComponentModel("app").setProperty("/busy", true);
            this.mainModel.remove(sPath, {
                    success: function (oData, oResponse) {
                       // sap.m.MessageBox.success(oData.Message);
                        sap.m.MessageBox.success("UOM Deleted Successfully");
                        // this.getView().getModel().refresh();
                        that.onCancel();
                        that.onNavigateToMaster();
                        this.getComponentModel("app").setProperty("/busy", false);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                        this.getComponentModel("app").setProperty("/busy", false);
                    }
                });
        },

        onNavigateToMaster : function(){
                this.oRouter.navTo("LandingPage", {
                },
                false
                );
        }
        
    });
});            
