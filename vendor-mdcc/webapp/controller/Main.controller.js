sap.ui.define([
    "./BaseController",
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
    "sap/ui/model/json/JSONModel",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} 
	 */
	function (BaseController, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox,JSONModel) {
		"use strict";

		return BaseController.extend("com.agel.mmts.vendormdcc.controller.Main", {
			onInit: function () {

                this.MainModel = this.getOwnerComponent().getModel();
                 //Router Object
                 this.oRouter = this.getOwnerComponent().getRouter();
                 this.oRouter.getRoute("RouteMain").attachPatternMatched(this._onObjectMatched, this);

                 this.getView().setModel(this.getOwnerComponent().getModel("i18n").getResourceBundle());
            },
            
            _onObjectMatched: function (oEvent) {
                this.sObjectId = oEvent.getParameter("arguments").POId;
                this.sObjectId = 3;
                this._getParentData();
             //   this._bindView("/PurchaseOrderSet" + sObjectId);
            },

            _getParentData : function(){
                var sPath = "/MDCCSet("+this.sObjectId+")/InspectionCall/InspectedParentItems";
                this.MainModel.read(sPath,{
                    success:function(oData,oResponse){
                        if(oData.results.length){
                            this._getChildItems(oData.results);
                        }
                    }.bind(this),
                    error:function(oError){
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            },

            _getChildItems : function(ParentData){
                this.ParentData = ParentData;
                for( var i=0; i < ParentData.length; i++){
                
                    var sPath = "/MDCCSet("+this.sObjectId+")/InspectionCall/InspectedParentItems("+ ParentData[i].ID +")/InspectedBOQItems";
                    this.MainModel.read(sPath,{
                        success:function(i,oData,oResponse){
                                                        
                            if(oData.results.length){
                                this.ParentData[i].isStandAlone=true;
                                this.ParentData[i].ChildItems=oData.results;
                            }
                            else{
                                this.ParentData[i].isStandAlone=false;
                                this.ParentData[i].ChildItems=[];
                            }
                            if(i==this.ParentData.length-1)
                                this._arrangeData();
                        }.bind(this,i),
                        error:function(oError){
                            sap.m.MessageBox.Error(JSON.stringify(oError));
                        }
                    });
                }
            },

            onEditQuantity: function(oEvent){

            },

            onSave: function(oEvent){
                debugger;
                var oPayload = {
                    "MDCCId":4,
                    "MDCCName":"test",
                    "CreatedAt": "/Date(1622432008547)/",
                    "CreatedBy": "John",
                    "UpdatedAt": "/Date(1622432008547)/",
                    "UpdatedBy": "John",
                };
                oPayload.MDCCParentLineItem =[];
                var data = this.getView().getModel("TreeTableModel").getData().ChildItems;
                for ( var i=0 ; i< data.length ; i++){
                    var obj = {};
                    obj.InspectedParentLineItemID=data[i].ID;
                    obj.MDCCApprovedQty=data[i].MDCCApprovedQty1;
                    obj.MDCCBOQItem = [];
                    
                    for( var j = 0 ; j<data[i].ChildItems.length ; j++){
                        var childObj = {};
                        childObj.InspectedBOQItemID=data[i].ChildItems[j].ID;
                        childObj.MDCCApprovedQty=data[i].ChildItems[j].MDCCApprovedQty1;
                        if(childObj.MDCCApprovedQty)
                            obj.MDCCBOQItem.push(childObj);
                    }
                    if(obj.MDCCApprovedQty)
                        oPayload.MDCCParentLineItem.push(obj);
                }
               // debugger;
            },

            // Model Data Set To Table
            _arrangeData : function(){        
                var oModel = new JSONModel({"ChildItems":this.ParentData});
                this.getView().setModel(oModel,"TreeTableModel");
            },

            //---------------------- View Data Fragment operation -----------------------//
            // Fragment/Dialog Open

            onViewPress: function (oEvent) {
              //  var oItem = oEvent.getSource();
              var that = this;
              this._getParentDataViewMDCC();
              //that.sPath = oEvent.getSource().getParent().getBindingContextPath();
               // that.handleViewDialogOpen();
            },

            // Arrange Data For View / Model Set
            _arrangeDataView : function(){        
                var that = this;
                var oModel = new JSONModel({"ChildItemsView":this.ParentDataView});
                this.getView().setModel(oModel,"TreeTableModelView");
               // var sPath = oEvent.getSource().getParent().getBindingContextPath();
              // sPath=  ;
                that.handleViewDialogOpen();
                //debugger;
            },

             // Child Line Items Dialog Open
            handleViewDialogOpen: function () {
                // create dialog lazily
                //debugger;
                var that =this;
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
              //  oDetails.sParentItemPath = sParentItemPath;
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.vendormdcc.view.fragments.TreeTableView",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                       /* oDialog.bindElement({
                            path: oDetails.sParentItemPath,
                        });*/
                        oDialog.setModel(that.getView().getModel("TreeTableModelView"));
                        return oDialog;
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                  /*  oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                    });*/
                    oDialog.setModel(that.getView().getModel("TreeTableModelView"));
                    oDialog.open();
                });
            },

            onViewChildDialogClose: function (oEvent) {
                this.pDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            // Parent Data View Fetch / Model Set
            _getParentDataViewMDCC : function(){
                this.ParentDataView = [];
                var sPath = "/MDCCSet("+this.sObjectId+")/MDCCParentLineItems";
                this.MainModel.read(sPath,{
                    success:function(oData,oResponse){
                        if(oData.results.length){
                            this._getChildItemsViewMDCC(oData.results);
                        }
                    }.bind(this),
                    error:function(oError){
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            },

            // Child Item View Fetch / Model Set
            _getChildItemsViewMDCC : function(ParentDataView){
                this.ParentDataView = ParentDataView;
                for( var i=0; i < ParentDataView.length; i++){
                
                    var sPath = "/MDCCSet("+this.sObjectId+")/MDCCParentLineItems("+ ParentDataView[i].ID +")/MDCCBOQItems";
                    this.MainModel.read(sPath,{
                        success:function(i,oData,oResponse){
                                                        
                            if(oData.results.length){
                                this.ParentDataView[i].isStandAlone=true;
                                this.ParentDataView[i].ChildItemsView=oData.results;
                            }
                            else{
                                this.ParentDataView[i].isStandAlone=false;
                                this.ParentDataView[i].ChildItemsView=[];
                            }
                            if(i==this.ParentDataView.length-1)
                                this._arrangeDataView();
                        }.bind(this,i),
                        error:function(oError){
                            sap.m.MessageBox.Error(JSON.stringify(oError));
                        }
                    });
                }
            }           

		});
	});
