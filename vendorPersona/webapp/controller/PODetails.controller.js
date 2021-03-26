sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/base/util/deepExtend',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast'
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.PODetails", {
        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            this._initializeCreationModels();

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RoutePODetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").POId;
            this._bindView("/PurchaseOrders" + sObjectId);
            this.getView().byId("idChildItemsTableSubsection").setVisible(false);
        },

        _initializeCreationModels: function () {
            var oModel = new JSONModel({
                "parent_line_item_id": null,
                "description": null,
                "po_number": null,
                "material_code": null,
                "qty": null,
                "purchase_order_ID": null
            });
            this.getView().setModel(oModel, "parentItemCreationModel")
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                parameters: {
                    "$expand": {
                        "parent_line_items": {
                            "$expand": {
                                "child_line_items": {}
                            }
                        }
                    }
                },
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                        var oView = that.getView();
                    }
                }
            });
        },

        //when the breadcrum pressed
        handleToAllVendorsBreadcrumPress: function (oEvent) {
            this.getRouter().navTo("RouteLandingPage");
        },

        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },

        onParentItemsTableUpdateFinished: function (oEvent) {
            oEvent.getSource().removeSelections();
        },

        onParentItemSelect: function (oEvent) {
            var oContext = oEvent.getParameters().listItem.getBindingContext();
            var sPath = "parent_line_items(" + oContext.getObject().ID + ")";
            console.log({ sPath });
            var newPath = oEvent.getParameters().listItem.getBindingContextPath();
            console.log({ newPath });
            /* this.byId("idChildItemsTable").bindElement({
                path: sPath
            }); */
            /* this.byId("idChildItemsTable").bindItems({
                path: sPath,
                template: this.byId("idTemplate")
            }); */

            var childTable = this.byId("idChildItemsTable"),
                binding = childTable.getBinding("items"),
                oFilter = new Filter("parent_line_item_ID", "EQ", oContext.getObject().ID);
            binding.filter(oFilter);

            this.getView().byId("idChildItemsTableSubsection").setVisible(true);
        },

        onChildTableUpdateStarted: function (oEvent) {
            oEvent.getSource().setBusy(true);
        },

        onChildItemsTableUpdateFinished: function (oEvent) {
            oEvent.getSource().setBusy(false);
        },

        onParentItemCreatePress: function (oEvent) {
            if (!this._oCreateParentItemDialog) {
                this._oCreateDialog = sap.ui.xmlfragment("com.agel.mmts.vendorPersona.view.fragments.PODetails.CreateParentItem", this);
                this.getView().addDependent(this._oCreateDialog);
            }
            this._oCreateDialog.open();
        },

        closeDialog: function (oEvent) {
            this._oCreateDialog.close();
        },

        onSaveParentLineItemPress: function (oEvent) {
            var oTable = this.getView().byId("idParentLineItemsTable"),
                oBinding = oTable.getBinding("items"),
                aInputData = this.getViewModel("parentItemCreationModel").getData(),
                oViewContext = this.getView().getBindingContext().getObject(),

                // Create a new entry through the table's list binding
                oContext = oBinding.create({
                    "parent_line_item_id": (Math.floor(Math.random() * (999999999999 - 900000000000 + 1)) + 900000000000).toString(),
                    "description": aInputData.description,
                    "po_number": oViewContext.po_number,
                    "material_code": aInputData.material_code,
                    "qty": parseInt(aInputData.qty),
                    "purchase_order_ID": oViewContext.ID
                });

            console.log(oContext);


            oContext.created().then(function () {
                //var oEntry = this.getObject();
                //sap.m.MessageBox.success("New entry created with name " + oEntry.name + " and email " + oEntry.email);
            }.bind(oContext), function (error) {
                //sap.m.MessageBox.success("Error Creating Entries!!");
            }.bind(oContext));
            this.closeDialog();
        },

        onExportParentItemsExportPress: function (oEvent) {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            oTable = this.byId("idParentLineItemsTable");
            oRowBinding = oTable.getBinding('items');

            aCols = [{
                property: 'ID',
                label: 'ID',
                width: '30%'
            },
            {
                property: 'material_code',
                label: 'Material Code'
            },
            {
                property: 'description',
                label: 'Description'
            },
            {
                property: 'qty',
                label: 'Quantity'
            }];

            var oModel = oRowBinding.getModel();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: {
                    type: 'odata',
                    dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
                    serviceUrl: oModel.sServiceUrl,
                    headers: oModel.getHeaders ? oModel.getHeaders() : null,
                    count: oRowBinding.getLength ? oRowBinding.getLength() : null,
                    useBatch: true // Default for ODataModel V2
                },
                fileName: 'ParentItems.csv',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageToast.show('Parent Items ready to Download!')
                })
                .finally(function () {
                    oSheet.destroy();
                });
        },

        fileUploaonBOQFileSelectedForUploadderChange: function (oEvent) {
            // keep a reference of the uploaded file
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
                oBindingObject = this.byId("idBOQUploader").getObjectBinding("DocumentUploadModel");
            
            data= data.substr(21, data.length);   

            //set the parameters
            oBindingObject.getParameterContext().setProperty("file", data);
            oBindingObject.getParameterContext().setProperty("po_number", oViewContext.po_number);
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

        onConfirmPO: function (oEvent) {
            //initialize the action
            var that = this,
                oViewContext = this.getView().getBindingContext().getObject(),
                oBindingObject = oEvent.getSource().getObjectBinding();

            //set the parameters
            oBindingObject.getParameterContext().setProperty("status", "CONFIRMED");
            oBindingObject.getParameterContext().setProperty("po_uuid", oViewContext.ID);

            //execute the action
            oBindingObject.execute().then(
                function () {
                    MessageToast.show("PO confirmed!");
                    that.getView().getModel().refresh();
                },
                function (oError) {
                    sap.m.MessageBox.alert(oError.message, {
                        title: "Error"
                    });
                }
            );
        }

    });
});