sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.agel.mmts.raiseconsumptionporequest.controller.BaseController", {


         getViewModel: function (sName) {
            return this.getView().getModel(sName);
        },
      setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        addContentDensityClass: function () {
            return this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },

        initializeFilterBar: function () {
            this._addSearchFieldAssociationToFB();

            this.oFilterBar = null;
            this.oFilterBar = this.byId("filterbar");

            this.oFilterBar.registerFetchData(this.fFetchData);
            this.oFilterBar.registerApplyData(this.fApplyData);
            this.oFilterBar.registerGetFiltersWithValues(this.fGetFiltersWithValues);

            this.oFilterBar.fireInitialise();
        },

        _addSearchFieldAssociationToFB: function () {
            let oFilterBar = this.getView().byId("filterbar");
            let oSearchField = oFilterBar.getBasicSearch();
            var oBasicSearch;
            if (!oSearchField) {
                // @ts-ignore   
                oBasicSearch = new sap.m.SearchField({
                    id: "idSearch", showSearchButton: false,
                    placeholder: "Search"
                });
                oBasicSearch.attachLiveChange(this.onFilterChange, this);
            } else {
                oSearchField = null;
            }
            oFilterBar.setBasicSearch(oBasicSearch);
            oBasicSearch.attachBrowserEvent("keyup", function (e) {
                if (e.which === 13) {
                    this.onSearch();
                }
            }.bind(this));
        },

        fFetchData: function () {
            var oJsonParam;
            var oJsonData = [];
            var sGroupName;
            var oItems = this.getAllFilterItems(true);

            for (var i = 0; i < oItems.length; i++) {
                oJsonParam = {};
                sGroupName = null;
                if (oItems[i].getGroupName) {
                    sGroupName = oItems[i].getGroupName();
                    oJsonParam.groupName = sGroupName;
                }

                oJsonParam.name = oItems[i].getName();

                var oControl = this.determineControlByFilterItem(oItems[i]);
                if (oControl) {
                    oJsonParam.value = oControl.getValue();
                    oJsonData.push(oJsonParam);
                }
            }

            return oJsonData;
        },

        fApplyData: function (oJsonData) {

            var sGroupName;

            for (var i = 0; i < oJsonData.length; i++) {

                sGroupName = null;

                if (oJsonData[i].groupName) {
                    sGroupName = oJsonData[i].groupName;
                }

                var oControl = this.determineControlByName(oJsonData[i].name, sGroupName);
                if (oControl) {
                    oControl.setValue(oJsonData[i].value);
                }
            }
        },

        fGetFiltersWithValues: function () {
            var i;
            var oControl;
            var aFilters = this.getFilterGroupItems();

            var aFiltersWithValue = [];

            for (i = 0; i < aFilters.length; i++) {
                oControl = this.determineControlByFilterItem(aFilters[i]);
                if (oControl && oControl.getValue && oControl.getValue()) {
                    aFiltersWithValue.push(aFilters[i]);
                }
            }

            return aFiltersWithValue;
        }

    });
});