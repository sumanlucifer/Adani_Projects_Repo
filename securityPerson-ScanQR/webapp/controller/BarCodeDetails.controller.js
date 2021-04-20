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
    '../utils/formatter',
    "jquery.sap.global"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, formatter, jquery) {
        "use strict";
        return BaseController.extend("com.agel.mmts.securityPerson-ScanQR.controller.BarCodeDetails", {
            formatter: formatter,

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

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("BarCodeDetailsPage").attachPatternMatched(this._onObjectMatched, this);
            },

            // On Object Matched 
            _onObjectMatched: function (oEvent) {
                var QRCode = oEvent.getParameters().arguments.QRCode;
                this._bindView("/enterQRNumber(" + QRCode + ")");
            },

            _bindView: function (sObjectPath) {
                var objectViewModel = this.getViewModel("objectViewModel");
                this.getView().bindElement({
                    path: sObjectPath,
                    parameters: {
                        "$expand": {
                            "insp_call": {
                                "$select": ["inspection_call_id"]
                            },
                            "packing_list": {
                                "$expand": {
                                    "insepected_parent_line_items": {
                                        "$select": ["packing_list_ID", "po_number", "material_code", "name", "description"]
                                    },
                                    "qr_code": {

                                    },
                                    "attachments": {},
                                    "gate": {
                                        "$select": ["entry_id"]
                                    }
                                },
                                "$select": ["vehicle_no", "qr_code_ID", "name"]
                            },
                            "purchase_order": {
                                "$expand": {
                                    "vendor": {
                                        "$expand": {
                                            "address": {
                                                "$select": ["street", "city", "state", "country"]
                                            }
                                        },
                                        "$select": ["name"]
                                    }
                                },
                                "$select": ["asn_number", "po_number", "asn_creation_date", "vendor_ID"]
                            }
                        },
                    },
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
            onPressSubmitQRCode: function (oEvent) {
                //initialize the action
               // if (this.getViewModel("oViewHandlingModel").getProperty("/EnterVehicleNo") === this.getViewModel("oViewHandlingModel").getProperty("/ReEnterVehicleNo")) {
                    var that = this,
                        oViewContext = this.getView().getBindingContext().getObject(),
                        oBindingObject = oEvent.getSource().getObjectBinding();

                    //set the parameters
                    oBindingObject.getParameterContext().setProperty("packingListId", oViewContext.packing_list.ID);
                    oBindingObject.getParameterContext().setProperty("vehicleNumber", this.getViewModel("oViewHandlingModel").getProperty("/ReEnterVehicleNo"));

                    //execute the action
                    oBindingObject.execute().then(
                        function () {
                            sap.m.MessageToast.show("Submited Successfully");
                            that.getView().getModel().refresh();
                            that.getViewModel("oViewHandlingModel").setProperty("/wantChange", false);
                        },
                        function (oError) {
                            sap.m.MessageBox.alert(oError.message, {
                                title: "Error"
                            });
                        }
                    );
               // } else {
                //    sap.m.MessageBox.alert("Vehicle Numbers do not match!");
                //}
            },

            onViewQRCodePress : function(oEvent){
                
                if (!this._oCreateParentItemDialog) {
                    this._oCreateDialog = sap.ui.xmlfragment("com.agel.mmts.securityPerson-ScanQR.view.fragments.ViewQR", this);
                    this.getView().addDependent(this._oCreateDialog);
                }
                this._oCreateDialog.open();
            },
            closeDialog : function(){
                this._oCreateDialog.close();
            }
		});
	});
