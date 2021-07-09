/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comagel.mmts.store_totalorder./store_totalorder/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
