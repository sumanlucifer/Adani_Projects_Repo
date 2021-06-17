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
    "jquery.sap.global"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, jquery) {
        "use strict";
        return BaseController.extend("com.agel.mmts.securityscanqr.controller.QRCodeDetails", {
            

            onInit: function () {
                jquery.sap.addUrlWhitelist("blob");
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                var oViewHandlingModel = new JSONModel({
                    "EnterVehicleNo": null,
                    "ReEnterVehicleNo": null,
                    //     HeaderDeclineButton : false
                    "wantChange": false

                });
                this.setModel(oViewHandlingModel, "oViewHandlingModel");

                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("QRCodeDetailsPage").attachPatternMatched(this._onObjectMatched, this);
            },

            // On Object Matched 
            _onObjectMatched: function (oEvent) {
                var that = this;
               var QRCode = oEvent.getParameters().arguments.QRCode;
               that.QRCode = QRCode;
               // var QRCode = 5;
                this._bindView("/QRCodeSet(" + QRCode + ")/PackingList");
                //this._bindView("/PackingListSet(" + QRCode + ")");
            },
            
            // View Level Binding
            _bindView: function (sObjectPath) {
                var that = this;
                var objectViewModel = this.getViewModel("objectViewModel");

                this.getView().bindElement({
                    path: sObjectPath,
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            debugger;
                            that.onSaveScanQrCode();
                            objectViewModel.setProperty("/busy", false);
                        }
                    }
                });
            },

            onSaveScanQrCode : function(){
                var that = this;
                var PackingListId = this.getView().getBindingContext().getObject().ID;
                var oPayload = {
                                "QRCodeId":that.QRCode,
                                "PackingListId":PackingListId,
                                "UserId":"1"
                };

                this.MainModel.create("/ScannedMaterialSet", oPayload, {
                    success: function (oData, oResponse) {
                      //  that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.success("Scanned QR Code Stored Successfully");
                    }.bind(this),
                    error: function (oError) {
                      //  that.getComponentModel("app").setProperty("/busy", false);
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
              
            },

            // On change vehicle number
            onChangeVehicleNumberPress: function () {
                var bWantChange = this.getViewModel("oViewHandlingModel").getProperty("/wantChange");
                if (bWantChange) {
                    this.getViewModel("oViewHandlingModel").setProperty("/wantChange", false);
                } else {
                    this.getViewModel("oViewHandlingModel").setProperty("/wantChange", true)
                }
            },

            // On Approve Press Vehicle Number
            onPressApproveQRCode: function () {
                this.byId("idHboxReEnterVehicleNob").setVisible(false);            
            },

            // On Reject Press Vehicle Number
            onPressRejectQRCode: function () {
                this.byId("idHboxReEnterVehicleNob").setVisible(true);                
            },

            // On Submit Press - 
            onVehiclleNumberSubmit: function (oEvent) {
                   // debugger;
                   // return;
                    var that = this;
                    var obj = oEvent.getSource().getBindingContext().getObject();
                    var oVehicleNob = obj.VehicleNumber;
                    
                    var oPayload = {
                                    "PackingListId":obj.ID,
                                    "VehicleNumber":oVehicleNob,
                                    "ScannedMaterialId":1
                    };

                    this.MainModel.create("/VehicleNumberUpdateSet", oPayload, {
                        success: function (oData, oResponse) {
                            MessageBox.success("Vechile Number Submitted successfully");       
                         }.bind(this),
                        error: function (oError) {
                            MessageBox.error(JSON.stringify(oError));
                        }
                    });
            },
            
            // QR Code View 
            onViewQRCodePress : function(oEvent){
                
                if (!this._oCreateParentItemDialog) {
                    this._oCreateDialog = sap.ui.xmlfragment("com.agel.mmts.securityscanqr.view.fragments.ViewQR", this);
                    this.getView().addDependent(this._oCreateDialog);
                }
                this._oCreateDialog.open();
            },
            // Close Dialog
            closeDialog : function(){
                this._oCreateDialog.close();
            }
		});
	});
