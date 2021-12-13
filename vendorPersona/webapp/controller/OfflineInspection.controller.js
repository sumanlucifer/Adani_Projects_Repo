sap.ui.define([
    "./BaseController",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    // "sap/ui/model/FilterOperator",
    // "sap/ui/core/Fragment",
    // "sap/ui/model/Sorter",
    // "sap/ui/Device",
    "sap/m/MessageBox",
    'sap/ui/core/ValueState',
    'sap/m/MessageToast',
    '../utils/formatter',
], function (BaseController, jQuery, JSONModel, Filter, MessageBox, ValueState, MessageToast, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.OfflineInspection", {
        formatter: formatter,

        onInit: function () {
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteCreateOfflineInspection").attachPatternMatched(this._onObjectMatched, this);
            this.MainModel = this.getOwnerComponent().getModel();

            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                bQunatityInput: false
            });
            this.setModel(oViewModel, "objectViewModel");
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").POId;
            this._bindView("/PurchaseOrderSet(" + sObjectId + ")");
            this._getLineItemData("/PurchaseOrderSet(" + sObjectId + ")/ParentLineItems");
            this._createAttachmentModel();
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
                        objectViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _getLineItemData: function (sPath) {
            this.getComponentModel().read(sPath, {
                urlParameters: { "$expand": "BOQApprovalRequests/BOQGroup" },
                success: function (oData, oResponse) {
                    var data = oData.results;
                    this._prepareDataForView(data);
                }.bind(this),
                error: function (oError) {
                   // sap.m.MessageBox.error(JSON.stringify(oError));
                }
            })
        },

        _createAttachmentModel: function () {
            var model = new JSONModel({
                items: [],
                Comment: null,
                InspectionDate: null,
                RaisedInspectionDate: null
            });
            this.getView().setModel(model, "localAttachmentModel");
        },

        _prepareDataForView: function (data) {
            if (data.length) {
                data.forEach(element => {
                    element.InspectionQty = null;
                    element.ParentLineItemId = element.ID;
                    element.InspectedBOQItemRequests = [];
                    element.BOQApprovedQty = 0;
                    element.BOQApprovedQtyRemaining = 0;
                    for (var i = 0; i < element.BOQApprovalRequests.results.length; i++) {
                        if (element.BOQApprovalRequests.results[i].Status === 'APPROVED') {
                            element.RejectQuantity = "0";
                            element.HoldQuantity = "0";
                            element.AcceptQuantity = "0";
                            if (!element.BOQApprovalRequests.results[i].IsInspectionRaised)
                                element.BOQApprovedQtyRemaining += parseFloat(element.BOQApprovalRequests.results[i].BOQGroup.GeneratedBOQQty);
                            element.BOQApprovedQty += parseFloat(element.BOQApprovalRequests.results[i].BOQGroup.GeneratedBOQQty);
                            element.InspectionQty = element.BOQApprovedQtyRemaining;
                        }
                    }
                });
            }
            var oModel = new JSONModel(data);
            this.getView().byId("idParentItemTable").setModel(oModel, "ParentItemModel");
        },

        onSelectionChange: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var bSelectAll = oEvent.getParameter("selectAll");
            var aListItems = oEvent.getParameter("listItems"),
                sBOQQty = parseFloat(oEvent.getParameter("listItem").getCells()[6].getText()),
                fnSetARHQtyEnableDisable = function (bEnabled) {
                    for (var i = 0; i < aListItems.length; i++) {
                        aListItems[i].getCells()[7].setEnabled(bEnabled);
                        aListItems[i].getCells()[8].setEnabled(bEnabled);
                        aListItems[i].getCells()[9].setEnabled(bEnabled);
                        aListItems[i].getCells()[10].setEnabled(bEnabled);
                    }
                };


            // if (sBOQQty === 0 || sBOQQty === null) {
            //     MessageToast.show("BOQ Quantity is not available for selected item.");
            //     return false;
            // }
            if (bSelectAll) {
                fnSetARHQtyEnableDisable(true);
            } else {
                fnSetARHQtyEnableDisable(false);
            }
            if (bSelected) {
                oEvent.getParameter("listItem").getCells()[7].setEnabled(true);
                oEvent.getParameter("listItem").getCells()[8].setEnabled(true);
                oEvent.getParameter("listItem").getCells()[9].setEnabled(true);
                oEvent.getParameter("listItem").getCells()[10].setEnabled(true);

            } else {
                oEvent.getParameter("listItem").getCells()[7].setEnabled(true);
                oEvent.getParameter("listItem").getCells()[8].setEnabled(false);
                oEvent.getParameter("listItem").getCells()[9].setEnabled(false);
                oEvent.getParameter("listItem").getCells()[10].setEnabled(false);
            }

            this.setSaveButtonEnabledDisable();
        },

        setSaveButtonEnabledDisable: function () {
            var oSaveButton = this.getView().byId("idOfflineSaveButton"),
                aSelectedLineItems = this.byId("idParentItemTable").getSelectedItems(),
                bFlagIncompleteItemsFound = false;

            if (aSelectedLineItems.length === 0) {
                oSaveButton.setEnabled(false);
                return;
            }

            for (var i = 0; i < aSelectedLineItems.length; i++) {
                var oLineItemObj = aSelectedLineItems[i].getBindingContext("ParentItemModel").getObject(),
                    iInspectionQty = oLineItemObj.InspectionQty ? parseFloat(oLineItemObj.InspectionQty) : 0,
                    iAcceptQuantity = oLineItemObj.AcceptQuantity ? parseFloat(oLineItemObj.AcceptQuantity) : 0,
                    iRejectQuantity = oLineItemObj.RejectQuantity ? parseFloat(oLineItemObj.RejectQuantity) : 0,
                    iHoldQuantity = oLineItemObj.HoldQuantity ? parseFloat(oLineItemObj.HoldQuantity) : 0,
                    iSumOfARHQty = iAcceptQuantity + iRejectQuantity + iHoldQuantity;

                iSumOfARHQty = parseFloat(iSumOfARHQty.toFixed(5));

                if (iSumOfARHQty !== iInspectionQty) {
                    bFlagIncompleteItemsFound = true;
                    break;
                }
            }

            if (bFlagIncompleteItemsFound) {
                oSaveButton.setEnabled(false);
            }
            else {
                oSaveButton.setEnabled(true);
            }

        },

        onLiveChangeComment: function (oEvent) {
            if (oEvent.getSource().getValue().length < 1) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Enter a comment value");
            } else {
                oEvent.getSource().setValueState("None");
            }
        },

        onLiveChangeDate: function (oEvent) {
            if (oEvent.getSource().getValue().length < 1) {
                oEvent.getSource().setValueState("Error");
            } else {
                oEvent.getSource().setValueState("None");
            }
        },

        onLiveChangeInspectionQty: function (oEvent) {
            var InspectQuantity = parseFloat(oEvent.getSource().getValue());
            oEvent.getSource().getParent().getCells()[8].setEnabled(true);
            oEvent.getSource().getParent().getCells()[9].setEnabled(true);
            oEvent.getSource().getParent().getCells()[10].setEnabled(true);
            var Quantity = parseFloat(oEvent.getSource().getParent().getCells()[5].getText());
            var oSaveButton = this.getView().byId("idOfflineSaveButton");

            if (oEvent.getSource().getValue() === "") {
                oEvent.getSource().getParent().getCells()[8].setEnabled(false);
                oEvent.getSource().getParent().getCells()[9].setEnabled(false);
                oEvent.getSource().getParent().getCells()[10].setEnabled(false);
                oEvent.getSource().getParent().getCells()[8].setValue("");
                oEvent.getSource().getParent().getCells()[9].setValue("");
                oEvent.getSource().getParent().getCells()[10].setValue("");
            }
            if (InspectQuantity <= 0) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter positive value");
                oSaveButton.setEnabled(false);
                return 0;
            }
            if (InspectQuantity > Quantity) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter inspected quantity lesser than or equal to total quantity");
                oSaveButton.setEnabled(false);
            }

            else {
                oEvent.getSource().setValueState("None");
                oSaveButton.setEnabled(false);
                // oSaveButton.setEnabled(true);
            }

        },

        onLiveChangeARHQty: function (oEvent) {
            var oValue = parseFloat(oEvent.getSource().getValue()),
                oLineItemObj = oEvent.getSource().getBindingContext("ParentItemModel").getObject(),
                Quantity = oLineItemObj.InspectionQty ? parseFloat(oLineItemObj.InspectionQty) : 0,
                ApprovedQty = oLineItemObj.AcceptQuantity ? parseFloat(oLineItemObj.AcceptQuantity) : 0,
                RejectQty = oLineItemObj.RejectQuantity ? parseFloat(oLineItemObj.RejectQuantity) : 0,
                HoldQty = oLineItemObj.HoldQuantity ? parseFloat(oLineItemObj.HoldQuantity) : 0,
                sumARHQty = ApprovedQty + RejectQty + HoldQty,
                oSaveButton = this.getView().byId("idOfflineSaveButton"),
                aInputFileds = oEvent.getSource().getParent().getCells(),
                fnSetQtyErrorMsg = function () {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Please check the entered quanity.");
                    oSaveButton.setEnabled(false);
                },
                fnSetMinusQtyErrorMsg = function () {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("No negative quantity values allowed.");
                    oSaveButton.setEnabled(false);
                };

            aInputFileds[7].setValueState("None");
            aInputFileds[8].setValueState("None");
            aInputFileds[9].setValueState("None");

            sumARHQty = parseFloat(sumARHQty.toFixed(5));

            if (oValue < 0 || ApprovedQty < 0 || RejectQty < 0 || HoldQty < 0) {
                fnSetMinusQtyErrorMsg();
                return 0;
            }
            else if (oValue > Quantity) {
                fnSetQtyErrorMsg();
                return 0;
            }
            else if (sumARHQty > Quantity) {
                fnSetQtyErrorMsg();
                return 0;
            }

            var aSelectedLineItems = oEvent.getSource().getParent().getParent().getSelectedItems(),
                aIncompleteSelctedLineItems = aSelectedLineItems.filter(function (oLineItem) {
                    var oLineItemObj = oLineItem.getBindingContext("ParentItemModel").getObject();
                    return oLineItemObj.AcceptQuantity === null || oLineItemObj.RejectQuantity === null || oLineItemObj.HoldQuantity === null;
                }),
                aIncompleteLineItemsWithMinus = aSelectedLineItems.filter(function (oItem) {
                    var oLineItemObj = oItem.getBindingContext("ParentItemModel").getObject();
                    return parseFloat(oLineItemObj.AcceptQuantity) < 0 || parseFloat(oLineItemObj.RejectQuantity) < 0 || parseFloat(oLineItemObj.HoldQuantity) < 0;
                });

            if (aIncompleteLineItemsWithMinus.length > 0) {
                fnSetMinusQtyErrorMsg();
                return;
            }

            if (aIncompleteSelctedLineItems.length > 0) {
                fnSetQtyErrorMsg();
                return 0;
            }
            else {
                if (sumARHQty < Quantity && (ApprovedQty > 0 && RejectQty > 0 && HoldQty > 0)) {
                    fnSetQtyErrorMsg();
                    return;
                }
                if (sumARHQty === Quantity) {
                    oEvent.getSource().setValueState("None");
                    // oSaveButton.setEnabled(true);
                    this.setSaveButtonEnabledDisable();

                }
                else {
                    oSaveButton.setEnabled(false);
                }
            }
        },


        // onLiveChangeARHQty: function (oEvent) {
        //     var oValue = parseFloat(oEvent.getSource().getValue());

        //     var Quantity = parseFloat(oEvent.getSource().getParent().getCells()[5].getValue());
        //     var ApprovedQty = parseFloat(oEvent.getSource().getParent().getCells()[6].getValue());
        //     var RejectQty = parseFloat(oEvent.getSource().getParent().getCells()[7].getValue());
        //     var HoldQty = parseFloat(oEvent.getSource().getParent().getCells()[8].getValue());
        //     if (!ApprovedQty) ApprovedQty = 0;
        //     if (!RejectQty) RejectQty = 0;
        //     if (!HoldQty) HoldQty = 0;
        //     var sumARHQty = ApprovedQty + RejectQty + HoldQty;
        //     var oSaveButton = this.getView().byId("idOfflineSaveButton");
        //     if (sumARHQty > Quantity) {
        //         oEvent.getSource().setValueState("Error");
        //         oEvent.getSource().setValueStateText("Please enter quantity lesser than or equal to total Inspection quantity");
        //         oSaveButton.setEnabled(false);
        //         return 0;
        //     }
        //     if (oValue <= 0) {
        //         oEvent.getSource().setValueState("Error");
        //         oEvent.getSource().setValueStateText("Please enter positive value");
        //         oSaveButton.setEnabled(false);
        //         return 0;
        //     }
        //     if (oValue > Quantity) {
        //         oEvent.getSource().setValueState("Error");
        //         oEvent.getSource().setValueStateText("Please enter inspected quantity lesser than or equal to total quantity");
        //         oSaveButton.setEnabled(false);
        //         return 0;
        //     }


        //     else {
        //         oEvent.getSource().setValueState("None");
        //         oSaveButton.setEnabled(true);
        //     }
        // },

        onSaveValidation: function () {
            var flag = 0;
            // var aTableData = this.byId("idParentItemTable").getModel("ParentItemModel").getData();
            // var aSelectedItemsFromTable = aTableData.filter(item => item.InspectionQty !== null);
            var creationModelData = this.getViewModel("localAttachmentModel").getData();

            // if (aSelectedItemsFromTable.length < 1) {
            //     sap.m.MessageBox.error("Please select at least one line item detail and fill the inspection quantity");
            //     return 1;
            // }

            // var aInvalidInspectionQtyItems = aTableData.filter(item => (item.InspectionQty && item.InspectionQty <= 0));
            // if (aInvalidInspectionQtyItems.length > 0) {
            //     sap.m.MessageBox.error("Please Enter valid inspection quantity");
            //     return 1;
            // }

            if (creationModelData.Comment && creationModelData.Comment.trim() === "") {
                flag = 1;
                this.getView().byId("idTxtComment").setValueState("Error");
            }

            if (creationModelData.InspectionDate == null || creationModelData.InspectionDate == "") {
                flag = 1;
                this.getView().byId("idDpInspectionDate").setValueState("Error");
            }

            if (creationModelData.RaisedInspectionDate == null || creationModelData.RaisedInspectionDate == "") {
                flag = 1;
                this.getView().byId("idDpRaisedInspectionDate").setValueState("Error");
            }

            if (flag == 1) {
                sap.m.MessageBox.error("Please fill mandatory fields");
                return 1;
            }

            if (creationModelData.items < 1) {
                sap.m.MessageBox.error("Please select at least one attachment");
                return 1;
            }
        },

        onSaveButtonPress: function (oEvent) {
            if (this.onSaveValidation() == 1) {
                return 0;
            }

            var that = this;
            MessageBox.confirm("Do you want to save offline item?", {
                icon: MessageBox.Icon.INFORMATION,
                title: "Confirm",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == "YES") {
                        that.onSaveButtonConfirmPress(oEvent);
                    }
                }
            });
        },

        onSaveButtonConfirmPress: function (oEvent) {
            var aSelectedItems = this.byId("idParentItemTable").getSelectedItems(),
                aInspectedParentLineItem = [];

            for (var i = 0; i < aSelectedItems.length; i++) {
                var oItemObj = aSelectedItems[i].getBindingContext("ParentItemModel").getObject();
                if (oItemObj.IsBOQApplicable === true && oItemObj.UoM !== "MT") {
                    aInspectedParentLineItem.push(oItemObj);
                } else if (oItemObj.InspectionQty > 0) {
                    aInspectedParentLineItem.push(oItemObj);
                }
            }

            var aTableData = this.byId("idParentItemTable").getModel("ParentItemModel").getData();
            var aSelectedItemsFromTable = aTableData.filter(item => item.InspectionQty !== null);
            var oBindingContextData = this.getView().getBindingContext().getObject();
            var creationModelData = this.getViewModel("localAttachmentModel").getData();
            var oPayload = {
                "PONumber": oBindingContextData.PONumber,
                "InspectionDate": creationModelData.InspectionDate,
                "PurchaseOrderId": oBindingContextData.ID,
                "Comment": creationModelData.Comment,
                "InspectedParentLineItemRequests": aInspectedParentLineItem,
                "Documents": null,
                "RaisedOfflineInspectionDate": creationModelData.RaisedInspectionDate
            };
            this.getViewModel("objectViewModel").setProperty("/busy", true);
            this.getComponentModel().create("/InspectionCallIdRequestSet", oPayload, {
                success: function (oData, oResponse) {
                    this.getViewModel("objectViewModel").setProperty("/busy", false);
                    this.getComponentModel().refresh();
                    sap.m.MessageBox.success("Offline Inspection Call raised successfully!", {
                        title: "Success",
                        onClose: function (oAction1) {
                            if (oAction1 === sap.m.MessageBox.Action.OK) {
                                this._navToDetailsPage();
                            }
                        }.bind(this)
                    });
                }.bind(this),
                error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty("/busy", false);
                }.bind(this)
            })

        },

        _navToDetailsPage: function () {

            this.oRouter.navTo("RoutePODetailPage", {
                POId: "(" + this.getView().getBindingContext().getObject().ID + ")"
            })
        },

        onFileDeleted: function (oEvent) {
            this.deleteItemById(oEvent.getParameter("documentId"));
            //	MessageToast.show("FileDeleted event triggered.");
        },

        deleteItemById: function (sItemToDeleteId) {
            var sCurrentPath = this.getCurrentFolderPath();
            var oData = this.oModel.getProperty(sCurrentPath);
            var aItems = oData && oData.items;
            jQuery.each(aItems, function (index) {
                if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
                    aItems.splice(index, 1);
                }
            });
            this.oModel.setProperty(sCurrentPath + "/items", aItems);
        },

        onAttachmentChange: function (oEvent) {
            // keep a reference of the uploaded file
            
            var rowObj = oEvent.getSource().getBindingContext().getObject();
            var that = this
            var oFiles = oEvent.getParameters().files;
            var SubType = "inpsection_doc";
            var Type = "INSPECTION";

            this.oFiles = oFiles;
            var fileName = oFiles[0].name;

            var fileType = oFiles[0].type;

            fileType = fileType === "application/pdf" ? "application/pdf" : "application/octet-stream";


            var fileSize = oFiles[0].size;
            for (var i = 0; i < oFiles.length; i++) {
                var fileName = oFiles[i].name;
                var fileSize = oFiles[i].size;
                this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                    that._addData(base64, fileName, fileType, fileSize, rowObj, oFiles);
                }, fileName);
            }
        },

        // _getImageData: function (url, callback) {
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

        // _addData1: function (data, fileName, SubType, Type, fileSize) {
        //     var that = this,
        //         oViewContext = this.getView().getBindingContext().getObject();

        //     // var document = {
        //     //     "Type": "INSPECTION",
        //     //     "SubType": "inpsection_doc",
        //     //     "FileName": fileName,
        //     //     "Content": data.split(",")[1],
        //     //     "ContentType": "application/pdf",
        //     //     "UploadedBy": "vendor-1",
        //     //     "FileSize": fileSize
        //     // };

        //     var document =
        //     {
        //         "Type": "INSPECTION",
        //         "ContentType": "application/pdf",
        //         "FileName": fileName,
        //         "Content": data,
        //         "UploadedBy": "vendor-1",
        //         "FileSize": fileSize,
        //         "SubType": "inpsection_doc",
        //         "UploadTypeId": "1",
        //         "PONumber": null,
        //         "CompanyCode": "123"
        //     };

        //     this.getView().getModel("localAttachmentModel").getData().items.push(document);
        // },

        _addData: function (base64, fileName, fileType, fileSize, rowObj, oFiles) {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );


            var sPONumber = this.getView().byId("idPONumber").getText();;
         
            var documents = {
                "Documents": [
                    {
                        "Type": "MDCC",
                        "ContentType": fileType,
                        "FileName": fileName,
                        "UploadedBy": "AGEL",
                        "FileSize": fileSize,
                        "SubType": "",
                        "UploadTypeId": rowObj.ID,
                        "PONumber": sPONumber,
                        "CompanyCode": null
                    }
                ]
            };

               this.getView().getModel("localAttachmentModel").getData().items.push(documents);
            
            var sPath = "/DocumentUploadEdmSet"
            this.MainModel.create(sPath, documents, {
                success: function (oData, oResponse) {
                    


                    this.getView().getModel().refresh();
                    this._updateDocumentService(oData.ID, fileType);
                    //   this.getView().getModel("ManageMDCCModel").getData().MDCCItems[rowId].MapItems = true;
                    //   this.getView().getModel("ManageMDCCModel").refresh();
                }.bind(this),
                error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );

                   // sap.m.MessageBox.error("Error uploading document");
                }
            });
        },


        _updateDocumentService: function (ID, fileType) {
            var that = this;
            var file = this.oFiles;
            var serviceUrl = `/AGEL_MMTS_API/api/v2/odata.svc/DocumentUploadEdmSet(${ID})/$value`
            var sUrl = serviceUrl;
            jQuery.ajax({
                method: "PUT",
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                url: sUrl,
                cache: false,
                contentType: fileType,
                processData: false,
                data: file[0],
                success: function (data) {
                    sap.m.MessageToast.show("MDCC Details Uploaded!");
                    that.getComponentModel().refresh();
                    that.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                },
                error: function () {
                    that.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                },
            });
        },


        onFileSizeExceed: function () {
            MessageBox.error("File size exceeded, Please upload file upto 10MB.");
        },

        onFileNameLengthExceed: function () {
            MessageBox.error("File name length exceeded, Please upload file with name lenght upto 50 characters.");
        }

    });
});
