/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/agel/mmts/vendorPersona-ConfirmPOs/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
