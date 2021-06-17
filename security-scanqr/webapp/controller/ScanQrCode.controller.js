sap.ui.define([
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/Fragment",
        "sap/ui/model/Sorter",
        "sap/ui/Device",
        "sap/ui/core/routing/History",
        "sap/m/ColumnListItem",
        "sap/m/Input",
        "sap/ui/core/ValueState"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (BaseController , JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input,ValueState ) {
		"use strict";

		return BaseController.extend("com.agel.mmts.securityscanqr.controller.ScanQrCode", {
            
            onInit: function () {
                
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");
                
                // Main Model Set
                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);
                
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("ScanQrCodePage").attachPatternMatched(this._onObjectMatched, this);
            },

         /* onPressSubmitQRCode : function(){
                var that = this;
                var qrCodeInput =this.byId("idInputScanCode");
                var qrCodeID= qrCodeInput.getSelectedKey();
                if ( qrCodeID == "" ){
                    qrCodeInput.setValueState(ValueState.Error);
                }else{
                     qrCodeInput.setValueState(ValueState.None);
                    that.getRouter().navTo("BarCodeDetailsPage", {QRCode:qrCodeID});
                }
            }, */

            _onObjectMatched: function (oEvent) {
               // var sObjectId = "XLj52SRDpM";
               //this._bindView("/ScannedMaterialSet");                
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
            
            onQRCodeSuggestionSelected : function(oEvent){
                var that = this;
                var qrCodeInput =this.byId("idInputQRCode");
                var qrCodeID = oEvent.getSource().getSelectedKey();
                var oBindingObject = oEvent.getSource().getObjectBinding();
                oEvent.getSource().setSelectedItem(oEvent.getSource().getSelectedItem());
                if ( qrCodeID == "" ){
                    qrCodeInput.setValueState(ValueState.Error);
                }else{
                     qrCodeInput.setValueState(ValueState.None);
                    //  this.onPressSubmitQRCode(oBindingObject,qrCodeInput.getValue());
                     that.getRouter().navTo("BarCodeDetailsPage", {QRCode:qrCodeID});
                }                
            },

            
         /*   onSubmitInvNum : function(oEvent){
                var that = this;
                var invoiceInput =this.byId("idInvoiceNum");
                var invoiceID = oEvent.getSource().getSelectedKey();
                var oBindingObject = oEvent.getSource().getObjectBinding();
                oEvent.getonPressSubmitQRCodeSource().setSelectedItem(invoiceID);
                if ( invoiceID == "" ){
                    invoiceInput.setValueState(ValueState.Error);
                }else{
                     invoiceInput.setValueState(ValueState.None);
                     that.getRouter().navTo("BarCodeDetailsPage", {InvoiceNumber:invoiceID});
                }                
            }, */

            onSubmitQRCode : function(oEvent) {
                var that = this;
                var qrCode =this.byId("idInputQRCode");
                var qrCodeID = oEvent.getSource().getSelectedKey();
                var oBindingObject = oEvent.getSource().getObjectBinding();
                oEvent.getSource().setSelectedItem(qrCodeID);
                if (qrCodeID == "" ){
                    qrCode.setValueState(ValueState.Error);
                }else{
                     qrCode.setValueState(ValueState.None);
                     that.getRouter().navTo("BarCodeDetailsPage", {QRNumber:qrCodeID});
                } 
            },

            // On Submit QR Histroy
            onPressSubmitQRCode : function(){
                var that = this;
                this.validateQRCode();
            },

            // Validate QR Code
            validateQRCode : function(){
                var that = this;
               
                var qrCodeId = this.getView().byId("idInputQRCode").getValue();
                var QRNumberFilter = new sap.ui.model.Filter({
                        path: "QRNumber",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: qrCodeId
                });

                var PACKINGLISTFilter = new sap.ui.model.Filter({
                        path: "Type",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: 'PACKINGLIST'
                });
                var filter = [];
                filter.push(QRNumberFilter);
                filter.push(PACKINGLISTFilter);
              //  var sPath = "/QRCodeSet?$filter=QRNumber eq '"+qrCodeId+"' and Type eq 'PACKINGLIST'&$expand=PackingList"
                            
              
                this.MainModel.read("/QRCodeSet", {
                    filters:[filter],
				    success: function(oData, oResponse) {
					    if(oData){
                            debugger;
                            if(oData.results.length){
                                that.oRouter.navTo("QRCodeDetailsPage", {
                                    QRCode : oData.results[0].ID
                                },false);
                            }else{
                                sap.m.MessageBox.error("Please Enter Valid QR Code");    
                            }
                        }else{
                            sap.m.MessageBox.error("Please Enter Valid QR Code");
                        }
				    }.bind(this),
				    error: function(oError) {
					    MessageBox.error(JSON.stringify(oError));
				    }
			    });                            
            },
           

            onSubmitInvNum : function(oEvent){
                var that = this;
                var invoiceInput =this.byId("idInvoiceNum");
                var invoiceID = oEvent.getSource().getSelectedKey();
                var oBindingObject = oEvent.getSource().getObjectBinding();
                oEvent.getonPressSubmitQRCodeSource().setSelectedItem(invoiceID);
                if ( invoiceID == "" ){
                    invoiceInput.setValueState(ValueState.Error);
                }else{
                     invoiceInput.setValueState(ValueState.None);
                     that.getRouter().navTo("BarCodeDetailsPage", {InvoiceNumber:invoiceID});
                }                
            },

            onSubmitQRCode : function(oEvent) {
                var that = this;
                var qrCode =this.byId("idInputQRCode");
                var qrCodeID = oEvent.getSource().getSelectedKey();
                var oBindingObject = oEvent.getSource().getObjectBinding();
                oEvent.getSource().setSelectedItem(qrCodeID);
                if (qrCodeID == "" ){
                    qrCode.setValueState(ValueState.Error);
                }else{
                     qrCode.setValueState(ValueState.None);
                     that.getRouter().navTo("BarCodeDetailsPage", {QRNumber:qrCodeID});
                } 
            }

		});
	});
