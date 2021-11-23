sap.ui.define([
    "com/agel/mmts/vendorPersona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../utils/formatter",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/Device",
], function (BaseController, JSONModel, Fragment, formatter, BusyIndicator, MessageToast, MessageBox, Device) {
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
            this.MainModel = this.getOwnerComponent().getModel();
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteInspectionDetailsPage").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            var that = this;
            var sObjectId = oEvent.getParameter("arguments").inspectionID;
            that.sObjectId = sObjectId;
            this.getView().byId("idIcnTabBar").setSelectedKey("idInspectedListTab");
            this._bindView("/InspectionCallIdSet" + sObjectId);
        },
        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;
            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        //   that.onReadMDCCItems(that.sObjectId);
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
            var that = this;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            //console.log(oPayLoad);
            return new Promise((resolve, reject) => {
                this.getOwnerComponent().getModel().read("/InspectionCallIdSet" + this.sObjectId + "/Attachments", {
                    success: function (oData, oResponse) {
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
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
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
                    //debugger;
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
                        // //debugger;
                        resolve(data);
                    },
                    error: function (data) {
                        reject(data);
                    },
                });
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
                    controller: oDetails.controller
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
        onViewInspectChildDialogClose: function () {
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
        onCreateClose: function (oEvent) {
            this._oPackingListNameGetterDialog.close();
        },
        MDCCFileSelectedForUpload: function (oEvent) {
            // keep a reference of the uploaded file
            var that = this;
            BusyIndicator.show();
            var oFiles = oEvent.getParameters().files;
            for (var i = 0; i < oFiles.length; i++) {
                var fileName = oFiles[i].name;
                if (fileName.split('.').length > 1) {
                    this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                        that._addData(base64, fileName);
                    }, fileName);
                }
            }
        },
        // _getImageData: function (url, callback, fileName) {
        //     var xhr = new XMLHttpRequest();
        //     xhr.onload = function () {
        //         var reader = new FileReader();
        //         reader.onloadend = function () {
        //             callback(reader.result);
        //         };
        //         reader.readAsDataURL(xhr.response);
        //     };
        //     xhr.open('GET', url);
        //     xhr.responseType = 'blob';
        //     xhr.send();
        // },
        _getImageData: function (url, callback, fileName) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                var reader = new FileReader();
                var fileByteArray = [];
                reader.readAsArrayBuffer(xhr.response);
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        var arrayBuffer = evt.target.result,
                            array = new Int8Array(arrayBuffer);
                        for (var i = 0; i < array.length; i++) {
                            fileByteArray.push(array[i]);
                        }
                        callback(fileByteArray);
                    }
                }
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        },
        onMDCCYesSelect: function () {
            this.byId("idMDCCUploadArea").setVisible(true);
        },
        ///--------------------- Send For Approval ----------------------------------//
        onSendForApprovalPress: function (oEvent) {
            var that = this;
            var obj = oEvent.getSource().getBindingContext().getObject();
            MessageBox.confirm("Do you want to send " + obj.MDCCNumber + " for approval?", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        var sPath = "/MDCCStatusSet";
                        var oPayload = {
                            //     "Status" : obj.Status,
                            "Status": "PENDING",
                            //"ApprovedOn": new Date(),
                            //      "ApprovedBy": obj.,
                            "CreatedAt": obj.CreatedAt,
                            "CreatedBy": obj.CreatedBy,
                            //"UpdatedAt": new Date(),
                            //        "UpdatedBy": obj.UpdatedBy,
                            //    "Comment"  : obj.,
                            "IsArchived": false,
                            "MDCCID": obj.ID
                        };
                        that.MDCCNumber = obj.MDCCNumber;
                        BusyIndicator.show();
                        that.MainModel.create(sPath, oPayload, {
                            success: function (oData, oResponse) {
                                BusyIndicator.hide();
                                if (oData.ID) {
                                    MessageBox.success("MDCC Number " + that.MDCCNumber + " Sent for approval successfully");
                                    that.getView().getContent()[0].getContent().rerender();
                                    that.getView().getModel().refresh();
                                }
                            }.bind(this),
                            error: function (oError) {
                                BusyIndicator.hide();
                                MessageBox.error(JSON.stringify(oError));
                            }
                        });
                    }
                }
            });
        },
        onViewPress: function (oEvent) {
            //  var oItem = oEvent.getSource();
            var that = this;
            var sObjectId = oEvent.getSource().getBindingContext().getObject().ID;
            var mdccNobb = oEvent.getSource().getBindingContext().getObject().MDCCNumber;
            this._getParentDataViewMDCC(sObjectId, mdccNobb);
        },
        // Arrange Data For View / Model Set
        _arrangeDataView: function (mdccNobb) {
            var that = this;
            var oModel = new JSONModel({ "ChildItemsView": this.ParentDataView });
            this.getView().setModel(oModel, "TreeTableModelView");
            that.handleViewDialogOpen(mdccNobb);
        },
        // Child Line Items Dialog Open
        handleViewDialogOpen: function (mdccNobb) {
            var that = this;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            //  oDetails.sParentItemPath = sParentItemPath;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.inspectionDetails.TreeTableView",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.setModel(that.getView().getModel("TreeTableModelView"));
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.setModel(that.getView().getModel("TreeTableModelView"));
                oDialog.setTitle("MDCC " + mdccNobb + " Mapped Items")
                oDialog.open();
            });
        },
        // Child Dialog Close
        onViewChildDialogClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
        },
        onMDCCNOSelect: function () {
            this.byId("idMDCCUploadArea").setVisible(false);
        },
        onBeforeUploadStarts: function () {
            //    var objectViewModel = this.getViewModel("objectViewModel");
            //   objectViewModel.setProperty("/busy", true);
            //    BusyIndicator.show();
            // this.busyIndicator = new sap.m.BusyIndicator();
            //  this.busyIndicator.open();
        },
        onUploadTerminated: function (oEvent) {
			/* this.busyIndicator.close();
			  var objectViewModel = this.getViewModel("objectViewModel");
			 objectViewModel.setProperty("/busy", false);*/
        },
        // Parent Data View Fetch / Model Set
        _getParentDataViewMDCC: function (sObjectId, mdccNobb) {
            this.ParentDataView = [];
            var sPath = "/MDCCSet(" + sObjectId + ")/MDCCParentLineItems";
            this.MainModel.read(sPath, {
                success: function (oData, oResponse) {
                    if (oData.results.length) {
                        this._getChildItemsViewMDCC(oData.results, sObjectId, mdccNobb);
                    }
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.Error(JSON.stringify(oError));
                }
            });
        },
        // Child Item View Fetch / Model Set
        _getChildItemsViewMDCC: function (ParentDataView, sObjectId, mdccNobb) {
            this.ParentDataView = ParentDataView;
            for (var i = 0; i < ParentDataView.length; i++) {
                var sPath = "/MDCCSet(" + sObjectId + ")/MDCCParentLineItems(" + ParentDataView[i].ID + ")/MDCCBOQItems";
                this.MainModel.read(sPath, {
                    success: function (i, oData, oResponse) {
                        if (oData.results.length) {
                            this.ParentDataView[i].isStandAlone = true;
                            this.ParentDataView[i].ChildItemsView = oData.results;
                        } else {
                            this.ParentDataView[i].isStandAlone = false;
                            this.ParentDataView[i].ChildItemsView = [];
                        }
                        if (i == this.ParentDataView.length - 1) this._arrangeDataView(mdccNobb);
                    }.bind(this, i),
                    error: function (oError) {
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            }
        },
        //-------------------- File Upload MDCC ----------------------//
        onMDCCFileUpload: function (oEvent) {
            // keep a reference of the uploaded file
            var that = this;
            BusyIndicator.show();
            var oFiles = oEvent.getParameters().files;
            var fileName = oFiles[0].name;
            var fileType = "application/pdf";
            this._getImageData(URL.createObjectURL(oFiles[0]), function (base64) {
                that._addData(base64, fileName, fileType);
            }, fileName);
        },
        //-------------------- Read MDCC ----------------------//
        // Add MDCC Item 
        onAddMdccItem: function (oEvent) {
            var that = this;
            MessageBox.confirm("Do you want to create new mdcc item?", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that.addMdccRow();
                    }
                }
            });
        },
        addMdccRow: function () {
            var that = this;
            var object = this.getView().getBindingContext().getObject();
            var oPayload = {
                //  "MDCCNumber": "", // as shubham informed
                "NotificationNumber": "",
                "Version": "",
                "PONumber": object.PONumber,
                "Status": null,
                "InspectionCall": {
                    "__metadata": {
                        "uri": "InspectionCallIdSet(" + object.ID + ")"
                    }
                }
            };
            var sPath = "/MDCCSet";
            BusyIndicator.show();
            this.MainModel.create(sPath, oPayload, {
                success: function (oData, oResponse) {
                    BusyIndicator.hide();
                    this.getView().getModel().refresh();
                    //that.getView().( "ManageMDCCModel");
                    // that.getView().getModel("ManageMDCCModel").getData().MDCCItems = oData.results;
                }.bind(this),
                error: function (oError) {
                    BusyIndicator.hide();
                    sap.m.MessageBox.Error(JSON.stringify(oError));
                }
            });
        },
        //-------------------- File Upload MDCC ----------------------//
        onMDCCFileSelectedForUpload: function (oEvent) {
            // keep a reference of the uploaded file
            var that = this;
            var rowId = oEvent.getSource().getParent().getParent().getBindingContextPath().split('/').pop();
            var rowObj = oEvent.getSource().getBindingContext().getObject();
            BusyIndicator.show();
            var oFiles = oEvent.getParameters().files;
            var fileName = oFiles[0].name;
            var fileType = "application/pdf";
            var fileSize = oFiles[0].size;
            this._getImageData(URL.createObjectURL(oFiles[0]), function (base64) {
                that._addData(base64, fileName, fileType, fileSize, rowId, rowObj);
            }, fileName);
        },
        _addData: function (data, fileName, fileType, fileSize, rowId, rowObj) {
            var that = this;
            var sPONumber = this.getView().byId("idPONumber").getText();;
            // var documents = {
            //     "Documents": [
            //         {
            //             "UploadTypeId": rowObj.ID, // MDCC Id
            //             "Type": "MDCC",
            //             "SubType": "",
            //             "FileName": fileName,
            //             "Content": data, // base - 64 (Type)
            //             "ContentType": fileType, // application/pdf text/csv
            //             "UploadedBy": rowObj.UpdatedBy ? rowObj.UpdatedBy : "vendor1",
            //             "FileSize": fileSize
            //         }
            //     ]
            // };
            var documents = {
                "Documents": [
                    {
                        "Type": "MDCC",
                        "ContentType": fileType,
                        "FileName": fileName,
                        "Content": data,
                        "UploadedBy": "AGEL",
                        "FileSize": fileSize,
                        "SubType": "",
                        "UploadTypeId": rowObj.ID,
                        "PONumber": sPONumber,
                        "CompanyCode": null
                    }
                ]
            };
            that.documents = documents;
            var sPath = "/DocumentUploadEdmSet"
            this.MainModel.create(sPath, documents, {
                success: function (oData, oResponse) {
                    BusyIndicator.hide();
                    sap.m.MessageToast.show("MDCC Details Uploaded!");
                    this.getView().getModel().refresh();
                    //   this.getView().getModel("ManageMDCCModel").getData().MDCCItems[rowId].MapItems = true;
                    //   this.getView().getModel("ManageMDCCModel").refresh();
                }.bind(this),
                error: function (oError) {
                    BusyIndicator.hide();
                    sap.m.MessageBox.error("Error uploading document");
                }
            });
        },
        onFileUrlClick: function (oEvent) {
            var FileContent = oEvent.getSource().getBindingContext().getObject().FileContent;
            var FileName = oEvent.getSource().getBindingContext().getObject().FileName;
            var url = formatter.fileContent(FileName, FileContent);
            window.open(url, "_blank");
        },
        // Navigating to Map MDCC Application
        onMapMDCCCItems: function (oEvent) {
            var mdccID = oEvent.getSource().getBindingContext().getObject().ID; // read MDCCIId from OData path MDCCSet
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: "mapmdcc",
                    action: "manage"
                },
                params: {
                    "MDCCId": mdccID
                    //   "manage":false 
                }
            })) || ""; // generate the Hash to display a MDCC Number
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            }); // navigate to Map MDCC application - MapView
        },
        // Navigating to Manage MDCC Application
        onManagePress: function (oEvent) {
            var mdccID = oEvent.getSource().getBindingContext().getObject().ID; // read MDCCIId from OData path MDCCSet
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: "mdcc",
                    action: "manage"
                },
                params: {
                    "MDCCId": mdccID
                    //  "manage":true
                }
            })) || ""; // generate the Hash to display a MDCC Number
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            }); // navigate to Manage MDCC application - Initiate Dispatch Screen
        },
        // Show File Name Dialog 
        onShowFileNameDialog: function (oEvent) {
            // create dialog lazily
            var that = this;
            var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
            var mdccNobb = oEvent.getSource().getParent().getBindingContext().getObject().MDCCNumber;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            if (!this.pDialogFileName) {
                this.pDialogFileName = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.inspectionDetails.ShowFileNamesMDCC",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                    });
                    //  oDialog.setModel(that.getView().getModel("TreeTableModelView"));
                    return oDialog;
                });
            }
            this.pDialogFileName.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sParentItemPath,
                });
                //oDialog.setModel(that.getView().getModel("TreeTableModelView"));
                oDialog.setTitle("MDCC - " + mdccNobb + " ");
                oDialog.open();
            });
        },
        // Child Dialog Close
        onViewFileDialogClose: function (oEvent) {
            this.pDialogFileName.then(function (oDialog) {
                oDialog.close();
            });
        },
        // onViewInspectionItemsPress: function (oEvent) {
        //     this.inspectionID = oEvent.getSource().getBindingContext().getObject().ID;
        //     this.CreatedAt = oEvent.getSource().getBindingContext().getObject().CreatedAt;
        //     this.UpdatedAt = oEvent.getSource().getBindingContext().getObject().UpdatedAt;
        //     //this.inspectionID = 15;
        //     var that = this;
        //     that.oIssueMaterialModel = new JSONModel();
        //     this.MainModel.read("/InspectedParentItemSet(" + this.inspectionID + ")", {
        //         urlParameters: { "$expand": "ParentLineItem/PCGroups/PCGroupItems" },
        //         success: function (oData, oResponse) {
        //             var data = oData.ParentLineItem.PCGroups.results[0];
        //             if (oData.ParentLineItem.UoM === "MT")
        //                 var bIsSplCase = true;
        //             else
        //                 bIsSplCase = false;
        //             var InspectionMapBOQItemsData = data.PCGroupItems.results;
        //             this.dataBuilding(InspectionMapBOQItemsData, bIsSplCase, oData.AcceptQuantity);
        //         }.bind(this),
        //         error: function (oError) {
        //             sap.m.MessageBox.error("Data Not Found");
        //         }
        //     });
        // },
        // dataBuilding: function (data, bIsSplCase, iParentQty) {
        //     for (var i = 0; i < data.length; i++) {
        //         data[i].isSelected = false;
        //         if (bIsSplCase)
        //             data[i].ApprovedQty = "";
        //         else
        //             data[i].ApprovedQty = data[i].Qty * iParentQty;
        //         data[i].isSpecial = bIsSplCase;
        //         data[i].ParentApprovedQty = iParentQty;
        //     }
        //     var oModel = new JSONModel({});
        //     oModel.setProperty("/isSpecial", bIsSplCase);
        //     this.getView().setModel(oModel, "inspectedMapBOQItemsModel");
        //     this.openInspectionBOQFragment(data);
        // },

        onViewInspectionItemsPress: function (oEvent) {
            this.inspectionID = oEvent.getSource().getBindingContext().getObject().ID;
            this.CreatedAt = oEvent.getSource().getBindingContext().getObject().CreatedAt;
            this.UpdatedAt = oEvent.getSource().getBindingContext().getObject().UpdatedAt;
            this.inspectionQty = oEvent.getSource().getBindingContext().getObject().Qty;
            this.oSelectedMapBOQItem = oEvent.getSource().getBindingContext().getObject();

            // this.inspectionID = 148;
            var that = this;
            that.oIssueMaterialModel = new JSONModel();
            this.MainModel.read("/InspectionCallIdSet" + this.sObjectId + "/InspectedParentItems(" + this.inspectionID + ")", {
                urlParameters: { "$expand": "ParentLineItem/BOQGroups/BOQItems" },
                success: function (oData, oResponse) {
                    var data = oData.ParentLineItem.BOQGroups.results;
                    this.dataBuilding(data);
                    this.getViewModel("objectViewModel").setProperty("/Description", oData.Description);
                    this.getViewModel("objectViewModel").setProperty("/LongText", oData.LongText);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error("Data Not Found");
                }
            });
        },

        dataBuilding: function (ParentData) {
            ParentData.reverse();
            for (var i = 0; i < ParentData.length; i++) {
                ParentData[i].results = [];
                ParentData[i].enable = false;
                if (i === 0) {
                    ParentData[i].isGroup = false;
                    for (var j = 0; j < ParentData[i].BOQItems.results.length; j++) {
                        ParentData[i].results.push(ParentData[i].BOQItems.results[j])
                        ParentData[i].results[j].isGroup = true;
                        ParentData[i].results[j].enable = true;
                    }
                }
                else {
                    ParentData[i].isGroup = false;
                    for (var j = 0; j < ParentData[i].BOQItems.results.length; j++) {
                        ParentData[i].results.push(ParentData[i].BOQItems.results[j])
                        ParentData[i].results[j].isGroup = true;
                        ParentData[i].results[j].enable = false;
                    }
                }
            }
            //   ParentData[0].enable = true;  
            var TreeDataModel = new JSONModel({ "results": ParentData });
            this.getView().setModel(TreeDataModel, "TreeDataModel");
            this.openInspectionBOQFragment();
        },

        openInspectionBOQFragment: function (itemData) {
            var oView = this.getView();
            // var TreeDataModel = new JSONModel({ results: itemData });
            // oView.setModel(TreeDataModel, "TreeDataModel");
            //  oView.getModel("inspectedMapBOQItemsModel").setProperty("/inspectedMapBOQItems", itemData);
            // create dialog lazily
            var that = this;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            if (!this.pDialogInspectBOQ) {
                this.pDialogInspectBOQ = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.inspectionDetails.InspectionCallChildLineItems",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    //  oDialog.setModel(that.getView().getModel("TreeTableModelView"));
                    return oDialog;
                });
            }
            this.pDialogInspectBOQ.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                //oDialog.setModel(that.getView().getModel("TreeTableModelView"));
                oDialog.open();
            });
        },


        onLiveChangeARHQty: function (oEvent) {
            var oSaveButton = this.getView().byId("idBtnSave"),
                iValue = oEvent.getSource().getValue();

            if (iValue) {
                var oRowObject = oEvent.getSource().getParent().getBindingContext("TreeDataModel").getObject(),
                    iQuantity = oRowObject.Qty ? parseFloat(oRowObject.Qty) : 0,
                    iAcceptedQuantity = oRowObject.AcceptedQuantity ? parseFloat(oRowObject.AcceptedQuantity) : 0,
                    iRejectedQuantity = oRowObject.RejectedQuantity ? parseFloat(oRowObject.RejectedQuantity) : 0,
                    iHoldQuantity = oRowObject.HoldQuantity ? parseFloat(oRowObject.HoldQuantity) : 0,
                    iSumOfARHQty = iAcceptedQuantity + iRejectedQuantity + iHoldQuantity,
                    oMismatchMsgStrip = this.getView().byId("idQntMismatchMSGStrip"),
                    fnShowQntMismatchMSGStrip = function () {
                        oMismatchMsgStrip.setText("Please check the entered quanity.");
                        oMismatchMsgStrip.setVisible(true);
                        oSaveButton.setEnabled(false);
                    },
                    fnShowMinusQntMSGStrip = function () {
                        oMismatchMsgStrip.setText("No negative quantity values allowed.");
                        oSaveButton.setEnabled(false);
                        oMismatchMsgStrip.setVisible(true);
                    };


                if (iValue.indexOf("-") >= 0) {
                    fnShowMinusQntMSGStrip();
                    return;
                }

                iValue = parseFloat(iValue);

                if (iValue > iQuantity) {
                    fnShowQntMismatchMSGStrip();
                    return;
                }
                else if (iSumOfARHQty > iQuantity) {
                    fnShowQntMismatchMSGStrip();
                    return;
                }
                oMismatchMsgStrip.setVisible(false);

                var aInspectionBOQItems = this.getTableItems().selectedItems.BOQItems.results,
                    aIncompleteInspectionBOQItems = aInspectionBOQItems.filter(function (oItem) {
                        return oItem.AcceptedQuantity === null || oItem.RejectedQuantity === null || oItem.HoldQuantity === null;
                    }),
                    aIncompleteInspectionBOQItemsWithMinus = aInspectionBOQItems.filter(function (oItem) {
                        return oItem.AcceptedQuantity.indexOf("-") >= 0 || oItem.RejectedQuantity.indexOf("-") >= 0 || oItem.HoldQuantity.indexOf("-") >= 0;
                    });

                if (aIncompleteInspectionBOQItemsWithMinus.length > 0) {
                    fnShowMinusQntMSGStrip();
                    return;
                }

                if (aIncompleteInspectionBOQItems.length === 0) {
                    // var iAcceptedQuantityTotal = 0, iRejectedQuantityTotal = 0, iHoldQuantityTotal = 0;
                    // for (var i = 0; i < aInspectionBOQItems.length; i++) {
                    //     iAcceptedQuantityTotal = iAcceptedQuantityTotal + (aInspectionBOQItems[i].AcceptedQuantity ? parseFloat(aInspectionBOQItems[i].AcceptedQuantity) : 0);
                    //     iRejectedQuantityTotal = iRejectedQuantityTotal + (aInspectionBOQItems[i].RejectedQuantity ? parseFloat(aInspectionBOQItems[i].RejectedQuantity) : 0);
                    //     iHoldQuantityTotal = iHoldQuantityTotal + (aInspectionBOQItems[i].HoldQuantity ? parseFloat(aInspectionBOQItems[i].HoldQuantity) : 0);
                    // }
                    // var iMainAcceptedQuantity = parseInt(this.oSelectedMapBOQItem.AcceptQuantity),
                    //     iMainRejectedQuantity = parseInt(this.oSelectedMapBOQItem.RejectQuantity),
                    //     iMainHoldQuantity = parseInt(this.oSelectedMapBOQItem.HoldQuantity);

                    // if (iAcceptedQuantityTotal > iMainAcceptedQuantity || iRejectedQuantityTotal > iMainRejectedQuantity || iHoldQuantityTotal > iMainHoldQuantity) {
                    //     // MessageBox.error("Please enter quantities matching with Parent Quantities.");
                    //     oMismatchMsgStrip.setVisible(true);
                    // }
                    // else {
                    //     oSaveButton.setEnabled(true);
                    // }

                    for (var i = 0; i < aInspectionBOQItems.length; i++) {
                        var iAcceptedQty = aInspectionBOQItems[i].AcceptedQuantity ? parseFloat(aInspectionBOQItems[i].AcceptedQuantity) : 0,
                            iRejectedQty = aInspectionBOQItems[i].RejectedQuantity ? parseFloat(aInspectionBOQItems[i].RejectedQuantity) : 0,
                            iHoldQty = aInspectionBOQItems[i].HoldQuantity ? parseFloat(aInspectionBOQItems[i].HoldQuantity) : 0,
                            iSumOfARHQuantity = iAcceptedQty + iRejectedQty + iHoldQty;

                        if (iSumOfARHQuantity < parseFloat(aInspectionBOQItems[i].Qty)) {
                            fnShowQntMismatchMSGStrip();
                            return;
                        }
                        else if (iSumOfARHQuantity > parseFloat(aInspectionBOQItems[i].Qty)) {
                            fnShowQntMismatchMSGStrip();
                            return;
                        }
                        // else if (iSumOfARHQuantity < parseFloat(aInspectionBOQItems[i].Qty)) {
                        //     fnShowQntMismatchMSGStrip();
                        //     return;
                        // }
                    }
                    oSaveButton.setEnabled(true);
                }
            } else {
                oSaveButton.setEnabled(false);
            }
        },
        // openInspectionBOQFragment: function (itemData) {
        //     var oView = this.getView();
        //     oView.getModel("inspectedMapBOQItemsModel").setProperty("/inspectedMapBOQItems", itemData);
        //     // create dialog lazily
        //     var that = this;
        //     var oDetails = {};
        //     oDetails.controller = this;
        //     oDetails.view = this.getView();
        //     if (!this.pDialogInspectBOQ) {
        //         this.pDialogInspectBOQ = Fragment.load({
        //             id: oDetails.view.getId(),
        //             name: "com.agel.mmts.vendorPersona.view.fragments.inspectionDetails.InspectionCallChildLineItems",
        //             controller: oDetails.controller
        //         }).then(function (oDialog) {
        //             if (Device.system.desktop) {
        //                 oDialog.addStyleClass("sapUiSizeCompact");
        //             }
        //             // connect dialog to the root view of this component (models, lifecycle)
        //             oDetails.view.addDependent(oDialog);
        //             //  oDialog.setModel(that.getView().getModel("TreeTableModelView"));
        //             return oDialog;
        //         });
        //     }
        //     this.pDialogInspectBOQ.then(function (oDialog) {
        //         oDetails.view.addDependent(oDialog);
        //         //oDialog.setModel(that.getView().getModel("TreeTableModelView"));
        //         oDialog.open();
        //     });
        // },

        onViewInspectBOQDialogClose: function () {
            this.pDialogInspectBOQ.then(function (oDialog) {
                oDialog.close();
            });
            this.oSelectedMapBOQItem = null;
        },

        onLiveChangeApprovedQty: function (oEvent) {
            var bindingContext = oEvent.getSource().getBindingContext("TreeDataModel"),
                path = bindingContext.getPath();
            // rowObj = bindingContext.getModel().getProperty(path);
            var aChildItems = this.getViewModel("TreeDataModel").getData().results[0].BOQItems.results;
            var iTotalChildQty = 0;
            for (var i = 0; i < aChildItems.length; i++) {
                if (aChildItems[i].IssuedQty)
                    iTotalChildQty += parseFloat(aChildItems[i].IssuedQty);
            }
            var ApprovedQty = oEvent.getSource().getValue();
            var aCell = oEvent.getSource().getParent().getCells()[8];
            if (parseFloat(ApprovedQty) > parseFloat(this.inspectionQty)) {
                aCell.setValueState("Error");
                aCell.setValueStateText("Please enter quantity lesser than or equal to remaining quantity")
                this.getView().byId("idBtnSave").setEnabled(false);
            } else {
                aCell.setValueState("None");
                this.getView().byId("idBtnSave").setEnabled(true);
            }
            if (iTotalChildQty > parseFloat(this.inspectionQty)) {
                aCell.setValueState("Error");
                aCell.setValueStateText("Quantity exceed the total parent Quantity.")
                this.getView().byId("idBtnSave").setEnabled(false);
            } else {
                aCell.setValueState("None");
                this.getView().byId("idBtnSave").setEnabled(true);
            }
        },

        onPressSaveInspectionBOQItems: function () {
            var itemData = this.getTableItems(),
                inspectionID = this.inspectionID;
                
            MessageBox.confirm("Do you want to Submit the Inspect BOQ Items?", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        this.onSaveInspectBOQDialog(inspectionID, itemData);
                    }
                }.bind(this)
            });
        },

        getTableItems: function () {
            var itemData = this.getView().getModel("TreeDataModel").getData();
            var selectedItems = itemData.results[0];
            // var selectedItems = itemData.filter(function (item) {
            //     return item.isSelected === true;
            // });
            return {
                selectedItems
            };
        },

        onSelectAll: function (oeve) {
            var isSelected = oeve.getSource().getSelected();
            var itemData = this.getView().getModel("inspectedMapBOQItemsModel").getProperty("/inspectedMapBOQItems");
            if (isSelected) {
                for (var i = 0; i < itemData.length; i++) {
                    itemData[i].isSelected = true;
                }
            }
            else {
                for (var i = 0; i < itemData.length; i++) {
                    itemData[i].isSelected = false;
                }
            }
            this.getView().getModel("inspectedMapBOQItemsModel").setProperty("/inspectedMapBOQItems", itemData);
        },

        _validateItemData: function (itemData) {
            var bValid = true;
            if (itemData.length > 0) {
                for (let i = 0; i < itemData.length; i++) {
                    if (!itemData[i].ApprovedQty) {
                        bValid = false;
                        sap.m.MessageBox.alert("Please select quanity for the material " + itemData[i].MaterialCode);
                        return;
                    }
                }
            }
            else {
                bValid = false;
                sap.m.MessageBox.alert("Please select atleast one item");
            }
            return bValid;
        },

        onSaveInspectBOQDialog: function (inspectionID, itemData) {
            var inspectionQty = this.oSelectedMapBOQItem.Qty,
                aInspectionBOQItems = itemData.selectedItems.BOQItems.results.map(function (item) {
                    return {
                        BOQItemId: item.ID,
                        InspectionQty: inspectionQty,
                        AcceptedQuantity: item.AcceptedQuantity !== "" ? item.AcceptedQuantity : "0",
                        RejectedQuantity: item.RejectedQuantity !== "" ? item.RejectedQuantity : "0",
                        HoldQuantity: item.HoldQuantity !== "" ? item.HoldQuantity : "0",
                    };
                }),
                oPayload = {
                    "InspectionID": inspectionID,
                    "CreatedAt": this.CreatedAt,
                    "CreatedBy": "",
                    "UpdatedAt": null,
                    "BOQGroupId": itemData.selectedItems.ID,
                    // "UpdatedBy": this.UpdatedBy,
                    "InspectedBOQItems": aInspectionBOQItems
                };

            this.MainModel.create("/InspectionBOQRequestSet", oPayload, {
                success: function (oData) {
                    this.oSelectedMapBOQItem = null;
                    if (oData.Success === true) {
                        MessageBox.success("The Inspected BOQ Items has been succesfully created for selected Items!");
                        this.onViewInspectBOQDialogClose();
                        this.MainModel.refresh();
                    }
                    else {
                        MessageBox.error(oData.Message);
                    }
                }.bind(this),
                error: function (oError) {
                    // MessageBox.error("Something went Wrong!");
                    // var objectViewModel = this.getViewModel("objectViewModel");
                    // objectViewModel.setProperty("/isViewQRMode", false);
                }.bind(this)
            });
        },

        onRowsUpdated: function (oEvent) {
            //  //debugger;
            //  var oTable = this.getView().byId("TreeTableBasicView");
            //   var mBindingParams = oEvent.getSource().getBinding("rows");
            // mBindingParams.aSorters.push(new sap.ui.model.Sorter("CreatedOn",false));
        },
        onExit: function () {
        }
    });
}
);
