sap.ui.define([
    "./BaseController",
    'sap/f/library',
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, fioriLibrary, Fragment, Filter, FilterOperator, JSONModel) {
        "use strict";

        return BaseController.extend("com.agel.mmts.mdmboqitems.controller.LandingPage", {

            // Initialisation
            onInit: function () {
                var oModel = this.getOwnerComponent().getModel("layoutModel");
                oModel.setProperty("/layout", "OneColumn");

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("LandingPage").attachPatternMatched(this._onObjectMatched, this);


            var oAppModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oAppModel = new JSONModel({
				busy : false,
				delay : 1000
            });
            this.oAppModel = oAppModel;
			this.getOwnerComponent().setModel(oAppModel, "app");

			fnSetAppNotBusy = function() {
				oAppModel.setProperty("/busy", false);
				oAppModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().
			 	then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);



            },

            //ObjectMatch
            _onObjectMatched: function (oEvent) {
                var sLayout = oEvent.getParameter("arguments").layout;

                this.getView().getModel("layoutModel").setProperty("/layout", sLayout);
                //   this._bindView("/MasterBoQItemSet" + this.sParentID);
            },

            onParentLineItemPress: function (oEvent) {
                this._showObject(oEvent.getSource());
            },

            // Show Object
            _showObject: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;
                this.oRouter.navTo("detail", {
                    parentMaterial: sObjectPath.slice("/MasterBoQItemSet".length),
                    layout: "TwoColumnsMidExpanded"
                },
                    false
                );
            },

            onCreatePress: function (oEvent) {
                this.oRouter.navTo("detail", {
                    parentMaterial: "new",
                    layout: "TwoColumnsMidExpanded"
                },
                    false
                );
            },

            //On Search
            onSearch : function(oEvent){

                var oView = this.getView();
                var oList = oView.byId("idListMaster");
                var oValue = oView.byId("searchField").getValue();
                var oBinding = oList.getBinding("items");
                var aFilters=[];

                var aSearchFilters = [
                    new sap.ui.model.Filter("Name", FilterOperator.Contains, oValue),
                    new sap.ui.model.Filter("Description", FilterOperator.Contains, oValue)
                ];

                // if (!isNaN(oValue)) {
                //     aSearchFilters.push(new Filter("ID", FilterOperator.EQ, oValue))
                // }

                aFilters.push(new Filter(aSearchFilters, false));
                if (aFilters.length > 0) {
                    var oFilter = new Filter({
                        filters: aFilters,
                        and: true,
                    });
                    oBinding.filter(oFilter);
                } else {
                    oBinding.filter([]);
                }               
            },

            // Child Line Items Dialog Open
            onOpenViewSettings: function (sParentItemPath) {
                // create dialog lazily
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
              //  oDetails.sParentItemPath = sParentItemPath;
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.mdmboqitems.view.fragments.FilterSortGroup",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        oDialog.bindElement({
                            path: "/MasterBoQItemSet",
                        });
                        oDialog.addStyleClass("sapUiSizeCompact");
                        return oDialog;
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: "/MasterBoQItemSet",
                    }); 
                    oDialog.open();
                });
            },

            onViewChildDialogClose: function (oEvent) {
                this.pDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onFilterSortConfirm: function(oEvent) {
                var oView = this.getView();
                var oList = oView.byId("idListMaster");
                var mParams = oEvent.getParameters();
                var oBinding = oList.getBinding("items");
                // apply grouping 
                var aSorters = [];
                if (mParams.groupItem) {
                    var sPath = mParams.groupItem.getKey();
                    var bDescending = mParams.groupDescending;
                    var vGroup = function(oContext) {
                    var name = oContext.getProperty("Name");
                        return {
                            key: name,      
                            text: name
                        };
                    };
                    aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
                }
                // apply sorter 
                if (mParams.sortItem) {
                    var sPath = mParams.sortItem.getKey();
                    var bDescending = mParams.sortDescending;
                    aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
                    oBinding.sort(aSorters);
                }
                // apply filters 
                if (mParams.filterItems) {
                    var aFilters = [];
                    for (var i = 0, l = mParams.filterItems.length; i < l; i++) 
                    {
                        var oItem = mParams.filterItems[i];
                        var aSplit = oItem.getKey().split("___");
                       // var sPath = "Name";
                       // var vOperator = new sap.ui.model.FilterOperator.Contains;
                        var vValue1 = aSplit[0];
                        var oFilter = new sap.ui.model.Filter("Name", FilterOperator.Contains, vValue1);
                        aFilters.push(oFilter);
                    }
                    oBinding.filter(aFilters);
                }
            }

        });
    });
