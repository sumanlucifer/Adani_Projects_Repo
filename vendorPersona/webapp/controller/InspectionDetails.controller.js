sap.ui.define([
    "com/agel/mmts/vendorPersona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../utils/formatter"
], function (BaseController, JSONModel, Fragment, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.InspectionDetails", {
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
                                "inspected_child_line_items": {
                                    "$select": ["material_code", "description", "qty", "uom"]
                                }
                            }
                        },
                        "packing_list": {},
                        "attachments": {}
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
                                "inspected_child_line_items": {
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

        onPackingListItemPress: function (oEvent) {
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

        onGenerateQRCodePress: function (oEvent) {
            var that = this,
                oBindingObject = oEvent.getSource().getObjectBinding("qrCodeModel");

            //set the parameters
            oBindingObject.getParameterContext().setProperty("po_number", "4500325995");
            oBindingObject.getParameterContext().setProperty("inspection_call_id", "1000001");
            oBindingObject.getParameterContext().setProperty("width", 10);
            oBindingObject.getParameterContext().setProperty("height", 10);
            oBindingObject.getParameterContext().setProperty("packing_list_id", 10);

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
        },

        onCreatePackingListPress: function (oEvent) {
            debugger;
            var oParentLineItemTable = this.byId("idInspectedParentLineItems")
            var aSelectedItems = oParentLineItemTable.getSelectedContexts()[0].getObject();
            var oViewContextObject = this.getView().getBindingContext().getObject;
            var aParentItems = aSelectedItems;
            var selectedChildLineItems = aParentItems.inspected_child_line_items;
            delete aParentItems.inspected_child_line_items;
            delete selectedChildLineItems[0].ID;
            delete aParentItems.ID;

            var oPayload = {
                "status": "Approved",
                "vehicle_no": "",
                "purchase_order_ID": "ef1a3038-9218-11eb-a8b3-0242ac130003",
                "insp_call_id": "be824424-8c91-11eb-8dcd-0242ac130003",
                "po_number": "4500326716",
                "name": "packing List",
                "packinglist_parent_line_items": [
                    {
                        "name": aParentItems.name,
                        "description": aParentItems.description,
                        "material_code": aParentItems.material_code,
                        "uom": aParentItems.uom,
                        "approved_qty": aParentItems.qty,
                        "packinglist_child_items": selectedChildLineItems
                    }
                ]
            };

            $.ajax({
                "async": true,
                "crossDomain": true,
                "url": "/AGEL_MMTS_API/odata/v4/VendorsService/PackingLists",
                "method": "POST",
                "headers": {
                    "content-type": "application/json"
                },
                "processData": false,
                "data": JSON.stringify(oPayload),
                success: function (oData, oResponse) {
                    // @ts-ignore
                    sap.m.MessageToast.show("packing List Created with ID " + oData.ID)
                },
                error: function (oError) {
                    sap.m.MessageBox.error("Error creating Packing List");
                }
            });
        },

        MDCCFileSelectedForUpload: function (oEvent) {
            // keep a reference of the uploaded file
            debugger;
            var that = this;
            var oFiles = oEvent.getParameters().files;
            this._getImageData(URL.createObjectURL(oFiles[0]), function (base64) {
                that._addData(base64);
            });
        },

        _getImageData: function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                var reader = new FileReader();
                reader.onloadend = function () {
                    callback(reader.result);
                };
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        },

        _addData: function (data) {
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                oBindingObject = this.byId("idMDCCUploader").getObjectBinding("attachmentModel");

            data = data.substr(21, data.length);
            var document = {
                "documents": [
                    {
                        "type": "mdcc",
                        "packing_list_id": "",
                        "file": data,
                        "fileName": "firstDoc.txt",
                        "inspection_call_id": "43e413aa-9376-11eb-a8b3-0242ac130003",
                        "document_number": "12345",
                        "document_date": "2021-04-09"
                    }
                ]
            }

            //set the parameters
            oBindingObject.getParameterContext().setProperty("file", data);
            //oBindingObject.getParameterContext().setProperty("po_number", oViewContext.po_number);
            oBindingObject.getParameterContext().setProperty("purchase_order_ID", oViewContext.ID);

            //execute the action
            oBindingObject.execute().then(
                function () {
                    MessageToast.show("BOQ uploaded!");
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

}
);