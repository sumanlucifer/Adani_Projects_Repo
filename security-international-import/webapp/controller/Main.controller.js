sap.ui.define([
    "./BaseController",
	 "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
],function (BaseController, JSONModel, Filter, FilterOperator, Fragment) {
    "use strict";

		return BaseController.extend("com.agel.mmts.securityinternationalimport.controller.Main", {
			onInit: function () {
                  
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                // International Import Model
                var oImportModel = new JSONModel({
                    PONumber: "",
                    ContainerNumber: "",
                    VehicleNumber: "",
                    InvoiceNumber: "",
                });
                this.getView().setModel(oImportModel, "oImportModel");

                this.MainModel = this.getComponentModel();
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteMain").attachPatternMatched(this._onObjectMatched, this);
            },
            
            _onObjectMatched : function(oEvent){
               // debugger;
            },

            onLiveChangePoNob : function(oEvent){
                oEvent.getSource().setValueState("None");
            },
            onLiveChangeContNob : function(oEvent){
                oEvent.getSource().setValueState("None");
            },
            onLiveChangeVehicleNob : function(oEvent){
                oEvent.getSource().setValueState("None");
            },
            onLiveChangeInvoiceNob : function(oEvent){
                oEvent.getSource().setValueState("None");
            },

            onCreateEntry : function(oEvent){
                
                var that=this;
                var oModel = this.getView().getModel("oImportModel").getData();
                var flag = 0 ;
                if ( oModel.PONumber == "" ){
                    this.getView().byId("idInpPoNob").setValueState("Error");
                    flag = 1;
                }
                if ( oModel.ContainerNumber == "" ){
                    this.getView().byId("idInpContNob").setValueState("Error");
                    flag = 1;
                }
                if ( oModel.VehicleNumber == "" ){
                    this.getView().byId("idInpVehicleNob").setValueState("Error");
                    flag = 1;
                }
                if ( oModel.InvoiceNumber == "" ){
                    this.getView().byId("idInvoiceNob").setValueState("Error");
                    flag = 1;
                }

                if ( flag == 1){
                    sap.m.MessageBox.error("Please fill mandatory fields");
                    return 0;
                };

                var oPayload = {
                    "PONumber": oModel.PONumber,
                    "ContainerNumber": oModel.ContainerNumber,
                    "VehicleNumber": oModel.VehicleNumber,
                    "InvoiceNumber": oModel.InvoiceNumber,
                };
                that.MainModel.create("/ManualEntrySet", oPayload, {
                    success: function (oData, oResponse) {
                        sap.m.MessageBox.success("Import entry created successfully");        
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            }

		});
	});
