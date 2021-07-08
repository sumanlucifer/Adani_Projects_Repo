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
        'sap/m/Input',
        'sap/ui/core/ValueState'
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (BaseController , JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input,ValueState ) {
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

            
            onQRCodeSuggestionSelected : function(oEvent){
                var that = this;
                var qrCodeInput =this.byId("idInputScanCode");
                var qrCodeID = oEvent.getSource().getSelectedKey();
                var oBindingObject = oEvent.getSource().getObjectBinding();
                oEvent.getSource().setSelectedItem(oEvent.getSource().getSelectedItem());
                if ( qrCodeID == "" ){
                    qrCodeInput.setValueState(ValueState.Error);
                }else{
                     qrCodeInput.setValueState(ValueState.None);
                     this.onPressSubmitQRCode(oBindingObject,qrCodeInput.getValue());
                     that.getRouter().navTo("BarCodeDetailsPage", {QRCode:qrCodeID});
                }                
            },

             // On Submit QR Histroy
            onPressSubmitQRCode : function(oBindingObject,qr_number){
                var that = this;
                var userInfo = sap.ushell.Container.getService("UserInfo");
                var userId = userInfo.getId();
                var userEmail = userInfo.getEmail();  
                
                //userId = "";
                userEmail = "venkatesh.hulekal@extentia.com"
                //set the parameters//
                oBindingObject.getParameterContext().setProperty("qr_number", qr_number);
                oBindingObject.getParameterContext().setProperty("user_id",userId );
                oBindingObject.getParameterContext().setProperty("email", userEmail);

                
                //execute the action
                oBindingObject.execute().then(
                    function () {
                    //    sap.m.MessageToast.show("Submited Successfully");
                      //  that.getView().getModel().refresh();
                    },
                    function (oError) {
                            sap.m.MessageBox.alert(oError.message, {
                            title: "Error"
                        });
                    }
                );
            },
           

		});
	});
