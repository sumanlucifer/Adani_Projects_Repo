sap.ui.define([
    "com/agel/mmts/vendorPersona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (BaseController, JSONModel, Fragment) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.InspectionDetails", {

        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteInspectionDetailsPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").inspectionID;
            this._bindView("/InspectionCallIds" + sObjectId);
        },

        _bindView: function (sObjectPath) {
            console.log(sObjectPath);
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                parameters: {
                    "$expand": {
                        "insepected_parent_line_items": {
                            "$expand": {
                                "inspected_child_line_items": {}
                            }
                        },
                        "packing_lists":{}
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
            });
        },

        onViewInspectedChildMaterialsPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var that = this;
            this._requestCronicalPath(oItem, function (sCronicalPath) {
                that._openDialog(sCronicalPath);
            });
        },

        _requestCronicalPath: function (oItem, callback) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                callback(sObjectPath);
            });
        },

        _openDialog: function (sParentItemPath) {
            // create dialog lazily
            var oDetails = {};
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.inspectionDetails.InspectionCallChildLineItems"
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "$expand": {
                                "inspected_child_line_items": {}
                            }
                        }
                    });
                    return oDialog;
                });

            }

            this.pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onPackingListItemPress: function(oEvent){
            this._showObject(oEvent.getSource());
        },

        // On Show Object - Navigation
        _showObject: function (oItem) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RoutePackingDeatilsPage", {
                    packingListID: sObjectPath.slice("/PackingLists".length) // /PurchaseOrders(123)->(123)
                });
            });
        },

        onGenerateQRCodePress: function(oEvent){
            var that = this,
                oBindingObject = oEvent.getSource().getObjectBinding("qrCodeModel");

            //set the parameters
            oBindingObject.getParameterContext().setProperty("po_number", "4500325995");
            oBindingObject.getParameterContext().setProperty("inspection_call_id", "1000001");
            oBindingObject.getParameterContext().setProperty("width", 10);
            oBindingObject.getParameterContext().setProperty("height", 10);

            //execute the action
            oBindingObject.execute().then(
                function () {
                    sap.m.MessageToast.show("QR Generated!");
                },
                function (oError) {
                    sap.m.MessageBox.alert(oError.message, {
                        title: "Error"
                    });
                }
            );
        }


    });

}
);