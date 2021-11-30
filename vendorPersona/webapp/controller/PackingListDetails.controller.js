sap.ui.define([
    "com/agel/mmts/vendorPersona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../utils/formatter",
    "sap/ui/core/BusyIndicator"
], function (BaseController, JSONModel, Fragment, formatter, BusyIndicator) {
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
                                    "$expand": {
                                        "qr_code": {}
                                    },
                                    "$select": ["material_code", "description", "qty", "uom"]
                                },
                                "qr_code": {}
                            }
                        },
                        "attachments": {}
                    }
                },
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                        var documentResult = that.getDocumentData();
                        documentResult.then(function (result) {
                            that.PrintDocumentService(result);
                        });
                    }
                }
            });
        },
        getDocumentData: function () {
            var promise = jQuery.Deferred();
            this.getViewModel("objectViewModel").setProperty("/busy", true);
            var that = this;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            //console.log(oPayLoad);
            return new Promise((resolve, reject) => {
                this.getOwnerComponent().getModel().read("/PackingListSet(" + this.packingListId + ")/Attachments", {
                    success: function (oData, oResponse) {

                        this.getViewModel("objectViewModel").setProperty("/busy", false);
                        var oJSONData = {
                            PL_Material: [],
                            PL_Invoice: [],
                            PL_Others: []
                        };
                        var DocumentModel = new JSONModel(oJSONData);
                        that.getView().setModel(DocumentModel, "DocumentModel");
                        resolve(oData.results);
                    }.bind(this),
                    error: function (oError) {
                        this.getViewModel("objectViewModel").setProperty("/busy", false);
                        //sap.m.MessageBox.error(JSON.stringify(oError));
                    }.bind(this),
                });
            });
        },
        PrintDocumentService: function (result) {
            var that = this;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            var aRequestID = result.map(function (item) {
                return {
                    RequestNo: item.RequestNo
                };
            });
            that.aResponsePayload = [];
            aRequestID.forEach((reqID) => {
                that.aResponsePayload.push(that.callPrintDocumentService(reqID))
            })
            result.forEach((item) => {
                var sContent = that.callPrintDocumentService({
                    RequestNo: item.RequestNo
                })
                sContent.then(function (oVal) {
                    item.Content = oVal.Bytes;
                    debugger;
                    if (item.Type === 'PACKING_LIST' && item.SubType === 'MATERIAL')
                        that.getViewModel("DocumentModel").getProperty("/PL_Material").push(item);
                    else if (item.Type === 'PACKING_LIST' && item.SubType === 'INVOICE')
                        that.getViewModel("DocumentModel").getProperty("/PL_Invoice").push(item);
                    else if (item.Type === 'PACKING_LIST' && item.SubType === 'OTHERS')
                        that.getViewModel("DocumentModel").getProperty("/PL_Others").push(item);

                    that.getViewModel("DocumentModel").refresh();
                });
            });
        },
        callPrintDocumentService: function (reqID) {
            var promise = jQuery.Deferred();
            var othat = this;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            //console.log(oPayLoad);
            // reqID.RequestNo = 'REQ00001'                  // For testing only, Comment for production
            return new Promise((resolve, reject) => {
                oDataModel.create("/PrintDocumentEdmSet", reqID, {
                    success: function (data) {
                        // debugger;
                        resolve(data);
                    },
                    error: function (data) {
                        reject(data);
                    },
                });
            });
        },

        // on Date Change
        onDateChange: function (oEvent) {
            var oDP = oEvent.getSource(),
                sValue = oEvent.getParameter("value"),
                bValid = oEvent.getParameter("valid");

            if (bValid) {
                oDP.setValueState(sap.ui.core.ValueState.None);
            } else {
                oDP.setValueState(sap.ui.core.ValueState.Error);
            }
        },

        onPackingListChildMaterialsPress: function (oEvent) {
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
            console.log({ sParentItemPath });
            oDetails.controller = this;

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.packingListDetails.PackingListChildLineItems",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "$expand": {
                                "packinglist_child_items": {
                                    "$expand": {
                                        "qr_code": {}
                                    },
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

        onViewPackingListChildDialogClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
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
        },

        onInvoiceFileSelectedForUpload: function (oEvent) {
            // keep a reference of the uploaded file
            var that = this;
            BusyIndicator.show();
            var oFiles = oEvent.getParameters().files;
            var fileName = oFiles[0].name;
            var fileType = "INVOICE";
            this._getImageData(URL.createObjectURL(oFiles[0]), function (base64) {
                that._addData(base64, fileName, fileType);
            }, fileName);
        },

        onMaterialFileSelectedForUpload: function (oEvent) {
            // keep a reference of the uploaded file
            var that = this;
            BusyIndicator.show()
            var oFiles = oEvent.getParameters().files;
            var fileType = "MATERIAL";
            for (var i = 0; i < oFiles.length; i++) {
                var fileName = oFiles[i].name;
                this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                    that._addData(base64, fileName, fileType);
                }, fileName);
            }
        },

        onOtherFileSelectedForUpload: function (oEvent) {
            // keep a reference of the uploaded file
            var that = this;
            BusyIndicator.show()
            var oFiles = oEvent.getParameters().files;
            var fileType = "OTHERS";
            for (var i = 0; i < oFiles.length; i++) {
                var fileName = oFiles[0].name;
                this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                    that._addData(base64, fileName, fileType);
                }, fileName);
            }
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

        onPressVehicleNumber: function (oEvent) {
            var VehicleNob = this.byId("idInputVehicleNob").getValue();

            //initialize the action
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                oBindingObject = oEvent.getSource().getObjectBinding();

            //set the parameters
            oBindingObject.getParameterContext().setProperty("packingListId", oViewContext.ID);
            oBindingObject.getParameterContext().setProperty("vehicleNumber", VehicleNob);

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

        // On Search of Parent Line Items Table 
        onSearch: function (oEvent) {
            var aFilters = [];
            var FreeTextSearch = this.getView().byId("idSearchFieldPackingListTable").getValue();
            if (FreeTextSearch) {
                //  aFilters.push(new Filter("material_code", FilterOperator.Contains, FreeTextSearch));
                aFilters.push(new Filter("description", FilterOperator.Contains, FreeTextSearch));
                //  aFilters.push(new Filter("qty", FilterOperator.Contains, FreeTextSearch));
                aFilters.push(new Filter("uom", FilterOperator.Contains, FreeTextSearch));
            }
            var mFilters = new Filter({
                filters: aFilters,
                and: false
            });
            var oTableBinding = this.getView().byId("idInspectedParentLineItems").getBinding("items");
            oTableBinding.filter(mFilters);
        },

        ondemo: function (oEvent) {
            var that = this;
            var document_date = this.byId("DP1").getValue();
            var date = new Date().toLocaleDateString().split("/");
        },

        _addData: function (data, fileName, fileType) {
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                //oBindingObject = this.byId("idMDCCUploader").getObjectBinding("attachmentModel");

                data = data.split(",")[1],
                date = this.byId("DP1").getValue().split('.');
            //  date = new Date().toLocaleDateString().split("/");
            if (fileType === "INVOICE") {
                var document_number = this.byId("idInvoiceNo").getValue();
                var document_date = this.byId("DP1").getValue();
                date = document_date.split('.');
            }
            else {
                var document_number = (Math.floor(Math.random() * (1000000 - 1999999 + 1)) + 1000000).toString();
                var document_date = date[2] + "-" + date[1] + "-" + date[0];
            }
            var documents = {
                "documents": [
                    {
                        "type": fileType,
                        "packing_list_id": oViewContext.ID,
                        "file": data,
                        "fileName": fileName,
                        "inspection_call_id": oViewContext.insp_call[0].ID,
                        "document_number": document_number,
                        "document_date": document_date
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
                    BusyIndicator.hide();
                    sap.m.MessageToast.show("MDCC Details Uploaded!");
                    this.getView().getModel().refresh();
                }.bind(this),
                error: function (oError) {
                    BusyIndicator.hide();
                    sap.m.MessageBox.error("Error uploading document");
                }
            });
        },

        onDispatchPackingListPress: function (oEvent) {
            //initialize the action
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                oBindingObject = oEvent.getSource().getObjectBinding();

            //set the parameters
            oBindingObject.getParameterContext().setProperty("status", "Dispatch Initiated");
            oBindingObject.getParameterContext().setProperty("packing_list_id", oViewContext.ID);

            //execute the action
            oBindingObject.execute().then(
                function () {
                    sap.m.MessageToast.show("Packing List Dispatched!");
                    that.getView().getModel().refresh();
                },
                function (oError) {
                    sap.m.MessageBox.alert(oError.message, {
                        title: "Error"
                    });
                }
            );
        },

        onCreateAssistantPress: function (oEvent) {
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                oBindingObject = this.byId("idQRAssistant").getObjectBinding();
            var inputModel = this.getView().getModel("qrAssistantModel");

            //set the parameters
            oBindingObject.getParameterContext().setProperty("reason", inputModel.getProperty("/reason"));
            oBindingObject.getParameterContext().setProperty("description", inputModel.getProperty("/comment"));
            oBindingObject.getParameterContext().setProperty("packing_list_ID", oViewContext.ID);

            //execute the action
            oBindingObject.execute().then(
                function () {
                    sap.m.MessageToast.show("Packing List Dispatched!");
                    that.getView().getModel().refresh();
                },
                function (oError) {
                    sap.m.MessageBox.alert(oError.message, {
                        title: "Error"
                    });
                }
            );
            this._oQRAssistantDialog.close();
        },

        onBeforeUploadStarts: function () {
            //    var objectViewModel = this.getViewModel("objectViewModel");
            //    objectViewModel.setProperty("/busy", true);

            // this.busyIndicator = new sap.m.BusyIndicator();
            //  this.busyIndicator.open();
        },

        onUploadComplete: function () {
            // this.busyIndicator.close();
            //    var objectViewModel = this.getViewModel("objectViewModel");
            //   objectViewModel.setProperty("/busy", false);
        }

    });
}
);