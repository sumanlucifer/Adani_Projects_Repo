//@ui5-bundle com/agel/mmts/quickAccess-Reports/Component-preload.js
jQuery.sap.registerPreloadedModules({
"version":"2.0",
"modules":{
	"com/agel/mmts/quickAccess-Reports/Component.js":function(){sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","com/agel/mmts/quickAccess-Reports/model/models"],function(e,t,i){"use strict";return e.extend("com.agel.mmts.quickAccess-Reports.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.getRouter().initialize();this.setModel(i.createDeviceModel(),"device")}})});
},
	"com/agel/mmts/quickAccess-Reports/controller/LandingPage.controller.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller"],function(e){"use strict";return e.extend("com.agel.mmts.quickAccess-Reports.controller.LandingPage",{onInit:function(){}})});
},
	"com/agel/mmts/quickAccess-Reports/i18n/i18n.properties":'title=Title\nappTitle=LandingPage\nappDescription=App Description\n\nappTileTitle=Reports\n',
	"com/agel/mmts/quickAccess-Reports/manifest.json":'{"_version":"1.12.0","sap.app":{"id":"com.agel.mmts.quickAccess-Reports","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"1.0.0"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","ach":"ach","sourceTemplate":{"id":"html5moduletemplates.basicSAPUI5ApplicationProjectModule","version":"1.40.12"},"crossNavigation":{"inbounds":{"intent1":{"signature":{"parameters":{},"additionalParameters":"allowed"},"semanticObject":"vendorReports","action":"quickAccess","title":"{{appTileTitle}}"}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":false,"rootView":{"viewName":"com.agel.mmts.quickAccess-Reports.view.LandingPage","type":"XML","async":true,"id":"LandingPage"},"dependencies":{"minUI5Version":"1.60.1","libs":{"sap.ui.core":{},"sap.m":{},"sap.ui.layout":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"com.agel.mmts.quickAccess-Reports.i18n.i18n"}}},"resources":{"css":[{"uri":"css/style.css"}]},"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","async":true,"viewPath":"com.agel.mmts.quickAccess-Reports.view","controlAggregation":"pages","controlId":"app","clearControlAggregation":false},"routes":[{"name":"RouteLandingPage","pattern":"RouteLandingPage","target":["TargetLandingPage"]}],"targets":{"TargetLandingPage":{"viewType":"XML","transition":"slide","clearControlAggregation":false,"viewName":"LandingPage"}}}}}',
	"com/agel/mmts/quickAccess-Reports/model/models.js":function(){sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,n){"use strict";return{createDeviceModel:function(){var i=new e(n);i.setDefaultBindingMode("OneWay");return i}}});
},
	"com/agel/mmts/quickAccess-Reports/view/LandingPage.view.xml":'<mvc:View controllerName="com.agel.mmts.quickAccess-Reports.controller.LandingPage" xmlns:mvc="sap.ui.core.mvc" displayBlock="true" xmlns="sap.m"><Shell id="shell"><App id="app"><pages><Page id="page" title="{i18n>title}"><content></content></Page></pages></App></Shell></mvc:View>\n'
}});
