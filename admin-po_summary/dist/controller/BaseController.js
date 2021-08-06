sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/BusyIndicator"],function(e,t){"use strict";return e.extend("com.agel.mmts.adminposummary.controller.BaseController",{getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},addContentDensityClass:function(){return this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())},getViewModel:function(e){return this.getView().getModel(e)},getComponentModel:function(){return this.getOwnerComponent().getModel()},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},presentBusyDialog:function(){t.show()},dismissBusyDialog:function(){t.hide()},initializeFilterBar:function(){this._addSearchFieldAssociationToFB();this.oFilterBar=null;this.oFilterBar=this.byId("filterbar");this.oFilterBar.registerFetchData(this.fFetchData);this.oFilterBar.registerApplyData(this.fApplyData);this.oFilterBar.registerGetFiltersWithValues(this.fGetFiltersWithValues);this.oFilterBar.fireInitialise()},_addSearchFieldAssociationToFB:function(){let e=this.getView().byId("filterbar");let t=e.getBasicSearch();var i;if(!t){i=new sap.m.SearchField({id:"idSearch",showSearchButton:false,placeholder:"Search"});i.attachLiveChange(this.onFilterChange,this)}else{t=null}e.setBasicSearch(i);i.attachBrowserEvent("keyup",function(e){if(e.which===13){this.onSearch()}}.bind(this))},fFetchData:function(){var e;var t=[];var i;var r=this.getAllFilterItems(true);for(var n=0;n<r.length;n++){e={};i=null;if(r[n].getGroupName){i=r[n].getGroupName();e.groupName=i}e.name=r[n].getName();var a=this.determineControlByFilterItem(r[n]);if(a){e.value=a.getValue();t.push(e)}}return t},fApplyData:function(e){var t;for(var i=0;i<e.length;i++){t=null;if(e[i].groupName){t=e[i].groupName}var r=this.determineControlByName(e[i].name,t);if(r){r.setValue(e[i].value)}}},fGetFiltersWithValues:function(){var e;var t;var i=this.getFilterGroupItems();var r=[];for(e=0;e<i.length;e++){t=this.determineControlByFilterItem(i[e]);if(t&&t.getValue&&t.getValue()){r.push(i[e])}}return r},addHistoryEntry:function(){var e=[];return function(t,i){if(i){e=[]}var r=e.some(function(e){return e.intent===t.intent});if(!r){e.push(t);this.getOwnerComponent().getService("ShellUIService").then(function(t){t.setHierarchy(e)})}}}()})});