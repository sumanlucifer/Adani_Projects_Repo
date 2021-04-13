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

		return BaseController.extend("com.agel.mmts.securityPerson-ScanQR.controller.BarCodeDetails", {
            
            onInit: function () {
                
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                var oViewHandlingModel = new JSONModel({
                    ReEnterVehicleNob : null,
               //     HeaderDeclineButton : false
                   
                });
                this.setModel(oViewHandlingModel, "oViewHandlingModel");
                
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("BarCodeDetailsPage").attachPatternMatched(this._onObjectMatched, this);
            },

            // On Object Matched 
            _onObjectMatched: function (oEvent) {
                var QRCode = oEvent.getParameters().arguments.QRCode;
                this._bindView("/enterQRNumber("+ QRCode +")");
            },

            _bindView: function(sObjectPath) {
                var objectViewModel = this.getViewModel("objectViewModel");
                this.getView().bindElement({
                        path: sObjectPath,
                        parameters: {
                            "$expand": {                          
                                        "insp_call": {
                                            "$select" : ["inspection_call_id"]
                                        },
                                        "packing_list" : {
                                            "$expand": {
                                                        "insepected_parent_line_items":{
                                                                "$select":["packing_list_ID","po_number","material_code","name","description"]
                                                        },
                                                        "qr_code" : {
                                                            
                                                        },
                                                        "attachments":{},
                                                        "gate":{
                                                            "$select":["entry_id"]
                                                        }
                                            },
                                            "$select" : ["vehicle_no","qr_code_ID"]
                                        },
                                        "purchase_order" : {
                                                "$expand" : {
                                                            "vendor" : {
                                                                "$expand" : {
                                                                        "address" : {
                                                                                "$select" : ["street","city","state","country"]
                                                                        }       
                                                                },  
                                                                "$select" : ["name"]
                                                            }
                                                },
                                                "$select" : ["asn_number","po_number","asn_creation_date","vendor_ID"]
                                        }
                             },                               
                        },
                        events: {
                            dataRequested: function() {
                                objectViewModel.setProperty("/busy", true);
                            },
                            dataReceived: function() {
                                objectViewModel.setProperty("/busy", false);                                
                            }
                        }
                }); 
            
                // Approve Reject Hide Based On Vehicle Number Blank
                if ( this.byId("idTextVehcileNob").getText() == "" ){
                   // this.byId("idHboxApproveReject").setVisible(false);
                }
            },

            // On Approve Press Vehicle Number
            onPressApproveQRCode : function(){
                this.byId("idInputVehcileNob").setEditable(false); 
                this.byId("idHboxApproveReject").setVisible(false);                
            },

            // On Reject Press Vehicle Number
            onPressRejectQRCode : function(){
                //Enter & ReEnter Vehicle Number 
                this.byId("idHboxEnterVehicleNob").setVisible(false); 
                this.byId("idHboxReEnterVehicleNob").setVisible(true);

                // Buttons Hide
                this.byId("idHboxApproveReject").setVisible(false); 
                
               // this.getView().getModel("oViewHandlingModel").setProperty("HeaderDeclineButton",true);
                this.getView().getModel("oViewHandlingModel").oData.ReEnterVehicleNob = this.byId("idInputVehcileNob").getValue();
               // this.byId("idReEnterInputVehcileNob").setValue(this.byId("idInputVehcileNob").getValue());                     
            },
           
            // On Submit Press - 
            onPressSubmitQRCode : function(oEvent){

                //initialize the action
                var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                oBindingObject = oEvent.getSource().getObjectBinding();

                //set the parameters
                oBindingObject.getParameterContext().setProperty("packingListId", oViewContext.packing_list.ID);
                oBindingObject.getParameterContext().setProperty("vehicleNumber", oViewContext.packing_list.vehicle_no);

                
                //execute the action
                oBindingObject.execute().then(
                    function () {
                        sap.m.MessageToast.show("Submited Successfully");
                        that.getView().getModel().refresh();
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
