sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","com/agel/mmts/storestock/model/models","com/agel/mmts/storestock/controller/ErrorHandler"],function(t,e,s,o){"use strict";return t.extend("com.agel.mmts.storestock.Component",{metadata:{manifest:"json"},init:function(){t.prototype.init.apply(this,arguments);this._oErrorHandler=new o(this);this.getRouter().initialize();this.setModel(s.createDeviceModel(),"device");this.setModel(s.createLayoutModel(),"layoutModel")},destroy:function(){this._oErrorHandler.destroy();t.prototype.destroy.apply(this,arguments)},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if(document.body.classList.contains("sapUiSizeCozy")||document.body.classList.contains("sapUiSizeCompact")){this._sContentDensityClass=""}else if(!e.support.touch){this._sContentDensityClass="sapUiSizeCompact"}else{this._sContentDensityClass="sapUiSizeCozy"}}return this._sContentDensityClass}})});