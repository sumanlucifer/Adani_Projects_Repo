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
                
                var oViewModel = new JSONModel({
                    "submitQRCode": false,
                    "scanQRCode": true,
                    "submitInvoiceCode": false,
                    "inputQRCode":true,
                    "inputInvoiceCode":true

                });
                this.setModel(oViewModel, "oViewModel");
                
                // Main Model Set
                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);
                
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("ScanQrCodePage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched:function(oEvent){
                var that = this;
                // var sObjectId = oEvent.getParameter("arguments").PackingListId;
                // this.sObjectId=sObjectId;
                this._bindView("/QRCodeSet");
            },

            _onNavtoQRDeatilsPage: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;
                that.getRouter().navTo("QRCodeDetailsPage", {
                    QRNo: oItem.getBindingContext().getObject().PackingListId
                });            
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
            
            // onQRCodeSuggestionSelected : function(oEvent){
            //     var that = this;
            //     var qrCodeInput =this.byId("idInputQRCode");
            //     var qrCodeID = oEvent.getSource().getSelectedKey();
            //     var oBindingObject = oEvent.getSource().getObjectBinding();
            //     oEvent.getSource().setSelectedItem(oEvent.getSource().getSelectedItem());
            //     if ( qrCodeID == "" ){
            //         qrCodeInput.setValueState(ValueState.Error);
            //         // this.getView().byId("idQRBtn").setProperty("enabled", false);
            //     }else{
            //          qrCodeInput.setValueState(ValueState.None);
            //         //  this.getView().byId("idQRBtn").setProperty("enabled", true);
                     
            //         //  this.onPressSubmitQRCode(oBindingObject,qrCodeInput.getValue());
            //         //  that.getRouter().navTo("QRCodeDetailsPage", {QRCode:qrCodeID});
            //     }                
            // },

            // onInvoiceSuggestionSelected : function(oEvent){
            //     var that = this;
            //     var invoiceInput =this.byId("idInvoiceNum");
            //     var invoiceID = oEvent.getSource().getSelectedKey();
            //     var oBindingObject = oEvent.getSource().getObjectBinding();
            //     oEvent.getSource().setSelectedItem(oEvent.getSource().getSelectedItem());
            //     if ( invoiceID == "" ){
            //         invoiceInput.setValueState(ValueState.Error);
            //         // this.getView().byId("idInvBtn").setProperty("enabled", false);
            //     }else{
            //          invoiceInput.setValueState(ValueState.None);
            //         //  this.getView().byId("idInvBtn").setProperty("enabled", true);
            //     }                
            // },

            onLiveChangeQR : function(oEvent) {
                var qrcodeID = this.byId("idInputQRCode").getSelectedKey();
                if ( qrcodeID !== "" ){
                      this.getView().byId("idQRBtn").setProperty("enabled", false);
                      this.getView().byId("idQRSubmit").setProperty("enabled", true);
                      this.getView().byId("idInvoiceNum").setProperty("enabled", false);
                      
                }else{
                      this.getView().byId("idQRBtn").setProperty("enabled", true);
                      this.getView().byId("idQRSubmit").setProperty("enabled", false);
                      this.getView().byId("idInvoiceNum").setProperty("enabled", true);
                }         
            },

            onLiveChangeInvoice : function(oEvent) {
                var invoiceID = this.byId("idInvoiceNum").getSelectedKey();
                if ( invoiceID !== "" ){
                      this.getView().byId("idInvBtn").setProperty("enabled", false);
                      this.getView().byId("idQRSubmit").setProperty("enabled", true);
                      this.getView().byId("idInputQRCode").setProperty("enabled", false);

                }else{  
                      this.getView().byId("idInvBtn").setProperty("enabled", true);
                      this.getView().byId("idQRSubmit").setProperty("enabled", false);
                      this.getView().byId("idInputQRCode").setProperty("enabled", true);
                }         
            },

            // On Press QR Histroy
            onPressScanQRCode : function(){
                var that = this;
                this.getView().byId("idQRBtn").setProperty("enabled", false);
                this.getView().byId("idInvBtn").setProperty("enabled", false);
                this.getView().byId("idInputQRCode").setProperty("enabled", false);
                this.getView().byId("idInvoiceNum").setProperty("enabled", false);
                this.validateQRCode();
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
                // filter.push(PACKINGLISTFilter);
              //  var sPath = "/QRCodeSet?$filter=QRNumber eq '"+qrCodeId+"' and Type eq 'PACKINGLIST'&$expand=PackingList"
                            
                this.MainModel.read("/QRCodeSet", {
                    filters:[filter],
				    success: function(oData, oResponse) {
					    if(oData){
                            // debugger;
                            if(oData.results.length){
                                that.oRouter.navTo("QRCodeDetailsPage", {
                                    QRNo : oData.results[0].ID,
                                    Type: "QR"
                                },false);
                            }else{
                                sap.m.MessageBox.error("Please Enter Valid QR Code");    
                            }
                        }else{
                            sap.m.MessageBox.error("Please Enter Valid QR Code");
                        }
				    }.bind(this),
				    error: function(oError) {
					    sap.m.MessageBox.error(JSON.stringify(oError));
				    }
			    });                            
            },

            onPressSubmitInvoiceNumber : function(){
                var that = this;
                this.validateInvoiceNumber();
            },
            validateInvoiceNumber : function(){
                var that = this;
               
                var invnumberId = this.getView().byId("idInvoiceNum").getValue();
                var InvNumberFilter = new sap.ui.model.Filter({
                        path: "InvoiceNumber",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: invnumberId
                });

                var PACKINGLISTFilter = new sap.ui.model.Filter({
                        path: "Type",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: 'PACKINGLIST'
                });
                var filter = [];
                filter.push(InvNumberFilter);
                // filter.push(PACKINGLISTFilter);
              //  var sPath = "/QRCodeSet?$filter=QRNumber eq '"+qrCodeId+"' and Type eq 'PACKINGLIST'&$expand=PackingList"
                            
                this.MainModel.read("/PackingListSet", {
                    filters:[filter],
                    
				    success: function(oData, oResponse) {
					    if(oData){
                            // debugger;
                            if(oData.results.length){
                                that.oRouter.navTo("QRCodeDetailsPage", {
                                    QRNo : oData.results[0].ID,
                                    Type: "INV"
                                },false);
                            }else{
                                sap.m.MessageBox.error("Please Enter Valid Invoice Number");    
                            }
                        }else{
                            sap.m.MessageBox.error("Please Enter Valid Invoice Number");
                        }
				    }.bind(this),
				    error: function(oError) {
					    sap.m.MessageBox.error(JSON.stringify(oError));
				    }
			    });                            
            },
           
            onSubmitInvNum : function(oEvent){
                var that = this;
                var invoiceInput =this.byId("idInvoiceNum");
                var invoiceID = oEvent.getSource().getSelectedKey();
                var oBindingObject = oEvent.getSource().getObjectBinding();
                oEvent.getSource().setSelectedItem(oEvent.getSource().getSelectedItem());
                if ( invoiceID == "" ){
                    invoiceInput.setValueState(ValueState.Error);
                }else{
                     invoiceInput.setValueState(ValueState.None);
                }                
            }
		});
	});
