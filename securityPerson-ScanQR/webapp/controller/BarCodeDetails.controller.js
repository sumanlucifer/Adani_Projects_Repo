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
              //  var sObjectId = "XLj52SRDpM";

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
                                            },
                                            "$select" : ["vehicle_no"]
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
            
                // Basic Data Binding
                this.getView().byId("sfQRData").bindElement({
                        path: "/PurchaseOrders",
                        parameters: {
                            "$expand": {                                        
                                        "parent_line_items": {},
                                        "inspection_call_ids":{}            
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
                
                // Inspection ID's Detail List
               /* this.getView().byId("idInspectionTable").bindItems({
                    path: "/enterQRNumber",
                    template: this.byId("idInspectionTable").removeItem(0),
                    parameters: {
                            "$expand": {
                                        "insp_call": {}
                            }
                    },  
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                          objectViewModel.setProperty("/busy", false);
                      }
                    }
                });   */   
                
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
                this.byId("idHboxReEnterVehicleNob").setVisible(true);
                this.byId("idInputVehcileNob").setEditable(true);                  
                this.byId("idTextVehcileNob").setVisible(false);
                this.byId("idInputVehcileNob").setVisible(true);
                this.byId("idHboxReEnterVehicleNob").setVisible(true);     
                this.byId("idHboxApproveReject").setVisible(false); 
                        
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
