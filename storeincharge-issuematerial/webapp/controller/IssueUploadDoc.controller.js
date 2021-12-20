sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    // "sap/ui/model/Filter",
    // "sap/ui/model/FilterOperator",
    // "sap/ui/core/Fragment",
    // "sap/ui/model/Sorter",
    // "sap/ui/Device",
    // "sap/ui/core/routing/History",
    // 'sap/m/ColumnListItem',
    // 'sap/m/Input',
    // 'sap/base/util/deepExtend',
    // 'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    // "sap/m/ObjectIdentifier",
    // "sap/m/Text",
    // "sap/m/Button",
    // "sap/m/Dialog",
    '../utils/formatter',
], function (BaseController, JSONModel, MessageToast, MessageBox, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.storeinchargeissuematerial.controller.IssueUploadDoc", {
        formatter: formatter,
        onInit: function () {
            //get UserInfo
            try {
                this.UserEmail = sap.ushell.Container.getService("UserInfo").getEmail();
                this.UserFName = sap.ushell.Container.getService("UserInfo").getFullName()();
            }
            catch (e) {
                this.UserEmail = 'test.user@extentia.com';
                this.UserFName = 'Test User'
            }

            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null,
                csvFile: "file",
                doneButton: false,
                reserveButton: true
            });
            this.setModel(oViewModel, "objectViewModel");

            //    this._initializeCreationModels();
            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RaiseIssueUploadDoc").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            // debugger;
            this.sObjectId = oEvent.getParameter("arguments").ID;
            // this._bindView("/IssueMaterialItemsEdmSet(" + this.sObjectId +")/IssueMaterialParentItems");
            this._bindView("/IssuedMaterialSet(" + this.sObjectId + ")");
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
                        that._setTreeTableData(that);
                    }
                }
            });
        },

        _setTreeTableData: function (oController) {

            var objectViewModel = oController.getViewModel("objectViewModel");
            objectViewModel.setProperty("/busy", true);
            oController.MainModel.read("/IssuedMaterialSet(" + oController.sObjectId + ")/IssuedMaterialParents", {
                urlParameters: { "$expand": "IssuedMaterialBOQ" },
                success: function (oData) {
                    objectViewModel.setProperty("/busy", false);
                    if (oData) {
                        oData.results.forEach(element => {
                            element.BoqItems = element.IssuedMaterialBOQ.results;
                        });
                        objectViewModel.setProperty("/TreeTableData", oData.results);
                    }
                }.bind(oController),
                error: function (oErr) {
                    objectViewModel.setProperty("/busy", false);

                }.bind(oController),
            })
        },

        handleToIssueMatBreadcrumPress: function () {
            this.getRouter().navTo("RaiseIssueScanQRCode");
        },

        onFileDeleted: function (oEvent) {
            this.deleteItemById(oEvent.getParameter("documentId"));
            //	MessageToast.show("FileDeleted event triggered.");
        },

        onAttachmentChange: function (oEvent) {
            // keep a reference of the uploaded file
            var that = this;
            var rowObj = oEvent.getSource().getBindingContext().getObject();
            var oFiles = oEvent.getParameters().files;
            this.oFiles = oFiles;


            var fileType = oFiles[0].type;

            fileType = fileType === "application/pdf" ? "application/pdf" : "application/octet-stream";
            var SubType = "inpsection_doc";
            var Type = "INSPECTION";
            for (var i = 0; i < oFiles.length; i++) {
                var fileName = oFiles[i].name;
                var fileSize = oFiles[i].size;
                this._getImageData(URL.createObjectURL(oFiles[i]), function (base64) {
                    that._addData(base64, fileName, SubType, Type, fileSize, fileType, rowObj);
                }, fileName);
            }
        },

        _createAttachmentModel: function () {
            var model = new JSONModel({
                items: [],
                Comment: null,
                InspectionDate: null
            });
            this.getView().setModel(model, "localAttachmentModel");
        },

        // _addData: function (Content, fileName, SubType, Type, fileSize) {
        //     var that = this,
        //         oViewContext = this.getView().getBindingContext().getObject();

        //     var document = {
        //         "UploadTypeId": 7,
        //         "Type": "ISSUE_MATERIAL",
        //         "SubType": "Material_Details",
        //         "FileName": fileName,
        //         "Content": "base-64",
        //         "ContentType": "application/pdf",
        //         "UploadedBy": "vendor-1",
        //         "FileSize": fileSize
        //     };

        //     this.getView().getModel("localAttachmentModel").getData().items.push(document);
        // },


        _addData: function (base64, fileName, SubType, Type, fileSize, fileType, rowObj) {
            var that = this;
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );


            var documents = {
                "Documents": [
                    {
                        "Type": "ISSUE_MATERIAL",
                        "ContentType": fileType,
                        "FileName": fileName,
                        "UploadedBy": "vendor-1",
                        "FileSize": fileSize,
                        "SubType": "",
                        "UploadTypeId": rowObj.ID,
                        "PONumber": null,
                        "CompanyCode": null
                    }
                ]
            };
            that.documents = documents;
            var sPath = "/DocumentUploadEdmSet"
            this.MainModel.create(sPath, documents, {
                success: function (oData, oResponse) {
                    this.getView().getModel().refresh();
                    this._updateDocumentService(oData.ID, fileType);
                    //   this.getView().getModel("ManageMDCCModel").getData().MDCCItems[rowId].MapItems = true;
                    //   this.getView().getModel("ManageMDCCModel").refresh();
                }.bind(this),
                error: function () {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );

                    sap.m.MessageBox.error("Error uploading document");
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
                    that.getComponentModel().refresh();
                    sap.m.MessageToast.show("MDCC Details Uploaded!");
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

        onPressConfirm: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            // debugger;
            var that = this;
            var MaterialID = this.sObjectId;
            var weight = this.getView().byId("idTotalGrossWeight").getValue();
            var oPayload = {
                "TotalGrossWeight": weight,
                "IssuedMaterialId": MaterialID,
                "UserName": this.UserFName
            };

            this.getOwnerComponent().getModel().create("/IssueMaterialConfirmationEdmSet", oPayload, {
                success: function (oData, oResponse) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    MessageBox.success("The Requested Material is Issued", {
                        onClose : function(sButton) {
                            this.getOwnerComponent().getModel().refresh();
                            this.getRouter().navTo("RouteLandingPage");
                        }.bind(this)
                    });
                }.bind(this),
                error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty("/busy",false);
                }.bind(this),
            });
        },


    });
});