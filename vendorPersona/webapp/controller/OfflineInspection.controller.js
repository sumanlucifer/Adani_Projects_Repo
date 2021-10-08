sap.ui.define([
    "./BaseController",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/m/MessageBox",
    'sap/ui/core/ValueState',
    '../utils/formatter',
], function (BaseController, jQuery, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, MessageBox, ValueState, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.OfflineInspection", {
        formatter: formatter,

        onInit: function () {
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteCreateOfflineInspection").attachPatternMatched(this._onObjectMatched, this);

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
                success: function (oData, oResponse) {
                    var data = oData.results;
                    this._prepareDataForView(data);
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            })
        },

        _createAttachmentModel: function () {
            var model = new JSONModel({
                items: [],
                Comment: null,
                InspectionDate: null
            });
            this.getView().setModel(model, "localAttachmentModel");
        },

        _prepareDataForView: function (data) {
            if (data.length) {
                data.forEach(element => {
                    element.InspectionQty = null;
                    element.ParentLineItemId = element.ID;
                    element.InspectedBOQItemRequests = [];
                });
            }
            var oModel = new JSONModel(data);
            this.getView().byId("idParentItemTable").setModel(oModel, "ParentItemModel");
        },

        onSelectionChange: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var bSelectAll = oEvent.getParameter("selectAll");
            var aListItems = oEvent.getParameter("listItems");

            if (bSelectAll) {
                for (var i = 0; i < aListItems.length; i++) {
                    aListItems[i].getCells()[4].setEnabled(true);
                }
            } else {
                for (var i = 0; i < aListItems.length; i++) {
                    aListItems[i].getCells()[4].setEnabled(false);
                }
            }

            if (bSelected) {
                oEvent.getParameter("listItem").getCells()[4].setEnabled(true);
            } else {
                oEvent.getParameter("listItem").getCells()[4].setEnabled(false);
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
            var InspectQuantity = parseInt(oEvent.getSource().getValue());
            var Quantity = parseInt(oEvent.getSource().getParent().getCells()[3].getText());
            if (InspectQuantity <= 0) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter positive value");
                return 0;
            }
            if (InspectQuantity > Quantity) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Please enter inspected quantity lesser than or equal to total quantity");
            }
            else {
                oEvent.getSource().setValueState("None");
            }
        },

        onSaveValidation: function () {
            var flag = 0;
            var aTableData = this.byId("idParentItemTable").getModel("ParentItemModel").getData();
            var aSelectedItemsFromTable = aTableData.filter(item => item.InspectionQty !== null);
            var creationModelData = this.getViewModel("localAttachmentModel").getData();

            if (aSelectedItemsFromTable.length < 1) {
                sap.m.MessageBox.error("Please select at least one line item detail and fill the inspection quantity");
                return 1;
            }

            var aInvalidInspectionQtyItems = aTableData.filter(item => (item.InspectionQty && item.InspectionQty <= 0));
            if (aInvalidInspectionQtyItems.length > 0) {
                sap.m.MessageBox.error("Please Enter valid inspection quantity");
                return 1;
            }

            if (creationModelData.Comment && creationModelData.Comment.trim() === "") {
                flag = 1;
                this.getView().byId("idTxtComment").setValueState("Error");
            }

            if (creationModelData.InspectionDate == null || creationModelData.InspectionDate == "") {
                flag = 1;
                this.getView().byId("idDpInspectionDate").setValueState("Error");
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
            var aTableData = this.byId("idParentItemTable").getModel("ParentItemModel").getData();
            var aSelectedItemsFromTable = aTableData.filter(item => item.InspectionQty !== null);
            var oBindingContextData = this.getView().getBindingContext().getObject();
            var creationModelData = this.getViewModel("localAttachmentModel").getData();
            var oPayload = {
                "PONumber": oBindingContextData.PONumber,
                "InspectionDate": creationModelData.InspectionDate,
                "PurchaseOrderId": oBindingContextData.ID,
                "Comment": creationModelData.Comment,
                "InspectedParentLineItemRequests": aSelectedItemsFromTable,
                "Documents": creationModelData.items
            };

            this.getComponentModel().create("/InspectionCallIdRequestSet", oPayload, {
                success: function (oData, oResponse) {
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
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
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
            var that = this
            var oFiles = oEvent.getParameters().files;
            var SubType = "inpsection_doc";
            var Type = "INSPECTION";
            for (var i = 0; i < oFiles.length; i++) {
                var fileName = oFiles[i].name;
                var fileSize = oFiles[i].size;
                this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                    that._addData(base64, fileName, SubType, Type, fileSize);
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
                reader.onloadend = function () {
                    var str = reader.result;
                    var bytes = [];
                    for (var i = 0; i < str.length; ++i) {
                        bytes.push(str.charCodeAt(i));
                    }
                    // var byteStr = bytes.join(",");
                    callback(bytes);
                };
                reader.readAsText(xhr.response);
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        },

        _addData: function (data, fileName, SubType, Type, fileSize) {
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject();

            // var document = {
            //     "Type": "INSPECTION",
            //     "SubType": "inpsection_doc",
            //     "FileName": fileName,
            //     "Content": data.split(",")[1],
            //     "ContentType": "application/pdf",
            //     "UploadedBy": "vendor-1",
            //     "FileSize": fileSize
            // };

            var document =
            {
                "Type": "INSPECTION",
                "ContentType": "application/pdf",
                "FileName": fileName,
                "Content": data,
                "UploadedBy": "vendor-1",
                "FileSize": fileSize,
                "SubType": "inpsection_doc",
                "UploadTypeId": "1",
                "PONumber": null,
                "CompanyCode": "123"
            };

            this.getView().getModel("localAttachmentModel").getData().items.push(document);
        },

        // onFileSizeExceed: function () {
        //     MessageBox.error("File size exceeded, Please upload file upto 1MB.");
        // },

        onFileNameLengthExceed: function () {
            MessageBox.error("File name length exceeded, Please upload file with name lenght upto 50 characters.");
        }

    });
});
