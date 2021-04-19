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
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/Button",
    '../utils/formatter',
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.PODetails", {
        formatter: formatter,
        onInit: function () {
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0,
                boqSelection: null,
                csvFile: "file"
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


            this.getViewModel("objectViewModel").setProperty("/boqSelection", this.byId("idManageBOQType").getSelectedKey());

            //   this.getView().byId("idChildItemsTableSubsection").setVisible(false);
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

            var oModel = new JSONModel({
                "parent_line_item_ID": null,
                "child_line_item_id": (Math.floor(Math.random() * (7777777777 - 7000000000 + 1)) + 7000000000).toString(),
                "description": null,
                "material_code": null,
                "qty": null,
                "comments": "Additional child items comments",
                "uom": null
            });
            this.getView().setModel(oModel, "childItemCreationModel")
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                parameters: {
                    "$expand": {
                        "parent_line_items": {
                            "$select": ["parent_line_item_id"],
                            "$expand": {
                                "child_line_items": {
                                    "$select": ["material_code", "description", "qty", "uom"]
                                }
                            }
                        },
                        "vendor": {
                            "$expand": {
                                "address": {}
                            }
                        },
                        "inspection_call_ids": {},
                        "sow_details": {},
                        "price_schedule_details": {},
                        "packing_list": {},
                        "boq_line_items": {}
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
            var that = this;
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
                var oEntry = this.getObject();
                sap.m.MessageBox.success("New entry created with name " + oEntry.name + " and quantity " + oEntry.qty);
            }.bind(oContext, that), function (error) {
                sap.m.MessageBox.success("Error Creating Entries!!");
            }.bind(oContext));
            this.closeDialog();

            // saving the entry
            var fnSuccess = function (response) {
                //sap.m.MessageToast.show("!!");
                //sap.m.MessageBox.success("Changes Saved Successfully!!");
            }.bind(this);

            var fnError = function (oError) {
                sap.m.MessageBox.alert(oError.toString());
            }.bind(this);


            this.getView().getModel().submitBatch("parentItemsGroup").then(fnSuccess, fnError);
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
            }
            ];

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

        onViewChildItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var that = this;
            this._requestCronicalPath(oItem, function (sCronicalPath) {
                that.handleChildItemsDialogOpen(sCronicalPath);
            });
        },

        _requestCronicalPath: function (oItem, callback) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                callback(sObjectPath);
            });
        },

        // Child Line Items Dialog Open
        handleChildItemsDialogOpen: function (sParentItemPath) {
            // create dialog lazily
            console.log({ sParentItemPath });
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.detailPage.ChildItemsDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "$expand": {
                                "child_line_items": {
                                    "$select": ["ID", "material_code", "qty", "uom"]
                                }
                            }
                        }
                    });
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sParentItemPath,
                    parameters: {
                        "$expand": {
                            "child_line_items": {
                                "$select": ["ID", "material_code", "description", "qty", "uom"]
                            }
                        }
                    }
                });
                oDialog.open();
            });
        },

        onClose: function (oEvent) {
            this.pDialog.close();
        },

        BOQFileSelectedForUpload: function (oEvent) {
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

            data = data.substr(21, data.length);


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
        },

        //triggers on press of a Inspection ID item from the list
        onInspectionIDPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        onPackingListPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showPackingDetails(oEvent.getSource());
        },

        // On Parent Table Edit Row Button 
        onViewPress: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var aCells = [
                new Input({
                    value: "{material_code}"
                }),
                new Input({
                    value: "{description}"
                }),
                new Input({
                    value: "{qty}"
                }),
                new Button({
                    text: "View Child Line Items",
                    type: "Emphasized"
                }).attachPress(this.onViewChildItemPress, this),
                new Button({
                    icon: "sap-icon://save",
                    type: "Transparent"
                }).attachPress(this.onSave, this),
                new Button({
                    icon: "sap-icon://delete",
                    type: "Transparent"
                }).attachPress(this.onDeletePress, this)
            ];
            this._modifyCells(oItem, aCells);
        },

        // On Parent Table Modify Row
        _modifyCells: function (tableRow, aCells) {
            for (let i = 0; i < aCells.length; i++) {
                tableRow.removeCell(0);
                tableRow.addCell(aCells[i]);
            }
        },

        // On Parent Table Row Save
        onShowCells: function (oItem) {
            var aCells = [
                new ObjectIdentifier({
                    title: "{material_code}",
                    titleActive: true
                }),
                new Text({
                    text: "{description}"
                }),
                new Text({
                    text: "{qty}"
                }),
                new Button({
                    text: "View Child Line Items",
                    type: "Emphasized"
                }).attachPress(this.onViewChildItemPress, this),
                new Button({
                    icon: "sap-icon://edit",
                    type: "Emphasized"
                }).attachPress(this.onViewPress, this),
                new Button({
                    icon: "sap-icon://delete",
                    type: "Transparent"
                }).attachPress(this.onDeletePress, this)
            ];
            this._modifyCells(oItem, aCells);
        },

        // On Parent Item Table Save Record
        onSave: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var fnSuccess = function () {
                this.onShowCells(oItem);
                sap.m.MessageBox.success("Changes Saved Successfully!!");
            }.bind(this);

            var fnError = function (oError) {
                sap.m.MessageBox.alert(oError.toString());
            }.bind(this);

            this.getView().getModel().submitBatch("parentItemsGroup").then(fnSuccess, fnError);
        },

        // On Delete Parent Item Table  
        onDeletePress: function (oEvent) {
            var oItemToDelete = oEvent.getSource();
            var that = this;
            MessageBox.warning("The parent item entry will be deleted. Press OK to continue", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (oItemToDelete, sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._deleteItem(oItemToDelete);
                    }
                }.bind(this, oItemToDelete)
            });
        },

        // Delete Item Message Toast
        _deleteItem: function (oItem) {
            oItem.getBindingContext().delete("$auto").then(function () {
                MessageToast.show("Parent Item Deleted");
            }.bind(this), function (oError) {
                MessageBox.error(oError.message);
            });
        },

        // On Child View Detail Pop Up Edit Item Press
        onViewChildViewPopUpPress: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var aCells = [
                new Input({
                    value: "{material_code}"
                }),
                new Input({
                    value: "{qty}"
                }),
                new Button({
                    icon: "sap-icon://save",
                    type: "Transparent"
                }).attachPress(this.onSaveChildViewPopUpPress, this),
                new Button({
                    icon: "sap-icon://delete",
                    type: "Transparent"
                }).attachPress(this.onDeleteChildViewPopPress, this)
            ];
            this._modifyCells(oItem, aCells);
        },

        // On Child View PopUp Table Modify Row
        _modifyCellsChildViewPopUp: function (tableRow, aCells) {
            for (let i = 0; i < aCells.length; i++) {
                tableRow.removeCell(0);
                tableRow.addCell(aCells[i]);
            }
        },

        onSaveChildViewPopUpPress: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var fnSuccess = function () {
                this.onShowCells(oItem);
                sap.m.MessageBox.success("Changes Saved Successfully!!");
            }.bind(this);

            var fnError = function (oError) {
                sap.m.MessageBox.alert(oError.toString());
            }.bind(this);

            this.getView().getModel().submitBatch("childLineItemOnPopUp").then(fnSuccess, fnError);
        },

        // On Delete Child View Pop Table Item   
        onDeleteChildViewPopPress: function (oEvent) {
            var oItemToDelete = oEvent.getSource();
            var that = this;
            MessageBox.warning("The parent item entry will be deleted. Press OK to continue", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (oItemToDelete, sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._deleteItemChildViewPop(oItemToDelete);
                    }
                }.bind(this, oItemToDelete)
            });
        },

        // On Delete Child View Pop Table Item  Message Toast
        _deleteItemChildViewPop: function (oItem) {
            oItem.getBindingContext().delete("$auto").then(function () {
                MessageToast.show("Parent Item Deleted");
            }.bind(this), function (oError) {
                MessageBox.error(oError.message);
            });
        },

        onCreateChildItemPress: function (oEvent) {
            if (!this._oCreateParentItemDialog) {
                this._oCreateDialog = sap.ui.xmlfragment("com.agel.mmts.vendorPersona.view.fragments.PODetails.CreateChildItem", this);
                this.getView().addDependent(this._oCreateDialog);
            }
            this._oCreateDialog.open();
        },

        onSaveChildLineItemPress: function (oEvent) {
            var that = this;

            var oTable = this.getView().byId("idChildItemsTable"),
                oBinding = oTable.getBinding("items"),
                aInputData = this.getViewModel("childItemCreationModel").getData(),
                aBindingContextPath = oTable.getBindingContext().getPath(),

                // Create a new entry through the table's list binding
                oContext = oBinding.create({
                    "parent_line_item_ID": aBindingContextPath.slice("/ParentLineItems(".length, aBindingContextPath.length - 1),
                    "child_line_item_id": aInputData.child_line_item_id,
                    "description": aInputData.description,
                    "material_code": aInputData.material_code,
                    "qty": parseInt(aInputData.qty),
                    "comments": aInputData.comments,
                    "uom": aInputData.uom
                });

            console.log(oContext);


            oContext.created().then(function () {
                sap.m.MessageBox.success("New entry created!");
            }.bind(oContext, that), function (error) {
                sap.m.MessageBox.success("Error Creating Entries!!");
            }.bind(oContext));
            this.closeDialog();
        },

        onChildItemsSavePress: function (oEvent) {
            // saving the entry
            var fnSuccess = function (response) {
            }.bind(this);

            var fnError = function (oError) {
                sap.m.MessageBox.alert(oError.toString());
            }.bind(this);

            this.getView().getModel().submitBatch("childLineItemGroup").then(fnSuccess, fnError);
        },

        // On Show Object - Navigation
        _showObject: function (oItem) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RouteInspectionDetailsPage", {
                    inspectionID: sObjectPath.slice("/InspectionCallIds".length) // /PurchaseOrders(123)->(123)
                });
            });
        },

        _showPackingDetails: function (oItem) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RoutePackingDeatilsPage", {
                    packingListID: sObjectPath.slice("/PackingLists".length) // /PurchaseOrders(123)->(123)
                });
            });
        },

        onMessagePopoverPress: function (oEvent) {
            var oSourceControl = oEvent.getSource();
            this._getMessagePopover().then(function (oMessagePopover) {
                oMessagePopover.openBy(oSourceControl);
            });
        },

        // On Message PopOver
        _getMessagePopover: function () {
            var oView = this.getView();
            // create popover lazily (singleton)
            if (!this._pMessagePopover) {
                this._pMessagePopover = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.MessagePopover"
                }).then(function (oMessagePopover) {
                    oView.addDependent(oMessagePopover);
                    return oMessagePopover;
                });
            }
            return this._pMessagePopover;
        },

        onBOQMangeTypeChange: function (oEvent) {
            this.getViewModel("objectViewModel").setProperty("/boqSelection", oEvent.getSource().getSelectedKey());
        },

        onDownloadSampleCSVPress: function (oEvent) {
            debugger;
            var aParentContexts = this.byId("idParentLineItemsTable").getBinding("items").getContexts(0);
            var aSampleData = [];
            for (var i = 0; i < aParentContexts.length; i++) {
                var oRowContext = aParentContexts[i];
                var oSampleEntry = {
                    "PARENT_ITEM_ID": oRowContext.getProperty("parent_line_item_id"),
                    "LINE_ITEM_ID": "120014",
                    "MATERIAL_CODE": "C-6758",
                    "NAME": "test name",
                    "DESCRIPTION": "Test Material",
                    "QUANTITY": 100,
                    "UOM": "each",
                    "COMMENTS": "Test Comments",
                }
                aSampleData.push(oSampleEntry);
            }

            var sampleBOQJSON = new JSONModel(aSampleData);


            var aItems = sampleBOQJSON.getProperty('/');;

            var JSONData = aItems,
                ShowLabel = true;

            var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
            var CSV = '';
            //This condition will generate the Label/Header
            if (ShowLabel) {
                var row = "";
                //This loop will extract the label from 1st index of on array
                for (var index in arrData[0]) {
                    //Now convert each value to string and comma-seprated
                    row += index + ',';
                }
                row = row.slice(0, -1);
                //append Label row with line break
                CSV += row + '\r\n';
            }
            //1st loop is to extract each row
            for (var i = 0; i < arrData.length; i++) {
                var row = "";
                //2nd loop will extract each column and convert it in string comma-seprated
                for (var index in arrData[i]) {
                    row += '"' + arrData[i][index] + '",';
                }
                row.slice(0, row.length - 1);
                //add a line break after each row
                CSV += row + '\r\n';
            }

            if (CSV == '') {
                alert("Invalid data");
                return;
            }
            //Generate a file name
            var fileName = "Sample BOQ";
            //Initialize file format you want csv or xls
            var uri = 'data:text/csv;charset=utf-8,' + escape(CSV); 

            //this trick will generate a temp <a /> tag
            var link = document.createElement("a");
            link.href = uri;

            //set the visibility hidden so it will not effect on your web-layout
            link.style = "visibility:hidden";
            link.download = fileName + ".csv";

            //this part will append the anchor tag and remove it after automatic click
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
});