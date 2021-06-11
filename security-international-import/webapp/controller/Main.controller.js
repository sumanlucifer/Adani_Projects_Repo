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

            onCreateEntry : function(oEvent){
                // debugger;
                var that=this;
                var oModel = this.getView().getModel("oImportModel").getData();;
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
