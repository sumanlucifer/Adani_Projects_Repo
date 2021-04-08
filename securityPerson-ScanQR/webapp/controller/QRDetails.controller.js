sap.ui.define([
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/Fragment",
        "sap/ui/model/Sorter",
        "sap/ui/Device",
        "sap/ui/core/routing/History",
        'sap/m/ColumnListItem',
        'sap/m/Input'
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (BaseController , JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input ) {
		"use strict";

		return BaseController.extend("com.agel.mmts.securityPerson-ScanQR.controller.QRDetails", {
            
            onInit: function () {
                
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");
                
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("QRCodeDetailPage").attachPatternMatched(this._onObjectMatched, this);
            },

            onPressSubmitQRCode : function(oEvent){
                var that = this;
                var qrCodeID =this.byId("idInputScanCode").getSelectedKey();
                that.getRouter().navTo("BarCodeDetailsPage", {QRCode:qrCodeID});
            },

            onQRCodeSuggestionSelected : function(oEvent){
                var that = this;
                oEvent.getSource().setSelectedItem(oEvent.getSource().getSelectedItem());
            },

            _onObjectMatched: function (oEvent) {
               // var sObjectId = "XLj52SRDpM";
               // this._bindView("/enterQRNumber");                
            },

            _bindView: function(sObjectPath) {
                var objectViewModel = this.getViewModel("objectViewModel");

                this.getView().bindElement({
                        path: sObjectPath,
                        events: {
                            dataRequested: function() {
                                objectViewModel.setProperty("/busy", true);
                            },
                            dataReceived: function() {
                                objectViewModel.setProperty("/busy", false);
                                
                            }
                        }
                });

            },
           

		});
	});
