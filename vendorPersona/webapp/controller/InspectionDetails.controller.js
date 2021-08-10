sap.ui.define([
    "com/agel/mmts/vendorPersona/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../utils/formatter",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function (BaseController, JSONModel, Fragment, formatter, BusyIndicator, MessageToast, MessageBox) {
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
            that.sObjectId=sObjectId;
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

        onMDCCYesSelect: function () {
            this.byId("idMDCCUploadArea").setVisible(true);
        },

        ///--------------------- Send For Approval ----------------------------------//
        
        onSendForApprovalPress : function(oEvent){
            //debugger;
           // return;
            var that = this;
            var sPath = "/MDCCStatusSet"
            var obj = oEvent.getSource().getBindingContext().getObject();
            var oPayload = {
                     //     "Status" : obj.Status,
                            "Status" :"PENDING",
                    //      "ApprovedOn": obj.,
                    //      "ApprovedBy": obj.,
                            "CreatedAt": obj.CreatedAt,
                            "CreatedBy": obj.CreatedBy,
                    //        "UpdatedAt": obj.UpdatedAt,
                    //        "UpdatedBy": obj.UpdatedBy,
                    //    "Comment"  : obj.,
                            "IsArchived": false,
                            "MDCCID": obj.ID
                };
                that.MDCCNumber = obj.MDCCNumber;
                BusyIndicator.show();
                this.MainModel.create(sPath,oPayload,{
                    success:function(oData,oResponse){
                        BusyIndicator.hide();
                        if(oData.ID){
                            MessageBox.success("MDCC Number "+that.MDCCNumber+" Sent for approval successfully");
                            this.getView().getContent()[0].getContent().rerender();
                            this.getView().getModel().refresh();
                        }
                    }.bind(this),
                    error:function (oError){
                        BusyIndicator.hide();
                        MessageBox.error(JSON.stringify(oError));
                    }
                });
        },


        onViewPress: function (oEvent) {
            //  var oItem = oEvent.getSource();
            var that = this;
            var sObjectId=oEvent.getSource().getBindingContext().getObject().ID;
            var mdccNobb =  oEvent.getSource().getBindingContext().getObject().MDCCNumber;
            this._getParentDataViewMDCC(sObjectId,mdccNobb);
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
                oDialog.setTitle("MDCC "+mdccNobb+" Mapped Items")
                oDialog.open();
            });            
        },

        // Child Dialog Close
        onViewChildDialogClose: function(oEvent) {
			this.pDialog.then(function(oDialog) {
				oDialog.close();
			});
		},

		onMDCCNOSelect: function() {
			this.byId("idMDCCUploadArea").setVisible(false);
		},
		onBeforeUploadStarts: function() {
			//    var objectViewModel = this.getViewModel("objectViewModel");
			//   objectViewModel.setProperty("/busy", true);
			//    BusyIndicator.show();
			// this.busyIndicator = new sap.m.BusyIndicator();
			//  this.busyIndicator.open();
		},
		onUploadTerminated: function(oEvent) {
			/* this.busyIndicator.close();
			  var objectViewModel = this.getViewModel("objectViewModel");
			 objectViewModel.setProperty("/busy", false);*/
		},
		
		// Arrange Data For View / Model Set
		
		
		// Parent Data View Fetch / Model Set
		_getParentDataViewMDCC: function(sObjectId,mdccNobb) {
			this.ParentDataView = [];
			var sPath = "/MDCCSet(" + sObjectId + ")/MDCCParentLineItems";
			this.MainModel.read(sPath, {
				success: function(oData, oResponse) {
					if(oData.results.length) {
						this._getChildItemsViewMDCC(oData.results, sObjectId , mdccNobb);
					}
				}.bind(this),
				error: function(oError) {
					sap.m.MessageBox.Error(JSON.stringify(oError));
				}
			});
        },
        
		// Child Item View Fetch / Model Set
		_getChildItemsViewMDCC: function(ParentDataView, sObjectId , mdccNobb) {
			this.ParentDataView = ParentDataView;
			for(var i = 0; i < ParentDataView.length; i++) {
				var sPath = "/MDCCSet(" + sObjectId + ")/MDCCParentLineItems(" + ParentDataView[i].ID + ")/MDCCBOQItems";
				this.MainModel.read(sPath, {
					success: function(i, oData, oResponse) {
						if(oData.results.length) {
							this.ParentDataView[i].isStandAlone = true;
							this.ParentDataView[i].ChildItemsView = oData.results;
						} else {
							this.ParentDataView[i].isStandAlone = false;
							this.ParentDataView[i].ChildItemsView = [];
						}
						if(i == this.ParentDataView.length - 1) this._arrangeDataView(mdccNobb);
					}.bind(this, i),
					error: function(oError) {
						sap.m.MessageBox.Error(JSON.stringify(oError));
					}
				});
			}
        },
        
		//-------------------- File Upload MDCC ----------------------//
		onMDCCFileUpload: function(oEvent) {
			// keep a reference of the uploaded file
			var that = this;
			BusyIndicator.show();
			var oFiles = oEvent.getParameters().files;
			var fileName = oFiles[0].name;
			var fileType = "application/pdf";
			this._getImageData(URL.createObjectURL(oFiles[0]), function(base64) {
				that._addData(base64, fileName, fileType);
			}, fileName);
		},

         //-------------------- Read MDCC ----------------------//

    /*    onReadMDCCItems : function(sObjectId){
            var that = this;
            var sPath = "/InspectionCallIdSet" + sObjectId + "/MDCC";
            this.MainModel.read(sPath, {
                success: function (oData, oResponse) {
                    var oManageMDCCModel = new JSONModel({"MDCCItems" :oData.results })
                    that.getView().setModel(oManageMDCCModel, "ManageMDCCModel");                  
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.Error(JSON.stringify(oError));
                }
            });
        },       */   

        // Add MDCC Item 
        onAddMdccItem : function (oEvent) {
            var that = this;
            var object = this.getView().getBindingContext().getObject();

            var oPayload = {
                          //  "MDCCNumber": "", // as shubham informed
                            "NotificationNumber": "",
                            "Version": "",
                            "PONumber": object.PONumber,
                            "Status": null,
                            "InspectionCall": { 
                                    "__metadata":{
                                        "uri":"InspectionCallIdSet("+object.ID+")"
                                    }
                            }
            };

            var sPath = "/MDCCSet";
            BusyIndicator.show();
            this.MainModel.create(sPath,oPayload ,{
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
                that._addData(base64, fileName, fileType , fileSize, rowId,rowObj);
            }, fileName);
        },

        _addData: function (data, fileName, fileType,fileSize, rowId , rowObj) {
            var that = this;
            var documents = {
                "Documents": [
                    {
                        "UploadTypeId": rowObj.ID, // MDCC Id
                        "Type": "MDCC",
                        "SubType":"",
                        "FileName": fileName,
                        "Content": data, // base - 64 (Type)
                        "ContentType":fileType, // application/pdf text/csv
                        "UploadedBy": rowObj.UpdatedBy ? rowObj.UpdatedBy:"vendor1" ,
                        "FileSize": fileSize
                    }
                ]
            };
            that.documents = documents;
            var sPath = "/DocumentUploadEdmSet"
            this.MainModel.create(sPath,documents,{
                success: function(oData,oResponse) {
                    BusyIndicator.hide();
                    sap.m.MessageToast.show("MDCC Details Uploaded!");
                    this.getView().getModel().refresh();
                 //   this.getView().getModel("ManageMDCCModel").getData().MDCCItems[rowId].MapItems = true;
                 //   this.getView().getModel("ManageMDCCModel").refresh();
                }.bind(this),
                error:function(oError) {
                    BusyIndicator.hide();
                    sap.m.MessageBox.error("Error uploading document");
                }
            });
        },

        onFileUrlClick : function(oEvent){

            var FileContent = oEvent.getSource().getBindingContext().getObject().FileContent;
            var FileName = oEvent.getSource().getBindingContext().getObject().FileName;
            var url = formatter.fileContent(FileName,FileContent);
            window.open(url,"_blank");        
        },

        // Navigating to Map MDCC Application
        onMapMDCCCItems :   function(oEvent){
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
        onManagePress : function(oEvent){
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
        onShowFileNameDialog : function (oEvent) {
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
                oDialog.setTitle("MDCC - "+mdccNobb+" ");
                oDialog.open();
            });
        },

        // Child Dialog Close
        onViewFileDialogClose: function(oEvent) {
			this.pDialogFileName.then(function(oDialog) {
				oDialog.close();
			});
        },
        
        onRowsUpdated : function(oEvent) {
          //  debugger;
          //  var oTable = this.getView().byId("TreeTableBasicView");
        },

        onExit : function(){
            
        }

    });
}
);
