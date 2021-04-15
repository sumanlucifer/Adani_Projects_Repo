sap.ui.define([
    "com/agel/mmts/vendorPersona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../utils/formatter"
], function (BaseController, JSONModel, Fragment, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.PackingListDetails", {
        formatter: formatter,
        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RoutePackingDeatilsPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").packingListID;
            this._bindView("/PackingLists" + sObjectId);
        },

        _bindView: function (sObjectPath) {
            console.log({ sObjectPath });
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                parameters: {
                    "$expand": {
                        "packinglist_parent_line_items": {
                            "$expand": {
                                "packinglist_child_items": {
                                    "$select": ["material_code", "description", "qty", "uom"]
                                }
                            }
                        },
                        "attachments":{}
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
                    name: "com.agel.mmts.vendorPersona.view.fragments.packingListDetails.PackingListChildLineItems"
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "$expand": {
                                "packinglist_child_items": {
                                    "$select": ["material_code", "description", "qty", "uom"]
                                }
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

        onGenerateQRCodePress: function (oEvent) {
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                oBindingObject = oEvent.getSource().getObjectBinding("qrCodeModel");

            //set the parameters
            oBindingObject.getParameterContext().setProperty("po_number", oViewContext.po_number);
            oBindingObject.getParameterContext().setProperty("inspection_call_id", oViewContext.insp_call[0].inspection_call_id);
            oBindingObject.getParameterContext().setProperty("width", 500);
            oBindingObject.getParameterContext().setProperty("height", 500);
            oBindingObject.getParameterContext().setProperty("packing_list_id", oViewContext.ID);

            //execute the action
            oBindingObject.execute().then(
                function () {
                    sap.m.MessageToast.show("QR code generated!");
                    that.getView().getModel().refresh();
                },
                function (oError) {
                    sap.m.MessageBox.alert(oError.message, {
                        title: "Error"
                    });
                }
            );
        },

        onPrintPackingListPress: function (oEvent) {
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                oBindingObject = oEvent.getSource().getObjectBinding();

            //set the parameters
            oBindingObject.getParameterContext().setProperty("insp_call_id", oViewContext.insp_call[0].inspection_call_id);
            oBindingObject.getParameterContext().setProperty("packing_list_id", oViewContext.ID);

            //execute the action
            oBindingObject.execute().then(
                function (oResponse) {
                    debugger;
                    var base64EncodedPDF = this.byId("idPrintButton").getBindingContext().getProperty("message");
                    var decodedPdfContent = atob(base64EncodedPDF);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for (var i = 0; i < decodedPdfContent.length; i++) {
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
                    var _pdfurl = URL.createObjectURL(blob);
                    window.open(_pdfurl, "Packing List", "width=800,height=900");
                }.bind(this),
                function (oError) {
                    debugger;
                    sap.m.MessageBox.alert(oError.message, {
                        title: "Error"
                    });
                }
            );
        }



    });

}
);