sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    'sap/m/Token',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    'sap/m/MessageBox',
    '../utils/formatter',
    'sap/m/MessageToast'

],
    function (BaseController, Fragment, Device, JSONModel, Token, ColumnListItem, Label, MessageBox, formatter, MessageToast) {
        "use strict";

        return BaseController.extend("com.agel.mmts.materialreservation.controller.MaterialReservationPage", {
            formatter: formatter,
            onInit: function () {
                //jQuery.sap.addUrlWhitelist("blob");
                this.mainModel = this.getOwnerComponent().getModel();
                //Router Object
                this.oRouter = this.getOwnerComponent().getRouter();
                // this.oRouter.getRoute("RouteCreateViewStep2").attachPatternMatched(this._onObjectMatched, this);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    movementType: [{
                    key: "0",
                    value: "201"


                },
                {
                    key: "1",
                    value: "221"


                },
                 {
                    key: "2",
                    value: "222"


                },
                {
                    key: "3",
                    value: "311"


                },
            
             {
                    key: "4",
                    value: "312"


                }
            ],
                    isPackagingTableVisible: false,
                    isPackingListInEditMode: false,
                    isOuterPackagingRequired: true,
                    isViewQRMode: false

                });
                this.setModel(oViewModel, "objectViewModel");
               


              

            },

            _onObjectMatched: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
                this.packingListId = oEvent.getParameter("arguments").packingListId;
                var that = this;
                this.getView().bindElement({
                    path: "/PackingListSet(" + this.packingListId + ")",
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            var bIsProcessTwoCompletes = this.getBoundContext().getObject().IsProcessTwoCompletes;
                            var bIsOuterPackagingRequired = this.getBoundContext().getObject().IsOuterPackagingRequired;
                            if (!bIsOuterPackagingRequired)
                                objectViewModel.setProperty("/isOuterPackagingRequired", true);

                            //if (bIsProcessTwoCompletes) {
                            //objectViewModel.setProperty("/isViewQRMode", false);
                            objectViewModel.setProperty("/isPackingListInEditMode", false);
                            //}
                            /* else {
                                //objectViewModel.setProperty("/isViewQRMode", false);
                                objectViewModel.setProperty("/isPackingListInEditMode", false);
                            } */

                            objectViewModel.setProperty("/busy", false);
                        }
                    }
                });

                this._getPackingListOuterPackagingData();
                this._getPackingListInnerPackagingData();
                this._createAdditionalDetailsModel();
            },

            _createAdditionalDetailsModel: function (oEvent) {
                var oModel = new JSONModel({
                    VehicleNumber: null,
                    PackagingReferenceNumber: null,
                    InvoiceNumber: null,
                    InvoiceDate: null
                });
                this.getView().setModel(oModel, "AdditionalDetialsModel")
            },

            _getPackingListOuterPackagingData: function () {
                this.mainModel.read("/PackingListSet(" + this.packingListId + ")/OuterPackagings", {
                    success: function (oData, oError) {
                        console.log("Outer packaging get");
                        var oModel = new JSONModel(oData.results);
                        this.getView().setModel(oModel, "outerPackagingModel");
                        this._getRelatedInnerPackagings(oData.results);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            _getRelatedInnerPackagings: function (outerPackagingData) {
                for (let i = 0; i < outerPackagingData.length; i++) {
                    var path = "/OuterPackagingSet(" + outerPackagingData[i].ID + ")/InnerPackagings"

                    this.mainModel.read(path, {
                        success: function (i, oData, oError) {
                            console.log("Inner packaging get");
                            this.getView().getModel("outerPackagingModel").setProperty("/" + i + "/InnerPackagings", oData.results);
                            debugger;
                        }.bind(this, i),
                        error: function (oError) {
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });

                }

            },

            _getPackingListInnerPackagingData: function () {
                this.mainModel.read("/PackingListSet(" + this.packingListId + ")/InnerPackagings", {
                    success: function (oData, oError) {
                        this.aInnerPackagingData = oData.results;
                        var oModel = new JSONModel(oData.results);
                        this.getView().setModel(oModel, "valueHelpModel");
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            onViewBOQItemDialogClose: function (oEvent) {
                this.boqDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onManageInnerPackagingPress: function (oEvent) {
                this.selectedOuterPackagingObject = oEvent.getSource().getBindingContext("outerPackagingModel").getObject();
                this._getInnerPackagingForSelected(oEvent.getSource());
                var oButton = oEvent.getSource(),
                    oView = this.getView();

                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.agel.mmts.vendorpackinglistcreate.view.fragments.createViewStep2.ValueHelpDialog",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                }

                this._pDialog.then(function (oDialog) {
                    //this._configDialog(oButton, oDialog);
                    oDialog.open();
                }.bind(this));
            },

            _getInnerPackagingForSelected: function (selected) {
                var sID = selected.getBindingContext("outerPackagingModel").getObject().ID;
                if (sID) {
                    var path = "/OuterPackagingSet(" + sID + ")/InnerPackagings"

                    this.mainModel.read(path, {
                        success: function (oData, oError) {
                            console.log("selected packaging get");
                            this._prepareData(oData.results);
                        }.bind(this),
                        error: function (oError) {
                            sap.m.MessageBox.error(JSON.stringify(oError));
                        }
                    });
                }
                else
                    this._prepareData([]);
            },

            _prepareData: function (aSelctedData) {
                this.aSelctedDataOfInnerPackaging = aSelctedData;
                this.mainModel.read("/PackingListSet(" + this.packingListId + ")/InnerPackagings", {
                    success: function (oData, oError) {
                        var aAllData = oData.results;
                        for (let i = 0; i < aAllData.length; i++) {
                            for (let j = 0; j < this.aSelctedDataOfInnerPackaging.length; j++) {
                                if (aAllData[i].ID == this.aSelctedDataOfInnerPackaging[j].ID)
                                    aAllData[i].selected = true;
                            }
                        }
                        aAllData = aAllData.filter((item) => item.OuterPackagingId == null || item.selected);
                        this.getView().getModel("valueHelpModel").setData(aAllData);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });


            },

            onAddOuterPackagingPress: function (oEvent) {
                var oModel = this.getViewModel("outerPackagingModel");
                var oItems = oModel.getData().map(function (oItem) {
                    return Object.assign({}, oItem);
                });

                oItems.push({
                    ItemNo: "",
                    Material: "",
                    StorageLocation: "",
                    Qty: "",
                    BaseUnit: "",
                    Batch: ""
                });

                oModel.setData(oItems);
            },

            onDeleteOuterPackingListItemPress: function (oEvent) {
                this.packingListObj = oEvent.getSource().getBindingContext("outerPackagingModel").getObject();

                var iRowNumberToDelete = parseInt(oEvent.getSource().getBindingContext("outerPackagingModel").getPath().slice("/".length));
                var sChildName = oEvent.getSource().getBindingContext("outerPackagingModel").getObject().PackagingType;

                if (sChildName.length)
                    var sMessage = "Are you sure you want to delete this entry with packaging type - " + sChildName + " ?";
                else
                    var sMessage = "Are you sure you want to delete this entry?";

                this._handleMessageBoxOpen(sMessage, "warning", iRowNumberToDelete);
            },

            _deleteFromDB: function (ID) {
                this.mainModel.remove("/OuterPackagingRequestEdmSet(" + ID + ")", {
                    success: function (oData, oResponse) {
                        console.log("Delete DB outerpackaging");
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.parse(oError));
                    }
                })
            },

            _handleMessageBoxOpen: function (sMessage, sMessageBoxType, iRowNumberToDelete) {
                MessageBox[sMessageBoxType](sMessage, {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (iRowNumberToDelete, oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this._deleteBOQRow(iRowNumberToDelete);
                        }
                    }.bind(this, iRowNumberToDelete)
                });
            },

            _deleteBOQRow: function (iRowNumberToDelete) {
                if (this.packingListObj.ID)
                    this._deleteFromDB(this.packingListObj.ID);
                var aTableData = this.getViewModel("outerPackagingModel").getData();
                aTableData.splice(iRowNumberToDelete, 1);
                this.getView().getModel("outerPackagingModel").refresh();
            },

            onPackingListTypeChange: function (oEvent) {
                //this.getViewModel("UOMSuggestionModel").setData(null);
                var packingListObj = oEvent.getParameter("selectedItem").getBindingContext().getObject(),
                    oBindingContext = oEvent.getParameter("selectedItem").getBindingContext(),
                    oBindingContextPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath(),
                    aRowCells = oEvent.getSource().getParent().getCells(),
                    sItemPath = oEvent.getSource().getBindingContext("outerPackagingModel").getPath();

                var sText = oEvent.getParameter("selectedItem").getText();
                this.getView().getModel("outerPackagingModel").setProperty(sItemPath + "/PackagingType", sText);

                var sKey = oEvent.getParameter("selectedItem").getKey();
                this.getView().getModel("outerPackagingModel").setProperty(sItemPath + "/OuterPackagingTypeId", sKey);


                for (var i = 1; i < aRowCells.length; i++) {
                    if (aRowCells[i] instanceof sap.m.Text) {
                        var cellContextPath = aRowCells[i].data("p");
                        var val = packingListObj[cellContextPath];
                        aRowCells[i].setText(val);
                    }
                }
            },

            onSavePackingListPress: function (oEvent) {
                debugger;
                this._getPackingListOuterPackagingData();
                var oBindingContextData = this.getView().getBindingContext().getObject();
                console.log(oBindingContextData);
                var oAdditionalData = this.getViewModel("AdditionalDetialsModel").getData();

                if (this.getView().getModel("outerPackagingModel"))
                    var aOuterPackaging = this.getViewModel("outerPackagingModel").getData();
                else
                    var aOuterPackaging = [];

                for (var i = 0; i < aOuterPackaging.length; i++) {
                    if (aOuterPackaging[i].OuterPackagingTypeId === "")
                        aOuterPackaging.splice(i);
                }

                var oPayload = {};
                oPayload.PackingListId = oBindingContextData.ID;
                oPayload.IsDraft = true;

                if (aOuterPackaging.length)
                    oPayload.IsProcessTwoCompletes = true;
                else
                    oPayload.IsProcessTwoCompletes = false;

                oPayload.IsOuterPackagingRequired = this.getViewModel("objectViewModel").getProperty("/isOuterPackagingRequired");
                oPayload.VehicleNumber = oBindingContextData.VehicleNumber;
                oPayload.PackagingReferenceNumber = oBindingContextData.PackagingReferenceNumber;
                oPayload.InvoiceNumber = oBindingContextData.InvoiceNumber;
                oPayload.InvoiceDate = oBindingContextData.InvoiceDate;
                var aOuterPackagingData = this.getViewModel("outerPackagingModel").getData();
                for (let i = 0; i < aOuterPackagingData.length; i++) {
                    if (!aOuterPackagingData[i].ID) {
                        aOuterPackagingData[i].InnerPackagings = [];
                    }
                }

                oPayload.OuterPackagings = aOuterPackagingData;


                this.mainModel.create("/OuterPackagingRequestEdmSet", oPayload, {
                    success: function (oData, oResponse) {
                        this.getView().getModel();
                        this._getPackingListOuterPackagingData();
                        var objectViewModel = this.getViewModel("objectViewModel");
                        objectViewModel.setProperty("/isPackingListInEditMode", false);
                        objectViewModel.setProperty("/isViewQRMode", true);
                    }.bind(this),
                    error: function (oError) {
                        var objectViewModel = this.getViewModel("objectViewModel");
                        objectViewModel.setProperty("/isPackingListInEditMode", false);
                        objectViewModel.setProperty("/isViewQRMode", false);
                    }.bind(this)
                })
            },

            onSaveInnerPackagingListPress: function (oEvent) {
                var aTotalInnerPackagingData = this.getViewModel("valueHelpModel").getData();
                var aSelectedInnerPackagingData = aTotalInnerPackagingData.filter(item => item.selected === true);
                var payload = {};
                payload.PackingListId = this.getView().getBindingContext().getObject().ID;
                payload.IsDraft = true;
                payload.IsProcessTwoCompletes = true;
                payload.IsOuterPackagingRequired = this.getViewModel("objectViewModel").getProperty("/isOuterPackagingRequired");
                payload.OuterPackagings = [];
                var oOuterPackagingObject = {};
                if (this.selectedOuterPackagingObject.ID)
                    oOuterPackagingObject.ID = this.selectedOuterPackagingObject.ID;
                oOuterPackagingObject.OuterPackagingTypeId = this.selectedOuterPackagingObject.OuterPackagingTypeId;
                oOuterPackagingObject.Remarks = "";
                oOuterPackagingObject.PackagingType = this.selectedOuterPackagingObject.PackagingType;
                oOuterPackagingObject.InnerPackagings = aSelectedInnerPackagingData;
                payload.OuterPackagings.push(oOuterPackagingObject)

                this.mainModel.create("/OuterPackagingRequestEdmSet", payload, {
                    success: function (oData, oResponse) {
                        this.getView().getModel();
                        sap.m.MessageBox.success("Outer Packaging managed succesfully!");
                        this._getPackingListOuterPackagingData();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.oError);

                    }
                });
            },

            onInvoiceFileSelectedForUpload: function (oEvent) {
                // keep a reference of the uploaded file
                var that = this;
                var oFiles = oEvent.getParameters().files;

                var SubType = "INVOICE";
                var Type = "PACKING_LIST";
                for (var i = 0; i < oFiles.length; i++) {
                    var fileName = oFiles[i].name;
                    var fileSize = oFiles[i].size;
                    this._getImageData(URL.createObjectURL(oFiles[0]), function (base64) {
                        that._addData(base64, fileName, SubType, Type, fileSize);
                    }, fileName);
                }
            },

            onMaterialFileSelectedForUpload: function (oEvent) {
                // keep a reference of the uploaded file
                var that = this;
                var oFiles = oEvent.getParameters().files;
                var SubType = "MATERIAL";
                var Type = "PACKING_LIST";
                for (var i = 0; i < oFiles.length; i++) {
                    var fileName = oFiles[i].name;
                    var fileSize = oFiles[i].size;
                    this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                        that._addData(base64, fileName, SubType, Type, fileSize);
                    }, fileName);
                }
            },

            onOtherFileSelectedForUpload: function (oEvent) {
                // keep a reference of the uploaded file
                var that = this
                var oFiles = oEvent.getParameters().files;
                var SubType = "OTHERS";
                var Type = "PACKING_LIST";
                for (var i = 0; i < oFiles.length; i++) {
                    var fileName = oFiles[i].name;
                    var fileSize = oFiles[i].size;
                    this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                        that._addData(base64, fileName, SubType, Type, fileSize);
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

            _addData: function (data, fileName, SubType, Type, fileSize) {
                var that = this,
                    oViewContext = this.getView().getBindingContext().getObject();

                var documents = {
                    "Documents": [
                        {
                            "UploadTypeId": oViewContext.ID,
                            "Type": Type,
                            "SubType": SubType,
                            "FileName": fileName,
                            "Content": data.split(",")[1],
                            "ContentType": "application/pdf",
                            "UploadedBy": "vendor-1",
                            "FileSize": fileSize
                        }
                    ]
                };

                this.mainModel.create("/DocumentUploadEdmSet", documents, {
                    success: function (oData, oResponse) {
                        console.log("docuymnet UPloaded");
                        this.byId("idMaterialFileUploader").getBinding("items").refresh();
                        this.byId("idInvoiceFileUploader").getBinding("items").refresh();
                        this.byId("idOtherFileUploader").getBinding("items").refresh();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });


            },

            onDeleteDocumentPress: function (oEvent) {
                var oInput = oEvent.getSource();
                var documentID = oEvent.getSource().getBindingContext().getObject().ID;
                this.mainModel.remove("/AttachmentSet(" + documentID + ")", {
                    success: function (oData, oResponse) {
                        sap.m.MessageBox.success("Document deleted successfully!");
                        // this.getView().getModel().refresh();
                        // oInput.getModel().refresh();
                        oInput.getParent().getBinding("items").refresh();
                        // this.onEditPackingListPress();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                })

            },

            onEditPackingListPress: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
                objectViewModel.setProperty("/isPackingListInEditMode", true);
                objectViewModel.setProperty("/isViewQRMode", false);
            },

            onOuterPackagingRequiredSelectionChange: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var iSelected = oEvent.getParameter("selectedIndex");
                if (iSelected === 1)
                    objectViewModel.setProperty("/isOuterPackagingRequired", false);
                else if (iSelected === 0)
                    objectViewModel.setProperty("/isOuterPackagingRequired", true);
            },

            onProceedStep2Press: function (oEvent) {
                this.oRouter.navTo("RoutePackingListDetails", {
                    packingListId: this.packingListId
                });
            },

            onViewQRCodePress: function (oEvent) {
                var that = this;
                var oPayload = {};
                var oAdditionalData = this.getView().getBindingContext().getObject();
                var poNum = oAdditionalData.PONumber;
                var userName = oAdditionalData.Name;
                var packingListId = oAdditionalData.ID;
                oPayload.UserName = "Venkatesh";
                oPayload.PackingListId = packingListId;
                oPayload.PONumber = poNum;

                if (!this._validateData(oAdditionalData)) {
                    return;
                }

                MessageBox.warning("Are you sure you want to view the QR Code? Once viewed, no changes can be made to the packing list.", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (oAction) {
                        if (oAction == "OK") {
                            that.mainModel.create("/QRCodeGenerationSet", oPayload, {
                                success: function (oData, oResponse) {
                                    that._makePackingListNonEditable();
                                    MessageToast.show("QR Code generated successfully");
                                    that.onProceedStep2Press(oEvent);
                                }.bind(that),
                                error: function (oError) {
                                    sap.m.MessageBox.error(JSON.stringify(oError));
                                }
                            });
                        }
                    }
                });
            },

            _makePackingListNonEditable: function () {
                var oPayload = { IsDraft: false };
                this.mainModel.update("/PackingListSet(" + this.packingListId + ")", oPayload, {
                    success: function (oData, oResponse) {
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            _validateData: function (data) {
                var bValid = true;

                /* if (!data.InvoiceNumber) {
                    this.byId("idVehicleNumber").setValueState("Error");
                    this.byId("idVehicleNumber").setValueStateText("Please enter the Invoice Number");
                    bValid = false;
                } else {
                    this.byId("idVehicleNumber").setValueState("None");
                    this.byId("idVehicleNumber").setValueStateText(null);
                }

                if (!data.PackagingReferenceNumber) {
                    this.byId("idPackagagingRefNumber").setValueState("Error");
                    this.byId("idPackagagingRefNumber").setValueStateText("Please enter the Packaging Reference Number");
                    bValid = false;
                } else {
                    this.byId("idPackagagingRefNumber").setValueState("None");
                    this.byId("idPackagagingRefNumber").setValueStateText(null);
                }

                if (!data.InvoiceDate) {
                    this.byId("idInvoiceDate").setValueState("Error");
                    this.byId("idInvoiceDate").setValueStateText("Please select the Invoice Date");
                    bValid = false;
                } else {
                    this.byId("idInvoiceDate").setValueState("None");
                    this.byId("idInvoiceDate").setValueStateText(null);
                } */

                if (!data.InvoiceNumber) {
                    bValid = false;
                    sap.m.MessageBox.alert("Please enter the Invoice Number before viewing the QR.");
                    return;
                }
                if (!data.PackagingReferenceNumber) {
                    bValid = false;
                    sap.m.MessageBox.alert("Please enter the Packaging Reference Number before viewing the QR.");
                    return;
                }
                if (!data.InvoiceDate) {
                    bValid = false;
                    sap.m.MessageBox.alert("Please select the Invoice Date before viewing the QR.");
                    return;
                }

                return bValid;
            }
        });
    });
