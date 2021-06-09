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

		return BaseController.extend("com.agel.mmts.vendormdcc.controller.PackingListProceed", {
			onInit: function () {

                this.MainModel = this.getOwnerComponent().getModel();
                 //Router Object
                 this.oRouter = this.getOwnerComponent().getRouter();
                 this.oRouter.getRoute("RoutePackingListProceedPage").attachPatternMatched(this._onObjectMatched, this);

                 this.getView().setModel(this.getOwnerComponent().getModel("i18n").getResourceBundle());
            },
            
            _onObjectMatched: function (oEvent) {
                this.sObjectId = oEvent.getParameter("arguments").POId;
                this.sObjectId = 3;
                this._getMDCCData();
                this._getParentDataViewMDCC();
              //  this._getParentData();
               // this._bindView("/MDCCSet("+this.sObjectId+"");
            },

            // Get MDCC Set Level Data For Post Operation
             _getMDCCData : function(){
                 var that = this;
                var sPath = "/MDCCSet("+this.sObjectId+")";
                this.MainModel.read(sPath,{
                    success:function(oData,oResponse){
                        if(oData){
                            that.MDCCData=oData;
                        }else{
                            that.MDCCData=[];
                        }
                    }.bind(this),
                    error:function(oError){
                        sap.m.MessageBox.Error(JSON.stringify(oError));
                    }
                });
            },
        

            onEditQuantity: function(oEvent){

            },

            onSave: function(oEvent){
                debugger;
                var that =this
                var oPayload = {
                    "MDCCId":that.MDCCData.ID,
                    "MDCCName":"",
                    "CreatedAt": that.MDCCData.CreatedAt,
                    "CreatedBy": that.MDCCData.CreatedBy,
                    "UpdatedAt": that.MDCCData.UpdatedAt,
                    "UpdatedBy": that.MDCCData.UpdatedBy,
                };
                oPayload.MDCCParentLineItem =[];
                var data = this.getView().getModel("TreeTableModel").getData().ChildItems;
                for ( var i=0 ; i< data.length ; i++){
                    var obj = {};
                    obj.ParentLineItemID=data[i].ID;
                    obj.MDCCApprovedQty=data[i].MDCCApprovedQty1;
                    obj.MDCCBOQItem = [];
                    
                    for( var j = 0 ; j<data[i].ChildItems.length ; j++){
                        var childObj = {};
                        childObj.BOQItemID=data[i].ChildItems[j].ID;
                        childObj.MDCCApprovedQty=data[i].ChildItems[j].MDCCApprovedQty1;
                        if(childObj.MDCCApprovedQty)
                            obj.MDCCBOQItem.push(childObj);
                    }
                    if(obj.MDCCApprovedQty)
                        oPayload.MDCCParentLineItem.push(obj);
                }
               // Create Call 
                that.MainModel.create("/MDCCBOQRequestSet", oPayload, {
                    success: function (oData, oResponse) {
                      //  that.getComponentModel("app").setProperty("/busy", false);
                        debbuger;
                        MessageBox.success("MDCC items mapped successfully");
                      //  that.onCancel();
                    }.bind(this),
                    error: function (oError) {
                        debbuger;
                       // that.getComponentModel("app").setProperty("/busy", false);
                        MessageBox.error(JSON.stringify(oError));
                    }
                });
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
             // this._getParentDataViewMDCC();
              //that.sPath = oEvent.getSource().getParent().getBindingContextPath();
               // that.handleViewDialogOpen();
            },

            // Arrange Data For View / Model Set
            _arrangeDataView : function(){        
                var that = this;
                var oModel = new JSONModel({"ChildItems":this.ParentDataView});
                this.getView().setModel(oModel,"TreeTableModel");
               // var sPath = oEvent.getSource().getParent().getBindingContextPath();
              // sPath=  ;
             //   that.handleViewDialogOpen();
                //debugger;
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
            },

            onDispatchViewPress : function(oEvent){
                var that = this;
                this.oRouter.navTo("RouteInitiateDispatchPage", {
                    MDCCId:3
                },false);
            
            }

		});
	});
