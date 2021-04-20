sap.ui.define([
    "com/agel/mmts/vendorPersona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../utils/formatter",
    "sap/ui/core/BusyIndicator"
], function (BaseController, JSONModel, Fragment, formatter,BusyIndicator) {
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
                    },
                    "$select": ["purchase_order_ID"]
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
            oDetails.controller = this;

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.inspectionDetails.InspectionCallChildLineItems",
                    controller :  oDetails.controller
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

        onViewInspectChildDialogClose : function () {
             this.pDialog.then(function (oDialog) {
                oDialog.close();
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

        onCreatePackingListPress: function (oEvent) {
            var oParentLineItemTable = this.byId("idInspectedParentLineItems")
            if (oParentLineItemTable.getSelectedContexts().length > 0) {
                var oPackingListInputModel = new JSONModel({
                    "name": null
                });
                this.getView().setModel(oPackingListInputModel, "PackingListInputModel");

                if (!this._oPackingListNameGetterDialog) {
                    this._oPackingListNameGetterDialog = sap.ui.xmlfragment("com.agel.mmts.vendorPersona.view.fragments.inspectionDetails.PackingListNameGetter", this);
                    this.getView().addDependent(this._oPackingListNameGetterDialog);
                }
                this._oPackingListNameGetterDialog.open();
            } else {
                sap.m.MessageBox.information("Please select at least one item to go ahead with Creating Packing List!");
            }
        },

        onCreateClose : function (oEvent) {
            this._oPackingListNameGetterDialog.close();
        },

        onCreatePress: function (oEvent) {
            var oParentLineItemTable = this.byId("idInspectedParentLineItems")
            var aSelectedItems = oParentLineItemTable.getSelectedContexts()[0].getObject();
            var oViewContextObject = this.getView().getBindingContext().getObject();
            var aParentItems = aSelectedItems;
            var selectedChildLineItems = aParentItems.inspected_child_line_items;
            delete aParentItems.inspected_child_line_items;
            delete selectedChildLineItems[0].ID;
            delete aParentItems.ID;

            var oPayload = {
                "status": "Saved",
                "vehicle_no": "",
                "purchase_order_ID": oViewContextObject.purchase_order_ID,
                "insp_call_id": oViewContextObject.ID,
                "po_number": oViewContextObject.po_number,
                "name": this.getView().getModel("PackingListInputModel").getProperty("/name"),
                "packinglist_parent_line_items": [
                    {
                        "name": aParentItems.name,
                        "description": aParentItems.description,
                        "material_code": aParentItems.material_code,
                        "uom": aParentItems.uom,
                        "approved_qty": aParentItems.approved_qty,
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
                    this._oPackingListNameGetterDialog.close();
                    sap.m.MessageToast.show("packing List Created with ID " + oData.name);
                    this.getView().getModel().refresh();
                    this.getRouter().navTo("RoutePackingDeatilsPage", {
                        packingListID: "(" + oData.ID + ")"
                    });
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error("Error creating Packing List");
                }
            });

        },

        MDCCFileSelectedForUpload: function (oEvent) {
            // keep a reference of the uploaded file
            var that = this;
            BusyIndicator.show();
            var oFiles = oEvent.getParameters().files;
            for (var i = 0; i < oFiles.length; i++) {
                var fileName = oFiles[i].name;
                this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                    that._addData(base64, fileName);
                }, fileName);
            }
        },

        _getImageData: function (url, callback, fileName) {
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

        _addData: function (data, fileName) {
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                oBindingObject = this.byId("idMDCCUploader").getObjectBinding("attachmentModel");

            data = data.split(",")[1];
            var documents = {
                "documents": [
                    {
                        "type": "mdcc",
                        "packing_list_id": "",
                        "file": data,
                        "fileName": fileName,
                        "inspection_call_id": oViewContext.ID,
                        "document_number": "12345",
                        "document_date": "2021-12-12"
                    }
                ]
            };

            //set the parameters
            //oBindingObject.getParameterContext().setProperty("documents", "");
            //oBindingObject.getParameterContext().setProperty("po_number", oViewContext.po_number);
            //oBindingObject.getParameterContext().setProperty("purchase_order_ID", oViewContext.ID);

            //execute the action
            /* oBindingObject.execute().then(
                function () {
                    debugger;
                    sap.m.MessageToast.show("MDCC Details uploaded!");
                    that.getView().getModel().refresh();
                },
                function (oError) {
                    debugger;
                    sap.m.MessageBox.alert(oError.message, {
                        title: "Error"
                    });
                }
            ); */

            $.ajax({
                "async": true,
                "crossDomain": true,
                "url": "/AGEL_MMTS_API/odata/v4/AttachmentsService/uploadDocument",
                "method": "POST",
                "headers": {
                    "content-type": "application/json"
                },
                "processData": false,
                "data": JSON.stringify(documents),
                success: function (oData, oResponse) {
                    // @ts-ignore
                    debugger;
                    BusyIndicator.hide();
                    sap.m.MessageToast.show("MDCC Details Uploaded!");
                    this.getView().getModel().refresh();
                }.bind(this),
                error: function (oError) {
                    debugger;
                    BusyIndicator.hide();
                    sap.m.MessageBox.error("Error uploading document");
                }
            });
        },

        onMDCCYesSelect: function () {
            this.byId("idMDCCUploadArea").setVisible(true);
        },
        onMDCCNOSelect: function () {
            this.byId("idMDCCUploadArea").setVisible(false);
        },

        onBeforeUploadStarts : function(){
            
        //    var objectViewModel = this.getViewModel("objectViewModel");
         //   objectViewModel.setProperty("/busy", true);

        //    BusyIndicator.show();

           // this.busyIndicator = new sap.m.BusyIndicator();
          //  this.busyIndicator.open();
        },

        onUploadComplete: function(oEvent){
           // this.busyIndicator.close();
         //    var objectViewModel = this.getViewModel("objectViewModel");
         //   objectViewModel.setProperty("/busy", false);
        },

        onUploadTerminated :  function(oEvent){
           /* this.busyIndicator.close();
             var objectViewModel = this.getViewModel("objectViewModel");
            objectViewModel.setProperty("/busy", false);*/
        },


    });

}
);